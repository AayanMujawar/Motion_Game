/* ============================================================
   MOTION PUZZLE – game.js
   Pick-and-place puzzle: select a piece, then tap a valid cell
   in one of the 4 cardinal directions to place it there.
   Get the ball into the hole!
   ============================================================ */

// ── Constants ──────────────────────────────────────────────
const MOVE_DURATION = 200; // ms for move animation

// ── Levels ─────────────────────────────────────────────────
// All levels use a 6×6 grid.
// ball: {x, y}  hole: {x, y}
// blocks: [{id, x, y, color, fixed}]
//   fixed=true → immovable wall (gray)
//   fixed=false → movable obstacle (can be picked and placed)
// minMoves: stated optimal solution length.

const LEVELS = [
  // ─── Level 1: "The Long Block" ── min 2 ────────────────────
  {
    name: "The Long Block",
    cols: 6, rows: 6,
    ball: { x: 0, y: 3 },
    hole: { x: 5, y: 3 },
    blocks: [
      { id: 'a', x: 2, y: 1, w: 1, h: 3, color: 'blue', fixed: false },
      { id: 'b', x: 4, y: 0, w: 1, h: 2, color: 'teal', fixed: true },
    ],
    minMoves: 3,
  },
  // ─── Level 2: "Wide Obstacle" ── min 3 ─────────────────────
  {
    name: "Wide Obstacle",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 0, y: 3, w: 3, h: 1, color: 'teal', fixed: false },
      { id: 'b', x: 3, y: 2, w: 2, h: 1, color: 'blue', fixed: true },
    ],
    minMoves: 4,
  },
  // ─── Level 3: "Sliding Doors" ── min 4 ───────────────────
  {
    name: "Sliding Doors",
    cols: 6, rows: 6,
    ball: { x: 2, y: 0 },
    hole: { x: 2, y: 5 },
    blocks: [
      { id: 'a', x: 0, y: 2, w: 4, h: 1, color: 'orange', fixed: false },
      { id: 'b', x: 2, y: 4, w: 3, h: 1, color: 'blue', fixed: false },
      { id: 'c', x: 5, y: 1, w: 1, h: 4, color: 'teal', fixed: true },
    ],
    minMoves: 5,
  },
  // ─── Level 4: "Traffic Jam" ── min 5 ─────────────────────
  {
    name: "Traffic Jam",
    cols: 6, rows: 6,
    ball: { x: 0, y: 2 },
    hole: { x: 5, y: 2 },
    blocks: [
      { id: 'a', x: 3, y: 0, w: 1, h: 3, color: 'purple', fixed: false },
      { id: 'b', x: 4, y: 4, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'c', x: 1, y: 4, w: 1, h: 2, color: 'blue', fixed: true },
    ],
    minMoves: 5,
  },
  // ─── Level 5: "The H-Bridge" ── min 5 ──────────────────
  {
    name: "The H-Bridge",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 4, color: 'teal', fixed: false },
      { id: 'b', x: 4, y: 2, w: 1, h: 4, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 2, w: 1, h: 1, color: 'blue', fixed: true },
    ],
    minMoves: 6,
  },
  // ─── Level 6: "Boxed In" ── min 6 ──────────────────────────
  {
    name: "Boxed In",
    cols: 6, rows: 6,
    ball: { x: 2, y: 2 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 1, w: 4, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 1, y: 4, w: 4, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 1, y: 2, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 4, y: 2, w: 1, h: 2, color: 'purple', fixed: false },
    ],
    minMoves: 7,
  },
  // ─── Level 7: "Shift to Open" ── min 6 ────────────────────────
  {
    name: "Shift to Open",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'b', x: 4, y: 2, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'c', x: 0, y: 2, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'd', x: 2, y: 3, w: 1, h: 3, color: 'teal', fixed: false },
    ],
    minMoves: 7,
  },
  // ─── Level 8: "The T-Junction" ── min 7 ───────────────────────
  {
    name: "The T-Junction",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 3, color: 'blue', fixed: false },
      { id: 'b', x: 0, y: 4, w: 3, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 2, w: 3, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 4, y: 4, w: 2, h: 2, color: 'yellow', fixed: false },
    ],
    minMoves: 8,
  },
  // ─── Level 9: "Crossroads" ── min 8 ───────────────────
  {
    name: "Crossroads",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'b', x: 4, y: 2, w: 1, h: 3, color: 'blue', fixed: true },
      { id: 'c', x: 1, y: 2, w: 1, h: 3, color: 'teal', fixed: false },
      { id: 'd', x: 2, y: 4, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 1, w: 2, h: 1, color: 'yellow', fixed: true },
    ],
    minMoves: 9,
  },
  // ─── Level 10: "Heavy Cargo" ── min 8 ────────────────
  {
    name: "Heavy Cargo",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 2, h: 2, color: 'blue', fixed: false },
      { id: 'b', x: 0, y: 2, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'c', x: 3, y: 3, w: 1, h: 3, color: 'teal', fixed: false },
      { id: 'd', x: 4, y: 1, w: 2, h: 1, color: 'yellow', fixed: true },
      { id: 'e', x: 1, y: 4, w: 2, h: 1, color: 'purple', fixed: false },
    ],
    minMoves: 10,
  },
  // ─── Level 11: "The Winding Path" ── min 9 ───────────────────
  {
    name: "The Winding Path",
    cols: 6, rows: 6,
    ball: { x: 5, y: 5 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 1, y: 4, w: 3, h: 1, color: 'orange', fixed: false },
      { id: 'b', x: 4, y: 1, w: 1, h: 3, color: 'blue', fixed: true },
      { id: 'c', x: 0, y: 2, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 2, y: 0, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 1, y: 1, w: 1, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 3, y: 2, w: 1, h: 2, color: 'green', fixed: false },
    ],
    minMoves: 10,
  },
  // ─── Level 12: "Barricades" ── min 10 ──────────────────────
  {
    name: "Barricades",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 3, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 3, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'c', x: 0, y: 4, w: 3, h: 1, color: 'orange', fixed: true },
      { id: 'd', x: 0, y: 2, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 1, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 3, y: 4, w: 1, h: 2, color: 'green', fixed: false },
    ],
    minMoves: 12,
  },
  // ─── Level 13: "Gridlock" ── min 11 ───────────────────
  {
    name: "Gridlock",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 0, y: 2, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 3, y: 0, w: 1, h: 3, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 2, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 2, y: 3, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 4, w: 2, h: 2, color: 'yellow', fixed: true },
      { id: 'f', x: 1, y: 1, w: 1, h: 2, color: 'green', fixed: false },
    ],
    minMoves: 13,
  },
  // ─── Level 14: "Corridor Squeeze" ── min 12 ────────────────────
  {
    name: "Corridor Squeeze",
    cols: 6, rows: 6,
    ball: { x: 0, y: 1 },
    hole: { x: 5, y: 4 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 3, color: 'blue', fixed: true },
      { id: 'b', x: 2, y: 2, w: 3, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 4, y: 0, w: 2, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 4, y: 4, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 3, w: 2, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 4, w: 1, h: 2, color: 'orange', fixed: false },
    ],
    minMoves: 14,
  },
  // ─── Level 15: "Sliding Madness" ── min 13 ───────────────────
  {
    name: "Sliding Madness",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 1, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'c', x: 0, y: 1, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 3, y: 2, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 1, y: 3, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 4, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 2, y: 3, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 4, y: 2, w: 1, h: 2, color: 'teal', fixed: false },
    ],
    minMoves: 15,
  },
  // ─── Level 16: "Interlock Complex" ── min 14 ──────────────────────
  {
    name: "Interlock Complex",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 0, y: 2, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'c', x: 3, y: 1, w: 1, h: 3, color: 'orange', fixed: false },
      { id: 'd', x: 4, y: 2, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 2, y: 3, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 4, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 5, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'i', x: 5, y: 0, w: 1, h: 2, color: 'purple', fixed: false },
    ],
    minMoves: 16,
  },
  // ─── Level 17: "The Vault" ── min 15 ────────────────
  {
    name: "The Vault",
    cols: 6, rows: 6,
    ball: { x: 5, y: 5 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 3, y: 4, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 2, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'c', x: 0, y: 4, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'd', x: 2, y: 1, w: 1, h: 3, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 2, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 1, y: 0, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 3, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 0, y: 2, w: 1, h: 2, color: 'blue', fixed: true },
    ],
    minMoves: 17,
  },
  // ─── Level 18: "Fortress" ── min 16 ─────────────────
  {
    name: "Fortress",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 1, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'c', x: 5, y: 1, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'd', x: 0, y: 3, w: 2, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 2, y: 2, w: 2, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 3, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 4, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 5, w: 2, h: 1, color: 'teal', fixed: false },
    ],
    minMoves: 18,
  },
  // ─── Level 19: "Master's Trial" ── min 18 ───────────────
  {
    name: "Master's Trial",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 1, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'c', x: 0, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 1, y: 2, w: 1, h: 3, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 2, y: 4, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 0, y: 3, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'i', x: 2, y: 3, w: 2, h: 1, color: 'teal', fixed: true },
    ],
    minMoves: 20,
  },
  // ─── Level 20: "Grandmaster" ── min 20 ────────────────
  {
    name: "Grandmaster",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 0, y: 1, w: 1, h: 3, color: 'teal', fixed: false },
      { id: 'c', x: 3, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 5, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 2, y: 2, w: 1, h: 3, color: 'yellow', fixed: false },
      { id: 'f', x: 3, y: 3, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 4, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 5, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'j', x: 0, y: 5, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'k', x: 4, y: 4, w: 1, h: 2, color: 'green', fixed: false },
    ],
    minMoves: 24,
  },
  // ═══════════════════════════════════════════════════════════
  // ██  HARD TIER  (Levels 21–30)  ██
  // Ordering dependencies, setup moves, blocking paradoxes
  // ═══════════════════════════════════════════════════════════

  // ─── Level 21: "The Detour" ── min 10 ───────────────────
  {
    name: "The Detour",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 4, color: 'purple', fixed: true },
      { id: 'b', x: 4, y: 1, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 3, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'd', x: 3, y: 4, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'e', x: 5, y: 2, w: 1, h: 2, color: 'yellow', fixed: false },
    ],
    minMoves: 10,
  },
  // ─── Level 22: "Reverse Logic" ── min 11 ────────────────
  {
    name: "Reverse Logic",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 3, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 1, y: 1, w: 1, h: 3, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 2, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 0, y: 3, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 2, y: 4, w: 3, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 3, w: 2, h: 1, color: 'green', fixed: false },
    ],
    minMoves: 11,
  },
  // ─── Level 23: "The Lock" ── min 12 ─────────────────────
  {
    name: "The Lock",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 1, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 3, y: 2, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 1, y: 3, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 4, y: 0, w: 1, h: 3, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 2, w: 1, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 5, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 5, w: 3, h: 1, color: 'orange', fixed: false },
    ],
    minMoves: 12,
  },
  // ─── Level 24: "Corridor" ── min 12 ─────────────────────
  {
    name: "Corridor",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 1, y: 3, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'c', x: 2, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 3, y: 3, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 1, w: 1, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 2, y: 4, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 5, y: 2, w: 1, h: 2, color: 'orange', fixed: false },
    ],
    minMoves: 12,
  },
  // ─── Level 25: "The Paradox" ── min 13 ──────────────────
  {
    name: "The Paradox",
    cols: 6, rows: 6,
    ball: { x: 0, y: 2 },
    hole: { x: 5, y: 2 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 2, y: 2, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 2, y: 4, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'd', x: 4, y: 0, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 3, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 4, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 5, y: 4, w: 1, h: 2, color: 'blue', fixed: true },
    ],
    minMoves: 13,
  },
  // ─── Level 26: "Double Gate" ── min 14 ──────────────────
  {
    name: "Double Gate",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 2, y: 1, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 2, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 4, y: 3, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 3, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 3, y: 5, w: 2, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 1, y: 1, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'h', x: 5, y: 1, w: 1, h: 3, color: 'orange', fixed: false },
    ],
    minMoves: 14,
  },
  // ─── Level 27: "S-Curve" ── min 14 ─────────────────────
  {
    name: "S-Curve",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 0, y: 2, w: 3, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 3, w: 3, h: 1, color: 'teal', fixed: true },
      { id: 'c', x: 3, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 1, y: 4, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 2, y: 0, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 4, w: 1, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 0, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
    ],
    minMoves: 14,
  },
  // ─── Level 28: "Deadlock" ── min 15 ─────────────────────
  {
    name: "Deadlock",
    cols: 6, rows: 6,
    ball: { x: 2, y: 0 },
    hole: { x: 3, y: 5 },
    blocks: [
      { id: 'a', x: 0, y: 1, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 2, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 0, w: 2, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 0, y: 3, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 2, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 3, w: 1, h: 2, color: 'green', fixed: true },
      { id: 'g', x: 1, y: 4, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 4, y: 2, w: 1, h: 1, color: 'teal', fixed: false },
    ],
    minMoves: 15,
  },
  // ─── Level 29: "The Bridge" ── min 16 ───────────────────
  {
    name: "The Bridge",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 5, y: 1, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'd', x: 2, y: 2, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 3, w: 3, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 3, w: 1, h: 2, color: 'green', fixed: true },
      { id: 'g', x: 1, y: 5, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 4, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 0, y: 1, w: 1, h: 2, color: 'blue', fixed: false },
    ],
    minMoves: 16,
  },
  // ─── Level 30: "Siege" ── min 17 ────────────────────────
  {
    name: "Siege",
    cols: 6, rows: 6,
    ball: { x: 3, y: 3 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 2, y: 2, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 3, y: 2, w: 1, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 3, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 3, y: 4, w: 1, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 2, y: 3, w: 1, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 1, y: 1, w: 2, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 4, y: 1, w: 1, h: 2, color: 'orange', fixed: true },
      { id: 'h', x: 0, y: 4, w: 3, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 5, y: 4, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'j', x: 1, y: 5, w: 2, h: 1, color: 'purple', fixed: false },
    ],
    minMoves: 17,
  },
  // ═══════════════════════════════════════════════════════════
  // ██  EXPERT TIER  (Levels 31–40)  ██
  // Multi-phase solutions, dead-end traps, chain dependencies
  // ═══════════════════════════════════════════════════════════

  // ─── Level 31: "Phase Shift" ── min 15 ──────────────────
  {
    name: "Phase Shift",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 2, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 2, y: 1, w: 1, h: 3, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 3, w: 1, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 0, y: 4, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 4, y: 4, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 3, y: 5, w: 1, h: 1, color: 'blue', fixed: false },
    ],
    minMoves: 15,
  },
  // ─── Level 32: "Domino Theory" ── min 16 ────────────────
  {
    name: "Domino Theory",
    cols: 6, rows: 6,
    ball: { x: 5, y: 5 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 4, y: 4, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 3, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 2, y: 2, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 1, y: 1, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 3, y: 1, w: 2, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 0, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 2, y: 4, w: 1, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 5, y: 2, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'i', x: 3, y: 5, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 1, y: 4, w: 1, h: 1, color: 'purple', fixed: false },
    ],
    minMoves: 16,
  },
  // ─── Level 33: "False Dawn" ── min 16 ───────────────────
  {
    name: "False Dawn",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 0, y: 2, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 5, y: 2, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'd', x: 2, y: 3, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 1, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 1, y: 4, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 3, y: 5, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 4, y: 4, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 2, y: 1, w: 1, h: 1, color: 'blue', fixed: false },
    ],
    minMoves: 16,
  },
  // ─── Level 34: "The Gauntlet" ── min 17 ─────────────────
  {
    name: "The Gauntlet",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 5, y: 0, w: 1, h: 3, color: 'teal', fixed: true },
      { id: 'd', x: 1, y: 2, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 2, w: 1, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 3, w: 1, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 4, y: 4, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 1, y: 5, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'j', x: 0, y: 4, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'k', x: 3, y: 5, w: 1, h: 1, color: 'yellow', fixed: false },
    ],
    minMoves: 17,
  },
  // ─── Level 35: "Chain Reaction" ── min 18 ───────────────
  {
    name: "Chain Reaction",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 2, y: 1, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 0, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'd', x: 3, y: 2, w: 1, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 2, w: 1, h: 2, color: 'yellow', fixed: true },
      { id: 'f', x: 1, y: 3, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 4, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 4, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 0, y: 5, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'j', x: 5, y: 1, w: 1, h: 2, color: 'purple', fixed: false },
    ],
    minMoves: 18,
  },
  // ─── Level 36: "Mirror Image" ── min 18 ─────────────────
  {
    name: "Mirror Image",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 1, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 4, y: 0, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 0, y: 2, w: 2, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 3, y: 2, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 2, w: 1, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 4, w: 1, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 2, y: 3, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 0, y: 4, w: 1, h: 2, color: 'blue', fixed: false },
      { id: 'j', x: 4, y: 4, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'k', x: 2, y: 5, w: 2, h: 1, color: 'yellow', fixed: true },
    ],
    minMoves: 18,
  },
  // ─── Level 37: "The Labyrinth" ── min 19 ────────────────
  {
    name: "The Labyrinth",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 0, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'c', x: 5, y: 1, w: 1, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 1, y: 1, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'e', x: 4, y: 2, w: 2, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 1, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 2, y: 2, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'h', x: 0, y: 3, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'i', x: 3, y: 4, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 4, y: 3, w: 1, h: 1, color: 'purple', fixed: false },
      { id: 'k', x: 3, y: 5, w: 2, h: 1, color: 'yellow', fixed: true },
    ],
    minMoves: 19,
  },
  // ─── Level 38: "Cascading Locks" ── min 20 ──────────────
  {
    name: "Cascading Locks",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 3, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 1, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 1, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 5, y: 2, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 4, y: 2, w: 1, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 2, w: 1, h: 2, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 5, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 1, y: 4, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 4, y: 4, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'k', x: 2, y: 5, w: 1, h: 1, color: 'yellow', fixed: false },
    ],
    minMoves: 20,
  },
  // ─── Level 39: "Entropy" ── min 21 ──────────────────────
  {
    name: "Entropy",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 5, y: 0, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'c', x: 1, y: 1, w: 1, h: 1, color: 'orange', fixed: false },
      { id: 'd', x: 3, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 0, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 4, y: 2, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 0, y: 4, w: 1, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 1, y: 3, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 2, y: 4, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 5, y: 3, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'k', x: 1, y: 5, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'l', x: 4, y: 5, w: 1, h: 1, color: 'green', fixed: false },
    ],
    minMoves: 21,
  },
  // ─── Level 40: "Crucible" ── min 22 ─────────────────────
  {
    name: "Crucible",
    cols: 6, rows: 6,
    ball: { x: 3, y: 0 },
    hole: { x: 2, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 1, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 2, y: 1, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'e', x: 3, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 1, y: 3, w: 1, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 5, y: 2, w: 1, h: 3, color: 'teal', fixed: false },
      { id: 'i', x: 0, y: 4, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'j', x: 1, y: 5, w: 1, h: 1, color: 'purple', fixed: false },
      { id: 'k', x: 3, y: 4, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'l', x: 3, y: 5, w: 2, h: 1, color: 'green', fixed: false },
    ],
    minMoves: 22,
  },
  // ═══════════════════════════════════════════════════════════
  // ██  GRANDMASTER TIER  (Levels 41–50)  ██
  // Full-grid coordination, long move chains, precise ordering
  // ═══════════════════════════════════════════════════════════

  // ─── Level 41: "Architect's Dream" ── min 20 ────────────
  {
    name: "Architect's Dream",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 3, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 2, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 4, y: 2, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 0, y: 4, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 3, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 5, y: 3, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'h', x: 1, y: 5, w: 3, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 1, y: 3, w: 1, h: 1, color: 'blue', fixed: true },
    ],
    minMoves: 20,
  },
  // ─── Level 42: "Quantum Gate" ── min 21 ─────────────────
  {
    name: "Quantum Gate",
    cols: 6, rows: 6,
    ball: { x: 5, y: 0 },
    hole: { x: 0, y: 5 },
    blocks: [
      { id: 'a', x: 3, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 1, y: 0, w: 1, h: 3, color: 'orange', fixed: false },
      { id: 'c', x: 3, y: 1, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 5, y: 2, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 3, y: 3, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 2, w: 1, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 4, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 0, y: 3, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 1, y: 4, w: 1, h: 2, color: 'blue', fixed: false },
      { id: 'j', x: 4, y: 5, w: 1, h: 1, color: 'purple', fixed: false },
    ],
    minMoves: 21,
  },
  // ─── Level 43: "The Algorithm" ── min 22 ────────────────
  {
    name: "The Algorithm",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 1, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'd', x: 2, y: 1, w: 1, h: 3, color: 'purple', fixed: true },
      { id: 'e', x: 4, y: 1, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 1, w: 1, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 3, w: 1, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 3, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 5, y: 3, w: 1, h: 2, color: 'blue', fixed: false },
      { id: 'j', x: 0, y: 5, w: 2, h: 1, color: 'purple', fixed: true },
      { id: 'k', x: 3, y: 5, w: 2, h: 1, color: 'yellow', fixed: false },
    ],
    minMoves: 22,
  },
  // ─── Level 44: "Recursive Trap" ── min 23 ───────────────
  {
    name: "Recursive Trap",
    cols: 6, rows: 6,
    ball: { x: 5, y: 5 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 4, y: 4, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 3, y: 3, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'c', x: 1, y: 5, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 2, y: 3, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 0, y: 3, w: 1, h: 2, color: 'yellow', fixed: true },
      { id: 'f', x: 4, y: 1, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 1, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 0, w: 1, h: 2, color: 'teal', fixed: true },
      { id: 'i', x: 0, y: 1, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 5, y: 2, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'k', x: 1, y: 3, w: 1, h: 1, color: 'green', fixed: true },
    ],
    minMoves: 23,
  },
  // ─── Level 45: "Grand Maze" ── min 24 ───────────────────
  {
    name: "Grand Maze",
    cols: 6, rows: 6,
    ball: { x: 0, y: 5 },
    hole: { x: 5, y: 0 },
    blocks: [
      { id: 'a', x: 0, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 5, y: 1, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 1, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 4, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 2, y: 2, w: 1, h: 1, color: 'green', fixed: false },
      { id: 'g', x: 0, y: 3, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 3, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 5, y: 3, w: 1, h: 2, color: 'blue', fixed: false },
      { id: 'j', x: 2, y: 4, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'k', x: 1, y: 5, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'l', x: 4, y: 5, w: 1, h: 1, color: 'green', fixed: false },
    ],
    minMoves: 24,
  },
  // ─── Level 46: "Neural Network" ── min 24 ───────────────
  {
    name: "Neural Network",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 1, h: 2, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 0, w: 1, h: 1, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 1, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 4, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 5, y: 1, w: 1, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 1, y: 2, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 3, y: 2, w: 1, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 5, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 2, y: 3, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 0, y: 4, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'k', x: 2, y: 4, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'l', x: 1, y: 5, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'm', x: 4, y: 5, w: 1, h: 1, color: 'orange', fixed: true },
    ],
    minMoves: 24,
  },
  // ─── Level 47: "Infinite Loop" ── min 25 ────────────────
  {
    name: "Infinite Loop",
    cols: 6, rows: 6,
    ball: { x: 3, y: 0 },
    hole: { x: 2, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 4, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 1, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 2, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 5, y: 1, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 3, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 3, y: 2, w: 1, h: 2, color: 'orange', fixed: true },
      { id: 'h', x: 1, y: 3, w: 1, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 4, y: 3, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 1, y: 4, w: 2, h: 1, color: 'purple', fixed: true },
      { id: 'k', x: 4, y: 4, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'l', x: 0, y: 5, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'm', x: 3, y: 5, w: 1, h: 1, color: 'orange', fixed: false },
    ],
    minMoves: 25,
  },
  // ─── Level 48: "Black Hole" ── min 26 ───────────────────
  {
    name: "Black Hole",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'b', x: 5, y: 0, w: 1, h: 3, color: 'orange', fixed: true },
      { id: 'c', x: 0, y: 2, w: 3, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 3, y: 1, w: 1, h: 2, color: 'purple', fixed: true },
      { id: 'e', x: 4, y: 2, w: 1, h: 2, color: 'yellow', fixed: false },
      { id: 'f', x: 0, y: 4, w: 2, h: 1, color: 'green', fixed: true },
      { id: 'g', x: 2, y: 3, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'h', x: 1, y: 5, w: 3, h: 1, color: 'teal', fixed: false },
      { id: 'i', x: 5, y: 4, w: 1, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 2, y: 4, w: 1, h: 1, color: 'purple', fixed: true },
    ],
    minMoves: 26,
  },
  // ─── Level 49: "Singularity" ── min 27 ──────────────────
  {
    name: "Singularity",
    cols: 6, rows: 6,
    ball: { x: 5, y: 5 },
    hole: { x: 0, y: 0 },
    blocks: [
      { id: 'a', x: 2, y: 0, w: 2, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 5, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 0, y: 1, w: 2, h: 1, color: 'teal', fixed: false },
      { id: 'd', x: 3, y: 1, w: 1, h: 3, color: 'purple', fixed: true },
      { id: 'e', x: 1, y: 2, w: 2, h: 1, color: 'yellow', fixed: false },
      { id: 'f', x: 5, y: 2, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 0, y: 3, w: 2, h: 1, color: 'orange', fixed: true },
      { id: 'h', x: 4, y: 3, w: 1, h: 2, color: 'teal', fixed: false },
      { id: 'i', x: 1, y: 4, w: 2, h: 1, color: 'blue', fixed: false },
      { id: 'j', x: 0, y: 5, w: 1, h: 1, color: 'purple', fixed: true },
      { id: 'k', x: 2, y: 5, w: 2, h: 1, color: 'yellow', fixed: false },
    ],
    minMoves: 27,
  },
  // ─── Level 50: "The Final Test" ── min 28 ───────────────
  {
    name: "The Final Test",
    cols: 6, rows: 6,
    ball: { x: 0, y: 0 },
    hole: { x: 5, y: 5 },
    blocks: [
      { id: 'a', x: 1, y: 0, w: 1, h: 1, color: 'blue', fixed: true },
      { id: 'b', x: 3, y: 0, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'c', x: 5, y: 0, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'd', x: 0, y: 1, w: 1, h: 2, color: 'purple', fixed: false },
      { id: 'e', x: 2, y: 1, w: 1, h: 1, color: 'yellow', fixed: true },
      { id: 'f', x: 4, y: 1, w: 1, h: 2, color: 'green', fixed: false },
      { id: 'g', x: 1, y: 2, w: 1, h: 2, color: 'orange', fixed: false },
      { id: 'h', x: 3, y: 2, w: 1, h: 1, color: 'teal', fixed: true },
      { id: 'i', x: 5, y: 2, w: 1, h: 2, color: 'blue', fixed: false },
      { id: 'j', x: 2, y: 3, w: 2, h: 1, color: 'purple', fixed: false },
      { id: 'k', x: 0, y: 4, w: 2, h: 1, color: 'yellow', fixed: true },
      { id: 'l', x: 3, y: 4, w: 2, h: 1, color: 'green', fixed: false },
      { id: 'm', x: 2, y: 5, w: 2, h: 1, color: 'orange', fixed: false },
      { id: 'n', x: 5, y: 4, w: 1, h: 1, color: 'teal', fixed: true },
    ],
    minMoves: 28,
  },
];


// ── State ──────────────────────────────────────────────────
let currentLevel  = 0;
let moves         = 0;
let selectedPiece = null;   // index into blocks array, or 'ball'
let validMoves    = [];     // array of {x, y} valid destination cells
let history       = [];     // undo stack
let gameActive    = true;
let isAnimating   = false;
let boardPx       = 320;

// Live game state (cloned from LEVELS on load)
let gameState = {
  cols: 6, rows: 6,
  ball: { x: 0, y: 0 },
  hole: { x: 0, y: 0 },
  blocks: [],
  minMoves: 0,
  name: '',
};

// Best scores localStorage
function getBestScores() {
  try { return JSON.parse(localStorage.getItem('icepuzzle_best') || '{}'); }
  catch { return {}; }
}
function saveBestScore(levelIdx, moveCount) {
  const scores = getBestScores();
  if (!scores[levelIdx] || moveCount < scores[levelIdx]) {
    scores[levelIdx] = moveCount;
    localStorage.setItem('icepuzzle_best', JSON.stringify(scores));
  }
}

// ── Deep clone helpers ─────────────────────────────────────
function cloneState() {
  return {
    ball: { ...gameState.ball },
    blocks: gameState.blocks.map(b => ({ ...b })),
  };
}

// ── DOM refs ───────────────────────────────────────────────
const boardEl       = document.getElementById('board');
const movesEl       = document.getElementById('moves');
const minMovesEl    = document.getElementById('min-moves');
const levelNumEl    = document.getElementById('level-number');
const levelNameEl   = document.getElementById('level-name');
const undoBtn       = document.getElementById('undo-btn');
const resetBtn      = document.getElementById('reset-btn');
const nextBtn       = document.getElementById('next-btn');
const menuBtn       = document.getElementById('menu-btn');
const winModal      = document.getElementById('win-modal');
const winMovesEl    = document.getElementById('win-moves');
const winMinEl      = document.getElementById('win-min');
const winBestEl     = document.getElementById('win-best');
const starsEl       = document.getElementById('stars');
const modalNextBtn  = document.getElementById('modal-next-btn');
const modalRetryBtn = document.getElementById('modal-retry-btn');
const levelModal    = document.getElementById('level-modal');
const levelGrid     = document.getElementById('level-grid');
const closeLevelBtn = document.getElementById('close-level-modal');
const instructionEl = document.getElementById('instruction');
const tierBadgeEl   = document.getElementById('tier-badge');

// ── Tier helper ────────────────────────────────────────────
const TIERS = [
  { name: 'Warmup',      cls: 'warmup',      from: 0,  to: 5  },
  { name: 'Easy',        cls: 'easy',        from: 5,  to: 10 },
  { name: 'Medium',      cls: 'medium',      from: 10, to: 20 },
  { name: 'Hard',        cls: 'hard',        from: 20, to: 30 },
  { name: 'Expert',      cls: 'expert',      from: 30, to: 40 },
  { name: 'Grandmaster', cls: 'grandmaster', from: 40, to: 50 },
];

function getTier(levelIdx) {
  for (const t of TIERS) {
    if (levelIdx >= t.from && levelIdx < t.to) return t;
  }
  return TIERS[TIERS.length - 1];
}

// ── Board sizing ───────────────────────────────────────────
function updateBoardSize() {
  const rect = boardEl.getBoundingClientRect();
  boardPx = rect.width;
}

function cellPx() { return boardPx / gameState.cols; }

// ── Occupied cell check ────────────────────────────────────
function isCellOccupied(x, y, excludeKey) {
  // Check ball
  if (excludeKey !== 'ball' && gameState.ball.x === x && gameState.ball.y === y) return true;
  // Check blocks
  for (let i = 0; i < gameState.blocks.length; i++) {
    if (excludeKey === i) continue;
    const b = gameState.blocks[i];
    const bw = b.w || 1;
    const bh = b.h || 1;
    if (x >= b.x && x < b.x + bw && y >= b.y && y < b.y + bh) return true;
  }
  return false;
}

// ── Get valid moves in 4 cardinal directions ───────────────
// Returns all empty cells reachable by walking straight in each
// direction from the piece's position. Stops at walls/obstacles.
function getValidMovesForPiece(piece, excludeKey) {
  const moves = [];
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy:  1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx:  1, dy: 0 }, // right
  ];

  const pw = piece.w || 1;
  const ph = piece.h || 1;

  for (const { dx, dy } of directions) {
    let cx = piece.x;
    let cy = piece.y;

    while (true) {
      cx += dx;
      cy += dy;

      // Check bounds
      if (cx < 0 || cx + pw > gameState.cols || cy < 0 || cy + ph > gameState.rows) break;

      // Check collisions for all occupied cells of the piece
      let collision = false;
      for (let w = 0; w < pw; w++) {
        for (let h = 0; h < ph; h++) {
          if (isCellOccupied(cx + w, cy + h, excludeKey)) {
            collision = true;
          }
        }
      }
      if (collision) break;

      moves.push({ x: cx, y: cy, dx, dy });
    }
  }

  return moves;
}

// ── Move a piece to a target cell ──────────────────────────
function movePieceTo(targetX, targetY) {
  if (!gameActive || isAnimating) return;
  if (selectedPiece === null) return;

  // Verify target is in valid moves
  const isValid = validMoves.some(m => m.x === targetX && m.y === targetY);
  if (!isValid) return;

  // Save state for undo
  history.push({ state: cloneState(), moves: moves });

  // Get the piece reference
  let piece;
  if (selectedPiece === 'ball') {
    piece = gameState.ball;
  } else {
    piece = gameState.blocks[selectedPiece];
  }

  // Animate
  isAnimating = true;

  // Update position
  piece.x = targetX;
  piece.y = targetY;
  moves++;
  movesEl.textContent = moves;

  // Clear valid moves and re-render
  validMoves = [];
  renderBoard();

  setTimeout(() => {
    isAnimating = false;
    // Check win after ball moves
    if (selectedPiece === 'ball') {
      checkWin();
    }
    // Keep the same piece selected for convenience
    if (gameActive && selectedPiece !== null) {
      computeValidMoves();
      renderBoard();
    }
  }, MOVE_DURATION + 50);
}

// ── Compute valid moves for currently selected piece ───────
function computeValidMoves() {
  if (selectedPiece === null) {
    validMoves = [];
    return;
  }

  let piece, excludeKey;
  if (selectedPiece === 'ball') {
    piece = gameState.ball;
    excludeKey = 'ball';
  } else {
    const block = gameState.blocks[selectedPiece];
    if (!block || block.fixed) {
      validMoves = [];
      return;
    }
    piece = block;
    excludeKey = selectedPiece;
  }

  validMoves = getValidMovesForPiece(piece, excludeKey);
}

// ── Render ─────────────────────────────────────────────────
function renderBoard() {
  boardEl.innerHTML = '';

  updateBoardSize();
  const cp = cellPx();
  const gap = 4;

  // Grid cells (background)
  for (let r = 0; r < gameState.rows; r++) {
    for (let c = 0; c < gameState.cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.style.left   = (c * cp + gap / 2) + 'px';
      cell.style.top    = (r * cp + gap / 2) + 'px';
      cell.style.width  = (cp - gap) + 'px';
      cell.style.height = (cp - gap) + 'px';
      boardEl.appendChild(cell);
    }
  }

  // Find current selected piece dimensions to display valid moves accurately
  let selW = 1, selH = 1;
  if (selectedPiece !== null && selectedPiece !== 'ball') {
    const b = gameState.blocks[selectedPiece];
    if (b) {
      selW = b.w || 1;
      selH = b.h || 1;
    }
  }

  // Valid move highlights
  validMoves.forEach(m => {
    let hw = 1;
    let hh = 1;
    let hx = m.x;
    let hy = m.y;
    
    if (m.dx !== undefined && m.dy !== undefined) {
      if (m.dx !== 0) {
        hw = 1;
        hh = selH;
        hx = m.dx === 1 ? m.x + selW - 1 : m.x;
      } else if (m.dy !== 0) {
        hw = selW;
        hh = 1;
        hy = m.dy === 1 ? m.y + selH - 1 : m.y;
      }
    }

    const highlight = document.createElement('div');
    highlight.className = 'valid-move';
    highlight.style.left   = (hx * cp + gap / 2) + 'px';
    highlight.style.top    = (hy * cp + gap / 2) + 'px';
    highlight.style.width  = (hw * cp - gap) + 'px';
    highlight.style.height = (hh * cp - gap) + 'px';

    highlight.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      movePieceTo(m.x, m.y);
    });

    boardEl.appendChild(highlight);
  });

  // Hole
  const h = gameState.hole;
  const holeEl = document.createElement('div');
  holeEl.className = 'hole';
  holeEl.style.left   = (h.x * cp + gap / 2) + 'px';
  holeEl.style.top    = (h.y * cp + gap / 2) + 'px';
  holeEl.style.width  = (cp - gap) + 'px';
  holeEl.style.height = (cp - gap) + 'px';
  boardEl.appendChild(holeEl);

  // Blocks
  gameState.blocks.forEach((b, idx) => {
    const el = document.createElement('div');
    el.className = `block ${b.color}`;
    if (b.fixed) el.classList.add('fixed');
    if (selectedPiece === idx) el.classList.add('selected');

    const bw = b.w || 1;
    const bh = b.h || 1;
    el.style.left   = (b.x * cp + gap / 2) + 'px';
    el.style.top    = (b.y * cp + gap / 2) + 'px';
    el.style.width  = (bw * cp - gap) + 'px';
    el.style.height = (bh * cp - gap) + 'px';

    if (b.fixed) {
      el.innerHTML = '<span class="block-icon">🧱</span>';
    }

    // Click to select
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!gameActive || isAnimating) return;
      if (b.fixed) return; // can't select fixed blocks
      selectPiece(idx);
    });

    boardEl.appendChild(el);
  });

  // Ball
  const ballEl = document.createElement('div');
  ballEl.className = 'block ball-piece';
  if (selectedPiece === 'ball') ballEl.classList.add('selected');

  ballEl.style.left   = (gameState.ball.x * cp + gap / 2) + 'px';
  ballEl.style.top    = (gameState.ball.y * cp + gap / 2) + 'px';
  ballEl.style.width  = (cp - gap) + 'px';
  ballEl.style.height = (cp - gap) + 'px';

  ballEl.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (!gameActive || isAnimating) return;
    selectPiece('ball');
  });

  boardEl.appendChild(ballEl);

  // Deselect when clicking empty background
  boardEl.addEventListener('pointerdown', (e) => {
    if (e.target === boardEl || e.target.classList.contains('grid-cell')) {
      selectedPiece = null;
      validMoves = [];
      renderBoard();
    }
  });

  // Update instruction text
  updateInstruction();
}

function selectPiece(ref) {
  if (isAnimating) return;
  if (selectedPiece === ref) {
    // Deselect
    selectedPiece = null;
    validMoves = [];
  } else {
    selectedPiece = ref;
    computeValidMoves();
  }
  renderBoard();
}

function updateInstruction() {
  if (!gameActive) {
    instructionEl.textContent = '🎉 Level Complete!';
    return;
  }
  if (selectedPiece === null) {
    instructionEl.textContent = 'Tap the ball or a movable block to select it.';
  } else if (selectedPiece === 'ball') {
    instructionEl.textContent = 'Ball selected. Tap a highlighted cell to move it there.';
  } else {
    const block = gameState.blocks[selectedPiece];
    if (block) {
      instructionEl.textContent = `Selected ${block.color} block. Tap a highlighted cell to move it.`;
    }
  }
}

// ── Win Check ──────────────────────────────────────────────
function checkWin() {
  if (gameState.ball.x === gameState.hole.x && gameState.ball.y === gameState.hole.y) {
    gameActive = false;
    selectedPiece = null;
    validMoves = [];
    nextBtn.disabled = false;

    saveBestScore(currentLevel, moves);

    // Hide ball (fell in hole)
    renderBoard();
    setTimeout(() => showWinModal(), 400);
  }
}

function showWinModal() {
  winMovesEl.textContent = moves;
  winMinEl.textContent = gameState.minMoves;
  const best = getBestScores()[currentLevel];
  winBestEl.textContent = best || moves;

  // Stars based on min moves
  const min = gameState.minMoves;
  let starCount = moves <= min ? 3 : moves <= min + 2 ? 2 : 1;
  starsEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const star = document.createElement('span');
    star.className = i < starCount ? 'star earned' : 'star';
    star.textContent = i < starCount ? '⭐' : '☆';
    star.style.animationDelay = (i * 0.15) + 's';
    starsEl.appendChild(star);
  }

  winModal.classList.remove('hidden');
  createConfetti();
}

// ── Confetti Effect ────────────────────────────────────────
function createConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colors = ['#ef5350', '#42a5f5', '#66bb6a', '#ffa726', '#ab47bc', '#26c6da', '#ffca28'];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
    confetti.style.width = (Math.random() * 6 + 4) + 'px';
    confetti.style.height = (Math.random() * 10 + 6) + 'px';
    container.appendChild(confetti);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ── Undo ───────────────────────────────────────────────────
function undo() {
  if (!gameActive || isAnimating || history.length === 0) return;
  const prev = history.pop();
  gameState.ball = prev.state.ball;
  gameState.blocks = prev.state.blocks;
  moves = prev.moves;
  movesEl.textContent = moves;
  selectedPiece = null;
  validMoves = [];
  renderBoard();
}

// ── Reset Level ────────────────────────────────────────────
function resetLevel() {
  const lvl = LEVELS[currentLevel];
  gameState.cols = lvl.cols;
  gameState.rows = lvl.rows;
  gameState.ball = { ...lvl.ball };
  gameState.hole = { ...lvl.hole };
  gameState.blocks = lvl.blocks.map(b => ({ ...b }));
  gameState.minMoves = lvl.minMoves;
  gameState.name = lvl.name;
  moves = 0;
  movesEl.textContent = 0;
  minMovesEl.textContent = lvl.minMoves;
  history = [];
  selectedPiece = null;
  validMoves = [];
  gameActive = true;
  isAnimating = false;
  nextBtn.disabled = true;
  renderBoard();
}

// ── Load Level ─────────────────────────────────────────────
function loadLevel(idx) {
  if (idx < 0 || idx >= LEVELS.length) return;
  currentLevel = idx;
  levelNumEl.textContent = idx + 1;
  levelNameEl.textContent = LEVELS[idx].name;

  // Update tier badge
  const tier = getTier(idx);
  tierBadgeEl.textContent = tier.name;
  tierBadgeEl.className = tier.cls;

  resetLevel();
}

function nextLevel() {
  winModal.classList.add('hidden');
  if (currentLevel + 1 < LEVELS.length) {
    loadLevel(currentLevel + 1);
  } else {
    // All levels complete!
    loadLevel(0);
  }
}

function retryLevel() {
  winModal.classList.add('hidden');
  resetLevel();
}

// ── Level Select ───────────────────────────────────────────
function showLevelSelect() {
  levelGrid.innerHTML = '';
  const scores = getBestScores();
  let currentTierIdx = -1;

  for (let i = 0; i < LEVELS.length; i++) {
    // Insert tier header when entering a new tier
    const tier = getTier(i);
    const tierIdx = TIERS.indexOf(tier);
    if (tierIdx !== currentTierIdx) {
      currentTierIdx = tierIdx;
      const header = document.createElement('div');
      header.className = `tier-header ${tier.cls}`;
      header.textContent = `${tier.name} (${tier.from + 1}–${tier.to})`;
      levelGrid.appendChild(header);
    }

    const cell = document.createElement('div');
    cell.className = 'level-cell';
    if (i === currentLevel) cell.classList.add('current');
    if (scores[i]) cell.classList.add('completed');

    const num = document.createElement('span');
    num.className = 'level-num';
    num.textContent = i + 1;
    cell.appendChild(num);

    if (scores[i]) {
      const best = document.createElement('span');
      best.className = 'level-best';
      best.textContent = `★${scores[i]}`;
      cell.appendChild(best);
    }

    cell.addEventListener('click', () => {
      levelModal.classList.add('hidden');
      loadLevel(i);
    });
    levelGrid.appendChild(cell);
  }
  levelModal.classList.remove('hidden');
}

// ── Input: Keyboard (Ctrl+Z for undo) ──────────────────────
window.addEventListener('keydown', (e) => {
  if (e.key === 'z' && e.ctrlKey) { undo(); return; }
});

// ── Event Bindings ─────────────────────────────────────────
undoBtn.addEventListener('click', undo);
resetBtn.addEventListener('click', resetLevel);
nextBtn.addEventListener('click', nextLevel);
modalNextBtn.addEventListener('click', nextLevel);
modalRetryBtn.addEventListener('click', retryLevel);
menuBtn.addEventListener('click', showLevelSelect);
closeLevelBtn.addEventListener('click', () => levelModal.classList.add('hidden'));

// ── Resize handling ────────────────────────────────────────
window.addEventListener('resize', () => {
  updateBoardSize();
  renderBoard();
});

// ── Init ───────────────────────────────────────────────────
loadLevel(0);