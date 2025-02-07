// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

// Track players, ball, and game state
let players = {};
let teams = {
  left: [], // Will store player IDs for left team
  right: [], // Will store player IDs for right team
};
let ball = { x: 50, y: 50, dx: 4, dy: 0 };
let score = { left: 0, right: 0 };
let gameStarted = false;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Enforce maximum player limit (4)
  if (Object.keys(players).length >= 4) {
    socket.emit("gameFull");
    socket.disconnect();
    return;
  }

  // Assign player to a team
  const assignTeam = () => {
    // If left team has fewer players, assign to left
    if (teams.left.length < teams.right.length) {
      teams.left.push(socket.id);
      return {
        team: "left",
        position: teams.left.length, // This will be 1 for first player, 2 for second
      };
    }
    // If right team has fewer players, assign to right
    else if (teams.right.length < teams.left.length) {
      teams.right.push(socket.id);
      return {
        team: "right",
        position: teams.right.length,
      };
    }
    // If teams are equal, assign to team with fewer players (or left by default)
    else if (teams.left.length < 2) {
      teams.left.push(socket.id);
      return {
        team: "left",
        position: teams.left.length,
      };
    } else {
      teams.right.push(socket.id);
      return {
        team: "right",
        position: teams.right.length,
      };
    }
  };

  const teamAssignment = assignTeam();
  const colorTeam = teamAssignment.team === "left" ? "#FF4444" : "#4444FF";
  const initialY = teamAssignment.position === 1 ? 30 : 70;

  players[socket.id] = {
    y: initialY,
    color: colorTeam,
    team: teamAssignment.team,
    position: teamAssignment.position,
  };

  socket.emit("init", {
    players,
    ball,
    score,
    teams,
    yourId: socket.id,
  });

  // Broadcast the new player to others
  socket.broadcast.emit("playerJoined", {
    id: socket.id,
    y: initialY,
    color: colorTeam,
    team: teamAssignment.team,
    position: teamAssignment.position,
  });

  // Handle player movement
  socket.on("move", (data) => {
    if (players[socket.id]) {
      players[socket.id].y = data.y;
      io.emit("playerMoved", { id: socket.id, y: data.y });
    }
  });

  // Handle start game event
  socket.on("startGame", () => {
    // if (Object.keys(players).length >= 1 && !gameStarted) {
    //   gameStarted = true;
    //   io.emit("gameStarted");
    // }
    if (teams.left.length >= 1 && teams.right.length >= 1 && !gameStarted) {
      gameStarted = true;
      io.emit("gameStarted");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const team = players[socket.id]?.team;
    if (team) {
      // Remove player from team
      teams[team] = teams[team].filter((id) => id !== socket.id);

      // Update positions of remaining players in the team
      teams[team].forEach((playerId, index) => {
        players[playerId].position = index + 1;
        players[playerId].y = index === 0 ? 30 : 70;
        io.emit("playerMoved", {
          id: playerId,
          y: players[playerId].y,
          position: players[playerId].position,
        });
      });
    }

    delete players[socket.id];
    io.emit("playerLeft", socket.id);

    // Stop game if any team is empty
    if (teams.left.length === 0 || teams.right.length === 0) {
      gameStarted = false;
      ball = { x: 50, y: 50, dx: 2, dy: 0 };
      score = { left: 0, right: 0 };
      io.emit("updateScore", score);
      io.emit("updateBall", ball);
      io.emit("gameStopped");
    }

    console.log("A user disconnected:", socket.id);
  });
});

// Game loop for ball movement and collision detection
setInterval(() => {
  if (!gameStarted || Object.keys(players).length < 2) return;

  // Update ball position
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom walls
  if (ball.y <= 0 || ball.y >= 100) {
    ball.dy *= -1;
    // Keep ball within bounds
    ball.y = ball.y <= 0 ? 0 : 100;
  }

  // Initialize player arrays for easier reference
  const playerIds = Object.keys(players);
  const leftPlayerId = playerIds[0];
  const rightPlayerId = playerIds[1];

  // Paddle dimensions (in percentage of screen)
  const PADDLE_WIDTH = 2; // Width of paddle
  const PADDLE_HEIGHT = 15; // Height of paddle
  const BALL_SIZE = 2; // Ball size

  // Check collision with left paddle
  const leftPaddle = players[leftPlayerId];
  if (leftPaddle) {
    if (
      ball.x - BALL_SIZE <= PADDLE_WIDTH && // Ball right edge > paddle left edge
      ball.x >= 0 && // Ball left edge < paddle right edge
      ball.y >= leftPaddle.y - PADDLE_HEIGHT / 2 && // Ball bottom > paddle top
      ball.y <= leftPaddle.y + PADDLE_HEIGHT / 2
    ) {
      // Ball top < paddle bottom

      // Fix ball position to prevent sticking
      ball.x = PADDLE_WIDTH + BALL_SIZE;
      ball.dx = Math.abs(ball.dx); // Ensure ball moves right

      // Add angle based on where ball hits paddle
      const relativeIntersectY = (leftPaddle.y - ball.y) / (PADDLE_HEIGHT / 2);
      const bounceAngle = relativeIntersectY * 0.75; // Max 45-degree angle
      ball.dy = -bounceAngle * 2; // Adjust vertical speed
    }
  }

  // Check collision with right paddle
  const rightPaddle = players[rightPlayerId];
  if (rightPaddle) {
    if (
      ball.x + BALL_SIZE >= 100 - PADDLE_WIDTH && // Ball left edge < paddle right edge
      ball.x <= 100 && // Ball right edge > paddle left edge
      ball.y >= rightPaddle.y - PADDLE_HEIGHT / 2 && // Ball bottom > paddle top
      ball.y <= rightPaddle.y + PADDLE_HEIGHT / 2
    ) {
      // Ball top < paddle bottom

      // Fix ball position to prevent sticking
      ball.x = 100 - PADDLE_WIDTH - BALL_SIZE;
      ball.dx = -Math.abs(ball.dx); // Ensure ball moves left

      // Add angle based on where ball hits paddle
      const relativeIntersectY = (rightPaddle.y - ball.y) / (PADDLE_HEIGHT / 2);
      const bounceAngle = relativeIntersectY * 0.75; // Max 45-degree angle
      ball.dy = -bounceAngle * 2; // Adjust vertical speed
    }
  }

  // Ball out of bounds - scoring
  if (ball.x < 0) {
    // Right player scores
    score.right++;
    resetBall("left");
    io.emit("updateScore", score);
  } else if (ball.x > 100) {
    // Left player scores
    score.left++;
    resetBall("right");
    io.emit("updateScore", score);
  }

  io.emit("updateBall", ball);
}, 1000 / 30);

// Helper function to reset ball with proper direction
function resetBall(direction) {
  ball.x = 50;
  ball.y = 50;
  const speed = 2;

  if (direction === "left") {
    ball.dx = -speed;
    ball.dy = 0;
  } else {
    ball.dx = speed;
    ball.dy = 0;
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
