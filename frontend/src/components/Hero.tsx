"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function Hero() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleRoast = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            router.push(`/roast/${username.trim()}`);
        }
    };

    return (
        <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-[48px] font-bold tracking-tight text-[#111827] mb-6 leading-tight"
            >
                AI Developer Roast Lab 🔥
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-[20px] text-[#6B7280] mb-12 max-w-2xl font-medium"
            >
                "Roast your GitHub, LinkedIn, and Resume with brutally honest AI feedback."
            </motion.p>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleRoast}
                className="w-full max-w-md relative flex items-center shadow-lg rounded-[16px] bg-white"
            >
                <div className="absolute left-4 text-[#6B7280]">
                    <Search size={24} />
                </div>
                <input
                    type="text"
                    placeholder="GitHub Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[64px] pl-14 pr-[120px] rounded-[16px] border border-[#E5E7EB] focus:border-[#000] focus:ring-1 focus:ring-[#000] outline-none text-lg placeholder:text-[#9CA3AF] transition-all"
                    required
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-[#000] text-white px-6 rounded-[12px] font-semibold hover:bg-[#1F2937] transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[#000]"
                >
                    Roast
                </button>
            </motion.form>
        </section>
    );
}
