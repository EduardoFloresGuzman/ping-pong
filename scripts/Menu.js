class Menu {
  constructor(game) {
    this.game = game;
    this.startBtn = document.getElementById("start-btn");
    this.optionsBtn = document.getElementById("options-btn");
    this.difficultyMenu = document.getElementById("difficulty-menu");
    this.isPaused = false;

    this.startBtn.addEventListener("click", () => this.startGame());
    this.optionsBtn.addEventListener("click", () => this.toggleOptionsMenu());

    this.difficultyMenu.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () =>
        this.setDifficulty(btn.dataset.difficulty)
      );
    });

    // Add reset button dynamically
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset Game";
    resetBtn.addEventListener("click", () => this.resetGame());
    this.difficultyMenu.appendChild(resetBtn);
  }

  startGame() {
    this.game.reset();
    this.game.gameOver = false;
    this.isPaused = false;
    gameLoop();
  }

  toggleOptionsMenu() {
    this.difficultyMenu.style.display =
      this.difficultyMenu.style.display === "block" ? "none" : "block";
    this.isPaused = !this.isPaused;
  }

  setDifficulty(difficulty) {
    this.game.bot.speed = this.game.bot.getSpeedByDifficulty(difficulty);
    // Increase ball speed based on difficulty
    switch (difficulty) {
      case "easy":
        this.game.ball.speedX = Math.abs(this.game.ball.speedX) * 1;
        this.game.ball.speedY = Math.abs(this.game.ball.speedY) * 1;
        break;
      case "normal":
        this.game.ball.speedX = Math.abs(this.game.ball.speedX) * 1.5;
        this.game.ball.speedY = Math.abs(this.game.ball.speedY) * 1.5;
        break;
      case "hard":
        this.game.ball.speedX = Math.abs(this.game.ball.speedX) * 2;
        this.game.ball.speedY = Math.abs(this.game.ball.speedY) * 2;
        break;
    }
    this.toggleOptionsMenu();
  }

  resetGame() {
    this.game.reset();
    this.game.score = { player: 0, bot: 0 };
    this.game.gameOver = false;
    this.isPaused = false;
    this.toggleOptionsMenu();
  }
}
