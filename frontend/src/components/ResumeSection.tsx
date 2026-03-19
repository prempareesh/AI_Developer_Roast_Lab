"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, Upload, Loader2 } from 'lucide-react';
import SharedResultCard from './SharedResultCard';
import API from '@/lib/api';

import { AnimatePresence } from 'framer-motion';

const RESUME_LOADING_MESSAGES = [
    "Reading vague objectives...",
    "Judging the font choice...",
    "Scanning for exaggerated skills...",
    "Reviewing tutorial side-projects...",
    "Generating brutal roast..."
];

export default function ResumeSection() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [messageIndex, setMessageIndex] = useState(0);

    // Handle loading message animation
    if (loading) {
        setTimeout(() => {
            setMessageIndex((prev) => (prev + 1) % RESUME_LOADING_MESSAGES.length);
        }, 2500);
    }

    const handleRoast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (file) {
            setLoading(true);
            setResult(null);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await API.post(`/api/roast/resume`,
                    formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setResult(response.data?.data);
            } catch (error) {
                console.error(error);
                alert("Failed to roast. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <section id="resume" className="flex flex-col items-center justify-center pt-24 pb-16 px-6 text-center w-full mx-auto border-t border-[#E5E7EB]">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-[48px] font-bold tracking-tight text-[#111827] mb-6 leading-tight"
            >
                Roast Your Resume 📄
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-[20px] text-[#6B7280] mb-12 max-w-2xl font-medium"
            >
                Upload your resume (PDF or Text) to see what hiring managers really think.
            </motion.p>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onSubmit={handleRoast}
                className="w-full max-w-xl relative flex flex-col items-center gap-4"
            >
                <div className="w-full relative shadow-lg rounded-[16px] bg-white border border-[#E5E7EB] hover:border-[#000] focus-within:border-[#000] transition-colors p-2 flex items-center">
                    <label className="flex-1 flex items-center gap-3 cursor-pointer p-3 pl-4 m-1 rounded-xl hover:bg-[#F3F4F6] transition-colors relative">
                        <Upload size={24} className="text-[#6B7280]" />
                        <span className="text-lg font-medium text-[#4B5563] truncate">
                            {file ? file.name : "Select Resume (PDF/TXT)"}
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className="bg-[#000] text-white px-8 py-3 h-[52px] rounded-[12px] font-semibold hover:bg-[#1F2937] transition-colors focus:ring-2 focus:ring-offset-1 focus:ring-[#000] disabled:opacity-50 ml-2 whitespace-nowrap"
                    >
                        {loading ? 'Roasting...' : 'Roast Resume'}
                    </button>
                </div>
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
                                {RESUME_LOADING_MESSAGES[messageIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {result && !loading && (
                <div className="w-full max-w-4xl mt-12 mx-auto">
                    <SharedResultCard
                        title="Resume Roast"
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
