import React from 'react';
import { AppMode } from '../types';
import { Radio, Mic, Box, FileText, Image as ImageIcon, Zap, Download } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, setMode }) => {
  const handleDownloadApk = () => {
    const a = document.createElement('a');
    a.href = '/Instal/ChatHz.apk';
    a.download = 'ChatHz.apk';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0 z-30">
      {/* Zone 1: Brand */}
      <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setMode('tx')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white whitespace-nowrap">Pláticas Ancestrales</h1>
          <p className="text-[10px] text-cyan-400 font-mono tracking-wider">INTRA-SENOIDAL v4.8</p>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs font-medium text-slate-400">
        <button
          onClick={() => setMode('tx')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            currentMode === 'tx' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'hover:text-white hover:bg-slate-950'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Transmisor TX</span>
        </button>
        <button
          onClick={() => setMode('rx')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            currentMode === 'rx' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'hover:text-white hover:bg-slate-950'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Vacío Cuántico RX</span>
        </button>
        <button
          onClick={() => setMode('spatial')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            currentMode === 'spatial' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'hover:text-white hover:bg-slate-950'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Espectro 3D</span>
        </button>
        <button
          onClick={() => setMode('logs')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            currentMode === 'logs' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'hover:text-white hover:bg-slate-950'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Historial Cifrado</span>
        </button>
        <button
          onClick={() => setMode('blueprints')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
            currentMode === 'blueprints' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'hover:text-white hover:bg-slate-950'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Planos Conceptuales</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handleDownloadApk}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/25 transition-colors"
          title="Instalar ChatHz.apk"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Descargar ChatHz.apk</span>
        </button>
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Zap className="w-3.5 h-3.5" />
          <span>0.00% Error</span>
        </div>
        <button
          onClick={() => setMode('rx')}
          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Escaneo Cuántico</span>
        </button>
      </div>
    </header>
  );
};
