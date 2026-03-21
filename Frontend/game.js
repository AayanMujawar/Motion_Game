let gridSize = 5;
let ball = { x: 0, y: 0 };
let hole = { x: 4, y: 4 };
let moves = 0;
let gameActive = false;
let tiltState = { x: 0, y: 0 }; // Track current tilt state to avoid continuous moves

function drawGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");

      if (x === ball.x && y === ball.y) {
        cell.classList.add("ball");
      }

      if (x === hole.x && y === hole.y) {
        cell.classList.add("hole");
      }

      grid.appendChild(cell);
    }
  }
}

function changeGravity(direction) {
  if (!gameActive) return;

  moves++;
  document.getElementById("moves").innerText = moves;

  if (direction === "right") ball.x = gridSize - 1;
  if (direction === "left") ball.x = 0;
  if (direction === "down") ball.y = gridSize - 1;
  if (direction === "up") ball.y = 0;

  drawGrid();
  checkWin();
}

function checkWin() {
  if (ball.x === hole.x && ball.y === hole.y) {
    gameActive = false; // Stop game upon winning
    setTimeout(() => {
      alert("You Win!");
      sendToAI();
    }, 100);
  }
}

function sendToAI() {
  fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      moves: moves,
      optimal: 5
    })
  })
  .then(res => res.json())
  .then(data => {
    alert("AI Feedback: " + data.feedback);
  })
  .catch(err => {
    console.log("Analytics error: " + err);
  });
}

function handleOrientation(event) {
  if (!gameActive) return;

  const beta = event.beta;   // Range [-180, 180) - front/back tilt
  const gamma = event.gamma; // Range [-90, 90) - left/right tilt

  const threshold = 20;
  const resetThreshold = 10;

  // X Axis (Gamma) Left/Right
  if (gamma > threshold && tiltState.x !== 1) {
    changeGravity("right");
    tiltState.x = 1;
  } else if (gamma < -threshold && tiltState.x !== -1) {
    changeGravity("left");
    tiltState.x = -1;
  } else if (Math.abs(gamma) < resetThreshold) {
    tiltState.x = 0;
  }

  // Y Axis (Beta) Up/Down
  // A positive beta means device is tilted towards you or away depending on starting position
  // Adjust logic if "tilt forward" usually means "down" in your game logic
  if (beta > threshold && tiltState.y !== 1) {
    changeGravity("down");
    tiltState.y = 1;
  } else if (beta < -threshold && tiltState.y !== -1) {
    changeGravity("up");
    tiltState.y = -1;
  } else if (Math.abs(beta) < resetThreshold) {
    tiltState.y = 0;
  }
}

document.getElementById('start-btn').addEventListener('click', () => {
  // Hide overlay
  document.getElementById('start-overlay').style.display = 'none';
  gameActive = true;
  
  // Request permission for iOS 13+ devices
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          alert('Permission to access device orientation was denied.');
        }
      })
      .catch(console.error);
  } else {
    // Non iOS 13+ devices
    window.addEventListener('deviceorientation', handleOrientation);
  }
});

drawGrid();