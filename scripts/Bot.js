class Bot {
  constructor(canvas, difficulty = "normal") {
    this.canvas = canvas;
    this.width = 10;
    this.height = 80;
    this.x = canvas.width - this.width - 10; // Position on the right side
    this.y = (canvas.height - this.height) / 2;
    this.color = this.getRandomColor();
    this.speed = this.getSpeedByDifficulty(difficulty);
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  getSpeedByDifficulty(difficulty) {
    switch (difficulty) {
      case "easy":
        return 3;
      case "normal":
        return 5;
      case "hard":
        return 7;
      default:
        return 5;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(ballY) {
    if (this.y + this.height / 2 < ballY) {
      this.y += this.speed;
    } else {
      this.y -= this.speed;
    }
    this.y = Math.max(0, Math.min(this.canvas.height - this.height, this.y));
  }
}
