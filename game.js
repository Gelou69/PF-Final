const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 400;

let gravity = 1;
let gameSpeed = 6;
let isGameOver = false;

class Player {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = 50;
    this.y = canvas.height - this.height;
    this.dy = 0;
    this.jumpPower = -20;
    this.grounded = true;
  }

  jump() {
    if (this.grounded) {
      this.dy = this.jumpPower;
      this.grounded = false;
    }
  }

  update() {
    this.dy += gravity;
    this.y += this.dy;

    // Ground collision
    if (this.y + this.height >= canvas.height) {
      this.y = canvas.height - this.height;
      this.dy = 0;
      this.grounded = true;
    }

    this.draw();
  }

  draw() {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Obstacle {
  constructor() {
    this.width = 20 + Math.random() * 30;
    this.height = 40 + Math.random() * 30;
    this.x = canvas.width;
    this.y = canvas.height - this.height;
  }

  update() {
    this.x -= gameSpeed;
    this.draw();
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y);
    ctx.lineTo(this.x + this.width, this.y + this.height);
    ctx.closePath();
    ctx.fill();
  }
}

let player = new Player();
let obstacles = [];
let frames = 0;

function spawnObstacle() {
  if (frames % 100 === 0) {
    obstacles.push(new Obstacle());
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function gameLoop() {
  if (isGameOver) return showGameOver();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();

  spawnObstacle();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();

    if (detectCollision(player, obs)) {
      isGameOver = true;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
    }
  }

  frames++;
  requestAnimationFrame(gameLoop);
}

function showGameOver() {
  ctx.fillStyle = "#fff";
  ctx.font = "48px sans-serif";
  ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") player.jump();
  if (e.code === "KeyR") {
    if (isGameOver) location.reload();
  }
});

gameLoop();
