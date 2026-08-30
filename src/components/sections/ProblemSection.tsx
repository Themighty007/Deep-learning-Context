import React, { useState } from 'react';
import { Grid, Eye, AlertTriangle, CheckCircle2, ZoomIn } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const [subdivisionLevel, setSubdivisionLevel] = useState<1 | 2 | 4>(4);
  const [selectedScene, setSelectedScene] = useState<'urban' | 'agri' | 'coastal'>('urban');

  const sceneDetails = {
    urban: {
      title: 'Urban Infrastructure & Roads',
      desc: 'Individual buildings (6-12m) and two-lane secondary roads (7m) collapse into single mixed pixels in nominal 10m Sentinel-2 data.',
      coarseNote: 'At 10m, adjacent buildings merge into a monolithic blurred block.',
      srNote: 'At 2.5m, building footprints and road corridors separate cleanly.'
    },
    agri: {
      title: 'Precision Agricultural Plots',
      desc: 'Narrow field irrigation boundaries and inter-plot drainage furrows (2-4m) suffer from heavy partial-pixel volume scattering.',
      coarseNote: 'At 10m, crop vitality anomalies bleed into neighbor fields.',
      srNote: 'At 2.5m, individual furrow health and plot edges are distinct.'
    },
    coastal: {
      title: 'Coastal Reclamation & Ports',
      desc: 'Breakwaters, shipping piers, and tidal shoreline margins fluctuate sub-pixel, causing false erosion/accretion estimations.',
      coarseNote: 'At 10m, land-water interfaces average into mixed gray values.',
      srNote: 'At 2.5m, hard seawall structures are resolved.'
    }
  };

  return (
    <section id="problem" className="relative w-full py-24 md:py-36 bg-[#F7F8F5] text-[#080808] border-t border-black/10 overflow-hidden">
      {/* Subtle technical background grid */}
      <div className="absolute inset-0 scientific-grid-light opacity-60 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>01 · THE RESOLUTION BOTTLENECK</span>
        </div>

        {/* Massive Editorial Headline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <div className="lg:col-span-8">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter font-display leading-[0.92] text-black uppercase mb-6">
              10 METERS<br/>
              ISN'T<br/>
              <span className="text-[#6D35FF]">ENOUGH.</span>
            </h2>
            <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl font-sans leading-relaxed">
              ESA’s Sentinel-2 constellation provides extraordinary 5-day global multispectral coverage.
              However, when the geospatial feature of interest is smaller than the 10 m Ground Sampling Distance (GSD),
              spatial resolution becomes the primary bottleneck for scientific and tactical observation.
            </p>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-black/10 shadow-sm">
            <div className="text-xs font-mono text-neutral-500 mb-2 uppercase">THE NOMINAL SENSOR LIMIT</div>
            <div className="text-4xl font-extrabold font-display text-black mb-1">100 m²</div>
            <p className="text-xs text-neutral-600 font-mono mb-4">Area represented by a single 10m × 10m Sentinel-2 pixel.</p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Features smaller than 10m (vehicles, small structures, farm roads) become unresolved mixed signatures.</span>
            </div>
          </div>
        </div>

        {/* Interactive Pixel Subdivision Laboratory */}
        <div className="p-6 md:p-10 rounded-3xl bg-white border border-black/10 shadow-xl mb-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/10 mb-8">
            <div>
              <div className="text-xs font-mono text-[#6D35FF] font-semibold tracking-wider uppercase mb-1">
                INTERACTIVE GSD RECONSTRUCTION
              </div>
              <h3 className="text-2xl font-bold font-display text-black">
                4× Spatial Resolution Subdivision
              </h3>
            </div>

            {/* Resolution Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 border border-black/5">
              <button
                id="subdiv-btn-1"
                onClick={() => setSubdivisionLevel(1)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  subdivisionLevel === 1
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                10 m (1×1)
              </button>
              <button
                id="subdiv-btn-2"
                onClick={() => setSubdivisionLevel(2)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  subdivisionLevel === 2
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                5 m (2×2)
              </button>
              <button
                id="subdiv-btn-4"
                onClick={() => setSubdivisionLevel(4)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  subdivisionLevel === 4
                    ? 'bg-[#00B8D4] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                2.5 m (4×4 RAMTSR)
              </button>
            </div>
          </div>

          {/* Scene Visualizer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Canvas Panel */}
            <div className="lg:col-span-7">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-black/10 bg-slate-900 shadow-inner flex items-center justify-center">
                {/* Synthetic Satellite Pixel Simulation */}
                <div 
                  className="w-full h-full grid transition-all duration-500"
                  style={{
                    gridTemplateColumns: `repeat(${subdivisionLevel * 8}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${subdivisionLevel * 6}, minmax(0, 1fr))`
                  }}
                >
                  {Array.from({ length: (subdivisionLevel * 8) * (subdivisionLevel * 6) }).map((_, idx) => {
                    // Procedural urban/building pattern depending on resolution
                    const col = idx % (subdivisionLevel * 8);
                    const row = Math.floor(idx / (subdivisionLevel * 8));
                    
                    const isRoad = Math.abs(col - (subdivisionLevel * 4)) <= subdivisionLevel * 0.4;
                    const isBuilding = (col > subdivisionLevel * 1 && col < subdivisionLevel * 3) && (row > subdivisionLevel * 1 && row < subdivisionLevel * 4);
                    const isCanopy = col > subdivisionLevel * 5 && row > subdivisionLevel * 2;
                    
                    let bg = '#1e293b'; // Slate baseline
                    if (isRoad) bg = '#64748b'; // Road
                    else if (isBuilding) bg = '#f97316'; // Terracotta roof
                    else if (isCanopy) bg = '#15803d'; // Green vegetation

                    // If at 10m (coarse), blend colors heavily
                    if (subdivisionLevel === 1) {
                      bg = (isRoad || isBuilding) ? '#57534e' : '#292524';
                    }

                    return (
                      <div 
                        key={idx}
                        className="border border-black/20 transition-colors duration-300"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>

                {/* Technical HUD Overlay on Image */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 border border-white/15 text-white text-xs font-mono backdrop-blur-md">
                  GSD: <span className="text-[#00F0FF] font-bold">{subdivisionLevel === 1 ? '10.0 m' : subdivisionLevel === 2 ? '5.0 m' : '2.5 m (RAMTSR)'}</span>
                </div>

                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/80 border border-white/15 text-white text-xs font-mono backdrop-blur-md">
                  GRID: <span className="text-[#B7F000]">{subdivisionLevel * 8} × {subdivisionLevel * 6} TOKENS</span>
                </div>
              </div>
            </div>

            {/* Scene Description & Insight */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Scene Category Selector */}
              <div className="flex gap-2">
                {(['urban', 'agri', 'coastal'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setSelectedScene(sc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                      selectedScene === sc
                        ? 'bg-black text-white font-bold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-black/5">
                <h4 className="font-bold font-display text-black text-base mb-1">
                  {sceneDetails[selectedScene].title}
                </h4>
                <p className="text-xs text-neutral-600 font-sans leading-relaxed mb-3">
                  {sceneDetails[selectedScene].desc}
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-red-50 text-red-900 border border-red-200">
                    <span className="font-bold">10m Coarse:</span> {sceneDetails[selectedScene].coarseNote}
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <span className="font-bold">2.5m RAMTSR:</span> {sceneDetails[selectedScene].srNote}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Core Question: BUT WHAT IF SHARPER DOESN'T MEAN TRUER? */}
        <div className="p-8 md:p-14 rounded-3xl bg-black text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-[#6D35FF]/20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#00F0FF] text-xs font-mono mb-6">
              <span>THE SCIENTIFIC DILEMMA</span>
            </div>

            <h3 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white mb-6 uppercase leading-[1.05]">
              BUT WHAT IF<br/>
              SHARPER DOESN'T<br/>
              MEAN <span className="text-[#00F0FF] text-glow-cyan">TRUER?</span>
            </h3>

            <p className="text-lg sm:text-xl text-neutral-300 font-sans leading-relaxed mb-6">
              Standard deep-learning super-resolution models are trained purely to maximize visual sharpness (e.g. via unconstrained GANs or diffusion).
              In geospatial applications, this creates a catastrophic vulnerability:
            </p>

            <div className="p-5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-200 text-sm md:text-base font-mono mb-8 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-300 block mb-1">The Hallucination Danger:</strong>
                "A hallucinated building or false road corridor is far more hazardous for urban planning, defense intelligence, and disaster management than a blurry pixel."
              </div>
            </div>

            <p className="text-sm font-mono text-neutral-400">
              RAMTSR solves this by binding every generated sub-pixel to physical sensor constraints and attaching calibrated uncertainty maps.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
