import React, { useState } from 'react';
import { Layers, Zap, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { TRAINING_PHASES } from '../../data/projectData';

export const TrainingCurriculumSection: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(3); // Default phase 4

  return (
    <section id="training" className="relative w-full py-24 md:py-36 bg-[#080808] text-white border-t border-white/10 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 scientific-grid-dark opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00F0FF] text-xs font-mono mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>10 · 4-PHASE PROGRESSIVE TRAINING CURRICULUM</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
              PROGRESSIVE<br/>
              <span className="text-[#B7F000] text-glow-lime">CURRICULUM TRAINING.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Why train in 4 stages? GANs too early cause geometric instability. Uncertainty too early produces calibrated confidence on hallucinated predictions.
            </p>
          </div>
        </div>

        {/* 4-Phase Timeline Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {TRAINING_PHASES.map((phase, idx) => {
            const isSelected = activePhaseIndex === idx;
            return (
              <div
                key={phase.phase}
                onClick={() => setActivePhaseIndex(idx)}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#00F0FF] bg-white/10 shadow-2xl scale-102 z-10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-black font-display" style={{ color: phase.tagColor }}>
                      {phase.phase}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">{phase.epochs}</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white mb-2">{phase.title}</h3>
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-neutral-300 break-all mb-3">
                    {phase.formula}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">OBJECTIVE:</span>
                  <span className="font-bold text-[#00F0FF]">{phase.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Phase Deep Dive & Why Order Matters Box */}
        <div className="p-6 md:p-10 rounded-3xl bg-[#0e0e0e] border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Active Phase Detailed Focus */}
            <div className="lg:col-span-7">
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-2">
                ACTIVE CURRICULUM PHASE {TRAINING_PHASES[activePhaseIndex].phase} · {TRAINING_PHASES[activePhaseIndex].epochs}
              </div>
              <h3 className="text-2xl font-bold font-display text-white mb-4">
                {TRAINING_PHASES[activePhaseIndex].title}
              </h3>
              <div className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-sm text-[#B7F000] mb-4">
                {TRAINING_PHASES[activePhaseIndex].formula}
              </div>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                {TRAINING_PHASES[activePhaseIndex].focus}
              </p>
            </div>

            {/* Right: Why The Order Matters Editorial Rule */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-black border border-white/15 text-xs font-mono">
              <div className="text-[#B7F000] font-bold uppercase mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B7F000]" />
                WHY THIS EXACT ORDER?
              </div>
              <div className="space-y-3 text-neutral-300">
                <div>
                  <span className="text-red-400 font-bold">1. Adversarial Too Early:</span>
                  <p className="text-neutral-400 text-[11px]">Causes discriminator mode collapse and hallucinated street grids.</p>
                </div>
                <div>
                  <span className="text-red-400 font-bold">2. Uncertainty Too Early:</span>
                  <p className="text-neutral-400 text-[11px]">Calibrates confidence over unstable, non-converged feature representations.</p>
                </div>
                <div className="pt-2 border-t border-white/10 text-[#00F0FF] font-bold">
                  GEOMETRY → PHYSICS → TEXTURE → TRUST
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
