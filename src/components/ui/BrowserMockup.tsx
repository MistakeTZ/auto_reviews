import React from "react";

type BrowserMockupProps = {
  headerTitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function BrowserMockup({
  headerTitle,
  children,
  className = "",
}: BrowserMockupProps) {
  return (
    <div className={`w-full max-w-[440px] overflow-hidden rounded-[12px] border border-black/5 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.03)] transition duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${className}`}>
      <div className="flex items-center gap-1 border-b border-[#f0f0f0] bg-[#fafafa] px-3 py-2.5 sm:px-4 sm:py-3.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        {headerTitle && (
          <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-[0.5px] text-slate-400">
            {headerTitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
