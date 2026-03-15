import { Flame, Star, GitFork, BookOpen, User, Users, Download, Copy, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function ResultCard({ result }: { result: any }) {
    const { profile, stats, roast, suggestions } = result;

    const topLanguages = Object.entries(stats.languageDistribution)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3);

    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
            const link = document.createElement('a');
            link.download = `${profile.username}-roast.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to generate image:", err);
            alert("Failed to download image. Try again later.");
        }
    };

    const handleCopy = () => {
        const text = `🔥 AI Developer Roast Lab - ${profile.username}\n\nRoast:\n${roast}\n\nVerdict: ${result.score?.verdict || ''}\n\nCheck yours at: ${window.location.href}`;
        navigator.clipboard.writeText(text);
        alert("Roast copied to clipboard!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6"
        >
            <div ref={cardRef} className="bg-white rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-[#E5E7EB] overflow-hidden">
                {/* Header Profile Section */}
                <div className="bg-[#F5F6F7] p-8 border-b border-[#E5E7EB] flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={profile.avatarUrl}
                        alt={profile.username}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
                    />
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold">{profile.name || profile.username}</h2>
                        <a href={profile.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#111827] flex items-center justify-center md:justify-start gap-1 font-medium mt-1">
                            @{profile.username}
                        </a>
                        {profile.bio && <p className="mt-3 text-sm text-[#4B5563] italic">"{profile.bio}"</p>}
                    </div>

                    <div className="flex gap-4 text-sm text-[#6B7280] font-medium bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB]">
                        <div className="flex flex-col items-center">
                            <span className="text-[#111827] font-bold text-lg">{profile.followers}</span>
                            <span>Followers</span>
                        </div>
                        <div className="w-px bg-[#E5E7EB]" />
                        <div className="flex flex-col items-center">
                            <span className="text-[#111827] font-bold text-lg">{profile.publicRepos}</span>
                            <span>Repos</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-10 space-y-12">
                    {/* The Roast Section */}
                    <section className="relative">
                        <div className="absolute -left-4 -top-4 opacity-10">
                            <Flame size={80} className="text-[#FF5A5F]" />
                        </div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <Flame className="text-[#FF5A5F]" /> The Roast
                        </h3>
                        <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-6 text-[#881337] leading-relaxed relative z-10 text-lg shadow-inner">
                            {roast.split('\n').map((paragraph: string, i: number) => (
                                <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                            ))}
                        </div>
                    </section>

                    {/* Score Section */}
                    {result.score && (
                        <section className="bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] p-6 rounded-2xl border border-[#CBD5E1] shadow-sm">
                            <h3 className="text-xl font-bold mb-4 text-[#1E293B] flex items-center gap-2">
                                📊 Developer Roast Score
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3 font-medium text-[#475569]">
                                    <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                                        <span>Code Activity:</span>
                                        <span className="font-bold text-[#0F172A]">{result.score.codeActivity}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                                        <span>Project Originality:</span>
                                        <span className="font-bold text-[#0F172A]">{result.score.projectOriginality}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                                        <span>Consistency:</span>
                                        <span className="font-bold text-[#0F172A]">{result.score.consistency}/10</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border-2 border-[#1E293B]">
                                        <span className="text-lg">Final Score:</span>
                                        <span className="font-bold text-2xl text-[#1E293B]">{result.score.finalScore} / 10</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="font-bold text-[#334155] mb-2 uppercase tracking-wide text-sm">AI Verdict</h4>
                                    <p className="text-lg italic font-medium text-[#0F172A] bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#3B82F6]">
                                        "{result.score.verdict}"
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Stats Section */}
                        <section>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Star className="text-[#F59E0B]" /> Repository Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#F5F6F7] p-4 rounded-xl border border-[#E5E7EB] flex items-center gap-3">
                                    <Star className="text-[#6B7280] w-5 h-5" />
                                    <div>
                                        <div className="font-bold text-xl">{stats.totalStars}</div>
                                        <div className="text-xs text-[#6B7280] uppercase tracking-wide">Stars Received</div>
                                    </div>
                                </div>
                                <div className="bg-[#F5F6F7] p-4 rounded-xl border border-[#E5E7EB] flex items-center gap-3">
                                    <GitFork className="text-[#6B7280] w-5 h-5" />
                                    <div>
                                        <div className="font-bold text-xl">{stats.totalForks}</div>
                                        <div className="text-xs text-[#6B7280] uppercase tracking-wide">Forks Given</div>
                                    </div>
                                </div>
                            </div>

                            {/* Language Section */}
                            <h3 className="text-lg font-bold mt-8 mb-4 flex items-center gap-2">
                                <BookOpen className="text-[#3B82F6]" /> Top Languages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {topLanguages.map(([lang, count]: any) => (
                                    <span key={lang} className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] px-3 py-1 rounded-full text-sm font-medium">
                                        {lang} ({count} repos)
                                    </span>
                                ))}
                                {topLanguages.length === 0 && <span className="text-sm text-[#6B7280]">No language data found.</span>}
                            </div>
                        </section>

                        {/* Suggestions Section */}
                        <section>
                            <h3 className="text-lg font-bold mb-4 text-[#10B981] flex items-center gap-2">
                                💡 How to actually improve
                            </h3>
                            <ul className="space-y-4">
                                {suggestions.map((suggestion: string, idx: number) => (
                                    <li key={idx} className="flex gap-3 text-[#4B5563] bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                                        <span className="font-bold text-[#10B981]">{idx + 1}.</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center py-6 mt-4">
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-white border border-[#E5E7EB] font-bold text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-all shadow-sm"
                >
                    <Copy size={20} /> Copy Roast
                </button>
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
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
