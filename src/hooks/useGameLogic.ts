import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BoardSize, Difficulty, LevelData, CellData, CellMark } from '../types';
import { solveLevel, type Position } from '../solver';
import { generateLevel } from '../generator';
import { hintsForDifficulty } from '../levels';

type GameState = 'idle' | 'playing' | 'won';

const EMPTY_BOARD: CellData[][] = [];

export function useGameLogic(
    size: BoardSize,
    difficulty: Difficulty,
    initialAutoCross = true,
    onAutoCrossChange?: (v: boolean) => void,
) {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [isAutoCrossEnabled, setIsAutoCrossEnabledRaw] = useState<boolean>(initialAutoCross);

    const setIsAutoCrossEnabled = useCallback((v: boolean) => {
        setIsAutoCrossEnabledRaw(v);
        onAutoCrossChange?.(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [moveCount, setMoveCount] = useState<number>(0);
    const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
    const [hintsRemaining, setHintsRemaining] = useState<number>(hintsForDifficulty[difficulty]);
    const [hintCell, setHintCell] = useState<Position | null>(null);
    const [level, setLevel] = useState<LevelData | null>(null);
    const [board, setBoard] = useState<CellData[][]>(EMPTY_BOARD);
    // maps each queen key ('row-col') to the set of cells it auto-crossed
    const autoCrossed = useRef<Map<string, Set<string>>>(new Map());

    // reset to idle whenever size or difficulty changes so stale boards are never shown
    useEffect(() => {
        setGameState('idle');
        setLevel(null);
        setBoard(EMPTY_BOARD);
        autoCrossed.current = new Map();
        setMoveCount(0);
        setSecondsElapsed(0);
        setHintsRemaining(hintsForDifficulty[difficulty]);
        setHintCell(null);
    }, [size, difficulty]);

    const solution = useMemo(() => (level ? solveLevel(level) : null), [level]);

    const buildBoard = useCallback((l: LevelData): CellData[][] =>
        l.regions.map((row, rIdx) =>
            row.map((regionId, cIdx) => ({
                row: rIdx,
                col: cIdx,
                regionId,
                mark: 'empty' as CellMark,
            }))
        )
    , []);

    // MARK: Timer
    // only runs while playing
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            setSecondsElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [gameState]);

    const { conflicts, placedQueensCount } = useMemo(() => {
        const invalidCells = new Set<string>();
        const queens: CellData[] = [];

        board.forEach(row => {
            row.forEach(cell => {
                if (cell.mark === 'queen') queens.push(cell);
            });
        });

        for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
                const q1 = queens[i];
                const q2 = queens[j];
                if (
                    q1.row === q2.row ||
                    q1.col === q2.col ||
                    q1.regionId === q2.regionId ||
                    (Math.abs(q1.row - q2.row) <= 1 && Math.abs(q1.col - q2.col) <= 1)
                ) {
                    invalidCells.add(`${q1.row}-${q1.col}`);
                    invalidCells.add(`${q2.row}-${q2.col}`);
                }
            }
        }

        return { conflicts: invalidCells, placedQueensCount: queens.length };
    }, [board]);

    // MARK: Win
    // transition to won when all queens placed with no conflicts
    useEffect(() => {
        if (gameState === 'playing' && level && placedQueensCount === level.size && conflicts.size === 0) {
            setGameState('won');
        }
    }, [gameState, level, placedQueensCount, conflicts]);

    // MARK: Start/Reset
    // generates a new board and starts the game
    const start = useCallback(() => {
        const newLevel = generateLevel(size, difficulty);
        setLevel(newLevel);
        setBoard(buildBoard(newLevel));
        autoCrossed.current = new Map();
        setMoveCount(0);
        setSecondsElapsed(0);
        setHintsRemaining(hintsForDifficulty[difficulty]);
        setHintCell(null);
        setGameState('playing');
    }, [size, difficulty, buildBoard]);

    // MARK: Reset
    // resets marks only — same board layout, back to playing
    const resetGame = useCallback(() => {
        if (!level) return;
        setBoard(buildBoard(level));
        autoCrossed.current = new Map();
        setMoveCount(0);
        setSecondsElapsed(0);
        setHintsRemaining(hintsForDifficulty[difficulty]);
        setHintCell(null);
        setGameState('playing');
    }, [level, buildBoard, difficulty]);

    const toggleCell = useCallback((row: number, col: number) => {
        if (gameState !== 'playing') return;
        if (hintCell && hintCell.row === row && hintCell.col === col) setHintCell(null);

        const currentMark = board[row][col].mark;
        let nextMark: CellMark = 'empty';
        if (currentMark === 'empty') nextMark = 'cross';
        else if (currentMark === 'cross') nextMark = 'queen';

        // MARK: Auto-cross
        if (isAutoCrossEnabled && nextMark === 'queen') {
            // record which empty cells this queen will auto-cross, using current board snapshot
            const queenKey = `${row}-${col}`;
            const targetRegion = board[row][col].regionId;
            const crossed = new Set<string>();
            for (let r = 0; r < board.length; r++) {
                for (let c = 0; c < board[r].length; c++) {
                    if (r === row && c === col) continue;
                    if (
                        (r === row || c === col || board[r][c].regionId === targetRegion ||
                        (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1)) &&
                        board[r][c].mark === 'empty'
                    ) crossed.add(`${r}-${c}`);
                }
            }
            autoCrossed.current.set(queenKey, crossed);
        } else if (isAutoCrossEnabled && nextMark === 'empty' && currentMark === 'queen') {
            autoCrossed.current.delete(`${row}-${col}`);
        }

        // only count as a move when the mark actually changes
        setMoveCount(prev => prev + 1);

        setBoard(prev => {
            const newBoard = prev.map(r => r.map(c => ({ ...c })));
            newBoard[row][col].mark = nextMark;

            if (isAutoCrossEnabled) {
                if (nextMark === 'queen') {
                    // apply the auto-crosses we already recorded
                    const crossed = autoCrossed.current.get(`${row}-${col}`) ?? new Set<string>();
                    for (const key of crossed) {
                        const [r, c] = key.split('-').map(Number);
                        newBoard[r][c].mark = 'cross';
                    }
                } else if (nextMark === 'empty' && currentMark === 'queen') {
                    // use the stored set to know exactly which cells this queen auto-crossed
                    const targetRegion = newBoard[row][col].regionId;
                    const coveredByOthers = new Set<string>();
                    for (const cells of autoCrossed.current.values()) {
                        for (const key of cells) coveredByOthers.add(key);
                    }
                    // only clear cells that were auto-crossed by this queen and not covered by another
                    for (let r = 0; r < newBoard.length; r++) {
                        for (let c = 0; c < newBoard[r].length; c++) {
                            if (r === row && c === col) continue;
                            const key = `${r}-${c}`;
                            if (
                                (r === row || c === col || newBoard[r][c].regionId === targetRegion ||
                                (Math.abs(r - row) <= 1 && Math.abs(c - col) <= 1)) &&
                                newBoard[r][c].mark === 'cross' &&
                                !coveredByOthers.has(key)
                            ) {
                                // only undo if this cell was originally auto-crossed by this queen,
                                // not manually placed by the user
                                const wasAutoCrossedByUs = board[r][c].mark === 'empty';
                                if (wasAutoCrossedByUs) newBoard[r][c].mark = 'empty';
                            }
                        }
                    }
                }
            }

            return newBoard;
        });
    }, [gameState, isAutoCrossEnabled, hintCell, board]);

    // MARK: Drag Cross
    // applies a cross to a single empty cell — used by drag gestures
    // MARK: Erase
    // clears any marked cell back to empty
    const eraseCell = useCallback((row: number, col: number) => {
        if (gameState !== 'playing') return;
        if (board[row][col].mark === 'empty') return;
        // if erasing a queen, also remove its auto-cross record
        if (board[row][col].mark === 'queen') {
            autoCrossed.current.delete(`${row}-${col}`);
        }
        setMoveCount(prev => prev + 1);
        setBoard(prev => {
            const newBoard = prev.map(r => r.map(c => ({ ...c })));
            newBoard[row][col].mark = 'empty';
            return newBoard;
        });
    }, [gameState, board]);

    const dragCross = useCallback((row: number, col: number) => {
        if (gameState !== 'playing') return;
        setBoard(prev => {
            if (prev[row][col].mark !== 'empty') return prev;
            const newBoard = prev.map(r => r.map(c => ({ ...c })));
            newBoard[row][col].mark = 'cross';
            setMoveCount(m => m + 1);
            return newBoard;
        });
    }, [gameState]);

    const requestHint = useCallback(() => {
        if (hintsRemaining <= 0 || gameState !== 'playing' || !solution) return;
        for (const pos of solution) {
            // skip cells already correctly placed or manually crossed out
            if (board[pos.row][pos.col].mark === 'empty' || board[pos.row][pos.col].mark === 'cross') {
                setHintCell(pos);
                setHintsRemaining(prev => prev - 1);
                break;
            }
        }
    }, [hintsRemaining, gameState, solution, board]);

    return {
        gameState,
        board,
        level,
        toggleCell,
        conflicts,
        isAutoCrossEnabled,
        setIsAutoCrossEnabled,
        moveCount,
        secondsElapsed,
        start,
        resetGame,
        hintsRemaining,
        hintsMax: hintsForDifficulty[difficulty],
        hintCell,
        requestHint,
        dragCross,
        eraseCell,
    };
}

// TODO: auto-cross colors, erase button, hint system, undo