// game.js
const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};
let ball = { x: 50, y: 50, dx: 4, dy: 0 };
let score = { left: 0, right: 0 };
let myId = null;
let myTeam = null;

function showStartScreen() {
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("startButton").disabled = false;
}

// Handle player movement
const handleMove = (clientY) => {
  const y = (clientY / canvas.height) * 100;
  socket.emit("move", { y });
};

// Mouse controls
window.addEventListener("mousemove", (e) => {
  handleMove(e.clientY);
});

// Touch controls
window.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  handleMove(touch.clientY);
});

document.getElementById("startButton").addEventListener("click", () => {
  socket.emit("startGame");
  document.getElementById("startButton").disabled = true;
});

// socket.on("init", (data) => {
//   players = data.players;
//   ball = data.ball;
//   score = data.score;

//   if (Object.keys(players).length >= 2) {
//     document.getElementById("startButton").disabled = false;
//   } else {
//     showStartScreen();
//     document.getElementById("startButton").disabled = true;
//   }
// });

socket.on("init", (data) => {
  players = data.players;
  ball = data.ball;
  score = data.score;
  myId = data.yourId;
  myTeam = players[myId].team;

  // Show/hide start button based on player count
  const leftPlayers = Object.values(players).filter(
    (p) => p.team === "left"
  ).length;
  const rightPlayers = Object.values(players).filter(
    (p) => p.team === "right"
  ).length;

  if (leftPlayers >= 1 && rightPlayers >= 1) {
    document.getElementById("startButton").disabled = false;
    document.querySelector("#startScreen p").textContent =
      "Press Start to begin!";
  } else {
    document.getElementById("startButton").disabled = true;
    document.querySelector("#startScreen p").textContent =
      "Waiting for players...";
  }
});

socket.on("playerJoined", (data) => {
  players[data.id] = { y: data.y, color: data.color };
  // If we now have 2 players, enable the start button
  if (Object.keys(players).length >= 2) {
    document.getElementById("startButton").disabled = false;
  }
});

// socket.on("playerMoved", (data) => {
//   if (players[data.id]) {
//     players[data.id].y = data.y;
//   }
// });
socket.on("playerMoved", (data) => {
  if (players[data.id]) {
    players[data.id].y = data.y;
    if (data.position) {
      players[data.id].position = data.position;
    }
  }
});

socket.on("playerLeft", (id) => {
  delete players[id];
  // If less than 2 players, show start screen again
  if (Object.keys(players).length < 2) {
    showStartScreen();
    document.getElementById("startButton").disabled = true; // Disable button until another player joins
  }
});

socket.on("gameStarted", () => {
  document.getElementById("startScreen").style.display = "none";
});

socket.on("updateBall", (data) => {
  ball = data;
});

socket.on("updateScore", (data) => {
  score = data;
  document.querySelector(
    ".score"
  ).textContent = `Score: ${score.left} - ${score.right}`;
});

socket.on("gameFull", () => {
  alert("The game is full. Please try again later.");
  window.location.reload();
});

socket.on("gameStopped", () => {
  showStartScreen();
  document.getElementById("startButton").disabled = true;
});

// function render() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // Draw players (paddles)
//   Object.keys(players).forEach((id, index) => {
//     const player = players[id];
//     const paddleWidth = canvas.width * 0.02; // 2% of screen width
//     const paddleHeight = canvas.height * 0.15; // 15% of screen height
//     const paddleX = index === 0 ? 0 : canvas.width - paddleWidth;
//     const paddleY = (player.y / 100) * canvas.height - paddleHeight / 2;

//     ctx.fillStyle = player.color;
//     ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
//   });

//   // Draw ball
//   const ballSize = canvas.width * 0.02; // 2% of screen width
//   ctx.fillStyle = "white";
//   ctx.beginPath();
//   ctx.arc(
//     (ball.x / 100) * canvas.width,
//     (ball.y / 100) * canvas.height,
//     ballSize / 2,
//     0,
//     Math.PI * 2
//   );
//   ctx.fill();

//   requestAnimationFrame(render);
// }

// Update the render function to handle team positions
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw teams
  Object.keys(players).forEach((id) => {
    const player = players[id];
    const paddleWidth = canvas.width * 0.02;
    const paddleHeight = canvas.height * 0.15;

    // Position paddles based on team and position
    const paddleX = player.team === "left" ? 0 : canvas.width - paddleWidth;
    let paddleY = (player.y / 100) * canvas.height - paddleHeight / 2;

    ctx.fillStyle = player.color;
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);

    // Draw player number above paddle
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(
      `P${player.position}`,
      paddleX + (player.team === "left" ? paddleWidth + 5 : -20),
      paddleY + paddleHeight / 2
    );
  });

  // Draw ball
  const ballSize = canvas.width * 0.02;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(
    (ball.x / 100) * canvas.width,
    (ball.y / 100) * canvas.height,
    ballSize / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  requestAnimationFrame(render);
}

render();
