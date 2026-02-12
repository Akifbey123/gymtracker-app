import React from 'react';

interface HomeProgressRingsProps {
    weeklyPercentage: number;
    calorieDiff: number;
    ringStrokeDashoffset: number;
    weeklyProteinDiff: number;
    weeklyProteinRingStrokeDashoffset: number;
    weeklyProteinPercentage: number;
    weeklyCarbDiff: number;
    weeklyCarbRingStrokeDashoffset: number;
    weeklyCarbPercentage: number;
    weeklyFatDiff: number;
    weeklyFatRingStrokeDashoffset: number;
    weeklyFatPercentage: number;
}

const HomeProgressRings: React.FC<HomeProgressRingsProps> = ({
    weeklyPercentage,
    calorieDiff,
    ringStrokeDashoffset,
    weeklyProteinDiff,
    weeklyProteinRingStrokeDashoffset,
    weeklyProteinPercentage,
    weeklyCarbDiff,
    weeklyCarbRingStrokeDashoffset,
    weeklyCarbPercentage,
    weeklyFatDiff,
    weeklyFatRingStrokeDashoffset,
    weeklyFatPercentage,
}) => {
    return (
        <div className="flex flex-col items-center gap-6 lg:gap-12 w-full lg:w-auto">
            {/* Main Calorie Ring */}
            <div className="relative w-32 h-32 lg:w-44 lg:h-44 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                    <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={calorieDiff > 0 ? '#ef4444' : '#10b981'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="264"
                        strokeDashoffset={ringStrokeDashoffset}
                        className="transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl lg:text-4xl font-bold text-zinc-100">{Math.round(weeklyPercentage)}%</span>
                    <span className="text-[10px] lg:text-xs text-zinc-500 uppercase tracking-wider">Weekly Calories</span>
                </div>
            </div>

            {/* Macro Rings Container - Row on Mobile, Column/Grid on Desktop if needed, but keeping simple row for macros */}
            <div className="flex flex-row justify-center gap-4 w-full">
                {/* Protein Ring (Smaller) */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={weeklyProteinDiff > 0 ? '#ef4444' : '#10b981'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset={weeklyProteinRingStrokeDashoffset}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm lg:text-base font-bold text-zinc-100">{Math.round(weeklyProteinPercentage)}%</span>
                        <span className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-wider">Protein</span>
                    </div>
                </div>

                {/* Carbs Ring (Smaller) */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={weeklyCarbDiff > 0 ? '#ef4444' : '#10b981'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset={weeklyCarbRingStrokeDashoffset}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm lg:text-base font-bold text-zinc-100">{Math.round(weeklyCarbPercentage)}%</span>
                        <span className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-wider">Carbs</span>
                    </div>
                </div>

                {/* Fat Ring (Smaller) */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="6" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={weeklyFatDiff > 0 ? '#ef4444' : '#10b981'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="264"
                            strokeDashoffset={weeklyFatRingStrokeDashoffset}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm lg:text-base font-bold text-zinc-100">{Math.round(weeklyFatPercentage)}%</span>
                        <span className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-wider">Fat</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeProgressRings;
