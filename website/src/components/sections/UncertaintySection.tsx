import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Sliders, Activity, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export const UncertaintySection: React.FC = () => {
  const [heatmapBlend, setHeatmapBlend] = useState<number>(65); // 0 = Pure SR, 100 = Pure Heatmap
  const [selectedObjectType, setSelectedObjectType] = useState<'building' | 'road' | 'water' | 'vegetation'>('building');

  const objectReliabilityDetails = {
    building: {
      name: 'Built Infrastructure & Roofs',
      confidence: '94.8%',
      aleatoric: '0.014 (Low sensor noise)',
      epistemic: '0.009 (Strong training density)',
      verdict: 'HIGH RELIABILITY',
      color: '#22C55E',
      note: 'High-contrast sharp boundaries verified across 5 temporal looks.'
    },
    road: {
      name: 'Transportation & Asphalt Corridors',
      confidence: '91.2%',
      aleatoric: '0.021 (Shadow interference)',
      epistemic: '0.012 (Well-represented geometry)',
      verdict: 'HIGH RELIABILITY',
      color: '#22C55E',
      note: 'Linear continuity preserved with sub-pixel edge alignment.'
    },
    water: {
      name: 'Turbid Riverbanks & Shorelines',
      confidence: '78.4%',
      aleatoric: '0.052 (Suspended sediment fluctuations)',
      epistemic: '0.038 (Dynamic tidal variability)',
      verdict: 'MODERATE AMBIGUITY',
      color: '#FACC15',
      note: 'Tidal sediment changes flagged as moderate variance.'
    },
    vegetation: {
      name: 'Seasonal Crop Canopy & Forests',
      confidence: '64.2%',
      aleatoric: '0.081 (Wind flutter / cloud edge shadow)',
      epistemic: '0.065 (High-frequency canopy texture)',
      verdict: 'HIGH UNCERTAINTY (FLAGGED)',
      color: '#FF334F',
      note: 'Potential cloud shadow edge flagged to prevent false crop stress diagnosis.'
    }
  };

  return (
    <section id="uncertainty" className="relative w-full py-24 md:py-36 bg-[#F7F8F5] text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-700 text-xs font-mono mb-4">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>06 · TRUST & UNCERTAINTY QUANTIFICATION</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              AI SHOULD KNOW<br/>
              WHEN IT IS <span className="text-[#FF334F]">GUESSING.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              RAMTSR predicts not only what a 2.5 m pixel could look like — but how much confidence decision-makers should place in it.
            </p>
          </div>
        </div>

        {/* The Trust Heatmap Interactive Dual-Layer Visualizer */}
        <div className="p-6 md:p-10 rounded-3xl bg-white border border-black/10 shadow-xl mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#FF334F] font-bold uppercase tracking-wider mb-1">
                CORE NOVELTY · RELIABILITY MAP
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-black">
                Interactive Trust Heatmap Blending
              </h3>
            </div>

            {/* Slider Control */}
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-neutral-100 border border-black/5 min-w-[280px]">
              <span className="text-[11px] font-mono text-neutral-500 font-bold uppercase">SR OUTPUT</span>
              <input
                type="range"
                min="0"
                max="100"
                value={heatmapBlend}
                onChange={(e) => setHeatmapBlend(parseInt(e.target.value))}
                className="w-full accent-[#FF334F] cursor-pointer"
              />
              <span className="text-[11px] font-mono text-[#FF334F] font-bold uppercase">TRUST MAP</span>
            </div>
          </div>

          {/* Visual Heatmap Canvas */}
          <div className="relative aspect-16/9 md:aspect-21/9 rounded-2xl overflow-hidden border-2 border-black/10 bg-slate-900 shadow-inner mb-6 flex items-center justify-center">
            
            {/* Base High-Res SR Image */}
            <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="urban-scene" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="50" height="50" fill="#1e293b" />
                  <rect x="5" y="5" width="18" height="18" fill="#ea580c" rx="1" />
                  <rect x="27" y="5" width="18" height="18" fill="#cbd5e1" rx="1" />
                  <rect x="5" y="27" width="18" height="18" fill="#16a34a" rx="1" />
                  <rect x="27" y="27" width="18" height="18" fill="#0284c7" rx="1" />
                  <line x1="0" y1="25" x2="50" y2="25" stroke="#475569" strokeWidth="2" />
                  <line x1="25" y1="0" x2="25" y2="50" stroke="#475569" strokeWidth="2" />
                </pattern>
              </defs>
              <rect width="1000" height="500" fill="url(#urban-scene)" />
            </svg>

            {/* Uncertainty Heatmap Overlay (Opacity blended via slider) */}
            <div 
              className="absolute inset-0 transition-opacity duration-150 pointer-events-none"
              style={{ opacity: heatmapBlend / 100 }}
            >
              <svg className="w-full h-full object-cover" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                {/* Green Safe Zones (High Confidence Buildings & Main Roads) */}
                <rect width="1000" height="500" fill="rgba(34, 197, 94, 0.45)" />
                
                {/* Yellow Moderate Uncertainty Zones */}
                <circle cx="350" cy="220" r="140" fill="rgba(250, 204, 21, 0.75)" />
                <circle cx="750" cy="380" r="120" fill="rgba(250, 204, 21, 0.75)" />

                {/* Red High Risk / Hallucination Danger Zones (Shadow edges / low-temporal support) */}
                <circle cx="350" cy="220" r="60" fill="rgba(255, 51, 79, 0.85)" />
                <rect x="680" y="80" width="160" height="90" fill="rgba(255, 51, 79, 0.85)" rx="10" />
                <circle cx="780" cy="120" r="40" fill="rgba(255, 51, 79, 0.95)" />
              </svg>
            </div>

            {/* Live Color Semantics Legend Overlay */}
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/85 border border-white/15 text-white text-xs font-mono backdrop-blur-md space-y-1.5">
              <div className="text-[10px] text-neutral-400 font-bold mb-1">RELIABILITY SCALE:</div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#22C55E]"></span>
                <span>GREEN: High Reliability (Calibrated)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FACC15]"></span>
                <span>YELLOW: Moderate Ambiguity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF334F]"></span>
                <span>RED: Hallucination Risk (Do Not Trust)</span>
              </div>
            </div>

            {/* Readout at Bottom Right */}
            <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/85 border border-white/15 text-white text-xs font-mono backdrop-blur-md">
              BLEND: <span className="text-[#00F0FF] font-bold">{heatmapBlend}% HEATMAP</span>
            </div>
          </div>

          {/* Uncertainty Breakdown Cards: Heteroscedastic vs MC-Dropout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-neutral-50 border border-black/10">
              <div className="text-xs font-mono text-[#00B8D4] font-bold uppercase mb-1">ALEATORIC UNCERTAINTY</div>
              <h4 className="text-base font-bold font-display text-black mb-2">Heteroscedastic σ² Head</h4>
              <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                Captures sensor noise, atmospheric haze, and sub-pixel edge blur inherent to the physical satellite observation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-50 border border-black/10">
              <div className="text-xs font-mono text-[#6D35FF] font-bold uppercase mb-1">EPISTEMIC UNCERTAINTY</div>
              <h4 className="text-base font-bold font-display text-black mb-2">MC-Dropout Variance (N=16)</h4>
              <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                Quantifies model parameter uncertainty by sampling stochastic dropout passes, highlighting unseen out-of-distribution terrain.
              </p>
            </div>
          </div>
        </div>

        {/* Object-Level Confidence Inspector */}
        <div className="p-6 md:p-10 rounded-3xl bg-neutral-900 text-white border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#00F0FF] font-bold uppercase tracking-wider mb-1">
                FEATURE-LEVEL TRUST AUDIT
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                Object Confidence & Reliability Inspector
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['building', 'road', 'water', 'vegetation'] as const).map((ot) => (
                <button
                  key={ot}
                  onClick={() => setSelectedObjectType(ot)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    selectedObjectType === ot
                      ? 'bg-[#00F0FF] text-black font-bold'
                      : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                  }`}
                >
                  {ot}
                </button>
              ))}
            </div>
          </div>

          {/* Active Object Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-black border border-white/15">
                <div className="text-xs font-mono text-neutral-400 uppercase mb-1">OBJECT CLASSIFICATION</div>
                <div className="text-2xl font-bold font-display text-white mb-4">
                  {objectReliabilityDetails[selectedObjectType].name}
                </div>
                
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-neutral-400">CALIBRATED CONFIDENCE:</span>
                    <span className="text-[#00F0FF] font-bold text-sm">
                      {objectReliabilityDetails[selectedObjectType].confidence}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-neutral-400">ALEATORIC NOISE:</span>
                    <span className="text-neutral-200">{objectReliabilityDetails[selectedObjectType].aleatoric}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-neutral-400">EPISTEMIC VARIANCE:</span>
                    <span className="text-neutral-200">{objectReliabilityDetails[selectedObjectType].epistemic}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-neutral-400">TRUST VERDICT:</span>
                    <span 
                      className="font-bold"
                      style={{ color: objectReliabilityDetails[selectedObjectType].color }}
                    >
                      {objectReliabilityDetails[selectedObjectType].verdict}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-neutral-400 text-[10px] uppercase font-bold mb-1">OPERATIONAL EXPLANATION</div>
                <p className="text-neutral-200 font-sans text-sm leading-relaxed">
                  {objectReliabilityDetails[selectedObjectType].note}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">ECE CALIBRATION SCORE</span>
                  <span className="text-emerald-400 font-bold text-sm">ECE = 0.046 (&lt; 0.060 Target)</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  CALIBRATED
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
