const canvas = document.getElementById("game-canvas");
const game = new Game(canvas);
const menu = new Menu(game);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial resize

function gameLoop() {
  if (!menu.isPaused) {
    game.update();
    game.draw();
  }
  if (!game.gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

document.getElementById("start-btn").addEventListener("click", () => {
  game.reset(); // Reset the game state
  gameLoop();
});
