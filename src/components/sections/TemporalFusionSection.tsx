import React, { useState } from 'react';
import { Layers, Cloud, Sparkles, AlertCircle, Cpu, Zap, ArrowRight } from 'lucide-react';
import { TEMPORAL_FRAMES_DATA } from '../../data/projectData';
import { TemporalFrameData } from '../../types';

export const TemporalFusionSection: React.FC = () => {
  const [selectedFrame, setSelectedFrame] = useState<TemporalFrameData>(TEMPORAL_FRAMES_DATA[2]); // Default T0
  const [interactiveCloud, setInteractiveCloud] = useState<number>(0.05);
  const [interactiveSharp, setInteractiveSharp] = useState<number>(0.92);
  const [interactiveBlur, setInteractiveBlur] = useState<number>(0.08);

  // Compute live quality score: Qi = 0.60*(1 - C) + 0.25*S + 0.15*B
  // Note: Here B is sharpness retention or blur index (1 - blur_amount)
  const computedQuality = (0.60 * (1 - interactiveCloud) + 0.25 * interactiveSharp + 0.15 * (1 - interactiveBlur)).toFixed(3);
  const qualityNum = parseFloat(computedQuality);

  return (
    <section id="temporal" className="relative w-full py-24 md:py-36 bg-[#F7F8F5] text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6D35FF]"></span>
              <span>03 · MULTI-TEMPORAL FUSION ENGINE</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              FIVE TEMPORAL FRAMES.<br/>
              <span className="text-[#6D35FF]">QUALITY-AWARE ATTENTION.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              Instead of relying on a single static image, RAMTSR exploits micro-parallax sub-pixel shifts and angular differences across 5 temporal acquisitions.
            </p>
          </div>
        </div>

        {/* 5-Frame Temporal Stack Visualizer */}
        <div className="p-6 md:p-10 rounded-3xl bg-white border border-black/10 shadow-xl mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#6D35FF] font-bold uppercase tracking-wider mb-1">
                TEMPORAL STACK SAMPLING (±30 DAYS)
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-black">
                Interactive Multi-Look Acquisition Stack
              </h3>
            </div>
            <div className="text-xs font-mono text-neutral-500">
              Select a frame to inspect its quality weights
            </div>
          </div>

          {/* 5 Frames Row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
            {TEMPORAL_FRAMES_DATA.map((frame) => {
              const isSelected = selectedFrame.id === frame.id;
              return (
                <div
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#6D35FF] bg-violet-50/50 shadow-lg scale-102'
                      : 'border-black/10 bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold font-display text-black">{frame.label}</span>
                      <span 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: frame.previewColor }}
                      ></span>
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 mb-3">{frame.dateOffset}</div>
                  </div>

                  {/* Micro Visual Card */}
                  <div className="h-16 rounded-xl bg-slate-800 flex items-center justify-center relative overflow-hidden mb-3">
                    {frame.cloudProb > 0.4 && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-slate-300">
                      {frame.cloudProb > 0.4 ? 'HAZY / CLOUD' : 'CLEAR OPTICAL'}
                    </span>
                  </div>

                  {/* Quality Readout */}
                  <div className="space-y-1 text-[11px] font-mono border-t border-black/5 pt-2">
                    <div className="flex justify-between text-neutral-500">
                      <span>Cloud (C):</span>
                      <span className="font-semibold text-black">{(frame.cloudProb * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Sharp (S):</span>
                      <span className="font-semibold text-black">{frame.sharpness.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#6D35FF] font-bold">
                      <span>Q Score:</span>
                      <span>{frame.qualityScore.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Frame Detail Inspector */}
          <div className="p-5 rounded-2xl bg-neutral-900 text-white font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6D35FF]/30 border border-[#6D35FF] flex items-center justify-center text-[#00F0FF]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[#00F0FF] font-bold">SELECTED FRAME: {selectedFrame.label} ({selectedFrame.dateOffset})</span>
                <p className="text-[11px] text-neutral-400">
                  {selectedFrame.status === 'optimal' 
                    ? '✓ High atmospheric clarity. Full contribution to cross-attention spatial tokens.' 
                    : selectedFrame.status === 'acceptable'
                    ? '⚠ Moderate cloud haze. Low-frequency spectral alignment retained, blurred details attenuated.'
                    : '✕ Severe cloud occlusion. Filtered by quality attention mechanism to prevent artifact injection.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-400">FUSION WEIGHT:</span>
              <span className="px-3 py-1 rounded-lg bg-[#6D35FF] text-white font-bold text-sm">
                {(selectedFrame.qualityScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quality Attention Equation Explorer & Windowed Attention Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Live Quality Formula Explorer */}
          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-white border border-black/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#6D35FF] font-bold uppercase tracking-wider mb-2">
                ATTENTION COEFFICIENT FORMULA
              </div>
              <h3 className="text-xl font-bold font-display text-black mb-4">
                Quality Metric Formulation
              </h3>

              {/* Formula Badge */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white font-mono text-sm sm:text-base border border-black/10 mb-6 flex items-center justify-center">
                <span className="text-[#00F0FF]">Q_i</span>
                <span className="mx-2">=</span>
                <span className="text-emerald-400">0.60(1 − C_i)</span>
                <span className="mx-2">+</span>
                <span className="text-[#B7F000]">0.25 S_i</span>
                <span className="mx-2">+</span>
                <span className="text-amber-400">0.15 B_i</span>
              </div>

              {/* Sliders */}
              <div className="space-y-4 text-xs font-mono mb-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Cloud Probability (C):</span>
                    <span className="font-bold text-black">{(interactiveCloud * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={interactiveCloud}
                    onChange={(e) => setInteractiveCloud(parseFloat(e.target.value))}
                    className="w-full accent-[#6D35FF] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Spatial Sharpness Index (S):</span>
                    <span className="font-bold text-black">{interactiveSharp.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={interactiveSharp}
                    onChange={(e) => setInteractiveSharp(parseFloat(e.target.value))}
                    className="w-full accent-[#00B8D4] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-600">Blur Ratio (B):</span>
                    <span className="font-bold text-black">{interactiveBlur.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={interactiveBlur}
                    onChange={(e) => setInteractiveBlur(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Computed Output Readout */}
            <div className="p-4 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-600 font-bold uppercase">COMPUTED QUALITY Qi:</span>
              <span className={`text-xl font-mono font-bold ${
                qualityNum > 0.7 ? 'text-emerald-600' : qualityNum > 0.4 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {computedQuality} ({qualityNum > 0.7 ? 'STRONG WEIGHT' : qualityNum > 0.4 ? 'ATTENUATED' : 'REJECTED'})
              </span>
            </div>
          </div>

          {/* Right Column: 8x8 Windowed Attention vs Global Attention O(N^2) */}
          <div className="lg:col-span-6 p-6 md:p-8 rounded-3xl bg-black text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-2">
                COMPUTATIONAL EFFICIENCY
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-3">
                8×8 Windowed Cross-Attention
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-6">
                Standard full-image multi-head self-attention scales quadratically <code className="text-[#FF334F] font-mono">O(N²)</code> with image height and width, quickly exceeding GPU VRAM limits on satellite tiles.
                RAMTSR partitions latent tokens into localized 8×8 windows, providing linear <code className="text-[#00F0FF] font-mono">O(N)</code> memory complexity suitable for operational deployment.
              </p>

              {/* Memory Comparison Box */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300">
                  <div className="font-bold text-red-400 mb-1">GLOBAL ATTENTION</div>
                  <div className="text-2xl font-black font-display text-red-200 mb-1">O(N²)</div>
                  <p className="text-[11px] text-red-300/80">Quadratic explosion. 512×512 tile requires 38.4 GB VRAM.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="font-bold text-emerald-400 mb-1">8×8 WINDOWED (RAMTSR)</div>
                  <div className="text-2xl font-black font-display text-[#B7F000] mb-1">O(N)</div>
                  <p className="text-[11px] text-emerald-300/80">Linear footprint. 512×512 tile uses only 2.1 GB VRAM.</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span>Engineered for practical GPU constraints and real-time tile inference.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
