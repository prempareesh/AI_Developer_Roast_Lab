"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import SharedResultCard from './SharedResultCard';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

const LINKEDIN_LOADING_MESSAGES = [
    "Analyzing buzzwords...",
    "Counting generic certifications...",
    "Evaluating 'Visionary' claims...",
    "Consulting senior tech recruiter...",
    "Generating brutal roast..."
];

export default function LinkedInSection() {
    const [profileUrl, setProfileUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [messageIndex, setMessageIndex] = useState(0);

    // Handle loading message animation
    if (loading) {
        setTimeout(() => {
            setMessageIndex((prev) => (prev + 1) % LINKEDIN_LOADING_MESSAGES.length);
        }, 2500);
    }

    const handleRoast = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = profileUrl.trim();

        if (!url) return;

        if (!url.toLowerCase().includes('linkedin.com/')) {
            alert("Please enter a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username)");
            return;
        }

        if (url) {
            setLoading(true);
            setResult(null);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5001` : 'http://localhost:5001');
                const response = await fetch(`${apiBaseUrl}/api/roast/linkedin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        profileUrl: url
                    })
                });
                const data = await response.json();
                setResult(data);
            } catch (error) {
                console.error(error);
                alert("Failed to roast. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <section id="linkedin" className="flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center w-full mx-auto border-t border-[#E5E7EB]">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-[48px] font-bold tracking-tight text-[#111827] mb-6 leading-tight"
            >
                Roast Your LinkedIn Profile 💼
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-[20px] text-[#6B7280] mb-12 max-w-2xl font-medium"
            >
                Paste your LinkedIn profile URL or raw text to get a brutally honest tech recruiter breakdown.
            </motion.p>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onSubmit={handleRoast}
                className="w-full max-w-xl relative flex items-center shadow-lg rounded-[16px] bg-white"
            >
                <div className="absolute left-4 text-[#6B7280]">
                    <Search size={24} />
                </div>
                <input
                    type="text"
                    placeholder="Paste your LinkedIn profile URL"
                    value={profileUrl}
                    onChange={(e) => setProfileUrl(e.target.value)}
                    className="w-full h-[64px] pl-14 pr-[150px] rounded-[16px] border border-[#E5E7EB] focus:border-[#000] focus:ring-1 focus:ring-[#000] outline-none text-lg placeholder:text-[#9CA3AF] transition-all"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 bg-[#000] text-white px-6 rounded-[12px] font-semibold hover:bg-[#1F2937] transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[#000] disabled:opacity-50"
                >
                    {loading ? 'Roasting...' : 'Roast LinkedIn'}
                </button>
            </motion.form>

            {loading && (
                <div className="flex flex-col items-center gap-6 mt-12 text-[#6B7280]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <Loader2 className="w-16 h-16 text-[#000000]" />
                    </motion.div>
                    <div className="h-8 overflow-hidden relative w-80 flex justify-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={messageIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="text-xl font-medium text-center absolute"
                            >
                                {LINKEDIN_LOADING_MESSAGES[messageIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {result && !loading && (
                <div className="w-full max-w-4xl mt-12 mx-auto">
                    <SharedResultCard
                        title="LinkedIn Roast"
                        summary={result.summary}
                        mainRoast={result.mainRoast}
                        analysis={result.analysis}
                        advice={result.advice}
                        closingRoast={result.closingRoast}
                    />
                </div>
            )}
        </section>
    );
}
