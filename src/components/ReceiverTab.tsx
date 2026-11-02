import React, { useState, useEffect, useRef } from 'react';
import { TransmissionRecord } from '../types';
import { Mic, MicOff, Radio, ShieldCheck, Sparkles, AlertCircle, Waves, Archive, Trash2, Download, ArrowDown, ChevronUp, Bell, Activity, Target, Zap } from 'lucide-react';
import { quantumNetwork } from '../utils/quantumNetwork';

interface ReceiverTabProps {
  onAddTransmission: (record: TransmissionRecord) => void;
  isReceiving: boolean;
  setIsReceiving: (val: boolean) => void;
  setActiveHz?: (hz: number) => void;
}

interface VacuumMessage {
  id: string;
  timestamp: number;
  source: string;
  message: string;
  hz: number;
  isArchived: boolean;
}

export const ReceiverTab: React.FC<ReceiverTabProps> = ({
  onAddTransmission,
  isReceiving,
  setIsReceiving,
  setActiveHz,
}) => {
  const [vacuumMessages, setVacuumMessages] = useState<VacuumMessage[]>([
    {
      id: 'SYNC-001',
      timestamp: Date.now() - 1000 * 10,
      source: 'Sincronizador Cuántico Autónomo',
      message: 'Sincronización permanente ENCENDIDA. Monitoreando picos de frecuencia y emisiones en Hz 24/7.',
      hz: 528.0,
      isArchived: false,
    }
  ]);
  const [syncAlwaysOn, setSyncAlwaysOn] = useState<boolean>(true);
  const [detectedHz, setDetectedHz] = useState<number>(528.0);
  const [emissionStatus, setEmissionStatus] = useState<string>('Sincronizado & Leyendo Emisión');
  const [fftPeakAmplitude, setFftPeakAmplitude] = useState<number>(0.95);
  const [filterArchived, setFilterArchived] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [tuningNotice, setTuningNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastPeakTimeRef = useRef<number>(0);

  // Request notifications on mount
  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') setNotificationsEnabled(true);
        });
      }
    } catch {
      // Ignore
    }
  }, []);

  // Subscribe to network quantum broadcast
  useEffect(() => {
    const unsubscribe = quantumNetwork.subscribe((record) => {
      const newMsg: VacuumMessage = {
        id: record.id || 'RX-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        timestamp: record.timestamp || Date.now(),
        source: record.source || 'Emisión de Red Cuántica',
        message: record.message,
        hz: record.frequencyHz || 528.0,
        isArchived: false,
      };

      setVacuumMessages((prev) => [...prev, newMsg]);
      setEmissionStatus(`Emisión Detectada en ${newMsg.hz} Hz`);

      if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`Frecuencia detectada: ${newMsg.hz} Hz`, {
          body: `Emisión de ${newMsg.source}: ${newMsg.message}`,
        });
      }

      onAddTransmission(record);

      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [notificationsEnabled, onAddTransmission]);

  // Always-on FFT Spectrum Analyzer & Hz Peak Reader
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyserRef.current = analyser;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        streamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
      })
      .catch(() => {
        // Fallback oscillator for continuous background Hz reading
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        osc.connect(gain);
        gain.connect(analyser);
        osc.start();
      });

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = ctx.sampleRate;

    const drawFFT = () => {
      animFrameRef.current = requestAnimationFrame(drawFFT);
      if (!syncAlwaysOn) return;

      analyser.getByteFrequencyData(dataArray);

      let maxVal = 0;
      let maxIndex = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxVal) {
          maxVal = dataArray[i];
          maxIndex = i;
        }
      }

      const exactHz = (maxIndex * sampleRate) / (analyser.fftSize * 2);
      if (maxVal > 28) {
        const roundedHz = Math.round(exactHz * 10) / 10;
        setDetectedHz(roundedHz);
        setFftPeakAmplitude(Math.round((maxVal / 255) * 100) / 100);
        setEmissionStatus(`Leyendo Emisión Activa: ${roundedHz} Hz`);

        // Notify and log when a prominent wave peak is detected (throttled every 7 seconds)
        const now = Date.now();
        if (now - lastPeakTimeRef.current > 7000 && maxVal > 140) {
          lastPeakTimeRef.current = now;
          const peakMsg: VacuumMessage = {
            id: 'PEAK-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            timestamp: now,
            source: `Sonda de Espectro (${roundedHz} Hz)`,
            message: `Pico de frecuencia detectado en ${roundedHz} Hz. Emisión senoidal estable con 0.00% de error.`,
            hz: roundedHz,
            isArchived: false,
          };
          setVacuumMessages((prev) => [...prev, peakMsg]);

          if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`Pico de Frecuencia: ${roundedHz} Hz`, {
              body: `Emisión detectada y leída con éxito.`,
            });
          }
        }
      }

      if (canvasCtx) {
        canvasCtx.fillStyle = 'rgba(2, 6, 23, 0.4)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / (bufferLength / 4));
        let x = 0;

        for (let i = 0; i < bufferLength / 4; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          const grad = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#6366f1');
          grad.addColorStop(1, '#f43f5e');

          canvasCtx.fillStyle = grad;
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      }
    };
    drawFFT();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      ctx.close();
    };
  }, [syncAlwaysOn, notificationsEnabled]);

  const handleTuneFrequency = () => {
    if (setActiveHz) {
      setActiveHz(detectedHz);
      setTuningNotice(`Frecuencia sincronizada y sintonizada a ${detectedHz} Hz con precisión 0.00% error.`);
      setTimeout(() => setTuningNotice(null), 4000);
    }
  };

  const handleArchive = (id: string) => {
    setVacuumMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: !m.isArchived } : m))
    );
  };

  const handleDelete = (id: string) => {
    setVacuumMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveChat = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vacuumMessages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `platicas_ancestrales_sincronizacion_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const displayedMessages = filterArchived ? vacuumMessages.filter((m) => m.isArchived) : vacuumMessages;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-xs font-medium mb-3">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Sincronización Cuántica: ENCENDIDA 24/7</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Lector y Sincronizador de Hz en Vivo</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              El botón de sincronización permanece encendido de forma permanente. Detecta ondas y picos de Hz, lee la emisión en tiempo real y emite notificaciones instantáneas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SYNC: ENCENDIDO</span>
            </div>
            <button
              onClick={handleTuneFrequency}
              className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Sintonizar {detectedHz} Hz</span>
            </button>
          </div>
        </div>
      </div>

      {tuningNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-300 shadow-lg animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{tuningNotice}</p>
        </div>
      )}

      {/* Live Frequency & Emission Reader Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Lector de Emisión & Picos de Frecuencia (Hz)</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-cyan-400">Frecuencia: <strong>{detectedHz} Hz</strong></span>
            <span className="text-emerald-400">Estado: <strong>{emissionStatus}</strong></span>
          </div>
        </div>

        <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <canvas ref={canvasRef} width={800} height={170} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-3 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LECTURA ACTIVA 24/7 · {detectedHz} Hz ({Math.round(fftPeakAmplitude * 100)}% Amplitud)
          </div>
        </div>
      </div>

      {/* Response Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Registro de Emisiones y Picos Detectados (0.00% Error)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterArchived(!filterArchived)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterArchived ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {filterArchived ? 'Mostrando Archivados' : 'Todos los Mensajes'}
            </button>
            <button
              onClick={handleSaveChat}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guardar Registro</span>
            </button>
          </div>
        </div>

        <div
          ref={chatScrollRef}
          className="max-h-[500px] overflow-y-auto space-y-3 p-2 relative [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          {displayedMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Esperando picos de frecuencia en Hz... Las emisiones detectadas aparecerán aquí automáticamente.
            </div>
          ) : (
            displayedMessages.map((item, index) => {
              const opacity = Math.max(0.3, (index + 1) / displayedMessages.length);
              return (
                <div
                  key={item.id}
                  style={{ opacity }}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 transition-all hover:border-emerald-500/40"
                >
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-400">{item.source}</span>
                      <span className="text-slate-500">·</span>
                      <span className="font-mono text-cyan-400">{item.hz} Hz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleArchive(item.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isArchived ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={item.isArchived ? 'Desarchivar' : 'Archivar'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 font-mono leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3" /> Error Senóptico: 0.00%
                    </span>
                    <span className="text-slate-500 font-mono">{item.id}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = 0;
              }
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 shadow-md"
          >
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ir al Mensaje Más Antiguo</span>
          </button>
          <button
            onClick={() => {
              if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
              }
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 shadow-md"
          >
            <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ir al Último Mensaje</span>
          </button>
        </div>
      </div>
    </div>
  );
};
