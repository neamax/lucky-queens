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
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
}

export function Board({ board, conflicts, hintCell, boardSize, onCellClick, onCellDrag }: BoardProps) {
  // MARK: Drag State
  const isDragging = useRef(false);
  const lastDragged = useRef<string | null>(null);
  const didDrag = useRef(false);

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
    const [r, c] = key.split('-').map(Number);
    // only start drag if the origin cell is empty
    if (board[r][c].mark !== 'empty') return;
    isDragging.current = true;
    didDrag.current = false;
    lastDragged.current = key;
    onCellDrag(r, c);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const key = cellFromPoint(e.clientX, e.clientY);
    if (!key || key === lastDragged.current) return;
    didDrag.current = true;
    lastDragged.current = key;
    const [r, c] = key.split('-').map(Number);
    onCellDrag(r, c);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    lastDragged.current = null;
  };

  // suppress click on the origin cell when a multi-cell drag occurred
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didDrag.current) {
      e.stopPropagation();
      didDrag.current = false;
    }
  };

//   MARK: Brd Cntnr
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className="overflow-hidden rounded-2xl border-2 border-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.04)] bg-slate-900 touch-none"
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
                onClick={onCellClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
