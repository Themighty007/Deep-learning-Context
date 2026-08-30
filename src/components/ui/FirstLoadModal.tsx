import React, { useState, useEffect } from 'react';
import { Satellite, ShieldCheck, Zap } from 'lucide-react';
import { PROJECT_CONFIG } from '../../config/project';

interface FirstLoadModalProps {
  onComplete: () => void;
}

export const FirstLoadModal: React.FC<FirstLoadModalProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(3);
  const [statusText, setStatusText] = useState('INITIALIZING EARTH OBSERVATION SYSTEM');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const steps = [
      { p: 17, text: 'INGESTING SENTINEL-2 L2A TEMPORAL STACK (T=5)...' },
      { p: 42, text: 'CONFIGURING SWINIR 8×8 WINDOWED CROSS-ATTENTION...' },
      { p: 76, text: 'CALIBRATING DIFFERENTIABLE SENSOR PSF & SRF...' },
      { p: 94, text: 'ACTIVATING HETEROSCEDASTIC RELIABILITY HEATMAP...' },
      { p: 100, text: 'SYSTEM ONLINE · 2.5m INFERRED RESOLUTION READY' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatusText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 400);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div 
      id="first-load-screen"
      className="fixed inset-0 z-500 bg-[#050505] flex flex-col items-center justify-center p-6 text-white select-none transition-opacity duration-500"
    >
      {/* Scanning Laser Line */}
      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent animate-scanline opacity-60 pointer-events-none"></div>

      {/* Background Star Points */}
      <div className="absolute inset-0 scientific-grid-dark opacity-40 pointer-events-none"></div>

      {/* Central HUD Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0a0a0a]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
        {/* Glowing Logo Mark */}
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] mb-5 shadow-lg shadow-cyan-500/20">
          <Satellite className="w-7 h-7 animate-pulse" />
        </div>

        {/* Project Header */}
        <div className="text-[11px] font-mono tracking-widest text-[#00F0FF] mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
          <span>{PROJECT_CONFIG.sihId} · {PROJECT_CONFIG.organization}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-white mb-1">
          {PROJECT_CONFIG.name}
        </h2>
        <p className="text-xs text-neutral-400 font-mono mb-6">
          {PROJECT_CONFIG.fullName}
        </p>

        {/* Progress Bar & Numerical Readout */}
        <div className="w-full mb-3">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-neutral-400">SUBSYSTEM SYNC</span>
            <span className="text-[#00F0FF] font-bold">{String(progress).padStart(2, '0')}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#B7F000] to-[#00F0FF] rounded-full transition-all duration-300 shadow-sm shadow-cyan-400"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Terminal Status Output */}
        <div className="w-full py-2 px-3 rounded-lg bg-black/60 border border-white/5 text-[11px] font-mono text-neutral-300 text-left truncate flex items-center gap-2">
          <Zap className="w-3 h-3 text-[#00F0FF] shrink-0" />
          <span className="truncate">{statusText}</span>
        </div>

        {/* Skip button for immediate entry */}
        <button
          id="skip-loader-btn"
          onClick={() => {
            setVisible(false);
            onComplete();
          }}
          className="mt-5 text-xs font-mono text-neutral-400 hover:text-white px-4 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-all cursor-pointer"
        >
          SKIP INITIALIZATION [ESC] →
        </button>
      </div>

      {/* Footer Subtext */}
      <div className="absolute bottom-6 text-[10px] font-mono text-neutral-400 tracking-wider">
        SENTINEL-2 L2A · 10m → 2.5m INFERRED · CALIBRATED TRUST
      </div>
    </div>
  );
};
