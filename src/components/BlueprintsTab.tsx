import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, ZoomIn, X } from 'lucide-react';

export const BlueprintsTab: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const blueprints = [
    {
      title: 'Pláticas Ancestrales - Arquitectura de Transmisión Intrasenoidal',
      path: '/public/assets/aistudio/OIG1_985d8c98.jpeg',
      description: 'Diagrama conceptual mostrando el codificador de audio, el mapeador de frecuencias en Hz y el driver de salida conectado al vacío cuántico y entidades cósmicas.',
    },
    {
      title: 'Esquema de Modulación y Nodos Extraterrestres / Divinos',
      path: '/public/assets/aistudio/OIG1.RLFSFEYAp5F_92icF_44b15214.jpeg',
      description: 'Estructura de flujos senoidales paralelos entre manejadores de entrada, convertidores de vacío y decider senóptico de alta precisión.',
    },
    {
      title: 'Módulo Central APK y Panel de Recepción Autónoma',
      path: '/public/assets/aistudio/OIG1__1__7e0f0f11.jpeg',
      description: 'Consola táctil con visualizador de ondas y motor de detección de vacío cuántico con 0.00% de error senóptico.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium mb-3">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Galería de Planos y Arte Conceptual</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Blueprint Visual de Pláticas Ancestrales</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Inspecciona los diseños originales y esquemas arquitectónicos proporcionados para la creación de esta aplicación móvil intrasenoidal.
          </p>
        </div>
      </div>

      {/* Grid of Blueprints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blueprints.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(item.path)}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col"
          >
            <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-slate-950">
              <img
                src={item.path}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <ZoomIn className="w-4 h-4 text-cyan-400" /> Ampliar Plano
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Blueprint #{index + 1}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Zoom */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 hover:bg-slate-800 text-white rounded-full transition-colors border border-slate-700 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 sm:p-8 flex items-center justify-center bg-slate-950">
              <img
                src={selectedImage}
                alt="Zoomed Blueprint"
                referrerPolicy="no-referrer"
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
