import React from 'react';
import { TransmissionRecord } from '../types';
import { FileText, ShieldCheck, ArrowUpRight, ArrowDownLeft, Radio, Calendar } from 'lucide-react';

interface LogsTabProps {
  records: TransmissionRecord[];
}

export const LogsTab: React.FC<LogsTabProps> = ({ records }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Registro Histórico Intrasenoidal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Historial de Transmisiones y Recepciones</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Bitácora temporal de sesión con hashes SHA-256 donde estén disponibles. El porcentaje de error requiere calibración.
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Radio className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
          <p className="text-sm">No hay registros de transmisiones o recepciones aún.</p>
          <p className="text-xs text-slate-600">Usa el Transmisor TX o el Vacío Cuántico RX para iniciar comunicación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    record.direction === 'TX' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {record.direction === 'TX' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{record.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        record.direction === 'TX' ? 'bg-cyan-500/15 text-cyan-300' : 'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {record.direction === 'TX' ? 'Transmisión TX' : 'Recepción RX'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{record.source} → {record.target}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-200 font-mono">
                "{record.message}"
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Frecuencia: <strong className="text-cyan-400 font-mono">{record.frequencyHz > 0 ? record.frequencyHz + ' Hz' : 'No medido'}</strong></span>
                  <span>Amplitud: <strong className="text-indigo-400 font-mono">{record.amplitude}x</strong></span>
                  <span>Error: <strong className="text-emerald-400 font-mono">{record.senopticError === null ? 'No medido' : record.senopticError.toFixed(2) + '%'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[160px] sm:max-w-xs">{record.encryptionHash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
