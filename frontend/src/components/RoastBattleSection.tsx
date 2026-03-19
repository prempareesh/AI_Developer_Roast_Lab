"use client";

import { useState } from "react";
import API from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2 } from "lucide-react";

export default function RoastBattleSection() {
    const [user1, setUser1] = useState("");
    const [user2, setUser2] = useState("");
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

            const response = await API.post("/api/roast/battle", {
                username1: user1.trim(),
                username2: user2.trim(),
            });

            setBattleResult(response?.data?.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                "Failed to generate battle. One or both GitHub users might not exist."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="roast-battle" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold flex justify-center items-center gap-3">
                        <Swords className="w-10 h-10" /> Developer Roast Battle
                    </h2>
                    <p className="text-gray-500 mt-4">
                        Enter two GitHub usernames and let AI decide the worst developer.
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-3xl mx-auto">
                    <form
                        onSubmit={handleBattle}
                        className="bg-white p-8 rounded-xl shadow border"
                    >
                        <div className="flex flex-col md:flex-row gap-4">

                            <input
                                type="text"
                                value={user1}
                                onChange={(e) => setUser1(e.target.value)}
                                placeholder="Username 1"
                                className="flex-1 border p-4 rounded-xl"
                                required
                            />

                            <input
                                type="text"
                                value={user2}
                                onChange={(e) => setUser2(e.target.value)}
                                placeholder="Username 2"
                                className="flex-1 border p-4 rounded-xl"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Simulating battle...
                                </>
                            ) : (
                                <>
                                    Start Battle <Swords />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 text-red-500 bg-red-50 p-4 rounded-xl"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Result Section */}
                {battleResult?.battle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-16 bg-white border rounded-xl shadow"
                    >
                        {/* Winner */}
                        <div className="bg-red-600 text-white text-center p-6">
                            <h3 className="text-sm uppercase tracking-widest">
                                Battle Winner
                            </h3>

                            <div className="text-3xl font-bold mt-2">
                                🏆 {battleResult?.battle?.winner}
                            </div>

                            <p className="mt-4 italic">
                                "{battleResult?.battle?.reason}"
                            </p>
                        </div>

                        {/* Players */}
                        <div className="grid md:grid-cols-2 gap-6 p-6">

                            {/* Player 1 */}
                            <div className="border rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={battleResult?.user1?.profile?.avatarUrl}
                                        className="w-12 h-12 rounded-full"
                                        alt={battleResult?.user1?.profile?.username}
                                    />
                                    <div>
                                        <h4 className="font-bold">
                                            {battleResult?.user1?.profile?.username}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {battleResult?.user1?.stats?.originalRepoCount || 0} repos •{" "}
                                            {battleResult?.user1?.stats?.totalStars || 0} stars
                                        </p>
                                    </div>
                                </div>

                                <p className="italic bg-red-50 p-3 rounded">
                                    {battleResult?.battle?.roast1}
                                </p>
                            </div>

                            {/* Player 2 */}
                            <div className="border rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={battleResult?.user2?.profile?.avatarUrl}
                                        className="w-12 h-12 rounded-full"
                                        alt={battleResult?.user2?.profile?.username}
                                    />
                                    <div>
                                        <h4 className="font-bold">
                                            {battleResult?.user2?.profile?.username}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {battleResult?.user2?.stats?.originalRepoCount || 0} repos •{" "}
                                            {battleResult?.user2?.stats?.totalStars || 0} stars
                                        </p>
                                    </div>
                                </div>

                                <p className="italic bg-red-50 p-3 rounded">
                                    {battleResult?.battle?.roast2}
                                </p>
                            </div>

                        </div>
                    </motion.div>
                )}
            </div>
        </section>
    );
}