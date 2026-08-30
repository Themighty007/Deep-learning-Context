import React, { useState } from 'react';
import { BarChart3, ShieldCheck, AlertTriangle, CheckCircle, Info, X, Zap, ChevronRight } from 'lucide-react';
import { RADIOMETRIC_METRICS } from '../../data/projectData';
import { MetricValue } from '../../types';

export const MetricsSection: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricValue | null>(null);

  const getStatusBadge = (status: MetricValue['status']) => {
    switch (status) {
      case 'target':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-700 border border-blue-500/30">EVAL TARGET</span>;
      case 'demo':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">DEMO RESULT</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-700 border border-amber-500/30">PENDING AUDIT</span>;
      case 'measured':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-700 border border-purple-500/30">VERIFIED</span>;
    }
  };

  return (
    <section id="metrics" className="relative w-full py-24 md:py-36 bg-white text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <span className="w-2 h-2 rounded-full bg-[#00B8D4]"></span>
              <span>07 · RADIOMETRIC & SCIENTIFIC AUDIT</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              PROVE<br/>
              <span className="text-[#00B8D4]">THE PIXEL.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              Sharpness is easy to fabricate. Scientific and radiometric fidelity is harder.
              RAMTSR audits PSNR, SSIM, SAM, SID, 4-band RMSE, NDVI/NDWI fidelity, ECE, and hallucination rates.
            </p>
          </div>
        </div>

        {/* Major Typographic Editorial Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#F7F8F5] border border-black/10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-red-600 font-bold uppercase mb-1">
              THE SCIENTIFIC REALITY
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-black uppercase">
              PSNR IS NOT ENOUGH.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {['PSNR', 'SSIM', 'SAM', 'SID', 'RMSE', 'NDVI', 'NDWI', 'ECE', 'HALLUCINATION'].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-lg bg-white border border-black/10 font-bold text-neutral-800">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Premium Bento Grid of Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Photometric (PSNR + SSIM) */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[0])}
            className="p-6 rounded-3xl bg-neutral-50 border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-neutral-500 uppercase">PHOTOMETRIC RECONSTRUCTION</span>
                {getStatusBadge('demo')}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-black font-display text-black">34.82</span>
                <span className="text-lg font-mono text-neutral-500">dB</span>
              </div>
              <div className="text-xs font-mono text-neutral-600 mb-4">
                PSNR (Baseline Image Contrast & Noise Ratio)
              </div>
              <div className="p-3 rounded-xl bg-white border border-black/5 flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-500">SSIM INDEX:</span>
                <span className="font-bold text-black">0.924 (High Structural Match)</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-black">
              <span>INSPECT FORMULA</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Spectral Fidelity (SAM) */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[2])}
            className="p-6 rounded-3xl bg-neutral-50 border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#6D35FF] font-bold uppercase">SPECTRAL FIDELITY</span>
                {getStatusBadge('target')}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-black font-display text-[#6D35FF]">≤ 0.070</span>
                <span className="text-lg font-mono text-neutral-500">rad</span>
              </div>
              <div className="text-xs font-mono text-neutral-600 mb-4">
                SAM (Spectral Angle Mapper across 4 Bands)
              </div>
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs font-mono text-violet-900">
                Smaller angle = strictly preserved chemical/material reflectance curves.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-black">
              <span>INSPECT FORMULA</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Hallucination Rate (Warning Aesthetic) */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[10])}
            className="p-6 rounded-3xl bg-red-50/50 border border-red-200 hover:border-red-500 transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-red-700 font-bold uppercase">HALLUCINATION RISK</span>
                {getStatusBadge('target')}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-black font-display text-red-600">≤ 4.2%</span>
              </div>
              <div className="text-xs font-mono text-red-800 mb-4">
                High-Frequency Mismatch & Unsupported Detail
              </div>
              <div className="p-3 rounded-xl bg-white border border-red-200 text-xs font-mono text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Zero unconstrained generative artifacts allowed into output rasters.</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-red-200 flex items-center justify-between text-[11px] font-mono text-red-700 group-hover:text-red-900">
              <span>INSPECT FORMULA</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Band-wise Surface Reflectance RMSE */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[4])}
            className="p-6 rounded-3xl bg-neutral-50 border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-neutral-500 uppercase">4-BAND RADIOMETRIC RMSE</span>
                {getStatusBadge('demo')}
              </div>
              
              <div className="space-y-2 text-xs font-mono mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-bold">B02 (Blue 490nm):</span>
                  <span className="font-semibold text-black">0.018 ref.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-bold">B03 (Green 560nm):</span>
                  <span className="font-semibold text-black">0.016 ref.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-700 font-bold">B04 (Red 665nm):</span>
                  <span className="font-semibold text-black">0.019 ref.</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-bold">B08 (NIR 842nm):</span>
                  <span className="font-semibold text-black">0.023 ref.</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500 font-sans">
                Sub-2.5% BOA surface reflectance error across all 4 Sentinel-2 optical bands.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-black">
              <span>INSPECT BANDS</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Application Fidelity (NDVI & NDWI) */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[8])}
            className="p-6 rounded-3xl bg-neutral-50 border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-700 font-bold uppercase">VEGETATION & WATER INDICES</span>
                {getStatusBadge('demo')}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-mono text-emerald-800 uppercase">NDVI ERROR</div>
                  <div className="text-xl font-bold font-mono text-emerald-900">0.031</div>
                  <div className="text-[10px] text-emerald-700 font-mono">Target: ≤0.045</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] font-mono text-blue-800 uppercase">NDWI ERROR</div>
                  <div className="text-xl font-bold font-mono text-blue-900">0.028</div>
                  <div className="text-[10px] text-blue-700 font-mono">Target: ≤0.040</div>
                </div>
              </div>
              <p className="text-[11px] text-neutral-600 font-sans">
                Guarantees precision agriculture crop health and flood line mapping are preserved.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-black">
              <span>INSPECT INDICES</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Expected Calibration Error (ECE) */}
          <div 
            onClick={() => setSelectedMetric(RADIOMETRIC_METRICS[11])}
            className="p-6 rounded-3xl bg-neutral-50 border border-black/10 hover:border-black transition-all cursor-pointer shadow-sm hover:shadow-xl group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#00B8D4] font-bold uppercase">RELIABILITY CALIBRATION</span>
                {getStatusBadge('demo')}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl sm:text-5xl font-black font-display text-[#00B8D4]">0.046</span>
              </div>
              <div className="text-xs font-mono text-neutral-600 mb-4">
                ECE (Target: ≤ 0.060 across 10 confidence bins)
              </div>
              <div className="p-3 rounded-xl bg-white border border-black/5 text-xs font-mono text-neutral-700">
                When RAMTSR predicts 90% confidence, empirical accuracy is calibrated within 4.6%.
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-black">
              <span>INSPECT DIAGRAM</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Scientific Disclaimer */}
        <div className="p-4 rounded-2xl bg-neutral-100 border border-black/10 text-xs font-mono text-neutral-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <div>
            <strong className="text-black">Scientific Integrity Protocol:</strong> Target metrics indicate predefined evaluation thresholds in the RAMTSR project repository.
            Demo values reflect sample evaluations on paired Sentinel-2 and SPOT-6/7 validation tiles.
          </div>
        </div>

      </div>

      {/* Interactive Metric Detail Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-500 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-white text-black border border-black/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#00B8D4]">
                  {selectedMetric.category} METRIC
                </span>
                {getStatusBadge(selectedMetric.status)}
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl font-bold font-display text-black">
                {selectedMetric.name} ({selectedMetric.code})
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-xs font-mono mb-6">
              <div className="flex justify-between mb-1">
                <span className="text-neutral-500">CURRENT VALUE:</span>
                <span className="font-bold text-black text-sm">{selectedMetric.value} {selectedMetric.unit}</span>
              </div>
              {selectedMetric.target && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">EVALUATION TARGET:</span>
                  <span className="font-bold text-[#00B8D4]">{selectedMetric.target}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 text-xs font-mono mb-6">
              <div>
                <div className="text-neutral-500 font-bold uppercase mb-1">WHAT IT MEASURES:</div>
                <p className="font-sans text-neutral-700 leading-relaxed text-sm">{selectedMetric.description}</p>
              </div>

              <div>
                <div className="text-emerald-700 font-bold uppercase mb-1">SCIENTIFIC IMPACT FOR RAMTSR:</div>
                <p className="font-sans text-neutral-700 leading-relaxed text-sm">{selectedMetric.scientificImpact}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900">
                <div className="font-bold uppercase mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  WHAT FAILURE LOOKS LIKE:
                </div>
                <p className="font-sans leading-relaxed text-xs">{selectedMetric.failureMode}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMetric(null)}
              className="w-full py-3 rounded-xl bg-black text-white font-mono text-xs font-bold uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              CLOSE AUDIT WINDOW
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
