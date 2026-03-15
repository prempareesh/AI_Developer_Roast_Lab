"use client";

import { Flame, CheckCircle2, XCircle, TrendingUp, Skull, Copy, Linkedin, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface SharedResultCardProps {
    title: string;
    summary: string;
    mainRoast: string[];
    analysis: {
        strengths: string[];
        weaknesses: string[];
    };
    advice: string[];
    closingRoast: string;
}

export default function SharedResultCard({ title, summary, mainRoast, analysis, advice, closingRoast }: SharedResultCardProps) {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-roast.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate image:", err);
            alert("Failed to download image. Try again later.");
        }
    };

    const handleCopy = () => {
        const text = `🔥 AI Developer Roast Lab - ${title}\n\n${summary}\n\nRoast:\n${mainRoast?.join('\n')}\n\nVerdict: ${closingRoast}\n\nCheck yours at: ${shareUrl}`;
        navigator.clipboard.writeText(text);
        alert("Roast copied to clipboard!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6 mt-8 w-full max-w-4xl mx-auto"
        >
            <div ref={cardRef} className="bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] overflow-hidden text-left">
                <div className="bg-[#F5F6F7] p-8 border-b border-[#E5E7EB]">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Flame className="text-[#FF5A5F]" /> {title} 🔥
                    </h2>
                    <p className="mt-3 text-[#4B5563] text-lg font-medium">{summary}</p>
                </div>

                <div className="p-8 md:p-10 space-y-12">
                    {/* Main Roast Section */}
                    <section className="relative">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Flame className="text-[#FF5A5F]" /> The Brutal Truth
                        </h3>
                        <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-6 text-[#881337] leading-relaxed text-lg space-y-4">
                            {mainRoast && mainRoast.map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))}
                        </div>
                    </section>

                    {/* Profile Analysis Section */}
                    <section>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="text-[#3B82F6]" /> Profile Analysis
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-6 rounded-2xl">
                                <h4 className="font-bold text-[#166534] flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5" /> Strengths
                                </h4>
                                <ul className="space-y-3">
                                    {analysis?.strengths?.map((str, i) => (
                                        <li key={i} className="flex gap-2 text-[#15803D]">
                                            <span>•</span>
                                            <span>{str}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#FEF2F2] border border-[#FECACA] p-6 rounded-2xl">
                                <h4 className="font-bold text-[#991B1B] flex items-center gap-2 mb-4">
                                    <XCircle className="w-5 h-5" /> Weaknesses
                                </h4>
                                <ul className="space-y-3">
                                    {analysis?.weaknesses?.map((wk, i) => (
                                        <li key={i} className="flex gap-2 text-[#B91C1C]">
                                            <span>•</span>
                                            <span>{wk}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Career Advice Section */}
                    <section>
                        <h3 className="text-xl font-bold mb-4 text-[#10B981] flex items-center gap-2">
                            💡 How to Actually Overcome This
                        </h3>
                        <ul className="space-y-4">
                            {advice && advice.map((suggestion, idx) => (
                                <li key={idx} className="flex gap-3 text-[#4B5563] bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                                    <span className="font-bold text-[#10B981]">{idx + 1}.</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Closing Roast Section */}
                    <section className="bg-black text-white p-6 rounded-2xl text-center shadow-lg border border-[#1F2937]">
                        <div className="flex justify-center mb-3 text-[#FF5A5F]">
                            <Skull className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-bold italic">"{closingRoast}"</p>
                    </section>

                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center py-6 mt-2">
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-white border border-[#E5E7EB] font-bold text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all shadow-sm"
                >
                    <Copy size={20} /> Copy Roast
                </button>
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[#0A66C2] text-white font-bold hover:bg-[#004182] transition-colors shadow-sm"
                >
                    <Linkedin size={20} /> Share on LinkedIn
                </a>
                <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] border border-transparent bg-[#000000] text-white font-bold hover:bg-[#1F2937] transition-colors shadow-sm"
                >
                    <Download size={20} /> Download Image
                </button>
            </div>
        </motion.div>
    );
}
