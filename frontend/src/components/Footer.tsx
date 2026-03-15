import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="h-[120px] bg-[#F5F6F7] border-t border-[#E5E7EB] flex flex-col items-center justify-center text-[#6B7280] text-[14px] px-6">
            <div className="flex gap-6 mb-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#111827] transition-colors">GitHub API</a>
                <Link href="/privacy" className="hover:text-[#111827] transition-colors">Privacy Policy</Link>
            </div>
            <p>© {new Date().getFullYear()} AI Developer Roast Lab. Built with Next.js & AI.</p>
        </footer>
    );
}
