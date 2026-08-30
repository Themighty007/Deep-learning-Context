import React, { useState, useEffect } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { FirstLoadModal } from './components/ui/FirstLoadModal';
import { WebGLHero } from './components/hero/WebGLHero';
import { HeroHUD } from './components/hero/HeroHUD';
import { ProblemSection } from './components/sections/ProblemSection';
import { ComparisonSection } from './components/sections/ComparisonSection';
import { PhilosophySection } from './components/sections/PhilosophySection';
import { TemporalFusionSection } from './components/sections/TemporalFusionSection';
import { ArchitectureSection } from './components/sections/ArchitectureSection';
import { PhysicsSection } from './components/sections/PhysicsSection';
import { UncertaintySection } from './components/sections/UncertaintySection';
import { MetricsSection } from './components/sections/MetricsSection';
import { AblationSection } from './components/sections/AblationSection';
import { DatasetsSection } from './components/sections/DatasetsSection';
import { TrainingCurriculumSection } from './components/sections/TrainingCurriculumSection';
import { GISDashboardSection } from './components/sections/GISDashboardSection';
import { ApplicationsSection } from './components/sections/ApplicationsSection';
import { OpenScienceSection } from './components/sections/OpenScienceSection';
import { FinalCTASection } from './components/sections/FinalCTASection';

export default function App() {
  const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isNavbarDark, setIsNavbarDark] = useState<boolean>(true);

  // Scroll listener for hero camera choreograph & active section detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      
      // Calculate hero scroll progress (0.0 to 1.0)
      const p = Math.min(Math.max(scrollY / (heroHeight * 1.1), 0), 1);
      setScrollProgress(p);

      // Detect dark vs light section for navbar morphing
      // Hero, Philosophy, Physics, Training, GIS, Final CTA are Dark
      // Problem, Comparison, Temporal, Architecture, Metrics, Datasets, Applications, OpenScience are Light
      const sections = [
        { id: 'hero', dark: true },
        { id: 'problem', dark: false },
        { id: 'comparison', dark: false },
        { id: 'temporal', dark: false },
        { id: 'architecture', dark: false },
        { id: 'physics', dark: true },
        { id: 'uncertainty', dark: false },
        { id: 'metrics', dark: false },
        { id: 'ablation', dark: false },
        { id: 'datasets', dark: false },
        { id: 'training', dark: true },
        { id: 'gis', dark: true },
        { id: 'applications', dark: false },
        { id: 'opensource', dark: false }
      ];

      const currentScrollPos = scrollY + 200;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (currentScrollPos >= top && currentScrollPos < top + height) {
            setActiveSection(sec.id);
            setIsNavbarDark(sec.dark);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-[#080808] selection:bg-[#00F0FF] selection:text-black">
      {/* First Load Cinematic Mission Initialization */}
      {!loadingComplete && (
        <FirstLoadModal onComplete={() => setLoadingComplete(true)} />
      )}

      {/* Global Floating Morphing Navigation */}
      <Navbar 
        activeSection={activeSection} 
        isDarkTheme={isNavbarDark} 
      />

      {/* 01 · HERO SECTION (Deep Space / WebGL Earth Descent) */}
      <section id="hero" className="relative w-full h-screen">
        <WebGLHero 
          scrollProgress={scrollProgress} 
          onExploreClick={() => scrollToSection('problem')}
        />
        <HeroHUD 
          scrollProgress={scrollProgress}
          onExploreClick={() => scrollToSection('problem')}
          onArchitectureClick={() => scrollToSection('architecture')}
        />
      </section>

      {/* 02 · PROBLEM SECTION (10m Resolution Bottleneck & Hallucination Awareness) */}
      <ProblemSection />

      {/* 03 · BEFORE / AFTER INTERACTIVE COMPARISON (10m vs 2.5m Inferred) */}
      <ComparisonSection />

      {/* 04 · PHILOSOPHY MANIFESTO ("We Don't Just Generate Pixels. We Quantify Trust.") */}
      <PhilosophySection />

      {/* 05 · TEMPORAL FUSION (5-Frame Stack, Quality-Aware Attention & 8x8 Windowed Attention) */}
      <TemporalFusionSection />

      {/* 06 · REPOSITORY ARCHITECTURE PIPELINE (Interactive 18-Node System Graph) */}
      <ArchitectureSection />

      {/* 07 · SENSOR PHYSICS (Differentiable Gaussian PSF, SRF & Lobs Consistency Loss) */}
      <PhysicsSection />

      {/* 08 · UNCERTAINTY & TRUST HEATMAP (Heteroscedastic Variance, MC-Dropout & Object Confidence) */}
      <UncertaintySection />

      {/* 09 · RADIOMETRIC METRICS BENTO (PSNR, SSIM, SAM, SID, RMSE, NDVI/NDWI, Hallucination, ECE) */}
      <MetricsSection />

      {/* 10 · 5-MODEL PROGRESSIVE ABLATION LABORATORY & BASELINE BENCHMARKS */}
      <AblationSection />

      {/* 11 · DATASETS & BIOMES (20% Stratified Sampling, WorldStrat, SEN2NAIP, SEN2VENµS) */}
      <DatasetsSection />

      {/* 12 · 4-PHASE PROGRESSIVE TRAINING CURRICULUM */}
      <TrainingCurriculumSection />

      {/* 13 · OPERATIONAL LEAFLET GIS WORKSTATION (Indian AOIs, Layer Split, Timeline, Metadata) */}
      <GISDashboardSection />

      {/* 14 · REAL-WORLD DOMAIN APPLICATIONS */}
      <ApplicationsSection />

      {/* 15 · OPEN SCIENCE & REPRODUCIBILITY (Directory Explorer & CLI) */}
      <OpenScienceSection />

      {/* 16 · FINAL CTA & COMPREHENSIVE MISSION FOOTER */}
      <FinalCTASection onScrollTo={scrollToSection} />
    </div>
  );
}
