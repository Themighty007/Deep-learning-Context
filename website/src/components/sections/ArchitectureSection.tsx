import React, { useState } from 'react';
import { Cpu, Play, CheckCircle, Info, ChevronRight, Layers, ArrowRight, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { ARCHITECTURE_NODES, ARCHITECTURE_EDGES } from '../../data/projectData';
import { ArchitectureNode, SystemCategory } from '../../types';

export const ArchitectureSection: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[6]); // SwinIR Encoder
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);

  const categories: { key: SystemCategory | 'all'; label: string; color: string }[] = [
    { key: 'all', label: 'ALL MODULES', color: '#080808' },
    { key: 'data', label: 'DATA INGESTION', color: '#00B8D4' },
    { key: 'model', label: 'NEURAL BACKBONE', color: '#6D35FF' },
    { key: 'physics', label: 'SENSOR PHYSICS', color: '#2D7DFF' },
    { key: 'uncertainty', label: 'UNCERTAINTY', color: '#FF334F' },
    { key: 'validation', label: 'SCIENTIFIC METRICS', color: '#22C55E' },
    { key: 'gis', label: 'GIS LAB', color: '#080808' }
  ];

  const getCategoryColor = (cat: SystemCategory) => {
    switch (cat) {
      case 'data': return 'border-[#00B8D4] text-[#00B8D4] bg-cyan-500/10';
      case 'model': return 'border-[#6D35FF] text-[#6D35FF] bg-purple-500/10';
      case 'physics': return 'border-[#2D7DFF] text-[#2D7DFF] bg-blue-500/10';
      case 'uncertainty': return 'border-[#FF334F] text-[#FF334F] bg-red-500/10';
      case 'validation': return 'border-[#22C55E] text-[#22C55E] bg-emerald-500/10';
      case 'gis': return 'border-black text-black bg-neutral-100';
    }
  };

  const getCategoryBadge = (cat: SystemCategory) => {
    switch (cat) {
      case 'data': return 'bg-[#00B8D4] text-white';
      case 'model': return 'bg-[#6D35FF] text-white';
      case 'physics': return 'bg-[#2D7DFF] text-white';
      case 'uncertainty': return 'bg-[#FF334F] text-white';
      case 'validation': return 'bg-[#22C55E] text-white';
      case 'gis': return 'bg-black text-white';
    }
  };

  // Filtered nodes
  const visibleNodes = activeCategoryFilter === 'all'
    ? ARCHITECTURE_NODES
    : ARCHITECTURE_NODES.filter(n => n.category === activeCategoryFilter);

  // Sequential Step Tour
  const nextTourStep = () => {
    const nextIdx = (activeStepIndex + 1) % ARCHITECTURE_NODES.length;
    setActiveStepIndex(nextIdx);
    setSelectedNode(ARCHITECTURE_NODES[nextIdx]);
  };

  const prevTourStep = () => {
    const prevIdx = (activeStepIndex - 1 + ARCHITECTURE_NODES.length) % ARCHITECTURE_NODES.length;
    setActiveStepIndex(prevIdx);
    setSelectedNode(ARCHITECTURE_NODES[prevIdx]);
  };

  return (
    <section id="architecture" className="relative w-full py-24 md:py-36 bg-white text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6D35FF]"></span>
              <span>04 · FULL REPOSITORY PIPELINE ARCHITECTURE</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              INSIDE<br/>
              <span className="text-[#6D35FF]">RAMTSR.</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              An end-to-end, physics-constrained pipeline from Copernicus Sentinel-2 L2A multi-temporal ingestion to calibrated 2.5m GIS rasters.
            </p>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryFilter(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === cat.key
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Interactive Grid: Node Pipeline Flow on Left, Active Node Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Pipeline Interactive Nodes Matrix (8 Cols) */}
          <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl bg-[#F7F8F5] border border-black/10 shadow-inner">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6 text-xs font-mono">
              <span className="text-neutral-500 font-bold uppercase">SYSTEM EXECUTION GRAPH</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTourStep}
                  className="px-2.5 py-1 rounded bg-white border border-black/10 hover:bg-neutral-100 cursor-pointer"
                >
                  PREV
                </button>
                <span className="text-black font-bold">STEP {activeStepIndex + 1} / {ARCHITECTURE_NODES.length}</span>
                <button
                  onClick={nextTourStep}
                  className="px-2.5 py-1 rounded bg-black text-white hover:bg-neutral-800 cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            </div>

            {/* Visual Node Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {visibleNodes.map((node, index) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      const fullIndex = ARCHITECTURE_NODES.findIndex(n => n.id === node.id);
                      if (fullIndex !== -1) setActiveStepIndex(fullIndex);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'border-black bg-white shadow-xl scale-102 z-10'
                        : 'border-black/5 bg-white/70 hover:bg-white hover:border-black/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${getCategoryBadge(node.category)}`}>
                          {node.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {node.tag}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-display text-black mb-1.5">
                        {node.title}
                      </h4>
                      <p className="text-xs text-neutral-600 font-sans line-clamp-2 leading-relaxed mb-3">
                        {node.description}
                      </p>
                    </div>

                    {/* Footer connector indicator */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-black/5">
                      <span>{node.formula ? '📐 FORMULA' : '🔄 PIPELINE'}</span>
                      <span className="text-black group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        INSPECT <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Node Inspector Panel (4 Cols) */}
          <div className="lg:col-span-4 p-6 md:p-8 rounded-3xl bg-neutral-900 text-white border border-white/10 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedNode.category === 'data' ? 'bg-[#00B8D4]' :
                  selectedNode.category === 'model' ? 'bg-[#6D35FF]' :
                  selectedNode.category === 'physics' ? 'bg-[#2D7DFF]' :
                  selectedNode.category === 'uncertainty' ? 'bg-[#FF334F]' : 'bg-[#22C55E]'
                }`}></span>
                <span className="text-xs font-mono uppercase text-neutral-300">MODULE INSPECTOR</span>
              </div>
              <span className="text-xs font-mono text-[#00F0FF]">{selectedNode.tag}</span>
            </div>

            <h3 className="text-2xl font-bold font-display text-white mb-2">
              {selectedNode.title}
            </h3>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-6">
              {selectedNode.description}
            </p>

            {/* Deep Technical Spec */}
            <div className="space-y-4 text-xs font-mono mb-6">
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10">
                <div className="text-neutral-400 text-[10px] mb-1 uppercase font-bold">OPERATIONAL DETAILS</div>
                <div className="text-neutral-200 leading-relaxed font-sans">{selectedNode.details}</div>
              </div>

              {selectedNode.formula && (
                <div className="p-3.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
                  <div className="text-[10px] text-neutral-400 mb-1 uppercase font-bold">MATHEMATICAL FORMULATION</div>
                  <div className="font-mono text-xs break-all">{selectedNode.formula}</div>
                </div>
              )}
            </div>

            {/* Quick Navigation Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">CATEGORY:</span>
              <span className="text-white font-bold uppercase">{selectedNode.category}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
