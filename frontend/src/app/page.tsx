"use client";

import Hero from '@/components/Hero';
import LinkedInSection from '@/components/LinkedInSection';
import ResumeSection from '@/components/ResumeSection';
import RoastBattleSection from '@/components/RoastBattleSection';
import { motion } from 'framer-motion';
import { Code, Flame, TrendingUp } from 'lucide-react';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function HomePageContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section');

  const showAll = !section;
  const showGithub = showAll || section === 'github';
  const showLinkedin = showAll || section === 'linkedin';
  const showResume = showAll || section === 'resume';
  const showBattle = showAll || section === 'battle';
  const showAbout = showAll || section === 'about';

  const features = [
    {
      icon: <Flame className="w-8 h-8 text-[#FF5A5F]" />,
      title: 'Brutal AI Roasts',
      description: 'Our AI model analyzes your repositories to generate a personalized, humorous take on your coding habits.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#8B5CF6]" />,
      title: 'Actionable Insights',
      description: 'Get constructive suggestions on how to improve your portfolio, code quality, and GitHub presence.'
    },
    {
      icon: <Code className="w-8 h-8 text-[#10B981]" />,
      title: 'Deep Analytics',
      description: 'Gain a new perspective on your language preferences, repository success rates, and coding activity.'
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {showGithub && (
        <div id="github">
          <Hero />
        </div>
      )}

      {showLinkedin && <LinkedInSection />}

      {showResume && <ResumeSection />}

      {showBattle && <RoastBattleSection />}

      {showAbout && (
        <section id="about" className="section-padding bg-white mt-12 mb-24 rounded-3xl mx-6 md:mx-auto max-w-6xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
          <h2 className="text-[32px] font-bold text-center mb-12">How it works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[16px] border border-[#E5E7EB] bg-white transition-shadow hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              >
                <div className="mb-6 p-4 bg-[#F5F6F7] inline-block rounded-xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
