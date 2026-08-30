import React, { useState, useRef, useCallback } from 'react';
import { ShieldCheck, Check, Sparkles, Layers, Sliders, Info, Eye } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeScene, setActiveScene] = useState<'urban' | 'agri' | 'ports'>('urban');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <section id="comparison" className="relative w-full py-24 md:py-36 bg-white text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]"></span>
              <span>02 · INTERACTIVE OBSERVATION COMPARISON</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              10m SENTINEL-2<br/>
              <span className="text-[#00B8D4]">VS 2.5m RAMTSR</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              Drag the interactive optical separator to compare standard 10m L2A reflectance against the 2.5m inferred representation.
              Every sub-pixel detail is constrained by physical degradation and multi-temporal evidence.
            </p>
          </div>
        </div>

        {/* Scene Selector Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-xs font-mono text-neutral-500 uppercase mr-2 shrink-0">TEST SCENE:</span>
          {(['urban', 'agri', 'ports'] as const).map((scene) => (
            <button
              key={scene}
              onClick={() => setActiveScene(scene)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeScene === scene
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {scene === 'urban' ? 'Delhi Urban Infrastructure' : scene === 'agri' ? 'Punjab Farm Plots' : 'Mumbai Port & Coastal'}
            </button>
          ))}
        </div>

        {/* Interactive Compare Container */}
        <div 
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-16/9 md:aspect-21/9 rounded-3xl overflow-hidden border-2 border-black/10 shadow-2xl bg-neutral-900 select-none cursor-ew-resize group"
        >
          {/* Base Layer: High-Res 2.5m RAMTSR Inferred Estimate (Right side) */}
          <div className="absolute inset-0 bg-[#0f172a] overflow-hidden flex items-center justify-center">
            {/* SVG Crisp High-Resolution Terrain Simulation */}
            <svg className="w-full h-full object-cover" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="urban-grid-hr" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="#1e293b" />
                  {/* Crisp building footprints */}
                  <rect x="4" y="4" width="14" height="14" fill="#ea580c" rx="1" />
                  <rect x="22" y="4" width="14" height="14" fill="#ea580c" rx="1" />
                  <rect x="4" y="22" width="14" height="14" fill="#cbd5e1" rx="1" />
                  <rect x="22" y="22" width="14" height="14" fill="#0284c7" rx="1" />
                  {/* Fine road lines */}
                  <line x1="0" y1="20" x2="40" y2="20" stroke="#475569" strokeWidth="2" />
                  <line x1="20" y1="0" x2="20" y2="40" stroke="#475569" strokeWidth="2" />
                </pattern>
                <pattern id="agri-grid-hr" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="60" height="60" fill="#14532d" />
                  <rect x="2" y="2" width="26" height="56" fill="#16a34a" />
                  <rect x="32" y="2" width="26" height="26" fill="#ca8a04" />
                  <rect x="32" y="32" width="26" height="26" fill="#65a30d" />
                  <line x1="30" y1="0" x2="30" y2="60" stroke="#0284c7" strokeWidth="2" />
                </pattern>
              </defs>

              {activeScene === 'urban' ? (
                <rect width="1000" height="500" fill="url(#urban-grid-hr)" />
              ) : activeScene === 'agri' ? (
                <rect width="1000" height="500" fill="url(#agri-grid-hr)" />
              ) : (
                <g>
                  <rect width="600" height="500" fill="url(#urban-grid-hr)" />
                  <path d="M 600,0 Q 680,250 600,500 L 1000,500 L 1000,0 Z" fill="#0369a1" />
                  {/* Seawalls & jetties */}
                  <rect x="580" y="120" width="180" height="16" fill="#e2e8f0" rx="2" />
                  <rect x="560" y="280" width="220" height="20" fill="#cbd5e1" rx="2" />
                </g>
              )}
            </svg>

            {/* RAMTSR Right Label */}
            <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-black/80 border border-[#00F0FF]/40 text-white font-mono text-xs backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
              <span className="font-bold text-[#00F0FF]">2.5m RAMTSR (INFERRED)</span>
            </div>
          </div>

          {/* Top Layer: Coarse 10m Sentinel-2 Image (Clipped to Slider position) */}
          <div 
            className="absolute inset-0 bg-[#0f172a] overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            {/* SVG Blurry Pixelated Low-Resolution Terrain Simulation */}
            <svg className="w-full h-full object-cover filter blur-[4px]" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
              {activeScene === 'urban' ? (
                <rect width="1000" height="500" fill="url(#urban-grid-hr)" />
              ) : activeScene === 'agri' ? (
                <rect width="1000" height="500" fill="url(#agri-grid-hr)" />
              ) : (
                <g>
                  <rect width="600" height="500" fill="url(#urban-grid-hr)" />
                  <path d="M 600,0 Q 680,250 600,500 L 1000,500 L 1000,0 Z" fill="#0369a1" />
                </g>
              )}
            </svg>

            {/* Coarse Pixel Grid Overlay on the 10m side */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}
            ></div>

            {/* Sentinel-2 Left Label */}
            <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-black/80 border border-white/20 text-white font-mono text-xs backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="font-bold">10m SENTINEL-2 L2A</span>
            </div>
          </div>

          {/* Draggable Divider Line & Glowing Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-[#00F0FF] shadow-[0_0_16px_#00F0FF] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black border-2 border-[#00F0FF] text-[#00F0FF] shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize hover:scale-110 transition-transform">
              <Sliders className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Floating HUD Annotations with SVG Connector Lines */}
          <div className="absolute bottom-6 left-6 z-10 hidden sm:flex flex-col gap-2 pointer-events-none">
            <div className="px-3.5 py-2 rounded-xl bg-black/85 border border-white/15 text-white font-mono text-[11px] backdrop-blur-md space-y-1">
              <div className="text-[#B7F000] font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#B7F000]" />
                RADIOMETRIC INTEGRITY PRESERVED
              </div>
              <div className="text-neutral-400 text-[10px]">
                ✓ Spectral consistency (SAM ≤ 0.07 rad)<br/>
                ✓ Geometric alignment (Phase-correlation)<br/>
                ✓ Differentiable sensor downsampling lock
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-10 hidden sm:flex flex-col items-end gap-2 pointer-events-none">
            <div className="px-3.5 py-2 rounded-xl bg-black/85 border border-white/15 text-white font-mono text-[11px] backdrop-blur-md text-right">
              <div className="text-neutral-400 text-[10px]">PIXEL TRUST CALIBRATION</div>
              <div className="text-[#00F0FF] font-bold">██████████████████░░ 91.8% HIGH</div>
              <div className="text-[10px] text-neutral-400">4× Spatial Gain (10m → 2.5m GSD)</div>
            </div>
          </div>
        </div>

        {/* Scientific Disclaimer Pill */}
        <div className="mt-6 p-4 rounded-2xl bg-neutral-100 border border-black/10 text-neutral-700 text-xs font-mono flex items-start gap-3">
          <Info className="w-4 h-4 text-[#00B8D4] shrink-0 mt-0.5" />
          <div>
            <strong className="text-black">Scientific Distinction:</strong> RAMTSR produces an <em>inferred 2.5m spatial representation</em>.
            It does not claim to recover physically unobserved ground truth. Every sub-pixel estimation carries an uncertainty quantifier.
          </div>
        </div>

      </div>
    </section>
  );
};
