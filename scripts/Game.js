class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.player = new Player(canvas);
    this.bot = new Bot(canvas);
    this.ball = new Ball(canvas);
    this.score = { player: 0, bot: 0 };
    this.gameOver = false;
    this.initialBallSpeed = 4; // Initial speed of the ball
  }

  update() {
    if (this.gameOver || menu.isPaused) return;

    this.ball.update(this.player, this.bot);
    this.bot.update(this.ball.y);

    // Check for scoring
    if (this.ball.x - this.ball.radius < 0) {
      this.score.bot++;
      this.resetBall();
    } else if (this.ball.x + this.ball.radius > this.canvas.width) {
      this.score.player++;
      this.resetBall();
    }

    // Update the score display
    document.getElementById(
      "score"
    ).textContent = `Player: ${this.score.player} | Bot: ${this.score.bot}`;

    // Check for game over
    if (this.score.player >= 10 || this.score.bot >= 10) {
      this.gameOver = true;
    }
  }

  resetBall() {
    this.ball.reset();
    // Increase ball speed as the game progresses
    if (this.score.player >= 8 || this.score.bot >= 8) {
      this.ball.speedX *= 1.2;
      this.ball.speedY *= 1.2;
    }
  }

  reset() {
    this.player = new Player(this.canvas);
    this.bot = new Bot(this.canvas);
    this.ball = new Ball(this.canvas);
    this.score = { player: 0, bot: 0 };
    this.gameOver = false;
    this.ball.speedX = this.initialBallSpeed * (Math.random() > 0.5 ? 1 : -1); // Reset to initial speed
    this.ball.speedY = (Math.random() * 2 - 1) * this.initialBallSpeed; // Reset to initial speed
    document.getElementById(
      "score"
    ).textContent = `Player: ${this.score.player} | Bot: ${this.score.bot}`;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.player.draw(this.ctx);
    this.bot.draw(this.ctx);
    this.ball.draw(this.ctx);
  }
}
