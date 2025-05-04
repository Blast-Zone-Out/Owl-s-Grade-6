// --- Game Variables ---
let playerName = "";
let score = 0;
let totalQuestions = 5;
let questionsAsked = 0;
let mistakeCount = 0;  // Reset this each new question
const tutorialLink = "https://www.youtube.com/watch?v=alstJ37BoZo"; // Replace with actual link


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hero = {
  x: 50,
  y: 240,
  width: 30,
  height: 30,
  color: "blue",
  speed: 5,
  baseSpeed: 5
};

gate = {
    x: Math.floor(Math.random() * 600) + 100,
    y: Math.floor(Math.random() * (canvas.height - 30)),
    width: 30,
    height: 30,
    color: "brown",
    active: true,
  };
  

let enemies = [];
let powerUps = [];

let keys = {};
let gamePaused = false;

// --- Game Start ---
function startGame() {
  playerName = document.getElementById("player-name").value.trim();
  if (!playerName) return showCustomAlert("Please enter your name!","Invalid Name");

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("playerDisplay").textContent = playerName;

  score = 0;
  questionsAsked = 0;
  gate.active = true;
  hero.x = 50;
  enemies = [];
  powerUps = [];
  gamePaused = false;

  draw();
  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);
  requestAnimationFrame(updateGame);
}

// --- Game Loop ---
function updateGame() {
  if (gamePaused) return;

  if (keys["ArrowRight"]) hero.x += hero.speed;
if (keys["ArrowLeft"]) hero.x -= hero.speed;
if (keys["ArrowUp"]) hero.y -= hero.speed;
if (keys["ArrowDown"]) hero.y += hero.speed;

hero.x = Math.max(0, Math.min(canvas.width - hero.width, hero.x));
hero.y = Math.max(0, Math.min(canvas.height - hero.height, hero.y));


  // Collision with gate
  if (
    gate.active &&
    hero.x < gate.x + gate.width &&
    hero.x + hero.width > gate.x &&
    hero.y < gate.y + gate.height &&
    hero.y + hero.height > gate.y
  ) {
    gate.active = false;
    gamePaused = true;
    generateQuestion();
    return;
  }
  

  // Collision with enemies
  enemies.forEach(enemy => {
    if (
      hero.x < enemy.x + enemy.width &&
      hero.x + hero.width > enemy.x &&
      hero.y < enemy.y + enemy.height &&
      hero.y + hero.height > enemy.y
    ) {
        showCustomAlert("🚫 You hit an enemy! Back to start!", "Enemy hit");
      hero.x = 50;
      hero.y = 240;
    }
  });
  

  // Collision with power-ups
  powerUps.forEach((pu, i) => {
    if (
      hero.x < pu.x + pu.width &&
      hero.x + hero.width > pu.x &&
      hero.y < pu.y + pu.height &&
      hero.y + hero.height > pu.y
    ) {
      powerUps.splice(i, 1); // Remove power-up from array
      hero.speed += 3; // Apply boost
      setTimeout(() => {
        hero.speed = hero.baseSpeed; // Reset after 5 seconds
      }, 5000);
      showCustomAlert("⚡ Speed Boost Collected!", "Collected");
    }
  });
  

  draw();
  requestAnimationFrame(updateGame);
}

// --- Drawing ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = hero.color;
  ctx.fillRect(hero.x, hero.y, hero.width, hero.height);

  if (gate.active) {
    ctx.fillStyle = gate.color;
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
  }

  // Draw enemies
  enemies.forEach(enemy => {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Draw power-ups
  powerUps.forEach(pu => {
    ctx.fillStyle = "green";
    ctx.fillRect(pu.x, pu.y, pu.width, pu.height);
  });
}

// --- Questions ---
function generateQuestion() {
    questionsAsked++;
    mistakeCount = 0;  // ✅ Reset on new question
  
    const frac1 = getRandomFraction();
    const frac2 = getRandomFraction();
    const correctAnswer = multiplyFractions(frac1, frac2);
  
    document.getElementById("question-box").innerHTML = `
      <p>You've reached a gate! Solve: <strong>${frac1}</strong> × <strong>${frac2}</strong></p>
      <input type="text" id="answer" placeholder="Enter answer like 3/4 or 1 1/2">
      <button onclick="checkAnswer('${correctAnswer}')">Submit</button>
    `;
  }
  



  function checkAnswer(correct) {
    const userInput = document.getElementById("answer").value.trim();
    document.getElementById("question-box").innerHTML = "";
  
    const isCorrect = normalizeFraction(userInput) === normalizeFraction(correct);
  
    if (isCorrect) {
      mistakeCount = 0;
      score++;
      document.getElementById("scoreDisplay").textContent = score;
      showCustomAlert("✅ Correct! Gate unlocked!","Good Job");
      spawnPowerUp();
    } else {
      spawnEnemy(); // ⬅️ Enemy spawns BEFORE we check enemies.length
  
      let tutorialLevel = enemies.length;

if (tutorialLevel === 1) {
  customConfirm("❗Oops! Incorrect.\nAre you having trouble?", "Need Help?", (wantsHint) => {
    if (wantsHint) {
      showCustomAlert("💡 Hint: Multiply the whole number as an improper fraction.");
    }
  });

} else if (tutorialLevel === 2) {
  customConfirm("📘 Are you having trouble?\nWould you like a tutorial?", "Tutorial Help", (wantsSemi) => {
    if (wantsSemi) {
      showCustomAlert(`📘 Tutorial:<br>
1. Convert mixed number to improper fraction.<br>
2. Multiply fractions.<br>
3. Correct answer: <strong>${correct}</strong>`);
    }
  });

} else if (tutorialLevel >= 3) {
    customConfirm("📚 Need help?\nWould you like a tutorial?", "Full Explanation", (wantsFull) => {
        if (wantsFull) {
          showCustomAlert(
            `📚 Full Explanation:<br>
            1. Convert mixed numbers to improper fractions.<br>
            2. Multiply numerators and denominators.<br>
            3. Simplify the result.<br><br>
            ✅ Correct answer: <strong>${correct}</strong><br>
            🎥 Watch: <a href="${tutorialLink}" target="_blank">Click here for tutorial</a>`
          );
        }
      });
      
}
    }
  
    // Proceed regardless of correct or wrong
    if (questionsAsked >= totalQuestions) {
      endGame();
    } else {
      gate = {
        x: Math.floor(Math.random() * 600) + 100,
        y: Math.floor(Math.random() * (canvas.height - 30)),
        width: 30,
        height: 30,
        color: "brown",
        active: true,
      };
      gamePaused = false;
      requestAnimationFrame(updateGame);
    }
  }
  
  

// --- Spawn Logic ---
function spawnEnemy() {
    enemies.push({
      x: Math.floor(Math.random() * 500) + 100,
      y: Math.floor(Math.random() * (canvas.height - 30)),
      width: 20,
      height: 30,
    });
  }
  

  function spawnPowerUp() {
    powerUps.push({
      x: Math.floor(Math.random() * 500) + 100,
      y: Math.floor(Math.random() * (canvas.height - 30)),
      width: 20,
      height: 30,
    });
  }
  

// --- Tutorial ---
function offerTutorial(correctAnswer) {
  const wantsTutorial = confirm("Would you like a tutorial?");
  if (wantsTutorial) {
    alert(`Step-by-step:\n1. Multiply numerators and denominators.\n2. Simplify if needed.\nCorrect answer: ${correctAnswer}`);
  }
}

// --- Game Over ---
function endGame() {
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  document.getElementById("finalScore").textContent = score;
  saveToLeaderboard(playerName, score);
}

// --- Leaderboard ---
function saveToLeaderboard(name, score) {
    let leaderboard = JSON.parse(localStorage.getItem("fractionHeroLeaderboard") || "[]");
  
    // Check if the name already exists
    const existingIndex = leaderboard.findIndex(entry => entry.name === name);
  
    if (existingIndex !== -1) {
      // Replace the existing score
      leaderboard[existingIndex].score = score;
    } else {
      // Add new entry
      leaderboard.push({ name, score });
    }
  
    // Sort and keep top 5
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5);
  
    localStorage.setItem("fractionHeroLeaderboard", JSON.stringify(leaderboard));
  }

function showLeaderboard() {
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("leaderboard-screen").style.display = "block";
  const leaderboard = JSON.parse(localStorage.getItem("fractionHeroLeaderboard") || "[]");
  const list = leaderboard.map(entry => `<li>${entry.name} - ${entry.score}</li>`).join('');
  document.getElementById("leaderboardList").innerHTML = list;
}

// --- Helpers ---
function getRandomFraction() {
  const whole = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2) + 1;
  const numerator = Math.floor(Math.random() * 5) + 1;
  const denominator = Math.floor(Math.random() * 5) + 2;
  return whole === 0 ? `${numerator}/${denominator}` : `${whole} ${numerator}/${denominator}`;
}

function multiplyFractions(frac1, frac2) {
  const [n1, d1] = toImproperFraction(frac1);
  const [n2, d2] = toImproperFraction(frac2);
  const resultNum = n1 * n2;
  const resultDen = d1 * d2;
  return simplifyFraction(resultNum, resultDen);
}

function toImproperFraction(frac) {
  if (frac.includes(' ')) {
    const [whole, part] = frac.split(' ');
    const [num, den] = part.split('/').map(Number);
    return [parseInt(whole) * den + num, den];
  }
  const [num, den] = frac.split('/').map(Number);
  return [num, den];
}

function simplifyFraction(num, den) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const common = gcd(num, den);
  num /= common;
  den /= common;
  if (num > den) {
    const whole = Math.floor(num / den);
    const remainder = num % den;
    return remainder === 0 ? `${whole}` : `${whole} ${remainder}/${den}`;
  }
  return `${num}/${den}`;
}

function normalizeFraction(frac) {
  const [n, d] = toImproperFraction(frac);
  return simplifyFraction(n, d);
}
function showCustomAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
      <div class="custom-alert-content">
        <h3></h3>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">OK</button>
      </div>
    `;
    document.body.appendChild(alertBox);
    alertBox.style.display = 'block';
  }
  
  
  function closeCustomAlert() {
    document.getElementById("customAlert").style.display = "none";
    
  }
  
  //Confirm
  let confirmCallback;

function customConfirm(message, title, callback) {
  document.getElementById("confirmTitle").innerText = title;
  document.getElementById("confirmMessage").innerText = message;
  document.getElementById("customConfirm").style.display = "block";
  confirmCallback = callback;
}

function handleConfirm(response) {
  document.getElementById("customConfirm").style.display = "none";
  if (confirmCallback) confirmCallback(response);
}
