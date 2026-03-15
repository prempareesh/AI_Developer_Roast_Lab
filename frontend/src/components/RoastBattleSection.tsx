"use client";

import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Loader2 } from 'lucide-react';

export default function RoastBattleSection() {
    const [user1, setUser1] = useState('');
    const [user2, setUser2] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [battleResult, setBattleResult] = useState<any>(null);

    const handleBattle = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user1.trim() || !user2.trim()) return;

        try {
            setLoading(true);
            setError(null);
            setBattleResult(null);

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5001` : 'http://localhost:5001');
            const response = await fetch(`${apiBaseUrl}/api/roast/battle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username1: user1.trim(),
                    username2: user2.trim()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate battle.');
            }

            const data = await response.json();
            setBattleResult(data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate battle. One or both GitHub users might not exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="roast-battle" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl mb-4 font-display flex items-center justify-center gap-3">
                        <Swords className="text-[#000000] w-12 h-12" /> Developer Roast Battle
                    </h2>
                    <p className="mt-4 text-xl text-[#4B5563] max-w-2xl mx-auto">
                        Who is the worst developer? Enter two GitHub usernames and let the AI decide.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleBattle} className="bg-white p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#E5E7EB]">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="text-[#9CA3AF] text-lg">@</span>
                                </div>
                                <input
                                    type="text"
                                    value={user1}
                                    onChange={(e) => setUser1(e.target.value)}
                                    placeholder="Username 1"
                                    className="w-full pl-10 pr-6 py-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 transition-all text-lg"
                                    required
                                />
                            </div>
                            <div className="text-2xl font-bold text-[#DC2626] font-display uppercase tracking-widest hidden md:block">VS</div>
                            <div className="flex-1 w-full relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="text-[#9CA3AF] text-lg">@</span>
                                </div>
                                <input
                                    type="text"
                                    value={user2}
                                    onChange={(e) => setUser2(e.target.value)}
                                    placeholder="Username 2"
                                    className="w-full pl-10 pr-6 py-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#000000] focus:ring-4 focus:ring-[#000000]/10 transition-all text-lg"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !user1.trim() || !user2.trim()}
                            className="mt-8 w-full bg-[#000000] text-white py-4 px-8 rounded-2xl text-lg font-bold hover:bg-[#1F2937] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-xl shadow-black/10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" /> Simulating battle...
                                </>
                            ) : (
                                <>
                                    Start Battle <Swords className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="mt-8 p-6 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] rounded-2xl flex items-center gap-3 shadow-sm"
                            >
                                <div className="text-2xl">⚠️</div>
                                <p className="font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {battleResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-16 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-[#E5E7EB] overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-[#DC2626] to-[#991B1B] p-8 text-center text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                            <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white/80 mb-2">Battle Winner</h3>
                            <div className="text-5xl font-black mb-4 flex justify-center items-center gap-4">
                                🏆 {battleResult.battle.winner}
                            </div>
                            <p className="text-xl font-medium max-w-3xl mx-auto italic bg-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                "{battleResult.battle.reason}"
                            </p>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-8 bg-[#F9FAFB]">
                            {/* User 1 Column */}
                            <div className={`p-6 bg-white rounded-2xl border ${battleResult.battle.winner === battleResult.user1.profile.login ? 'border-2 border-[#10B981] shadow-lg relative' : 'border-[#E5E7EB] shadow-sm'}`}>
                                {battleResult.battle.winner === battleResult.user1.profile.login && (
                                    <div className="absolute -top-4 -right-4 bg-[#10B981] text-white w-10 h-10 flex flex-col items-center justify-center rounded-full font-bold shadow-md z-10 text-xl">
                                        W
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={battleResult.user1.profile.avatar_url} alt="User 1" className="w-16 h-16 rounded-full border-2 border-[#E5E7EB]" />
                                    <div>
                                        <h4 className="font-bold text-xl">{battleResult.user1.profile.login}</h4>
                                        <p className="text-[#6B7280] text-sm">{battleResult.user1.stats.originalRepoCount} Repos • {battleResult.user1.stats.totalStars} Stars</p>
                                    </div>
                                </div>
                                <div className="bg-[#FFF1F2] p-5 rounded-xl border border-[#FECDD3] text-[#881337] leading-relaxed italic text-lg shadow-inner relative before:content-['“'] before:absolute before:-top-2 before:-left-2 before:text-4xl before:text-[#FECDD3] before:font-serif">
                                    {battleResult.battle.roast1}
                                </div>
                            </div>

                            {/* User 2 Column */}
                            <div className={`p-6 bg-white rounded-2xl border ${battleResult.battle.winner === battleResult.user2.profile.login ? 'border-2 border-[#10B981] shadow-lg relative' : 'border-[#E5E7EB] shadow-sm'}`}>
                                {battleResult.battle.winner === battleResult.user2.profile.login && (
                                    <div className="absolute -top-4 -right-4 bg-[#10B981] text-white w-10 h-10 flex flex-col items-center justify-center rounded-full font-bold shadow-md z-10 text-xl">
                                        W
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={battleResult.user2.profile.avatar_url} alt="User 2" className="w-16 h-16 rounded-full border-2 border-[#E5E7EB]" />
                                    <div>
                                        <h4 className="font-bold text-xl">{battleResult.user2.profile.login}</h4>
                                        <p className="text-[#6B7280] text-sm">{battleResult.user2.stats.originalRepoCount} Repos • {battleResult.user2.stats.totalStars} Stars</p>
                                    </div>
                                </div>
                                <div className="bg-[#FFF1F2] p-5 rounded-xl border border-[#FECDD3] text-[#881337] leading-relaxed italic text-lg shadow-inner relative before:content-['“'] before:absolute before:-top-2 before:-left-2 before:text-4xl before:text-[#FECDD3] before:font-serif">
                                    {battleResult.battle.roast2}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
