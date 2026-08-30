import React from 'react';
import { ShieldCheck, Eye, Activity, Cpu } from 'lucide-react';
import { PROJECT_CONFIG } from '../../config/project';

export const PhilosophySection: React.FC = () => {
  return (
    <section className="relative w-full py-28 md:py-40 bg-[#080808] text-white border-t border-white/10 overflow-hidden">
      {/* Background Star Points & Radials */}
      <div className="absolute inset-0 scientific-grid-dark opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00F0FF]/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center flex flex-col items-center">
        {/* Subsystem Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#00F0FF] mb-10 tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RAMTSR CORE MANIFESTO</span>
        </div>

        {/* Giant Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter font-display leading-[0.95] uppercase max-w-5xl mb-12">
          WE DON'T JUST<br/>
          GENERATE PIXELS.<br/>
          <span className="text-[#B7F000] text-glow-lime">WE QUANTIFY TRUST.</span>
        </h2>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl text-left mt-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-mono text-[#00F0FF] mb-2 font-bold">01 · MULTI-TEMPORAL</div>
            <h3 className="text-lg font-bold font-display text-white mb-2">5-Frame Stack</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Synthesizes sub-pixel orbital offsets and cloud-free angular looks across temporal revisit windows.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-mono text-[#6D35FF] mb-2 font-bold">02 · QUALITY FUSION</div>
            <h3 className="text-lg font-bold font-display text-white mb-2">Quality Attention</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Dynamic atmospheric transmittance, sharpness, and blur weighting Qi = 0.6(1-C) + 0.25S + 0.15B.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-mono text-[#00B8D4] mb-2 font-bold">03 · SENSOR PHYSICS</div>
            <h3 className="text-lg font-bold font-display text-white mb-2">Observation Lock</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Differentiable Gaussian PSF and Sentinel-2 SRF enforce strict downsampling consistency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-xs font-mono text-[#B7F000] mb-2 font-bold">04 · UNCERTAINTY</div>
            <h3 className="text-lg font-bold font-display text-white mb-2">Calibrated ECE</h3>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              Heteroscedastic variance and MC-dropout flag hallucination risks on a per-pixel reliability heatmap.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
