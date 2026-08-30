import React, { useState, useEffect } from 'react';
import { Satellite, Shield, Cpu, BarChart3, MapPin, Code2, Menu, X, ExternalLink, Activity } from 'lucide-react';
import { PROJECT_CONFIG } from '../../config/project';

interface NavbarProps {
  activeSection: string;
  isDarkTheme?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, isDarkTheme = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'SYSTEM', icon: Satellite },
    { id: 'problem', label: 'SCIENCE', icon: Shield },
    { id: 'architecture', label: 'ARCHITECTURE', icon: Cpu },
    { id: 'metrics', label: 'METRICS', icon: BarChart3 },
    { id: 'gis', label: 'GIS LAB', icon: MapPin },
    { id: 'opensource', label: 'SOURCE', icon: Code2 }
  ];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
      <nav 
        id="main-navigation"
        className={`pointer-events-auto transition-all duration-500 rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between border backdrop-blur-md shadow-2xl ${
          isDarkTheme
            ? 'bg-[#080808]/80 border-white/10 text-white shadow-black/60'
            : 'bg-white/90 border-black/10 text-black shadow-slate-200/60'
        }`}
      >
        {/* Brand Mark */}
        <button 
          id="nav-brand-btn"
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/10 border border-[#00F0FF]/40 text-[#00F0FF] group-hover:scale-105 transition-transform">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-bold tracking-wider text-sm font-display">
              <span>RAMTSR</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-normal tracking-normal bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                {PROJECT_CONFIG.sihId}
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 bg-black/20 dark:bg-white/5 p-1 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => scrollTo(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? isDarkTheme
                      ? 'bg-[#00F0FF] text-black font-semibold shadow-lg shadow-[#00F0FF]/25'
                      : 'bg-black text-white font-semibold shadow-md'
                    : isDarkTheme
                    ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                    : 'text-neutral-600 hover:text-black hover:bg-black/5'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Status & GitHub CTA */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="tracking-wider">ONLINE · 2.5m</span>
          </div>

          <a
            id="nav-github-cta"
            href={PROJECT_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-300 bg-white/10 hover:bg-[#00F0FF] hover:text-black text-white border border-white/15"
          >
            <span>CODE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          id="mobile-nav-drawer"
          className="pointer-events-auto lg:hidden mt-2 p-4 rounded-2xl bg-[#0a0a0a]/95 border border-white/15 text-white backdrop-blur-xl shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono text-neutral-400">
            <span>MISSION NAVIGATION</span>
            <span className="text-emerald-400">● T=5 ACTIVE</span>
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider text-left transition-colors cursor-pointer ${
                activeSection === item.id ? 'bg-[#00F0FF] text-black font-semibold' : 'hover:bg-white/10 text-neutral-300'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
          <a
            href={PROJECT_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-[#00F0FF] hover:text-black text-xs font-mono text-center transition-colors"
          >
            <span>VIEW GITHUB REPOSITORY</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </header>
  );
};
