import type { CellData } from '../types';
import type { BoardSize } from '../types';
import { cn } from '@/lib/utils';

interface CellProps {
    data: CellData;
    isConflict: boolean;
    isHinted: boolean;
    boardSize: BoardSize;
    borders: {
        top: boolean;
        bottom: boolean;
        left: boolean;
        right: boolean;
    };
    onClick: (row: number, col: number) => void;
}

const regionColours: Record<number, string> = {
    1: 'from-olive-300 to-olive-200',
    2: 'from-mist-300 to-mist-200',
    3: 'from-mauve-300 to-mauve-200',
    4: 'from-slate-300 to-slate-200',
    5: 'from-rose-200 to-rose-100',
    6: 'from-purple-200 to-purple-100',
    7: 'from-blue-200 to-blue-100',
    8: 'from-white to-gray-100',
    9: 'from-lime-200 to-lime-100',
    10: 'from-pink-200 to-pink-100',
    11: 'from-indigo-300 to-indigo-200',
    12: 'from-yellow-200 to-yellow-100',
    13: 'from-red-300 to-red-200',
    14: 'from-orange-300 to-orange-200',
    15: 'from-emerald-200 to-emerald-100',
};

const cellSizeClass: Record<BoardSize, string> = {
    8: 'h-11 w-11 sm:h-14 sm:w-14 text-2xl',
    10: 'h-9 w-9 sm:h-11 sm:w-11 text-xl',
    12: 'h-7 w-7 sm:h-9 sm:w-9 text-lg',
    15: 'h-6 w-6 sm:h-8 sm:w-8 text-base',
};

export function Cell({ data, isConflict, isHinted, boardSize, borders, onClick }: CellProps) {
    return (
        <div
            data-cell={`${data.row}-${data.col}`}
            onClick={() => onClick(data.row, data.col)}
            className={cn(
                'bg-conic-45 hover:bg-conic-225 inset-shadow-sm hover:inset-shadow-gray-500 cell-tile flex cursor-pointer select-none rounded rounded-xs items-center justify-center transition-all duration-150 font-medium relative',
                cellSizeClass[boardSize],
                regionColours[data.regionId] || 'from-gray-200 to-gray-100',
                borders.top ? 'border-t-[1px] border-t-mist-600/80' : 'border-t border-t-mist-600/15',
                borders.bottom ? 'border-b-[1px] border-b-mist-600/80' : 'border-b border-b-mist-600/15',
                borders.left ? 'border-l-[1px] border-l-mist-600/80' : 'border-l border-l-mist-600/15',
                borders.right ? 'border-r-[1px] border-r-mist-600/80' : 'border-r border-r-mist-600/15',
                isConflict && data.mark === 'queen' && 'animate-pulse bg-red-500 text-black',
                isHinted && !isConflict && 'ring-4 ring-inset animate-pulse z-10 shadow-lg'
            )}
        >
            {data.mark === 'queen' && (
                <span className={cn('drop-shadow-md text-shadow-lg text-shadow-yellow-500/50 transform transition-transform duration-150 scale-105', isConflict ? 'text-red-500' : 'text-slate-700/80')}>
                    ♛
                </span>
            )}
            {data.mark === 'cross' && (
                <span className="font-bold text-slate-700/80">✕</span>
            )}
        </div>
    );
}
