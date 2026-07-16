import { useRef } from 'react';
import type { CellData } from '../types';
import type { BoardSize } from '../types';
import type { Position } from '../solver';
import { Cell } from './Cell';

interface BoardProps {
  board: CellData[][];
  conflicts: Set<string>;
  hintCell: Position | null;
  boardSize: BoardSize;
  isEraseMode: boolean;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  onCellErase: (row: number, col: number) => void;
}

export function Board({ board, conflicts, hintCell, boardSize, isEraseMode, onCellClick, onCellDrag, onCellErase }: BoardProps) {
  // MARK: Drag State
  const isDragging = useRef(false);
  const lastDragged = useRef<string | null>(null);
  const didDrag = useRef(false);
  // tracks the cell key where pointer-down fired so we can suppress the
  // synthetic click that mobile browsers fire after touchend on the same cell
  const pointerDownKey = useRef<string | null>(null);

  const getBorders = (row: number, col: number, regionId: number) => {
    return {
      top:    row > 0 && board[row - 1][col].regionId !== regionId,
      bottom: row < board.length - 1 && board[row + 1][col].regionId !== regionId,
      left:   col > 0 && board[row][col - 1].regionId !== regionId,
      right:  col < board[0].length - 1 && board[row][col + 1].regionId !== regionId,
    };
  };

  // resolves the cell key from a pointer position using elementFromPoint
  const cellFromPoint = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y);
    const cell = el?.closest('[data-cell]');
    return cell?.getAttribute('data-cell') ?? null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const key = cellFromPoint(e.clientX, e.clientY);
    if (!key) return;
    isDragging.current = true;
    didDrag.current = false;
    lastDragged.current = key;
    pointerDownKey.current = key;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const key = cellFromPoint(e.clientX, e.clientY);
    if (!key || key === lastDragged.current) return;
    // first move away from origin: also cross the origin cell if it was empty
    if (!didDrag.current && pointerDownKey.current) {
      const [or, oc] = pointerDownKey.current.split('-').map(Number);
      if (isEraseMode) onCellErase(or, oc);
      else if (board[or][oc].mark === 'empty') onCellDrag(or, oc);
    }
    didDrag.current = true;
    lastDragged.current = key;
    const [r, c] = key.split('-').map(Number);
    if (isEraseMode) onCellErase(r, c);
    else onCellDrag(r, c);
  };

  const handlePointerUp = (_e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    lastDragged.current = null;
    // tap (no drag): erase or cycle depending on mode
    if (!didDrag.current && pointerDownKey.current) {
      const [r, c] = pointerDownKey.current.split('-').map(Number);
      if (isEraseMode) onCellErase(r, c);
      else onCellClick(r, c);
    }
    didDrag.current = false;
    pointerDownKey.current = null;
  };

  // block all synthetic clicks — all interaction is handled via pointer events
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

//   MARK: Brd Cntnr
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="overflow-hidden rounded-3xl border-2 border-mist-500 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)] bg-slate-900 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        {board.map((row, rIdx) => (
          <div key={rIdx} className="flex">
            {row.map((cell, cIdx) => (
              <Cell
                key={`${rIdx}-${cIdx}`}
                data={cell}
                boardSize={boardSize}
                isConflict={conflicts.has(`${rIdx}-${cIdx}`)}
                isHinted={hintCell?.row === rIdx && hintCell?.col === cIdx}
                borders={getBorders(rIdx, cIdx, cell.regionId)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
