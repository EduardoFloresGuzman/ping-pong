class Ball {
  constructor(canvas) {
    this.canvas = canvas;
    this.radius = 10;
    this.reset();
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  reset() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.color = this.getRandomColor();
    this.speedX = (Math.random() > 0.5 ? 1 : -1) * 4; // Random direction
    this.speedY = (Math.random() * 2 - 1) * 4; // Random angle
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(player, bot) {
    this.x += this.speedX;
    this.y += this.speedY;

    // Collision with top and bottom walls
    if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
      this.speedY *= -1;
    }

    // Collision with paddles
    if (
      (this.x - this.radius < player.x + player.width &&
        this.y > player.y &&
        this.y < player.y + player.height) ||
      (this.x + this.radius > bot.x &&
        this.y > bot.y &&
        this.y < bot.y + bot.height)
    ) {
      this.speedX *= -1;
    }
  }
}
