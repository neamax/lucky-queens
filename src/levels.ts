import type { BoardSize, Difficulty } from './types';

export const BOARD_SIZES: BoardSize[] = [8, 10, 12, 15];

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export const hintsForDifficulty: Record<Difficulty, number> = {
  easy:   4,
  medium: 2,
  hard:   1,
};
