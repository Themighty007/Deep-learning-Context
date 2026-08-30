import React, { useState } from 'react';
import { Building2, Sprout, AlertTriangle, Droplets, ShieldCheck, ArrowRight } from 'lucide-react';

export const ApplicationsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const applications = [
    {
      id: 'urban',
      title: 'Urban Intelligence & Smart Cities',
      category: '01 · INFRASTRUCTURE',
      icon: Building2,
      headline: 'Small structures better resolved. But never blindly trusted.',
      desc: 'Separates 6-12m residential building footprints and narrow 2-lane road arteries that blur together in 10m Sentinel-2. The calibrated uncertainty map prevents city planners from hallucinating non-existent informal settlements.',
      keyMetrics: ['Building Boundary IoU: +14.2%', 'Road Network Continuity: +18.6%', 'Hallucination Risk: ≤ 4.2%'],
      accentColor: '#6D35FF'
    },
    {
      id: 'agri',
      title: 'Precision Agriculture & Food Security',
      category: '02 · FOOD SYSTEMS',
      icon: Sprout,
      headline: 'Sub-field crop phenology without spectral distortion.',
      desc: 'Resolves micro-irrigation channels and individual smallholder plots without altering chlorophyll absorption bands. Strict NDVI error limits (ΔNDVI ≤ 0.031) ensure farmers do not receive false crop-stress warnings.',
      keyMetrics: ['NDVI Absolute Error: ≤ 0.031', 'Plot Boundary Separation: 2.5m GSD', 'Yield Anomaly Sensitivity: 94.2%'],
      accentColor: '#22C55E'
    },
    {
      id: 'disaster',
      title: 'Disaster Response & Rapid Flood Mapping',
      category: '03 · CRISIS RESPONSE',
      icon: AlertTriangle,
      headline: 'Rapid situational clarity when seconds count.',
      desc: 'Provides 4× sharper spatial visibility through thin cloud gaps for emergency route assessment and structural damage mapping. High uncertainty flags alert first responders to areas obscured by cloud shadows.',
      keyMetrics: ['Flood Boundary Precision: 2.5m', 'Emergency Route Triage: Verified', 'Temporal Revisit Look: 5-Day Stack'],
      accentColor: '#FF334F'
    },
    {
      id: 'water',
      title: 'Water Bodies & Environmental Monitoring',
      category: '04 · HYDROLOGY & CLIMATE',
      icon: Droplets,
      headline: 'Precise coastal seawall and wetland shoreline tracking.',
      desc: 'Enforces NDWI spectral fidelity across land-water interfaces. Eliminates partial-pixel water bleeding to accurately measure reservoir volume depletion and coastal mangrove restoration.',
      keyMetrics: ['NDWI Error: ≤ 0.028', 'Shoreline Delineation: ± 2.5m', 'Sediment Plume Resolution: 4×'],
      accentColor: '#00B8D4'
    }
  ];

  return (
    <section id="applications" className="relative w-full py-24 md:py-36 bg-white text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00B8D4]"></span>
              <span>12 · REAL-WORLD HIGH-IMPACT APPLICATIONS</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              DEPLOYED ACROSS<br/>
              <span className="text-[#00B8D4]">CRITICAL DOMAINS.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              From tactical infrastructure reconnaissance to precision crop monitoring, RAMTSR delivers defensible 2.5m spatial intelligence.
            </p>
          </div>
        </div>

        {/* 4 Application Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Tab Selectors (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {applications.map((app, idx) => {
              const isSelected = activeTab === idx;
              const Icon = app.icon;
              return (
                <button
                  key={app.id}
                  onClick={() => setActiveTab(idx)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-black bg-[#F7F8F5] shadow-md scale-102'
                      : 'border-black/5 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: app.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase font-bold">{app.category}</div>
                      <div className="text-sm font-bold font-display text-black">{app.title}</div>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-black translate-x-1' : 'text-neutral-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Application Feature Card (8 Cols) */}
          <div className="lg:col-span-8 p-8 md:p-12 rounded-3xl bg-[#F7F8F5] border border-black/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold text-white uppercase"
                  style={{ backgroundColor: applications[activeTab].accentColor }}
                >
                  {applications[activeTab].category}
                </span>
                <span className="text-xs font-mono text-neutral-400">OPERATIONAL DEPLOYMENT</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black font-display text-black mb-4 uppercase">
                {applications[activeTab].headline}
              </h3>

              <p className="text-sm sm:text-base text-neutral-700 font-sans leading-relaxed mb-8">
                {applications[activeTab].desc}
              </p>

              {/* Key Quantitative Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {applications[activeTab].keyMetrics.map((km, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase mb-1">TARGET SPEC 0{i + 1}</div>
                    <div className="text-xs font-mono font-bold text-black">{km}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black text-white text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                <span>GeoTIFF 4-Band + 1-Band Uncertainty Raster Ready</span>
              </div>
              <span className="text-[#B7F000] font-bold">ACTIVE PIPELINE</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
