class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = 10;
    this.height = 80;
    this.x = 10;
    this.y = (canvas.height - this.height) / 2;
    this.color = this.getRandomColor();
    this.speed = 5;

    // Add event listener for mouse movement
    canvas.addEventListener("mousemove", (e) => this.movePaddle(e));
    canvas.addEventListener("touchmove", (e) => this.movePaddle(e.touches[0]));
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  moveUp() {
    this.y = Math.max(0, this.y - this.speed);
  }

  moveDown() {
    this.y = Math.min(this.canvas.height - this.height, this.y + this.speed);
  }

  movePaddle(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    this.y = mouseY - this.height / 2;

    // Ensure the paddle stays within the canvas bounds
    this.y = Math.max(0, Math.min(this.canvas.height - this.height, this.y));
  }
}
