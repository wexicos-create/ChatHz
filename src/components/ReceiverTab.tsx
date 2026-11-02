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
  const [vacuumMessages, setVacuumMessages] = useState<VacuumMessage[]>([]);
  const [syncAlwaysOn, setSyncAlwaysOn] = useState<boolean>(true);
  const [detectedHz, setDetectedHz] = useState<number | null>(null);
  const [emissionStatus, setEmissionStatus] = useState<string>('Esperando acceso al micrófono');
  const [fftPeakAmplitude, setFftPeakAmplitude] = useState<number>(0);
  const [filterArchived, setFilterArchived] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [tuningNotice, setTuningNotice] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<'solicitando' | 'activo' | 'sin-permiso' | 'suspendido'>('solicitando');
  const [fftResolution, setFftResolution] = useState<number | null>(null);

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

  // Medición real: nunca sustituir un micrófono denegado por un oscilador artificial.
  useEffect(() => {
    if (!syncAlwaysOn) {
      setEmissionStatus('Lectura detenida');
      setDetectedHz(null);
      return;
    }
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext('2d');
    let disposed = false;
    let frameId = 0;
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('sin-permiso');
      setEmissionStatus('Micrófono no disponible: usa HTTPS o la aplicación Android');
      return;
    }
    setMicStatus('solicitando');
    setEmissionStatus('Solicitando acceso al micrófono');
    navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    }).then(async mediaStream => {
      if (disposed) { mediaStream.getTracks().forEach(track => track.stop()); return; }
      stream = mediaStream;
      streamRef.current = mediaStream;
      ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.65;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(mediaStream).connect(analyser);
      const binWidth = ctx.sampleRate / analyser.fftSize;
      setFftResolution(binWidth);
      try { await ctx.resume(); } catch { /* requiere gesto del usuario */ }
      if (disposed) return;
      setMicStatus(ctx.state === 'running' ? 'activo' : 'suspendido');
      setEmissionStatus(ctx.state === 'running' ? 'Micrófono activo: analizando señal' : 'Toca Activar Audio para comenzar');
      const bins = new Uint8Array(analyser.frequencyBinCount);
      const paint = () => {
        if (disposed) return;
        frameId = requestAnimationFrame(paint);
        if (ctx?.state !== 'running') return;
        analyser.getByteFrequencyData(bins);
        let maxVal = 0, maxIndex = 0;
        for (let i = Math.max(1, Math.ceil(20 / binWidth)); i < bins.length; i++) {
          if (bins[i] > maxVal) { maxVal = bins[i]; maxIndex = i; }
        }
        if (maxVal > 28) {
          const left = bins[maxIndex - 1] ?? maxVal;
          const right = bins[maxIndex + 1] ?? maxVal;
          const divisor = left - 2 * maxVal + right;
          const offset = divisor === 0 ? 0 : Math.max(-0.5, Math.min(0.5, 0.5 * (left - right) / divisor));
          const roundedHz = Math.round((maxIndex + offset) * binWidth * 10) / 10;
          setDetectedHz(roundedHz);
          setFftPeakAmplitude(maxVal / 255);
          setEmissionStatus('Pico acústico observado: ' + roundedHz + ' Hz');
          const now = Date.now();
          if (maxVal > 140 && now - lastPeakTimeRef.current >= 7000) {
            lastPeakTimeRef.current = now;
            const peakMsg: VacuumMessage = {
              id: 'PEAK-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
              timestamp: now, source: 'Micrófono · FFT (' + roundedHz + ' Hz)',
              message: 'Pico espectral acústico a ' + roundedHz + ' Hz. Nivel FFT relativo ' + Math.round(maxVal / 255 * 100) + '%. Precisión instrumental no calibrada.',
              hz: roundedHz, isArchived: false,
            };
            setVacuumMessages(prev => [...prev.slice(-499), peakMsg]);
            if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Pico acústico: ' + roundedHz + ' Hz', { body: 'Lectura del micrófono.' });
            }
          }
        } else {
          setDetectedHz(null);
          setFftPeakAmplitude(0);
          setEmissionStatus('Micrófono activo: sin pico superior al umbral');
        }
        if (canvas && canvasCtx) {
          canvasCtx.fillStyle = '#020617';
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
          const limit = Math.min(512, bins.length);
          const width = canvas.width / limit;
          for (let i = 0; i < limit; i++) {
            const height = bins[i] / 255 * canvas.height;
            canvasCtx.fillStyle = '#06b6d4';
            canvasCtx.fillRect(i * width, canvas.height - height, Math.max(1, width - 1), height);
          }
        }
      };
      paint();
    }).catch(error => {
      if (disposed) return;
      setDetectedHz(null);
      setMicStatus('sin-permiso');
      setEmissionStatus('Sin lectura: permiso denegado o micrófono no disponible');
      console.warn('No se puede iniciar el analizador FFT:', error);
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
      if (ctx) void ctx.close();
    };
  }, [syncAlwaysOn, notificationsEnabled]);

  const handleTuneFrequency = () => {
    if (setActiveHz && detectedHz !== null) {
      const hz = Math.min(1000, Math.max(1, detectedHz));
      setActiveHz(hz);
      setTuningNotice(`Transmisor ajustado a ${hz} Hz. Lectura no calibrada.`);
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
              <span>Analizador acústico FFT · Lectura local</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Lector y Sincronizador de Hz en Vivo</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Analiza frecuencias del micrófono mientras esta pantalla permanece activa. No mide radiación espacial ni funciona en segundo plano.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{micStatus === 'activo' ? 'MIC: ACTIVO' : 'MIC: ' + micStatus.toUpperCase()}</span>
            </div>
            <button
              disabled={detectedHz === null}
              onClick={handleTuneFrequency}
              className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Sintonizar {detectedHz === null ? '—' : detectedHz} Hz</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
        <button type="button" onClick={() => setSyncAlwaysOn(s => !s)} className="rounded-xl bg-slate-800 px-4 py-2 text-cyan-300">{syncAlwaysOn ? 'Detener lectura' : 'Iniciar lectura'}</button>
        {micStatus === 'suspendido' && <button type="button" className="rounded-xl bg-cyan-700 px-4 py-2 text-white" onClick={() => { void audioCtxRef.current?.resume().then(() => { setMicStatus('activo'); setEmissionStatus('Micrófono activo: analizando señal'); }); }}>Activar Audio</button>}
        <span>Origen: micrófono · Resolución FFT: {fftResolution === null ? '—' : fftResolution.toFixed(2) + ' Hz/bin'}</span>
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
            <span className="text-cyan-400">Frecuencia: <strong>{detectedHz === null ? '—' : detectedHz} Hz</strong></span>
            <span className="text-emerald-400">Estado: <strong>{emissionStatus}</strong></span>
          </div>
        </div>

        <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <canvas ref={canvasRef} width={800} height={170} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-3 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {micStatus === 'activo' ? 'LECTURA DE MICRÓFONO' : 'SIN MEDICIÓN'} · {detectedHz === null ? '—' : detectedHz + ' Hz'} ({Math.round(fftPeakAmplitude * 100)}% nivel FFT relativo)
          </div>
        </div>
      </div>

      {/* Response Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Registro de picos acústicos medidos · Sin calibrar</span>
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
              Esperando picos reales del micrófono. Verifica el permiso y el estado del análisis.
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
                      <Activity className="w-3 h-3" /> Lectura local · Sin calibrar
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
