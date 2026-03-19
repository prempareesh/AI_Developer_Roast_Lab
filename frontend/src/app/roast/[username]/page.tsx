"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import API from '@/lib/api';

import ResultCard from '@/components/ResultCard';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
    "Analyzing GitHub commits...",
    "Scanning questionable coding decisions...",
    "Consulting senior developer sarcasm engine...",
    "Generating brutal roast..."
];

export default function RoastPage() {
    const { username } = useParams();

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            interval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        const fetchRoast = async () => {
            if (!username) return;

            try {
                setLoading(true);
                setError(null);

                const response = await API.post(`/api/roast`, {
                    username: username
                });


                if (response?.data?.data) {
                    setResult(response.data.data);
                } else {
                    throw new Error("Invalid response structure from server");
                }
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to generate roast. The GitHub user might not exist or the API is overwhelmed.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoast();
    }, [username]);

    return (
        <div className="section-padding min-h-[calc(100vh-192px)] flex flex-col items-center justify-center relative">
            {loading && (
                <div className="flex flex-col items-center gap-6 text-[#6B7280]">
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
                                {LOADING_MESSAGES[messageIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {error && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-[#FCA5A5] text-center max-w-lg w-full"
                >
                    <div className="bg-[#FEE2E2] text-[#EF4444] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        😕
                    </div>
                    <h2 className="text-2xl font-bold text-[#111827] mb-2">Oops! Something went wrong</h2>
                    <p className="text-[#6B7280] mb-8">{error}</p>
                    <a href="/">
                        <button className="bg-[#000000] text-white px-6 py-3 rounded-[12px] font-medium hover:bg-[#1F2937] transition-colors w-full">
                            Try Another Username
                        </button>
                    </a>
                </motion.div>
            )}

            {result && !loading && !error && (
                <div className="w-full max-w-4xl mx-auto pb-16">
                    <ResultCard result={result} />
                </div>
            )}
        </div>
    );
}
