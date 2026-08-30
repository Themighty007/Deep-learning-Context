import React, { useState } from 'react';
import { Layers, Check, X, ShieldCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { ABLATION_MODELS } from '../../data/projectData';
import { AblationModel } from '../../types';

export const AblationSection: React.FC = () => {
  const [activeModel, setActiveModel] = useState<AblationModel>(ABLATION_MODELS[4]); // Full RAMTSR default

  return (
    <section id="ablation" className="relative w-full py-24 md:py-36 bg-[#F7F8F5] text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6D35FF]"></span>
              <span>08 · 5-MODEL PROGRESSIVE ABLATION LABORATORY</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              WHY RAMTSR?<br/>
              <span className="text-[#6D35FF]">REMOVE ONE IDEA. SEE WHAT BREAKS.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              Super-resolution cannot rely on blind neural complexity. We systematically ablate each architectural component to quantify its scientific contribution.
            </p>
          </div>
        </div>

        {/* Progressive Model Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
          {ABLATION_MODELS.map((model, idx) => {
            const isSelected = activeModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setActiveModel(model)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#6D35FF] bg-white shadow-xl scale-102 z-10'
                    : 'border-black/5 bg-white/70 hover:bg-white'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 mb-1">MODEL 0{idx + 1}</div>
                  <div className="text-xs font-bold font-display text-black mb-2">{model.name}</div>
                </div>
                <div className="text-[11px] font-mono font-bold text-[#6D35FF]">
                  {idx === 4 ? 'FULL SYSTEM' : `+ STEP 0${idx + 1}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Ablation Interactive Dashboard */}
        <div className="p-6 md:p-10 rounded-3xl bg-white border border-black/10 shadow-xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Active Modules & Key Insight */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#6D35FF]/10 text-[#6D35FF] text-xs font-mono font-bold uppercase">
                    ACTIVE CONFIGURATION
                  </span>
                  <span className="text-xs font-mono text-neutral-400">4× INFERENCE TEST</span>
                </div>

                <h3 className="text-2xl font-bold font-display text-black mb-3">
                  {activeModel.name}
                </h3>

                <p className="text-sm text-neutral-600 font-sans leading-relaxed mb-6">
                  {activeModel.description}
                </p>

                {/* Subsystem Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    activeModel.temporal ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}>
                    {activeModel.temporal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                    <span>TEMPORAL (T=5)</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    activeModel.physics ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}>
                    {activeModel.physics ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <X className="w-3.5 h-3.5" />}
                    <span>PHYSICS LOBS</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    activeModel.gan ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}>
                    {activeModel.gan ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <X className="w-3.5 h-3.5" />}
                    <span>PATCHGAN</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    activeModel.uncertainty ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                  }`}>
                    {activeModel.uncertainty ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <X className="w-3.5 h-3.5" />}
                    <span>UNCERTAINTY</span>
                  </div>
                </div>

                {/* Key Insight Box */}
                <div className="p-4 rounded-2xl bg-[#F7F8F5] border border-black/10 text-xs font-mono">
                  <div className="text-[#6D35FF] font-bold uppercase mb-1">ARCHITECTURAL FINDING:</div>
                  <p className="font-sans text-neutral-800 text-sm leading-relaxed">{activeModel.keyInsight}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Comparative Metrics Column for this model */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900 text-white font-mono text-xs shadow-inner">
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase mb-4 pb-2 border-b border-white/10">
                ABLATION PERFORMANCE AUDIT
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">PSNR (Luminance dB):</span>
                  <span className="font-bold text-base text-white">{activeModel.psnr?.toFixed(2) || '—'} dB</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">SSIM (Structural Match):</span>
                  <span className="font-bold text-base text-white">{activeModel.ssim?.toFixed(3) || '—'}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">SAM (Spectral Angle):</span>
                  <span className={`font-bold text-base ${
                    (activeModel.sam || 1) <= 0.07 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activeModel.sam?.toFixed(3) || '—'} rad
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-neutral-400">Hallucination Rate:</span>
                  <span className={`font-bold text-base ${
                    (activeModel.hallucinationRate || 100) <= 5 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activeModel.hallucinationRate ? `≤ ${activeModel.hallucinationRate}%` : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-neutral-400">ECE Calibration:</span>
                  <span className="font-bold text-base text-[#00F0FF]">
                    {activeModel.ece ? activeModel.ece.toFixed(3) : 'UNAVAILABLE (NO σ² HEAD)'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Baseline Benchmark Comparison Table */}
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-black/10 shadow-sm">
          <div className="text-xs font-mono text-neutral-500 font-bold uppercase mb-4">
            BENCHMARK COMPARISON MATRIX (TARGET REPOSITORY CRITERIA)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-black/10 text-neutral-500">
                  <th className="pb-3 font-semibold">METHOD</th>
                  <th className="pb-3 font-semibold">ARCHITECTURE</th>
                  <th className="pb-3 font-semibold">TEMPORAL</th>
                  <th className="pb-3 font-semibold">PHYSICS CONSTRAINED</th>
                  <th className="pb-3 font-semibold">UNCERTAINTY MAP</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="py-3 font-bold text-black">ESRGAN</td>
                  <td className="py-3 text-neutral-600">RRDB + Adversarial</td>
                  <td className="py-3 text-red-600">No (T=1)</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">Baseline</span></td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-black">TTST</td>
                  <td className="py-3 text-neutral-600">Transformer Temporal</td>
                  <td className="py-3 text-emerald-600">Yes (T=3)</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">Baseline</span></td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-black">EDiffSR</td>
                  <td className="py-3 text-neutral-600">Conditional Diffusion</td>
                  <td className="py-3 text-red-600">No (T=1)</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3 text-red-600">No</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">Baseline</span></td>
                </tr>
                <tr className="bg-cyan-50/50">
                  <td className="py-3 font-bold text-[#00B8D4]">RAMTSR (Ours)</td>
                  <td className="py-3 text-black font-semibold">SwinIR + Windowed Cross-Attn</td>
                  <td className="py-3 text-emerald-600 font-bold">Yes (T=5 Quality-Weighted)</td>
                  <td className="py-3 text-emerald-600 font-bold">Yes (Differentiable PSF/SRF)</td>
                  <td className="py-3 text-emerald-600 font-bold">Yes (Heteroscedastic + MC)</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded bg-[#00F0FF] text-black font-bold">PROPOSED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
