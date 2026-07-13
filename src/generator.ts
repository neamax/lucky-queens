import type { BoardSize, Difficulty, LevelData } from './types';

// seeded PRNG (mulberry32) so generation is reproducible when needed
function makePRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// MARK: Queen Placement
function placeQueens(size: number, rand: () => number): { row: number; col: number }[] | null {
  const solution: { row: number; col: number }[] = [];
  const usedCols = new Set<number>();

  function canPlace(row: number, col: number): boolean {
    if (usedCols.has(col)) return false;
    for (const q of solution) {
      if (Math.abs(q.row - row) <= 1 && Math.abs(q.col - col) <= 1) return false;
    }
    return true;
  }

  function backtrack(row: number): boolean {
    if (row === size) return true;
    const cols = shuffle(Array.from({ length: size }, (_, i) => i), rand);
    for (const col of cols) {
      if (canPlace(row, col)) {
        solution.push({ row, col });
        usedCols.add(col);
        if (backtrack(row + 1)) return true;
        solution.pop();
        usedCols.delete(col);
      }
    }
    return false;
  }

  return backtrack(0) ? solution : null;
}

// MARK: Region Flood-Fill
function buildRegions(
  size: number,
  queens: { row: number; col: number }[],
  difficulty: Difficulty,
  rand: () => number
): number[][] {
  const grid: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const queues: Map<number, [number, number][]> = new Map();
  queens.forEach((q, idx) => {
    const regionId = idx + 1;
    grid[q.row][q.col] = regionId;
    queues.set(regionId, [[q.row, q.col]]);
  });

  let remaining = size * size - queens.length;
  while (remaining > 0) {
    for (const [regionId, queue] of queues) {
      if (queue.length === 0) continue;
      let r: number, c: number;
      if (difficulty === 'easy') {
        [r, c] = queue.pop()!;
      } else if (difficulty === 'hard') {
        [r, c] = queue.shift()!;
      } else {
        const idx = Math.floor(rand() * queue.length);
        [[r, c]] = queue.splice(idx, 1);
      }
      const dirs = shuffle([...DIRS], rand);
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 0) {
          grid[nr][nc] = regionId;
          queue.push([nr, nc]);
          remaining--;
        }
      }
    }
  }

  return grid;
}

// MARK: One-Cell Region Limit
const maxSingleCellRegions: Record<Difficulty, number> = {
  easy:   3,
  medium: 1,
  hard:   0,
};

const minSingleCellRegions: Record<Difficulty, number> = {
  easy:   1,
  medium: 0,
  hard:   0,
};

// grows excess single-cell regions by stealing a cell from the largest adjacent neighbour,
// and ensures a minimum number of single-cell regions by carving the queen cell out of a large region
function fixSingleCellRegions(
  grid: number[][],
  size: number,
  queens: { row: number; col: number }[],
  min: number,
  max: number
): void {
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const getRegionSizes = () => {
    const sizes = new Map<number, number>();
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        sizes.set(grid[r][c], (sizes.get(grid[r][c]) ?? 0) + 1);
    return sizes;
  };

  const getSingles = (sizes: Map<number, number>) =>
    [...sizes.entries()].filter(([, sz]) => sz === 1).map(([id]) => id);

  let regionSizes = getRegionSizes();
  let singles = getSingles(regionSizes);
  let excess = singles.length - max;

  for (const regionId of singles) {
    if (excess <= 0) break;
    let sr = -1, sc = -1;
    outer: for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === regionId) { sr = r; sc = c; break outer; }

    let bestR = -1, bestC = -1, bestSize = -1;
    for (const [dr, dc] of DIRS) {
      const nr = sr + dr, nc = sc + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const nId = grid[nr][nc];
      if (nId === regionId) continue;
      const nSize = regionSizes.get(nId) ?? 0;
      if (nSize > bestSize) { bestSize = nSize; bestR = nr; bestC = nc; }
    }

    if (bestR === -1) continue;
    grid[bestR][bestC] = regionId;
    regionSizes = getRegionSizes();
    excess--;
  }

  // MARK: min singles
  regionSizes = getRegionSizes();
  singles = getSingles(regionSizes);
  let deficit = min - singles.length;
  if (deficit <= 0) return;

  let nextId = size + 1;

  for (let attempt = 0; attempt < deficit; attempt++) {
    regionSizes = getRegionSizes();

    const candidate = queens
      .map((q, idx) => ({ q, id: idx + 1, sz: regionSizes.get(idx + 1) ?? 0 }))
      .filter(({ sz }) => sz > 2)
      .sort((a, b) => b.sz - a.sz)[0];
    if (!candidate) break;

    const { q, id: oldId } = candidate;

    const newId = nextId++;
    grid[q.row][q.col] = newId;
    regionSizes = getRegionSizes();

    // BFS: absorb every remaining cell of oldId into its largest adjacent foreign neighbour
    const toMerge: [number, number][] = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === oldId) toMerge.push([r, c]);

    let changed = true;
    while (changed) {
      changed = false;
      for (let i = toMerge.length - 1; i >= 0; i--) {
        const [r, c] = toMerge[i];
        if (grid[r][c] !== oldId) { toMerge.splice(i, 1); changed = true; continue; }
        let bestId = -1, bestSz = -1;
        for (const [dr, dc] of DIRS) {
          const ar = r + dr, ac = c + dc;
          if (ar < 0 || ar >= size || ac < 0 || ac >= size) continue;
          const aId = grid[ar][ac];
          if (aId === oldId || aId === newId) continue;
          const aSz = regionSizes.get(aId) ?? 0;
          if (aSz > bestSz) { bestSz = aSz; bestId = aId; }
        }
        if (bestId !== -1) {
          grid[r][c] = bestId;
          regionSizes = getRegionSizes();
          toMerge.splice(i, 1);
          changed = true;
        }
      }
    }

    // remap newId → oldId so region ids stay in the 1..size range
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (grid[r][c] === newId) grid[r][c] = oldId;
  }
}

// MARK: Public API
export function generateLevel(size: BoardSize, difficulty: Difficulty, seed?: number): LevelData {
  const rand = makePRNG(seed ?? (Date.now() ^ Math.floor(Math.random() * 0xffffffff)));

  let queens: { row: number; col: number }[] | null = null;
  for (let attempt = 0; attempt < 100; attempt++) {
    queens = placeQueens(size, rand);
    if (queens) break;
  }

  if (!queens) throw new Error(`generateLevel: failed to place queens for size ${size}`);

  const regions = buildRegions(size, queens, difficulty, rand);
  fixSingleCellRegions(regions, size, queens, minSingleCellRegions[difficulty], maxSingleCellRegions[difficulty]);

  return { id: 0, name: 'Generated', size, regions };
}
