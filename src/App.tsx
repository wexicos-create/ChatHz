import React, { useState } from 'react';
import { AppMode, TransmissionRecord } from './types';
import { Navbar } from './components/Navbar';
import { TransmitterTab } from './components/TransmitterTab';
import { ReceiverTab } from './components/ReceiverTab';
import { ThreeQuantumScene } from './components/ThreeQuantumScene';
import { LogsTab } from './components/LogsTab';
import { BlueprintsTab } from './components/BlueprintsTab';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('tx');
  const [activeHz, setActiveHz] = useState<number>(528.0);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  const [records, setRecords] = useState<TransmissionRecord[]>([
    {
      id: 'TX-7892Q',
      timestamp: Date.now() - 1000 * 60 * 15,
      direction: 'TX',
      source: 'Usuario (Operador Terrestre)',
      target: 'Extraterrestre (Pléyades Sector 7)',
      message: 'Saludos fraternales desde la Tierra. Frecuencia armónica establecida en 528Hz.',
      frequencyHz: 528.0,
      amplitude: 1.0,
      senopticError: 0.00,
      encryptionHash: '0x8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      status: 'completado',
    },
    {
      id: 'RX-4412X',
      timestamp: Date.now() - 1000 * 60 * 5,
      direction: 'RX',
      source: 'Divine Node (Alpha-9 / Fuente Central)',
      target: 'Usuario (Receptor Cuántico)',
      message: 'El vacío cuántico responde. La vibración colectiva se eleva hacia el orden cósmico.',
      frequencyHz: 963.0,
      amplitude: 1.2,
      senopticError: 0.00,
      encryptionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a2b',
      status: 'verificado',
    },
  ]);

  const handleAddTransmission = (record: TransmissionRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  const renderContent = () => {
    switch (mode) {
      case 'tx':
        return (
          <TransmitterTab
            onAddTransmission={handleAddTransmission}
            activeHz={activeHz}
            setActiveHz={setActiveHz}
            setIsTransmitting={setIsTransmitting}
            setMode={setMode}
          />
        );
      case 'rx':
        return (
          <ReceiverTab
            onAddTransmission={handleAddTransmission}
            isReceiving={isReceiving}
            setIsReceiving={setIsReceiving}
          />
        );
      case 'spatial':
        return (
          <div className="w-full h-[calc(100vh-4rem)]">
            <ThreeQuantumScene
              activeHz={activeHz}
              isTransmitting={isTransmitting}
              isReceiving={isReceiving}
            />
          </div>
        );
      case 'logs':
        return <LogsTab records={records} />;
      case 'blueprints':
        return <BlueprintsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <Navbar currentMode={mode} setMode={setMode} />

      {/* Viewport Toggle Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 text-xs shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-cyan-400">Pláticas Ancestrales</span>
          <span>/</span>
          <span className="capitalize">{mode === 'spatial' ? 'Espectro 3D' : mode === 'tx' ? 'Transmisor TX' : mode === 'rx' ? 'Receptor RX' : mode === 'logs' ? 'Historial Cifrado' : 'Planos Conceptuales'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              isMobileFrame ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMobileFrame ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
            <span>{isMobileFrame ? 'Modo Dispositivo Móvil' : 'Modo Pantalla Completa'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center overflow-y-auto">
        {isMobileFrame && mode !== 'spatial' ? (
          <div className="my-8 w-[380px] h-[780px] bg-slate-900 border-[8px] border-slate-800 rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-slate-800 rounded-b-2xl z-40" />
            <div className="flex-1 overflow-y-auto pt-6 pb-4">
              {renderContent()}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex-1">
            {renderContent()}
          </div>
        )}
      </main>
    </div>
  );
}
