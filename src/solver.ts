import type { LevelData } from './types';

export interface Position {
  row: number;
  col: number;
}

// solves the puzzle grid algorithmically using backtracking
export function solveLevel(level: LevelData): Position[] | null {
  const size = level.size;
  const solution: Position[] = [];
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();

  function canPlace(row: number, col: number, regionId: number): boolean {
    if (usedCols.has(col) || usedRegions.has(regionId)) {
      return false;
    }
    
    for (const pos of solution) {
      const rowDiff = Math.abs(pos.row - row);
      const colDiff = Math.abs(pos.col - col);
      // rowDiff > 0 guard ensures a queen never conflicts with itself
      if (rowDiff > 0 && rowDiff <= 1 && colDiff <= 1) {
        return false;
      }
    }
    
    return true;
  }

  function backtrack(row: number): boolean {
    if (row === size) {
      return true;
    }

    for (let col = 0; col < size; col++) {
      const regionId = level.regions[row][col];
      
      if (canPlace(row, col, regionId)) {
        solution.push({ row, col });
        usedCols.add(col);
        usedRegions.add(regionId);

        if (backtrack(row + 1)) {
          return true;
        }

        // backtrack state if dead end is reached
        solution.pop();
        usedCols.delete(col);
        usedRegions.delete(regionId);
      }
    }
    
    return false;
  }

  if (backtrack(0)) {
    return solution;
  }
  
  return null;
}