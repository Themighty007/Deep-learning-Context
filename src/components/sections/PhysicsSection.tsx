import React, { useState } from 'react';
import { ShieldCheck, Cpu, ArrowRight, Zap, RefreshCw, AlertCircle, CheckCircle2, Sliders } from 'lucide-react';

export const PhysicsSection: React.FC = () => {
  const [psfSigma, setPsfSigma] = useState<number>(1.5);
  const [samWeight, setSamWeight] = useState<number>(0.20);
  const [simulatedMismatch, setSimulatedMismatch] = useState<number>(0.024);

  // Computed loss Lobs = ||F(SR) - LR||1 + samWeight * SAM
  const l1Loss = (simulatedMismatch * (psfSigma / 1.5)).toFixed(4);
  const samLoss = (0.058 * samWeight).toFixed(4);
  const totalLobs = (parseFloat(l1Loss) + parseFloat(samLoss)).toFixed(4);

  return (
    <section id="physics" className="relative w-full py-24 md:py-36 bg-[#080808] text-white border-t border-white/10 overflow-hidden">
      {/* Background Star Points & Radials */}
      <div className="absolute inset-0 scientific-grid-dark opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[#00F0FF] text-xs font-mono mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>05 · DIFFERENTIABLE SENSOR FORWARD MODEL</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase">
              WHAT IF THE MODEL HAS TO<br/>
              <span className="text-[#00F0FF] text-glow-cyan">ANSWER TO PHYSICS?</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              We take the generated 2.5 m super-resolved representation and mathematically ask:{' '}
              <span className="text-white font-semibold">"If Sentinel-2 had physically observed this ground scene, would it reproduce the 10 m observation we started with?"</span>
            </p>
          </div>
        </div>

        {/* Differentiable Sensor Forward Pipeline Diagram */}
        <div className="p-6 md:p-10 rounded-3xl bg-[#0e0e0e] border border-white/10 shadow-2xl mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-1">
                FORWARD DEGRADATION CHAIN F(SR)
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                Optical Transmission & Downsampling Simulation
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DIFFERENTIABLE AUTOGRAD COMPLIANT</span>
            </div>
          </div>

          {/* 5-Step Degradation Flow Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            
            {/* Step 1: 2.5m SR Estimate */}
            <div className="p-4 rounded-2xl bg-white/5 border border-[#00F0FF]/40 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#00F0FF] font-bold mb-1">STEP 01</div>
                <h4 className="text-sm font-bold font-display text-white mb-2">2.5m SR Output</h4>
                <p className="text-xs text-neutral-400 font-sans">High-resolution inferred multispectral tensor (4 × 4H × 4W).</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-300">
                GSD: 2.5 m
              </div>
            </div>

            {/* Step 2: Gaussian PSF */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#2D7DFF] font-bold mb-1">STEP 02</div>
                <h4 className="text-sm font-bold font-display text-white mb-2">Gaussian PSF</h4>
                <p className="text-xs text-neutral-400 font-sans">9×9 optical Point Spread Function kernel with σ = {psfSigma.toFixed(1)}.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-300">
                Kernel: 9×9 Conv2D
              </div>
            </div>

            {/* Step 3: Sentinel-2 SRF */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#6D35FF] font-bold mb-1">STEP 03</div>
                <h4 className="text-sm font-bold font-display text-white mb-2">Sentinel-2 SRF</h4>
                <p className="text-xs text-neutral-400 font-sans">MSI Spectral Response Functions for B02, B03, B04, B08.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-300">
                Spectral Matrix M_srf
              </div>
            </div>

            {/* Step 4: 4x Downsampling */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-[#B7F000] font-bold mb-1">STEP 04</div>
                <h4 className="text-sm font-bold font-display text-white mb-2">4× Downsample</h4>
                <p className="text-xs text-neutral-400 font-sans">Area-averaging sub-pixel decimation to nominal GSD.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[11px] font-mono text-neutral-300">
                Stride 4 AveragePool
              </div>
            </div>

            {/* Step 5: Synthetic 10m Observation */}
            <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/40 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold mb-1">STEP 05</div>
                <h4 className="text-sm font-bold font-display text-white mb-2">F(SR) vs Real LR</h4>
                <p className="text-xs text-neutral-400 font-sans">Quantized synthetic observation compared to true 10m Sentinel-2.</p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 text-[11px] font-mono text-emerald-400 font-bold">
                Lobs Consistency Lock
              </div>
            </div>

          </div>

          {/* Real vs Synthetic 10m Observation Feedback Strip */}
          <div className="p-5 rounded-2xl bg-black/80 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <span className="text-sm font-bold font-mono text-white">OBSERVATION CONSISTENCY STATUS:</span>
                <span className="text-emerald-400 font-bold font-mono ml-2">OPTIMAL CONVERGENCE (Lobs = {totalLobs})</span>
              </div>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Discrepancies automatically penalize neural loss gradients during training.
            </div>
          </div>
        </div>

        {/* Observation Loss Equation Explorer & Parameter Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Equation Breakdown */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-[#0e0e0e] border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-2">
                NON-NEGOTIABLE LOSS FORMULATION
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-4">
                Observation Consistency Loss Formulation
              </h3>

              {/* Equation Box */}
              <div className="p-5 rounded-2xl bg-black border border-white/15 font-mono text-sm sm:text-base text-center mb-6">
                <span className="text-[#00F0FF] font-bold">L_obs</span>
                <span className="mx-2">=</span>
                <span className="text-[#B7F000]">||F(I_SR) − I_LR||₁</span>
                <span className="mx-2">+</span>
                <span className="text-[#6D35FF]">0.20 · SAM(F(I_SR), I_LR)</span>
              </div>

              {/* Mathematical Term Explanations */}
              <div className="space-y-3 text-xs font-mono text-neutral-300">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <span className="text-[#B7F000] font-bold shrink-0">||F(I_SR) − I_LR||₁ :</span>
                  <span>L1 photometric error between degraded SR prediction and original 10m Sentinel-2 observation.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <span className="text-[#6D35FF] font-bold shrink-0">0.20 · SAM :</span>
                  <span>Spectral Angle Mapper penalty preventing colour and material reflectance shift across 4 bands.</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                  <span className="text-[#00F0FF] font-bold shrink-0">F(·) :</span>
                  <span>End-to-end differentiable forward sensor operator combining PSF convolution, SRF, and downsampling.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Parameter Tuning */}
          <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl bg-[#0e0e0e] border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-2">
                FORWARD SENSOR SIMULATOR
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-4">
                Degradation Parameters
              </h3>

              <div className="space-y-5 text-xs font-mono mb-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">Gaussian PSF Sigma (σ):</span>
                    <span className="text-[#00F0FF] font-bold">{psfSigma.toFixed(1)} px</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={psfSigma}
                    onChange={(e) => setPsfSigma(parseFloat(e.target.value))}
                    className="w-full accent-[#00F0FF] cursor-pointer"
                  />
                  <span className="text-[10px] text-neutral-400">Repository default: 1.5 px (9×9 Gaussian Kernel)</span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-400">SAM Spectral Weight (λ_sam):</span>
                    <span className="text-[#6D35FF] font-bold">{samWeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.01"
                    value={samWeight}
                    onChange={(e) => setSamWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#6D35FF] cursor-pointer"
                  />
                  <span className="text-[10px] text-neutral-400">Repository default: 0.20 weight</span>
                </div>
              </div>
            </div>

            {/* Computed Loss Readout Box */}
            <div className="p-4 rounded-2xl bg-black border border-white/15">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-neutral-400">TOTAL OBSERVATION LOSS:</span>
                <span className="text-[#B7F000] font-bold text-base">{totalLobs}</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-[#B7F000]"
                  style={{ width: `${Math.min(parseFloat(totalLobs) * 1200, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
