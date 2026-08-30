import React from 'react';
import { ArrowDown, ArrowUpRight, ShieldCheck, Cpu, Compass, Layers } from 'lucide-react';
import { PROJECT_CONFIG } from '../../config/project';

interface HeroHUDProps {
  onExploreClick: () => void;
  onArchitectureClick: () => void;
  scrollProgress: number;
}

export const HeroHUD: React.FC<HeroHUDProps> = ({
  onExploreClick,
  onArchitectureClick,
  scrollProgress
}) => {
  // Fade HUD as user dives toward Earth surface
  const hudOpacity = Math.max(1 - scrollProgress * 1.8, 0);

  if (hudOpacity <= 0.02) return null;

  return (
    <div 
      id="hero-hud-layer"
      style={{ opacity: hudOpacity }}
      className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-12 lg:p-16 text-white transition-opacity duration-300"
    >
      {/* Top Spacer for floating Navbar */}
      <div className="h-12 md:h-16"></div>

      {/* Main Content Split: Headline on Left, Scientific Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-7xl mx-auto my-auto">
        
        {/* Left Column: Massive Editorial Typography */}
        <div className="lg:col-span-7 flex flex-col items-start pointer-events-auto">
          {/* Subsystem Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono mb-4 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
            <span>SIH26142 · {PROJECT_CONFIG.organization} · SPACE TECH</span>
          </div>

          {/* Massive Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter font-display leading-[0.92] text-white mb-4 uppercase">
            SEE<br/>
            THE<br/>
            <span className="text-[#00F0FF] text-glow-cyan">UNSEEN.</span>
          </h1>

          {/* Project Title */}
          <div className="text-xl sm:text-2xl font-bold font-display text-neutral-200 tracking-tight mb-3">
            {PROJECT_CONFIG.fullName}
          </div>

          {/* Scientific Positioning Statement */}
          <p className="text-sm sm:text-base text-neutral-300 font-sans max-w-lg leading-relaxed mb-8">
            From <span className="text-white font-semibold">10 m Sentinel-2</span> observations to a{' '}
            <span className="text-[#00F0FF] font-semibold">2.5 m inferred representation</span> — with
            calibrated uncertainty and physics consistency attached to every pixel.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              id="hero-explore-cta"
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-full bg-[#00F0FF] hover:bg-[#B7F000] text-black font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-[#00F0FF]/25 hover:shadow-[#B7F000]/30 hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>EXPLORE RAMTSR</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              id="hero-arch-cta"
              onClick={onArchitectureClick}
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>VIEW ARCHITECTURE</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Floating Scientific Telemetry HUDs */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-end gap-4 pointer-events-auto">
          {/* Card 1: Sensor & Stack HUD */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md shadow-2xl max-w-xs w-full text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#00F0FF] border-b border-white/10 pb-2 mb-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                ORBITAL SENSING
              </span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>CONSTELLATION</span>
                <span className="text-white">SENTINEL-2 L2A</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>SPECTRAL BANDS</span>
                <span className="text-white">B02 / B03 / B04 / B08</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>TEMPORAL DEPTH</span>
                <span className="text-[#00F0FF] font-bold">T = 5 FRAMES</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>INFERRED GSD</span>
                <span className="text-[#B7F000] font-bold">2.5 m (4× SR)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Physical & Trust State */}
          <div className="p-4 rounded-xl bg-black/60 border border-white/15 backdrop-blur-md shadow-2xl max-w-xs w-full text-left">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#B7F000] border-b border-white/10 pb-2 mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                OBSERVATION LOCK
              </span>
              <span className="text-emerald-400">ENFORCED</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>SENSOR PSF</span>
                <span className="text-white">Gaussian (σ=1.5)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>CALIBRATION</span>
                <span className="text-emerald-400 font-semibold">ECE &lt; TARGET</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>UNCERTAINTY</span>
                <span className="text-white">Aleatoric + Epistemic</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Micro Data & Scroll Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs font-mono text-neutral-400 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">10m → 2.5m</span>
          <span>·</span>
          <span>T = 5 STACK</span>
          <span>·</span>
          <span className="text-[#00F0FF]">RELIABILITY-AWARE SR</span>
        </div>

        {/* Pulsing Scroll Indicator */}
        <div 
          onClick={onExploreClick}
          className="flex items-center gap-2 text-[#00F0FF] hover:text-white transition-colors cursor-pointer pointer-events-auto group"
        >
          <span className="tracking-widest uppercase text-[11px]">SCROLL TO DESCEND</span>
          <div className="w-6 h-6 rounded-full border border-[#00F0FF]/40 flex items-center justify-center group-hover:translate-y-1 transition-transform">
            <ArrowDown className="w-3.5 h-3.5 text-[#00F0FF]" />
          </div>
        </div>
      </div>
    </div>
  );
};
