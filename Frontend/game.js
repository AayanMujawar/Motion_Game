/* ============================================================
   SLIDING BLOCK PUZZLE – game.js
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

const LEVELS = [
  // ─── Level 1 ── Easy: 2 moves. Right→Up ──────────────
  // Red starts at (0,4). Blue wall block at (2,4) stops it. Then up, wall block at (2,0) area stops at hole.
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 2, y: 2, w: 1, h: 3, color: 'blue',   shape: 'rect',   goal: false },
    ],
    hole: { x: 1, y: 0, w: 1, h: 1 },
  },
  // ─── Level 2 ── 3 moves ──────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 0, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 3, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
    ],
    hole: { x: 3, y: 4, w: 1, h: 1 },
  },
  // ─── Level 3 ── Introduce more blocks ────────────────
  {
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 3, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 2, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 4, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
    ],
    hole: { x: 3, y: 0, w: 1, h: 1 },
  },
  // ─── Level 4 ── Need to clear path ───────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 2, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 2, y: 2, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 3, w: 1, h: 1, color: 'green',  shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 2, w: 1, h: 1 },
  },
  // ─── Level 5 ── Tighter puzzle ───────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 1, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 2, y: 3, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 4, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 0, y: 0, w: 1, h: 1 },
  },
  // ─── Level 6 ── Maze-like ────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 3, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 1, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 0, y: 3, w: 2, h: 1, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 2, w: 1, h: 1, color: 'orange', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 7 ── 6 blocks ────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 0, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 2, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 1, y: 2, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 2, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 0, y: 4, w: 1, h: 1, color: 'teal',   shape: 'circle', goal: false },
      { id: 'f', x: 4, y: 1, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 8 ── Complex ─────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 3, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 2, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 4, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 2, y: 4, w: 2, h: 1, color: 'orange', shape: 'rect',   goal: false },
      { id: 'f', x: 3, y: 1, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 9 ── 7 blocks ───────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 2, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 1, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 3, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 0, y: 0, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'e', x: 1, y: 3, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'f', x: 4, y: 0, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
      { id: 'g', x: 2, y: 1, w: 1, h: 2, color: 'orange', shape: 'rect',   goal: false },
    ],
    hole: { x: 4, y: 4, w: 1, h: 1 },
  },
  // ─── Level 10 ── Dense ─────────────────────────────
  {
    blocks: [
      { id: 'a', x: 0, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 1, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 0, y: 1, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 2, y: 2, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 4, y: 1, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'f', x: 3, y: 3, w: 1, h: 2, color: 'orange', shape: 'rect',   goal: false },
      { id: 'g', x: 1, y: 4, w: 2, h: 1, color: 'purple', shape: 'rect',   goal: false },
    ],
    hole: { x: 4, y: 0, w: 1, h: 1 },
  },
  // ─── Level 11 ── Tricky ────────────────────────────
  {
    blocks: [
      { id: 'a', x: 2, y: 4, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'c', x: 4, y: 0, w: 1, h: 3, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'd', x: 1, y: 2, w: 3, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 0, y: 3, w: 1, h: 2, color: 'green',  shape: 'rect',   goal: false },
      { id: 'f', x: 3, y: 3, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
      { id: 'g', x: 1, y: 1, w: 1, h: 1, color: 'orange', shape: 'circle', goal: false },
    ],
    hole: { x: 0, y: 0, w: 1, h: 1 },
  },
  // ─── Level 12 ── Hard ──────────────────────────────
  {
    blocks: [
      { id: 'a', x: 3, y: 3, w: 1, h: 1, color: 'red',    shape: 'circle', goal: true },
      { id: 'b', x: 0, y: 0, w: 1, h: 2, color: 'yellow',  shape: 'rect',   goal: false },
      { id: 'c', x: 1, y: 1, w: 2, h: 1, color: 'blue',   shape: 'rect',   goal: false },
      { id: 'd', x: 3, y: 0, w: 2, h: 1, color: 'teal',   shape: 'rect',   goal: false },
      { id: 'e', x: 2, y: 2, w: 1, h: 3, color: 'green',  shape: 'rect',   goal: false },
      { id: 'f', x: 4, y: 2, w: 1, h: 1, color: 'purple', shape: 'circle', goal: false },
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

// ── Render ─────────────────────────────────────────────────
function renderBoard() {
  boardEl.innerHTML = '';
  updateBoardSize();
  const cp = cellPx();
  const gap = 4;
  const level = LEVELS[currentLevel];

  // Grid cells (background)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.left   = (c * cp + gap / 2) + 'px';
      cell.style.top    = (r * cp + gap / 2) + 'px';
      cell.style.width  = (cp - gap) + 'px';
      cell.style.height = (cp - gap) + 'px';
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

    // Click to select
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!gameActive) return;
      selectBlock(b.id);
    });

    boardEl.appendChild(el);
  });

  // Deselect when clicking board background
  boardEl.addEventListener('pointerdown', (e) => {
    if (e.target === boardEl || e.target.classList.contains('grid-cell')) {
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

// ── Movement ───────────────────────────────────────────────
function canMoveTo(block, dx, dy, blocks, hole) {
  const nx = block.x + dx;
  const ny = block.y + dy;

  // Boundary check
  if (nx < 0 || ny < 0 || nx + block.w > GRID_COLS || ny + block.h > GRID_ROWS) return false;

  // Collision with other blocks
  for (const other of blocks) {
    if (other.id === block.id) continue;
    if (rectsOverlap(nx, ny, block.w, block.h, other.x, other.y, other.w, other.h)) return false;
  }
  return true;
}

function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function moveBlock(direction) {
  if (!gameActive || !selectedBlock) return;
  
  const level = LEVELS[currentLevel];
  const block = level.blocks.find(b => b.id === selectedBlock.id);
  if (!block) return;

  let dx = 0, dy = 0;
  if (direction === 'left')  dx = -1;
  if (direction === 'right') dx =  1;
  if (direction === 'up')    dy = -1;
  if (direction === 'down')  dy =  1;

  // Slide until can't move further
  let moved = false;
  const prevBlocks = cloneBlocks(level.blocks);

  while (canMoveTo(block, dx, dy, level.blocks, level.hole)) {
    block.x += dx;
    block.y += dy;
    moved = true;
  }

  if (moved) {
    history.push(prevBlocks);
    moves++;
    movesEl.textContent = moves;
    selectedBlock = block; // keep selected
    renderBoard();
    checkWin();
  }
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
  // Stars: 3 if <6 moves, 2 if <10, 1 otherwise
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
// We need original level data — deep clone on load
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
    // All done - restart from first
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

// ── Swipe Detection ────────────────────────────────────────
let touchStart = null;

boardEl.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}, { passive: true });

boardEl.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 25;

  if (Math.max(absDx, absDy) < threshold) {
    touchStart = null;
    return;
  }

  if (absDx > absDy) {
    moveBlock(dx > 0 ? 'right' : 'left');
  } else {
    moveBlock(dy > 0 ? 'down' : 'up');
  }
  touchStart = null;
}, { passive: true });

// Mouse-swipe fallback for desktop
let mouseStart = null;
boardEl.addEventListener('mousedown', (e) => {
  mouseStart = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', (e) => {
  if (!mouseStart) return;
  const dx = e.clientX - mouseStart.x;
  const dy = e.clientY - mouseStart.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 25;

  if (Math.max(absDx, absDy) >= threshold) {
    if (absDx > absDy) {
      moveBlock(dx > 0 ? 'right' : 'left');
    } else {
      moveBlock(dy > 0 ? 'down' : 'up');
    }
  }
  mouseStart = null;
});

// ── Keyboard Controls ──────────────────────────────────────
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':  e.preventDefault(); moveBlock('left');  break;
    case 'ArrowRight': e.preventDefault(); moveBlock('right'); break;
    case 'ArrowUp':    e.preventDefault(); moveBlock('up');    break;
    case 'ArrowDown':  e.preventDefault(); moveBlock('down');  break;
    case 'z': if (e.ctrlKey) undo(); break;
  }
});

// ── Event Bindings ─────────────────────────────────────────
undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', resetLevel);
nextBtn.addEventListener('click', nextLevel);
modalNextBtn.addEventListener('click', nextLevel);
menuBtn.addEventListener('click', showLevelSelect);
closeLevelBtn.addEventListener('click', () => levelModal.classList.add('hidden'));

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