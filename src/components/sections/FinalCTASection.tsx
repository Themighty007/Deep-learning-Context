import React, { useState } from 'react';
import { ArrowUpRight, Satellite, ShieldCheck, Github, MapPin, Cpu, BarChart3, Code2, Sparkles } from 'lucide-react';
import { PROJECT_CONFIG } from '../../config/project';

interface FinalCTASectionProps {
  onScrollTo: (id: string) => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onScrollTo }) => {
  const [easterEggActive, setEasterEggActive] = useState<boolean>(false);

  const triggerEasterEgg = () => {
    setEasterEggActive(true);
    setTimeout(() => setEasterEggActive(false), 3000);
  };

  return (
    <footer className="relative w-full bg-[#050505] text-white border-t border-white/10 overflow-hidden select-none">
      {/* Background Star Grid */}
      <div className="absolute inset-0 scientific-grid-dark opacity-40 pointer-events-none"></div>

      {/* Mini Wireframe Earth Ambient Silhouette */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full border border-[#00F0FF]/15 bg-radial from-[#00F0FF]/5 via-transparent to-transparent pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full border border-dashed border-[#00F0FF]/10 animate-radar"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 md:pt-40 pb-16 relative z-10">
        
        {/* Main CTA Block */}
        <div className="text-center flex flex-col items-center mb-24 md:mb-36">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-mono mb-8 tracking-widest uppercase">
            <Satellite className="w-3.5 h-3.5" />
            <span>READY FOR DEPLOYMENT</span>
          </div>

          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter font-display uppercase leading-[0.9] text-white mb-6">
            SEE MORE.<br/>
            TRUST MORE.<br/>
            <span className="text-[#00F0FF] text-glow-cyan">BUILD WITH RAMTSR.</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-sans max-w-2xl leading-relaxed mb-12">
            Transform 10 m Sentinel-2 multi-temporal observations into a calibrated 2.5 m inferred geospatial product — with observation consistency and quantified trust.
          </p>

          {/* Magnetic CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              id="cta-github-btn"
              href={PROJECT_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full bg-[#00F0FF] hover:bg-[#B7F000] text-black font-mono text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-xl shadow-[#00F0FF]/20 hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>ACCESS OPEN CODE</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              id="cta-gis-btn"
              onClick={() => onScrollTo('gis')}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>OPEN GIS DEMO</span>
              <MapPin className="w-4 h-4" />
            </button>

            <button
              id="cta-arch-btn"
              onClick={() => onScrollTo('architecture')}
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 font-mono text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>VIEW ARCHITECTURE</span>
              <Cpu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Easter Egg Banner */}
        {easterEggActive && (
          <div className="mb-12 p-4 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF] text-white font-mono text-xs text-center animate-in fade-in zoom-in duration-300">
            ✨ <strong>EASTER EGG UNLOCKED:</strong> 10m Sentinel-2 GSD → 2.5m Sub-pixel SwinIR Upsampling Triggered! (4× Resolution Boost Active)
          </div>
        )}

        {/* Comprehensive Mission Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-12 border-t border-white/10 text-xs font-mono text-neutral-400">
          
          {/* Left Column: Brand & Slogan */}
          <div className="md:col-span-4 flex flex-col items-start">
            <button 
              onClick={triggerEasterEgg}
              className="flex items-center gap-2 mb-3 text-left group cursor-pointer"
              title="Click to trigger resolution Easter Egg!"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] group-hover:scale-125 transition-transform animate-ping"></span>
              <span className="text-base font-bold font-display text-white tracking-wider group-hover:text-[#00F0FF]">
                {PROJECT_CONFIG.name}
              </span>
            </button>
            <p className="text-neutral-400 font-sans text-xs max-w-sm mb-4">
              {PROJECT_CONFIG.fullName}
            </p>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#B7F000]">
              ● EARTH OBSERVATION SYSTEM ONLINE
            </div>
          </div>

          {/* Center Column: SIH & NTRO Metadata */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-white font-bold uppercase mb-2">PROJECT SPECIFICATION</div>
            <div>HACKATHON ID: <span className="text-white">{PROJECT_CONFIG.sihId}</span></div>
            <div>ORGANIZATION: <span className="text-white">{PROJECT_CONFIG.orgFullName} ({PROJECT_CONFIG.organization})</span></div>
            <div>DOMAIN: <span className="text-white">{PROJECT_CONFIG.domain}</span></div>
            <div>SPATIAL GSD: <span className="text-[#00F0FF] font-bold">{PROJECT_CONFIG.inputResolution} → {PROJECT_CONFIG.outputResolution}</span></div>
          </div>

          {/* Right Column: Quick Navigation Links */}
          <div className="md:col-span-4 space-y-2 flex flex-col md:items-end">
            <div className="text-white font-bold uppercase mb-2">NAVIGATION</div>
            <button onClick={() => onScrollTo('hero')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">SYSTEM (HERO)</button>
            <button onClick={() => onScrollTo('problem')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">SCIENCE & RESOLUTION</button>
            <button onClick={() => onScrollTo('architecture')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">PIPELINE ARCHITECTURE</button>
            <button onClick={() => onScrollTo('physics')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">SENSOR PHYSICS MODEL</button>
            <button onClick={() => onScrollTo('metrics')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">RADIOMETRIC METRICS</button>
            <button onClick={() => onScrollTo('gis')} className="hover:text-[#00F0FF] transition-colors cursor-pointer">LEAFLET GIS WORKSTATION</button>
          </div>

        </div>

        {/* Bottom Signature Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-white/5 text-[11px] font-mono text-neutral-400">
          <div>
            © 2026 RAMTSR · Built for Smart India Hackathon 2026 ({PROJECT_CONFIG.sihId})
          </div>
          <div className="text-neutral-400 font-bold tracking-wider text-right">
            INFERENCE ≠ TRUTH · <span className="text-[#00F0FF]">TRUST MUST BE MEASURED.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
