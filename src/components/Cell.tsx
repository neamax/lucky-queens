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
}

const regionColours: Record<number, string> = {
    1: 'from-olive-400 to-olive-200',
    2: 'from-mauve-300/85 to-mauve-50',
    3: 'from-rose-200/80 to-rose-50',
    4: 'from-purple-300 to-purple-100',
    5: 'from-blue-200 to-blue-50',
    6: 'from-white to-gray-200',
    7: 'from-lime-200 to-lime-50',
    8: 'from-slate-300/70 to-slate-50',
    9: 'from-pink-200 to-pink-100',
    10: 'from-indigo-300 to-indigo-100',
    11: 'from-yellow-200 to-yellow-50',
    12: 'from-red-300 to-red-200',
    13: 'from-orange-300 to-orange-100',
    14: 'from-mist-300 to-mist-50',
    15: 'from-emerald-200 to-emerald-50',
};

const cellSizeClass: Record<BoardSize, string> = {
    8: 'h-11 w-11 sm:h-14 sm:w-14 text-2xl',
    10: 'h-9 w-9 sm:h-11 sm:w-11 text-xl',
    12: 'h-7 w-7 sm:h-9 sm:w-9 text-lg',
    15: 'h-6 w-6 sm:h-8 sm:w-8 text-base',
};

export function Cell({ data, isConflict, isHinted, boardSize, borders }: CellProps) {
    return (
        <div
            data-cell={`${data.row}-${data.col}`}
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
