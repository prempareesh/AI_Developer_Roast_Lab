import Link from 'next/link';
import { Ghost } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-192px)] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-[#F3F4F6] text-[#6B7280] w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E5E7EB]">
                <Ghost size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-[48px] font-bold mb-2 text-[#111827]">404</h2>
            <p className="text-xl font-semibold mb-3 text-[#111827]">Page Not Found</p>
            <p className="text-[#6B7280] max-w-md mb-8">
                The page you're looking for doesn't exist or has been moved. Or maybe it got roasted so hard it vanished.
            </p>
            <Link href="/">
                <button className="bg-[#000000] text-white px-8 py-3 rounded-[12px] font-medium hover:bg-[#1F2937] transition-colors shadow-md">
                    Return Home
                </button>
            </Link>
        </div>
    );
}
