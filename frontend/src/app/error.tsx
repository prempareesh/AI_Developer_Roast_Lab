"use client";

import { useEffect, useState } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[calc(100vh-192px)] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-[#FFF1F2] text-[#E11D48] w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm border border-[#FDA4AF]">
                ⚠️
            </div>
            <h2 className="text-3xl font-bold mb-4 text-[#111827]">Something broke!</h2>
            <p className="text-[#6B7280] max-w-md mb-8">
                We hit an unexpected error while trying to process this request. It's not you, it's us (well, maybe it's the AI).
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="bg-[#000000] text-white px-6 py-3 rounded-[12px] font-medium hover:bg-[#1F2937] transition-colors shadow-sm"
                >
                    Try again
                </button>
                <a href="/">
                    <button className="bg-white text-[#111827] border border-[#E5E7EB] px-6 py-3 rounded-[12px] font-medium hover:bg-[#F9FAFB] transition-colors shadow-sm">
                        Go Home
                    </button>
                </a>
            </div>
        </div>
    );
}
