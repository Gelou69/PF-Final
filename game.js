const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 400;

let gravity = 1;
let gameSpeed = 6;
let isGameOver = false;
let score = 0;
let attempts = 1;

const difficultySelect = document.getElementById("difficulty");
const scoreDisplay = document.getElementById("score");
const attemptsDisplay = document.getElementById("attempts");

const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;
bgMusic.play();

difficultySelect.addEventListener("change", () => {
  gameSpeed = parseInt(difficultySelect.value);
  resetGame();
});

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
    this.height = 30 + Math.random() * 30;
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

class Monster {
  constructor() {
    this.width = 40;
    this.height = 40;
    this.x = 0;
    this.y = canvas.height - this.height;
    this.speed = 2;
  }

  update() {
    if (this.x < player.x - 20) this.x += this.speed;
    this.draw();
  }

  draw() {
    ctx.fillStyle = "purple";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

let player = new Player();
let monster = new Monster();
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

function resetGame() {
  isGameOver = false;
  score = 0;
  frames = 0;
  player = new Player();
  monster = new Monster();
  obstacles = [];
  gameSpeed = parseInt(difficultySelect.value);
  gameLoop();
}

function gameOver() {
  isGameOver = true;
  ctx.fillStyle = "#fff";
  ctx.font = "48px sans-serif";
  ctx.fillText("Game Over", canvas.width / 2 - 120, canvas.height / 2);
  ctx.font = "24px sans-serif";
  ctx.fillText("Press R to Retry", canvas.width / 2 - 90, canvas.height / 2 + 40);
}

function gameLoop() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  monster.update();

  spawnObstacle();

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();

    if (detectCollision(player, obs) || detectCollision(player, monster)) {
      attempts++;
      attemptsDisplay.textContent = `Attempts: ${attempts}`;
      return gameOver();
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
    }
  }

  frames++;
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") player.jump();
  if (e.code === "KeyR") resetGame();
});

gameLoop();
