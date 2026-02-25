import { useEffect } from "react";
import { Trophy, X } from "lucide-react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NoteModal({ isOpen, onClose }: ModalProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const rewards = [
        { rank: 1, prize: "50$", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
        { rank: 2, prize: "20$", color: "text-slate-300", bg: "bg-slate-300/10", border: "border-slate-300/20" },
        { rank: 3, prize: "10$", color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" }
    ];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[100] px-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative bg-zinc-900 w-full max-w-sm border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <Trophy size={20} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">Ödül Bilgisi</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Squad hareketinde haftalık olarak belirlenen liderlik tablosunda ilk 3 kişiye verilen ödüller:
                        </p>

                        <div className="space-y-2">
                            {rewards.map((reward) => (
                                <div
                                    key={reward.rank}
                                    className={`flex items-center justify-between p-4 rounded-2xl border ${reward.bg} ${reward.border} ${reward.color}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black italic">#{reward.rank}</span>
                                        <span className="text-sm font-semibold uppercase tracking-wide">Sıra</span>
                                    </div>
                                    <div className="text-xl font-black tabular-nums">
                                        {reward.prize}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-colors shadow-lg active:scale-95"
                        >
                            Anladım
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}