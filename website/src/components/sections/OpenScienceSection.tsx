import React, { useState } from 'react';
import { Code2, Folder, FileCode, ExternalLink, Terminal, Copy, Check, GitBranch } from 'lucide-react';
import { REPO_STRUCTURE } from '../../data/projectData';
import { PROJECT_CONFIG } from '../../config/project';

export const OpenScienceSection: React.FC = () => {
  const [selectedDir, setSelectedDir] = useState<typeof REPO_STRUCTURE[0]>(REPO_STRUCTURE[1]); // Default ramtsr/models
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const cliCommands = [
    { id: 'clone', label: 'Clone Repository', cmd: `git clone ${PROJECT_CONFIG.githubUrl}.git` },
    { id: 'install', label: 'Install Dependencies', cmd: 'pip install -r requirements.txt' },
    { id: 'train', label: 'Execute 4-Phase Training', cmd: 'python scripts/train_4phase.py --config config/train_config.yaml' },
    { id: 'api', label: 'Launch GIS FastAPI Server', cmd: 'uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload' }
  ];

  return (
    <section id="opensource" className="relative w-full py-24 md:py-36 bg-[#F7F8F5] text-[#080808] border-t border-black/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-xs font-mono mb-4">
              <Code2 className="w-3.5 h-3.5" />
              <span>13 · OPEN SCIENCE & REPRODUCIBILITY</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-black uppercase">
              SHOW<br/>
              <span className="text-[#6D35FF]">THE WORK.</span>
            </h2>
          </div>

          <div className="lg:col-span-4">
            <p className="text-sm text-neutral-600 font-sans leading-relaxed">
              A defensible Earth observation system should be fully open and auditable. Inspect our codebase, loss formulations, and sensor physics forward models.
            </p>
          </div>
        </div>

        {/* Repository Directory Tree Explorer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left Column: Interactive Directory Tree (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-black/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-4 text-xs font-mono">
                <span className="text-neutral-500 font-bold uppercase">RAMTSR REPOSITORY TREE</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" /> main
                </span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {REPO_STRUCTURE.map((item) => {
                  const isSelected = selectedDir.path === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => setSelectedDir(item)}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#6D35FF] text-white font-bold shadow-md'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#6D35FF]'}`} />
                        <span>{item.path}</span>
                      </div>
                      <span className="text-[10px] opacity-70">
                        {item.files.length} files
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <a
              href={PROJECT_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 rounded-2xl bg-black text-white font-mono text-xs font-bold uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>ACCESS OPEN REPOSITORY</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Right Column: Active Directory Inspector & File Manifest (7 Cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-neutral-900 text-white border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-[#00F0FF] font-bold">{selectedDir.path}</span>
                </div>
                <span className="text-neutral-400">MODULE INSPECTOR</span>
              </div>

              <div className="mb-6">
                <div className="text-neutral-400 text-[10px] font-mono uppercase mb-1">MODULE PURPOSE:</div>
                <p className="text-sm font-sans text-neutral-200 leading-relaxed">
                  {selectedDir.desc}
                </p>
              </div>

              {/* Contained Files */}
              <div className="space-y-2 font-mono text-xs mb-6">
                <div className="text-neutral-400 text-[10px] uppercase font-bold mb-2">SOURCE MODULES:</div>
                {selectedDir.files.map((file) => (
                  <div 
                    key={file}
                    className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between hover:border-[#00F0FF]/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#B7F000]" />
                      <span className="text-white font-medium">{file}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Python 3.10+ / PyTorch</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-neutral-300 flex items-center justify-between">
              <span>LICENSE: MIT OPEN SOURCE</span>
              <span className="text-[#00F0FF] font-bold">READY FOR REPRODUCTION</span>
            </div>
          </div>

        </div>

        {/* Reproducibility CLI Terminal */}
        <div className="p-6 md:p-8 rounded-3xl bg-black text-white border border-white/15 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00F0FF]" />
              <span className="text-xs font-mono text-[#00F0FF] font-bold uppercase">REPRODUCTION CLI COMMANDS</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {cliCommands.map((cmd) => (
              <div 
                key={cmd.id}
                className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-neutral-400 block sm:inline mr-3"># {cmd.label}:</span>
                  <span className="text-[#B7F000] font-bold">$ {cmd.cmd}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(cmd.cmd, cmd.id)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-[#00F0FF] hover:text-black transition-all flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
                >
                  {copiedCmd === cmd.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd === cmd.id ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
