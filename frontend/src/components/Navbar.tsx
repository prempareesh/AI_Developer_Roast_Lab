import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">AI Developer <span className="text-gradient">Roast Lab</span> 🔥</span>
            </Link>

            <div className="hidden md:flex flex-wrap items-center gap-6 text-[14px] font-medium text-secondary-text">
                <Link href="/" className="hover:text-primary-text transition-colors">Home</Link>
                <Link href="/?section=github" className="hover:text-primary-text transition-colors">GitHub Roast</Link>
                <Link href="/?section=linkedin" className="hover:text-primary-text transition-colors">LinkedIn Roast</Link>
                <Link href="/?section=resume" className="hover:text-primary-text transition-colors">Resume Roast</Link>
                <Link href="/?section=battle" className="hover:text-primary-text transition-colors">Roast Battle</Link>
                <Link href="/?section=about" className="hover:text-primary-text transition-colors">About</Link>
            </div>

            <Link href="/">
                <button className="bg-[#000000] text-white px-5 py-2.5 rounded-[10px] text-[14px] font-medium hover:bg-[#1F2937] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#000]">
                    Roast Me
                </button>
            </Link>
        </nav>
    );
}
