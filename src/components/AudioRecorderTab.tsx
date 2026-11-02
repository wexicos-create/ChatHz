import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Square, Download, Trash2, Radio, ShieldCheck, Volume2, Activity } from 'lucide-react';
import { TransmissionRecord } from '../types';
import { quantumNetwork } from '../utils/quantumNetwork';

interface AudioRecorderTabProps {
  onAddTransmission: (record: TransmissionRecord) => void;
}

interface RecordedAudioItem {
  id: string;
  timestamp: number;
  blobUrl: string;
  durationSeconds: number;
  sizeKb: number;
  transcript: string;
}

export const AudioRecorderTab: React.FC<AudioRecorderTabProps> = ({ onAddTransmission }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<RecordedAudioItem[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    setRecordingTime(0);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);
        const sizeKb = Math.round(audioBlob.size / 1024);

        const newRec: RecordedAudioItem = {
          id: 'REC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          timestamp: Date.now(),
          blobUrl,
          durationSeconds: recordingTime,
          sizeKb,
          transcript: `Audio grabado por micrófono (${recordingTime}s) · Hz no medidos`,
        };

        setRecordings((prev) => [newRec, ...prev]);
        setSuccessNotice('¡Audio grabado con éxito desde el micrófono de audífono!');
        setTimeout(() => setSuccessNotice(null), 4000);

        // Stop stream tracks
        stream.getTracks().forEach((t) => t.stop());

        const digest = await crypto.subtle.digest('SHA-256', await audioBlob.arrayBuffer());
        const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
        onAddTransmission({
          id: newRec.id,
          timestamp: Date.now(),
          direction: 'RX',
          source: 'Micrófono de Audífono (AUX)',
          target: 'Grabador Local',
          message: newRec.transcript,
          frequencyHz: 0,
          amplitude: 0,
          senopticError: null,
          encryptionHash: 'sha256:' + hash,
          status: 'verificado',
        });
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting audio recorder:', err);
      alert('No se pudo acceder al micrófono de audífono. Por favor verifica los permisos del navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playRecording = (rec: RecordedAudioItem) => {
    if (audioElRef.current) {
      audioElRef.current.src = rec.blobUrl;
      audioElRef.current.play();
      setPlayingId(rec.id);
      audioElRef.current.onended = () => setPlayingId(null);
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Grabador de Audio y Micrófono de Audífono</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Grabación Directa con Audífonos (AUX)</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Graba audio directamente con el micrófono disponible. Reproduce y descarga tus grabaciones con hash SHA-256 para comprobar integridad (sin cifrado).
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-5 py-4">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Estado de Grabación</p>
              <p className={`text-xl font-mono font-bold ${isRecording ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
                {isRecording ? `00:${recordingTime < 10 ? '0' + recordingTime : recordingTime}` : 'Listo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-emerald-300 shadow-lg animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{successNotice}</p>
        </div>
      )}

      {/* Recording Control Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-24 h-24 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl relative">
          <div className={`absolute inset-0 rounded-full bg-cyan-500/10 ${isRecording ? 'animate-ping' : ''}`} />
          <Mic className={`w-10 h-10 ${isRecording ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">
            {isRecording ? 'Grabando audio con micrófono de audífono...' : 'Listo para grabar audio en alta fidelidad'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Conecta tus audífonos con micrófono o cable auxiliar y presiona el botón para iniciar la captura.
          </p>
        </div>

        <div className="flex justify-center gap-4 pt-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2.5 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Iniciar Grabación con Audífono</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2.5 transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Detener y Guardar Grabación</span>
            </button>
          )}
        </div>
      </div>

      {/* Recordings List */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 px-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Grabaciones Realizadas ({recordings.length})</span>
        </h3>

        {recordings.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No hay audios grabados todavía. Realiza tu primera grabación con el micrófono de tus audífonos.
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <div key={rec.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{rec.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {rec.durationSeconds}s · {rec.sizeKb} KB
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{rec.transcript}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => playRecording(rec)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      playingId === rec.id ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{playingId === rec.id ? 'Reproduciendo...' : 'Reproducir'}</span>
                  </button>
                  <a
                    href={rec.blobUrl}
                    download={`chat_hz_audio_${rec.id}.webm`}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl transition-colors"
                    title="Descargar Audio"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteRecording(rec.id)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <audio ref={audioElRef} className="hidden" />
    </div>
  );
};
