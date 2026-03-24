/* ============================================================
   PICK-AND-PLACE PUZZLE – game.js
   ============================================================ */

// ── Constants ──────────────────────────────────────────────
const GRID_COLS = 5;
const GRID_ROWS = 5;

// ── State ──────────────────────────────────────────────────
let currentLevel = 0;
let moves = 0;
let selectedBlock = null;
let history = [];    // undo stack: array of snapshots
let gameActive = true;
let boardPx = 320;   // updated dynamically

// ── Levels ─────────────────────────────────────────────────
// Each level:  { blocks: [ {id, x, y, w, h, color, shape, goal} ], hole: {x,y,w,h} }
// x,y in grid units, w/h in grid units
// shape: 'rect' | 'circle'   (circle only when w==1 && h==1)
// goal: true → this block must reach the hole to win
//
// Pick-and-place: select any block, place it on any empty cell(s).
// Optimal = min obstacles to clear + 1 (ball into hole).

const LEVELS = [
  // ─── Level 1 ── 1 move: ball straight into hole ─────────
  {
    blocks: [
      { id: 'a', x: 1, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 3, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
    ],
    hole: { x: 1, y: 0, w: 1, h: 1 },
  },
  // ─── Level 2 ── 2 moves: move 1 blocker + ball ──────────
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 3, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
    ],
    hole: { x: 3, y: 4, w: 1, h: 1 },
  },
  // ─── Level 3 ── 2 moves: 1 blocker on hole + ball ───────
  {
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 3, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 0, y: 3, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
    ],
    hole: { x: 3, y: 4, w: 1, h: 1 },
  },
  // ─── Level 4 ── 3 moves: 2 blockers + ball ──────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 2, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 4, y: 1, w: 1, h: 2, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 3, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 2, w: 1, h: 1 },
  },
  // ─── Level 5 ── 3 moves ─────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 2, y: 3, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 4, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 0, y: 0, w: 1, h: 1 },
  },
  // ─── Level 6 ── 3 moves ─────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 3, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 1, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 4, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
      { id: 'e', x: 4, y: 2, w: 1, h: 1, color: 'orange', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 7 ── 4 moves ─────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 0, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 2, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 1, y: 2, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 2, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 4, w: 1, h: 1, color: 'teal',   shape: 'circle', goal: false },
      { id: 'f', x: 4, y: 1, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 8 ── 4 moves ─────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 3, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 2, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 4, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
      { id: 'e', x: 2, y: 4, w: 2, h: 1, color: 'orange', shape: 'rect',   goal: false },
      { id: 'f', x: 3, y: 1, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 9 ── 5 moves ─────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 1, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 0, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 1, y: 3, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'f', x: 4, y: 0, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
      { id: 'g', x: 4, y: 4, w: 1, h: 1, color: 'orange', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 10 ── 5 moves ────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 1, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 2, y: 2, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 0, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
      { id: 'f', x: 3, y: 3, w: 1, h: 2, color: 'orange', shape: 'rect',   goal: false },
      { id: 'g', x: 1, y: 4, w: 2, h: 1, color: 'purple', shape: 'rect',   goal: false },
    ],
    hole: { x: 4, y: 0, w: 1, h: 1 },
  },
  // ─── Level 11 ── 5 moves ────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 4, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 1, y: 2, w: 3, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 0, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'f', x: 3, y: 3, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
      { id: 'g', x: 1, y: 1, w: 1, h: 1, color: 'orange', shape: 'circle', goal: false },
    ],
    hole: { x: 0, y: 0, w: 1, h: 1 },
  },
  // ─── Level 12 ── 6 moves ────────────────────────────────
  {
    blocks: [
      { id: 'a', x: 3, y: 3, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 1, y: 1, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 0, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 2, y: 2, w: 1, h: 3, color: 'green',  shape: 'rect',   goal: false },
      { id: 'f', x: 0, y: 2, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
      { id: 'g', x: 0, y: 3, w: 2, h: 1, color: 'orange', shape: 'rect',   goal: false },
      { id: 'h', x: 4, y: 4, w: 1, h: 1, color: 'teal',   shape: 'circle', goal: false },
    ],
    hole: { x: 0, y: 0, w: 1, h: 1 },
  },
];

// Deep-clone blocks for reset / undo
function cloneBlocks(blocks) {
  return blocks.map(b => ({ ...b }));
}

// ── DOM refs ───────────────────────────────────────────────
const boardEl       = document.getElementById('board');
const movesEl       = document.getElementById('moves');
const levelNumEl    = document.getElementById('level-number');
const undoBtn       = document.getElementById('undo-btn');
const resetBtn      = document.getElementById('reset-btn');
const nextBtn       = document.getElementById('next-btn');
const menuBtn       = document.getElementById('menu-btn');
const winModal      = document.getElementById('win-modal');
const winMovesEl    = document.getElementById('win-moves');
const starsEl       = document.getElementById('stars');
const modalNextBtn  = document.getElementById('modal-next-btn');
const levelModal    = document.getElementById('level-modal');
const levelGrid     = document.getElementById('level-grid');
const closeLevelBtn = document.getElementById('close-level-modal');

// ── Board sizing ───────────────────────────────────────────
function updateBoardSize() {
  const rect = boardEl.getBoundingClientRect();
  boardPx = rect.width;
}

function cellPx() { return boardPx / GRID_COLS; }

// ── Collision Helpers ──────────────────────────────────────
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Check if placing a block at (nx, ny) is valid
function isValidPlacement(block, nx, ny, blocks) {
  // Boundary check
  if (nx < 0 || ny < 0 || nx + block.w > GRID_COLS || ny + block.h > GRID_ROWS) return false;

  // Collision with other blocks
  for (const other of blocks) {
    if (other.id === block.id) continue;
    if (rectsOverlap(nx, ny, block.w, block.h, other.x, other.y, other.w, other.h)) return false;
  }
  return true;
}

// Get all valid single-cell positions for a selected block
function getValidCells(block, blocks) {
  const valid = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      // Skip current position
      if (c === block.x && r === block.y) continue;
      if (isValidPlacement(block, c, r, blocks)) {
        valid.push({ x: c, y: r });
      }
    }
  }
  return valid;
}

// ── Render ─────────────────────────────────────────────────
function renderBoard() {
  boardEl.innerHTML = '';
  updateBoardSize();
  const cp = cellPx();
  const gap = 4;
  const level = LEVELS[currentLevel];

  // Compute valid placement cells if a block is selected
  let validCells = [];
  if (selectedBlock && gameActive) {
    validCells = getValidCells(selectedBlock, level.blocks);
  }

  // Grid cells (background)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.left   = (c * cp + gap / 2) + 'px';
      cell.style.top    = (r * cp + gap / 2) + 'px';
      cell.style.width  = (cp - gap) + 'px';
      cell.style.height = (cp - gap) + 'px';

      // Mark valid placement targets
      const isValid = validCells.some(v => v.x === c && v.y === r);
      if (isValid) {
        cell.classList.add('valid-target');
        cell.dataset.gridX = c;
        cell.dataset.gridY = r;
        cell.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          placeBlock(c, r);
        });
      }

      boardEl.appendChild(cell);
    }
  }

  // Hole
  const h = level.hole;
  const holeEl = document.createElement('div');
  holeEl.className = 'hole';
  holeEl.style.left   = (h.x * cp + gap / 2) + 'px';
  holeEl.style.top    = (h.y * cp + gap / 2) + 'px';
  holeEl.style.width  = (h.w * cp - gap) + 'px';
  holeEl.style.height = (h.h * cp - gap) + 'px';

  // If ball is selected and hole is a valid target, make hole clickable
  if (selectedBlock && selectedBlock.goal && gameActive) {
    const holeValid = isValidPlacement(selectedBlock, h.x, h.y, level.blocks);
    if (holeValid) {
      holeEl.classList.add('valid-target');
      holeEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        placeBlock(h.x, h.y);
      });
    }
  }

  boardEl.appendChild(holeEl);

  // Blocks
  level.blocks.forEach(b => {
    const el = document.createElement('div');
    el.className = `block ${b.color}`;
    if (b.shape === 'circle') el.classList.add('circle');
    if (b.goal) el.classList.add('goal-block');
    if (selectedBlock && selectedBlock.id === b.id) el.classList.add('selected');

    el.style.left   = (b.x * cp + gap / 2) + 'px';
    el.style.top    = (b.y * cp + gap / 2) + 'px';
    el.style.width  = (b.w * cp - gap) + 'px';
    el.style.height = (b.h * cp - gap) + 'px';

    el.dataset.id = b.id;

    // Click to select / deselect
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!gameActive) return;
      selectBlock(b.id);
    });

    boardEl.appendChild(el);
  });

  // Deselect when clicking board background (non-valid cells)
  boardEl.addEventListener('pointerdown', (e) => {
    if (e.target === boardEl) {
      selectedBlock = null;
      renderBoard();
    }
  });
}

function selectBlock(id) {
  const b = LEVELS[currentLevel].blocks.find(bl => bl.id === id);
  if (selectedBlock && selectedBlock.id === id) {
    selectedBlock = null;
  } else {
    selectedBlock = b;
  }
  renderBoard();
}

// ── Place Block (Pick-and-Place) ───────────────────────────
function placeBlock(gridX, gridY) {
  if (!gameActive || !selectedBlock) return;

  const level = LEVELS[currentLevel];
  const block = level.blocks.find(b => b.id === selectedBlock.id);
  if (!block) return;

  // Validate placement
  if (!isValidPlacement(block, gridX, gridY, level.blocks)) return;

  // Don't count if placed in same position
  if (block.x === gridX && block.y === gridY) return;

  // Save state for undo
  history.push(cloneBlocks(level.blocks));

  // Move block
  block.x = gridX;
  block.y = gridY;

  moves++;
  movesEl.textContent = moves;
  selectedBlock = null; // deselect after placement
  renderBoard();
  checkWin();
}

// ── Win Check ──────────────────────────────────────────────
function checkWin() {
  const level = LEVELS[currentLevel];
  const goalBlock = level.blocks.find(b => b.goal);
  if (!goalBlock) return;

  const hole = level.hole;
  if (goalBlock.x === hole.x && goalBlock.y === hole.y &&
      goalBlock.w === hole.w && goalBlock.h === hole.h) {
    gameActive = false;
    selectedBlock = null;
    nextBtn.disabled = false;

    setTimeout(() => showWinModal(), 350);
  }
}

function showWinModal() {
  winMovesEl.textContent = moves;
  // Stars: 3 if ≤5 moves, 2 if ≤9, 1 otherwise
  let starCount = moves <= 5 ? 3 : moves <= 9 ? 2 : 1;
  starsEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    starsEl.innerHTML += i < starCount ? '⭐' : '☆';
  }
  winModal.classList.remove('hidden');
}

// ── Undo ───────────────────────────────────────────────────
function undo() {
  if (!gameActive || history.length === 0) return;
  const prev = history.pop();
  LEVELS[currentLevel].blocks = prev;
  moves = Math.max(0, moves - 1);
  movesEl.textContent = moves;
  selectedBlock = null;
  renderBoard();
}

// ── Reset Level ────────────────────────────────────────────
const ORIGINAL_LEVELS = LEVELS.map(l => ({
  blocks: cloneBlocks(l.blocks),
  hole: { ...l.hole },
}));

function resetLevel() {
  const orig = ORIGINAL_LEVELS[currentLevel];
  LEVELS[currentLevel].blocks = cloneBlocks(orig.blocks);
  LEVELS[currentLevel].hole = { ...orig.hole };
  moves = 0;
  movesEl.textContent = 0;
  history = [];
  selectedBlock = null;
  gameActive = true;
  nextBtn.disabled = true;
  renderBoard();
}

// ── Load Level ─────────────────────────────────────────────
function loadLevel(idx) {
  if (idx < 0 || idx >= LEVELS.length) return;
  currentLevel = idx;
  levelNumEl.textContent = idx + 1;
  resetLevel();
}

function nextLevel() {
  winModal.classList.add('hidden');
  if (currentLevel + 1 < LEVELS.length) {
    loadLevel(currentLevel + 1);
  } else {
    loadLevel(0);
  }
}

// ── Level Select ───────────────────────────────────────────
function showLevelSelect() {
  levelGrid.innerHTML = '';
  for (let i = 0; i < LEVELS.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'level-cell';
    cell.textContent = i + 1;
    if (i === currentLevel) cell.classList.add('current');
    cell.addEventListener('click', () => {
      levelModal.classList.add('hidden');
      loadLevel(i);
    });
    levelGrid.appendChild(cell);
  }
  levelModal.classList.remove('hidden');
}

// ── Event Bindings ─────────────────────────────────────────
undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', resetLevel);
nextBtn.addEventListener('click', nextLevel);
modalNextBtn.addEventListener('click', nextLevel);
menuBtn.addEventListener('click', showLevelSelect);
closeLevelBtn.addEventListener('click', () => levelModal.classList.add('hidden'));

// ── Keyboard: Undo with Ctrl+Z ────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.key === 'z' && e.ctrlKey) undo();
});

// ── Resize handling ────────────────────────────────────────
window.addEventListener('resize', () => {
  updateBoardSize();
  renderBoard();
});

// ── AI Analytics (kept from original) ──────────────────────
function sendToAI() {
  fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moves, optimal: 5 }),
  })
  .then(res => res.json())
  .then(data => {
    console.log("AI Feedback:", data.feedback);
  })
  .catch(err => {
    console.log("Analytics error:", err);
  });
}

// ── Init ───────────────────────────────────────────────────
loadLevel(0);