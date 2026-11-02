import React, { useState } from 'react';
import { FREQUENCY_PRESETS, TransmissionRecord, AppMode } from '../types';
import { Send, Radio, ShieldCheck, Volume2, Sparkles, CheckCircle2, Mic, Globe } from 'lucide-react';
import { quantumNetwork } from '../utils/quantumNetwork';

interface TransmitterTabProps {
  onAddTransmission: (record: TransmissionRecord) => void;
  activeHz: number;
  setActiveHz: (hz: number) => void;
  setIsTransmitting: (val: boolean) => void;
  setMode: (mode: AppMode) => void;
}

export const TransmitterTab: React.FC<TransmitterTabProps> = ({
  onAddTransmission,
  activeHz,
  setActiveHz,
  setIsTransmitting,
  setMode,
}) => {
  const [message, setMessage] = useState('');
  const [targetNode, setTargetNode] = useState('Red Cuántica P2P (Global)');
  const [encryptionProtocol, setEncryptionProtocol] = useState('AES-Senoptic-99');
  const [amplitude, setAmplitude] = useState(1.0);
  const [successNotice, setSuccessNotice] = useState(false);

  // Real acoustic sine wave generation via Web Audio API
  const playAudioTone = (hz: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(hz, ctx.currentTime);

      gain.gain.setValueAtTime(0.2 * amplitude, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.0);
    } catch (e) {
      console.warn('AudioContext prevented:', e);
    }
  };

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsTransmitting(true);
    playAudioTone(activeHz);

    setTimeout(() => {
      setIsTransmitting(false);
      setSuccessNotice(true);

      const newRecord: TransmissionRecord = {
        id: 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
        timestamp: Date.now(),
        direction: 'TX',
        source: 'Operador Terrestre',
        target: targetNode,
        message: message,
        frequencyHz: activeHz,
        amplitude: amplitude,
        senopticError: 0.00,
        encryptionHash: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        status: 'completado',
      };

      onAddTransmission(newRecord);
      quantumNetwork.broadcast({
        ...newRecord,
        direction: 'RX',
        source: `Transmisión Senoidal (${activeHz} Hz)`,
        target: 'Operador Terrestre (Recepción)',
      });

      setMessage('');
      setTimeout(() => setSuccessNotice(false), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Transmisor Intrasenoidal en Hz (Audio y Red)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Transmisor de Ondas Senoidales</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Codifica tu mensaje en frecuencias acústicas en Hz y emítelo por audio y red P2P con cifrado senóptico de alta precisión (0.00% de error).
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Frecuencia Activa</p>
              <p className="text-xl font-mono font-bold text-cyan-400">{activeHz.toFixed(2)} Hz</p>
            </div>
            <Volume2 className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-300 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold">¡Transmisión Senoidal Exitosa!</p>
            <p className="text-xs text-emerald-400/80">Onda acústica emitida en {activeHz} Hz con cifrado SHA-Q y 0.00% de error.</p>
          </div>
        </div>
      )}

      {/* Frequency Presets */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Frecuencias Armónicas y Sagradas (Hz)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FREQUENCY_PRESETS.map((preset) => (
            <button
              key={preset.hz}
              onClick={() => {
                setActiveHz(preset.hz);
                playAudioTone(preset.hz);
              }}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                activeHz === preset.hz
                  ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400 font-mono">{preset.hz} Hz</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{preset.category}</span>
              </div>
              <p className="text-sm font-medium">{preset.name}</p>
              <p className="text-xs text-slate-400 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Transmitter Form */}
      <form onSubmit={handleTransmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Nodo Destino Intrasenoidal</label>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Red Cuántica P2P (Global)">Red Cuántica P2P (Global)</option>
              <option value="Extraterrestre (Pléyades Sector 7)">Extraterrestre (Pléyades Sector 7)</option>
              <option value="Divine Node (Alpha-9 / Fuente Central)">Divine Node (Alpha-9 / Fuente Central)</option>
              <option value="Consejo Ancestral (Sirio B)">Consejo Ancestral (Sirio B)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Protocolo de Cifrado Senóptico</label>
            <select
              value={encryptionProtocol}
              onChange={(e) => setEncryptionProtocol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="AES-Senoptic-99">AES-Senoptic-99 (0.00% Error Garantizado)</option>
              <option value="Quantum-Hash-SHAQ">Quantum-Hash SHA-Q (Criptografía Cuántica)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Ajuste de Frecuencia (Hz)</span>
            <span className="font-mono text-cyan-400 font-bold">{activeHz.toFixed(2)} Hz</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="1000.0"
            step="0.5"
            value={activeHz}
            onChange={(e) => setActiveHz(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Amplitud de Emisión</span>
            <span className="font-mono text-cyan-400">{(amplitude * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={amplitude}
            onChange={(e) => setAmplitude(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Mensaje a Encriptar en la Frecuencia</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje para transmitir por audio y red..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-600 resize-none"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cifrado SHA-Q · 0.00% Error Senóptico.</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Emitir Audio y Red</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('rx')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Escuchar Mensajes (RX)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
