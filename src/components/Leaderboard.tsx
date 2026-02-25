import React, { useState, useEffect } from 'react';
import { Trophy, ChevronDown, User, Dumbbell, Info } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import NoteModal from './modal1'
interface LeaderboardUser {
    rank: number;
    username: string;
    weight: number;
    date: string;
    avatar?: string;
}

const EXERCISES = [
    "Squat",
    "Deadlift",
    "Bench Press",
    "Overhead Press",
    "Standing Military Press",
    "Seated Dumbbell Shoulder Press",
    "Planks",
    "Bent-Over Barbell Rows",
    "Hammer Curls",
    "Pull Up",
    "Dumbbell Row",
    "Push Up",
    "Leg Press",
    "Biceps Curl",
    "Lateral raise",
    "Lat Pulldown",
    "Triceps Pushdown",

    ""
];

// Enhanced Mock Data Generator
const getMockData = (exercise: string): LeaderboardUser[] => {
    // Base ranges for different exercises (realistic max weights)
    let baseWeight = 100;
    switch (exercise) {
        case "Deadlift": baseWeight = 180; break;
        case "Squat": baseWeight = 140; break;
        case "Bench Press": baseWeight = 100; break;
        case "Overhead Press": baseWeight = 60; break;
        case "Dumbbell Row": baseWeight = 40; break;
        case "Pull Up": baseWeight = 20; break; // Weighted pullup
        case "Standing Military Press": baseWeight = 200; break;
        case "Seated Dumbbell Shoulder Press": baseWeight = 100; break;
        case "Planks": baseWeight = 150; break;
        case "Bent-Over Barbell Rows": baseWeight = 300; break;
        case "Hammer Curls": baseWeight = 60; break;
        case "Push Up": baseWeight = 150; break;
        case "Leg Press": baseWeight = 400; break;
        case "Biceps Curl": baseWeight = 60; break;
        case "Lateral raise": baseWeight = 40; break;
        case "Lat Pulldown": baseWeight = 120; break;
        case "Triceps Pushdown": baseWeight = 100; break;
        default: baseWeight = 80;
    }

    return [


    ];
};

export default function Leaderboard() {
    const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]);
    const [isOpen, setIsOpen] = useState(false);
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Try fetching from API first
                const data = await apiClient.get<any[]>(`/leaderboard?exercise=${selectedExercise}`);

                if (data && Array.isArray(data) && data.length > 0) {
                    // Map backend response to component state
                    const mappedLeaders = data.map((item, index) => ({
                        rank: index + 1,
                        username: item.name,
                        weight: item.weight,
                        date: formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: tr }),
                        avatar: item.avatar
                    }));
                    setLeaders(mappedLeaders);
                } else {
                    // Fallback to mock data if API returns empty
                    setLeaders(getMockData(selectedExercise));
                }
            } catch (error) {
                console.log("Leaderboard offline mode or API error, using mock data.", error);
                setLeaders(getMockData(selectedExercise));
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedExercise]);

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case 2: return "text-slate-300 bg-slate-300/10 border-slate-300/20";
            case 3: return "text-amber-600 bg-amber-600/10 border-amber-600/20";
            default: return "text-zinc-400 bg-zinc-800/50 border-zinc-700/50";
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy size={16} className="text-yellow-400" fill="currentColor" />;
            case 2: return <span className="font-bold text-slate-300">#2</span>;
            case 3: return <span className="font-bold text-amber-600">#3</span>;
            default: return <span className="font-bold text-zinc-500">#{rank}</span>;
        }
    };

    return (
        <section className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-6 lg:p-8 flex flex-col h-full">
            <button
                onClick={() => setIsNoteModalOpen(true)}>
                <Info size={20} className="text-zinc-200 hover:text-zinc-100 mb-3 " />

            </button>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Trophy size={20} className="text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-100 text-lg">Lider Tablosu</h3>
                        <p className="text-xs text-zinc-500">En yüksek ağırlıklar</p>
                    </div>

                </div>

                {/* Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors"
                    >

                        <Dumbbell size={14} className="text-zinc-200" />
                        {selectedExercise}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <div className="max-h-[200px] overflow-y-auto absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                {EXERCISES.map((ex) => (
                                    <button
                                        key={ex}
                                        onClick={() => {
                                            setSelectedExercise(ex);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedExercise === ex
                                            ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                            }`}
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center min-h-[150px]">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    leaders.map((user) => (
                        <div
                            key={user.rank}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(user.rank)}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-zinc-950/30 shrink-0`}>
                                    {getRankIcon(user.rank)}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/50">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                                <User size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-200">{user.username}</div>
                                        <div className="text-[10px] text-zinc-500 font-medium">{user.date}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-lg font-black tracking-tight flex items-baseline gap-0.5">
                                    {user.weight}
                                    <span className="text-xs font-medium opacity-60">kg</span>
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {!loading && leaders.length === 0 && (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        Bu egzersiz için henüz veri yok.
                    </div>
                )}
            </div>

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
            />
        </section>
    );
}
