import type { BoardSize, Difficulty } from './types';

export const BOARD_SIZES: BoardSize[] = [8, 10, 12, 15];

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const hintsForDifficulty: Record<Difficulty, number> = {
  easy:   8,
  medium: 4,
  hard:   2,
};
