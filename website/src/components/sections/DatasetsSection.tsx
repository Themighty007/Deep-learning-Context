import React from 'react';
import { Globe2, Layers, Database, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { DATASET_DISTRIBUTION, DATASET_CARDS } from '../../data/projectData';

export const DatasetsSection: React.FC = () => {
  return (
    <section id="datasets" className="relative w-full py-24 md:py-36 bg-white text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <Globe2 className="w-3.5 h-3.5" />
              <span>09 · DATASET & BIOME GENERALIZATION</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              TRAINED ACROSS<br/>
              <span className="text-[#6D35FF]">THE PLANET.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              Standard Earth observation AI models overfit to uniform farmland. RAMTSR enforces a strict 20% stratified biome split across 5 continents.
            </p>
          </div>
        </div>

        {/* 20% Balanced Land-Cover Patch Sampler */}
        <div className="p-6 md:p-10 rounded-3xl bg-[#F7F8F5] border border-black/10 shadow-lg mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#6D35FF] font-bold uppercase tracking-wider mb-1">
                STRATIFIED PATCH SAMPLING POLICY
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-black">
                Equal 20% Land-Cover Distribution
              </h3>
            </div>
            <div className="text-xs font-mono text-neutral-500">
              P(biome) = 0.20 uniformly sampled
            </div>
          </div>

          {/* 5 Biome Slices */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            {DATASET_DISTRIBUTION.map((biome) => (
              <div
                key={biome.biome}
                className="p-5 rounded-2xl bg-white border border-black/10 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: biome.color }}></span>
                    <span className="text-xl font-bold font-display text-black">{biome.percent}%</span>
                  </div>
                  <h4 className="text-sm font-bold font-display text-black mb-2">{biome.biome}</h4>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">{biome.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unified Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex shadow-inner">
            {DATASET_DISTRIBUTION.map((b) => (
              <div 
                key={b.biome}
                className="h-full"
                style={{ width: `${b.percent}%`, backgroundColor: b.color }}
              />
            ))}
          </div>
        </div>

        {/* Dataset Role Cards (WorldStrat, SEN2NAIP, SEN2VENµS, OpenSR-Test) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DATASET_CARDS.map((ds) => (
            <div
              key={ds.name}
              className="p-6 rounded-3xl bg-neutral-50 border border-black/10 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase" style={{ color: ds.color }}>
                    {ds.role}
                  </span>
                  <Database className="w-4 h-4 text-neutral-400" />
                </div>
                <h3 className="text-xl font-bold font-display text-black mb-2">{ds.name}</h3>
                <p className="text-xs font-mono text-neutral-600 mb-3">{ds.specs}</p>
                <div className="p-2.5 rounded-xl bg-white border border-black/5 text-[11px] text-neutral-700 font-sans leading-relaxed">
                  {ds.highlight}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-black/5 text-[11px] font-mono text-neutral-500">
                VOLUME: <span className="font-bold text-black">{ds.samples}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
