export type CellMark = 'empty' | 'cross' | 'queen';

export type BoardSize = 8 | 10 | 12 | 15;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CellData {
  row: number;
  col: number;
  regionId: number;
  mark: CellMark;
}

export interface LevelData {
  id: number;
  name: string;
  size: BoardSize;
  regions: number[][];
}