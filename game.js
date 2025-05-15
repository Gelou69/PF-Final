const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 400;

let gravity = 1;
let gameSpeed = 6;
let score = 0;
let attempts = 1;
let warningShown = false;

const difficultySelect = document.getElementById("difficulty");
const scoreDisplay = document.getElementById("score");
const attemptsDisplay = document.getElementById("attempts");
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;

difficultySelect.addEventListener("change", () => {
  gameSpeed = parseInt(difficultySelect.value);
  resetGame();
  warningShown = false;
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
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
  }
}

class Obstacle {
  constructor(type) {
    this.type = type || ["spike", "block", "rotator", "movingBlock", "portal"][Math.floor(Math.random() * 5)];
    this.width = 30;
    this.height = 30;
    this.x = canvas.width;
    this.y = canvas.height - this.height;
    this.angle = 0; // for rotator
    this.speed = Math.random() * 3 + 3; // Random speed for some obstacles
    this.movingX = Math.random() * 200 - 100; // Random horizontal movement for some obstacles
    this.mode = difficultySelect.value;

    // Difficulty-specific adjustments
    this.adjustForDifficulty();
  }

  adjustForDifficulty() {
    if (this.mode == 3) { // Easy
      this.width = 20; // Smaller blocks
      this.speed = 2; // Slower movement
      this.height = 20;
      this.type = Math.random() < 0.5 ? "block" : "spike"; // Simpler obstacles
    } else if (this.mode == 6) { // Normal
      this.width = 30;
      this.speed = 3;
      this.height = 30;
      this.type = Math.random() < 0.3 ? "rotator" : "movingBlock"; // Standard obstacles
    } else if (this.mode == 9) { // Hard
      this.width = 40; // Larger blocks
      this.speed = 5;
      this.height = 40;
      this.type = ["spike", "block", "rotator", "movingBlock", "portal"][Math.floor(Math.random() * 5)]; // More variety and faster
    }
  }

  update() {
    this.x -= this.speed;
    if (this.type === "movingBlock") {
      this.y += Math.sin(this.movingX * 0.1) * 2; // Oscillating movement effect
      this.movingX += this.speed;
    }
    this.draw();
  }

  draw() {
    if (this.type === "spike") {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === "block") {
      ctx.fillStyle = "#ff0";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.type === "rotator") {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate((this.angle += 0.1));
      ctx.fillStyle = "magenta";
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    } else if (this.type === "movingBlock") {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else if (this.type === "portal") {
      ctx.fillStyle = "cyan";
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
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
    ctx.shadowColor = 'purple';
    ctx.shadowBlur = 20;
    ctx.fillStyle = "purple";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;
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
  player = new Player();
  monster = new Monster();
  obstacles = [];
  frames = 0;
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  warningShown = false;
}

function gameOver() {
  attempts++;
  attemptsDisplay.textContent = `Attempts: ${attempts}`;
  alert("Touch to attempt again!");
  resetGame();
}

function drawFloor() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
}

function showHardModeWarning() {
  if (!warningShown) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("WARNING: HARD MODE!", canvas.width / 2 - 100, canvas.height / 2 - 50);
    warningShown = true;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloor();

  player.update();
  monster.update();
  spawnObstacle();

  if (gameSpeed === 9) showHardModeWarning(); // Show warning if in hard mode

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.update();

    if (detectCollision(player, obs) || detectCollision(player, monster)) {
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
});

gameLoop();
