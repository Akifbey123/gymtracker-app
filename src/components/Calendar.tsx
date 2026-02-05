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
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
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
                    const getCaloriesForDay = (date: Date) => {
                        return dailyCalories[format(date, 'yyyy-MM-dd')] || 0;
                    };

                    const hasMeals = daysWithMeals.some(d => isSameDay(d, day));
                    const isAfterToday = day > new Date();

                    console.log(getCaloriesForDay(day));

                    const isDayToday = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleDayClick(day)}
                            className={`
                                relative border-r border-b border-zinc-800 last:border-r-0 
                                transition-colors cursor-pointer
                                ${!isCurrentMonth ? 'bg-zinc-950/80 text-zinc-600' : 'text-zinc-300 hover:bg-green-900/50'}
                                ${isSelected ? 'bg-emerald-900/20' : ''}
                                ${isAfterToday ? 'bg-zinc-950/80 text-zinc-600' : ''}
                                ${(dayIdx + 1) % 7 === 0 ? 'border-r-0' : ''} // Remove right border for last column
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
                            {getCaloriesForDay(day) > 0 ? (
                                <div className="absolute bottom-2 right-2 flex flex-col items-end w-[90%]">
                                    <span className="text-xs font-mono font-medium text-emerald-400">
                                        {getCaloriesForDay(day)} <span className="text-[9px] text-zinc-500">kcal</span>
                                    </span>
                                    <div className="h-2 bg-sky-400 rounded-full" style={{ width: `${getCaloriesForDay(day) / 3200 * 100}%` }} />
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
    );
}