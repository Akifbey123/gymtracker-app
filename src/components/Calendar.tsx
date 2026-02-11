import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { maxWithOptions } from 'date-fns/fp';



interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    dailyCalories?: Record<string, number>;
    daysWithMeals?: Date[];
}

export default function Calendar({ selected, onSelect, dailyCalories = {}, daysWithMeals = [] }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Generate days for the grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: tr });
    const endDate = endOfWeek(monthEnd, { locale: tr });
    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day: Date) => {
        const isAfterToday = day > new Date();
        if (isAfterToday) {
            return;
        }
        if (onSelect) {
            onSelect(day);
        }
    };

    return (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="scrollbar-hide">
            <div style={{ minWidth: '360px' }} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-auto min-h-[350px] lg:min-h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h2 className="text-2xl font-bold text-zinc-100 capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousMonth}
                            className="p-2 hover:bg-blue-600 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-blue-600 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/30">
                    {weekDays.map((day) => (
                        <div
                            key={day}
                            className="py-2 text-center text-zinc-500 font-medium text-xs uppercase tracking-wider border-r border-zinc-800/50 last:border-0"
                        >
                            {day}

                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-zinc-950/30">
                    {calendarDays.map((day, dayIdx) => {
                        const isSelected = selected && isSameDay(day, selected);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isDayToday = isToday(day);

                        const calories = dailyCalories[format(day, 'yyyy-MM-dd')] || 0;
                        const target = 3200;
                        const percentage = (calories / target) * 100;
                        const hasMeals = daysWithMeals.some(d => isSameDay(d, day));
                        const isAfterToday = day > new Date();

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => handleDayClick(day)}
                                style={{ overflow: 'hidden' }}
                                className={`
                                relative border-r border-b border-zinc-800 last:border-r-0 
                                transition-colors cursor-pointer min-h-[60px] lg:min-h-0
                                ${!isCurrentMonth ? 'bg-zinc-950/80 text-zinc-600' : 'text-zinc-300 hover:bg-zinc-900/50'}
                                ${isSelected ? 'bg-emerald-900/20' : ''}
                                ${isAfterToday ? 'bg-zinc-950/80 text-zinc-600' : ''}
                                ${(dayIdx + 1) % 7 === 0 ? 'border-r-0' : ''}
                            `}
                            >
                                {/* Day Number */}
                                <div className="absolute top-2 left-2 flex flex-col items-center">
                                    <span className={`
                                    text-sm w-7 h-7 flex items-center justify-center rounded-full
                                    ${isDayToday
                                            ? 'bg-red-500 text-white font-bold shadow-sm'
                                            : isSelected ? 'text-emerald-400 font-bold' : ''
                                        }
                                `}>
                                        {format(day, 'd')}
                                    </span>
                                </div>

                                {/* Calorie Indicator */}
                                {calories > 0 ? (
                                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', left: '4px', overflow: 'hidden' }} className="flex flex-col items-end">
                                        <span style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', display: 'block', textAlign: 'right' }} className="font-mono font-medium text-emerald-400">
                                            {calories}
                                        </span>
                                        <div
                                            className={`h-1.5 rounded-full mt-0.5 ${percentage >= 100 ? 'bg-red-500' : 'bg-sky-400'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%`, maxWidth: '100%' }}
                                        />
                                    </div>
                                ) : hasMeals && (
                                    <div className="absolute bottom-2 right-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}