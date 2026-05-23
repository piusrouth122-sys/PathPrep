import React from 'react';

export default function FloatingStats() {
  return (
    <div className="hidden lg:flex flex-col justify-center gap-6 absolute right-20 top-0 h-full w-[400px] z-10 pointer-events-none">
      
      {/* Card 1: Value Proposition (Why use it?) */}
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Why PathPrep?</h3>
        <div className="text-xl font-extrabold text-white leading-snug">
          Master Placement Exams with Data.
        </div>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed">
          Ditch the old textbooks. Practice company-specific mock tests under pressure, analyze your weak points in real-time, and elevate your aptitude skills for top-tier recruitment.
        </p>
      </div>

      {/* Card 2: Tech Stack (What was used to build it) */}
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">System Architecture</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-[#61dafb]/10 text-[#61dafb] border border-[#61dafb]/20 rounded-full text-xs font-medium">React.js</span>
          <span className="px-3 py-1 bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 rounded-full text-xs font-medium">Tailwind CSS</span>
          <span className="px-3 py-1 bg-[#bb99ff]/10 text-[#bb99ff] border border-[#bb99ff]/20 rounded-full text-xs font-medium">Framer Motion</span>
          <span className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-medium">Spline 3D</span>
        </div>
      </div>

      {/* Card 3: Creator Info */}
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl flex items-center justify-between">
        <div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Developed By</h3>
          <div className="text-lg font-bold text-white tracking-wide">Pius Routh</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 font-mono tracking-wider">BUILD v3.0</div>
          {/* Pulsing online indicator */}
          <div className="flex items-center justify-end gap-2 mt-1.5">
            <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">System Live</span>
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse"></div>
          </div>
        </div>
      </div>

    </div>
  );
}