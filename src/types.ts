export type AppMode = 'tx' | 'rx' | 'spatial' | 'logs' | 'blueprints' | 'recorder';

export interface TransmissionRecord {
  id: string;
  timestamp: number;
  direction: 'TX' | 'RX';
  source: string; // 'Usuario' | 'Extraterrestre (Pléyades)' | 'Divine Node (Alpha-9)'
  target: string;
  message: string;
  frequencyHz: number;
  amplitude: number;
  senopticError: number; // e.g. 0.00%
  encryptionHash: string;
  status: 'completado' | 'transmitiendo' | 'interceptado' | 'verificado';
}

export interface FrequencyPreset {
  name: string;
  hz: number;
  description: string;
  category: 'Humano' | 'Extraterrestre' | 'Divino' | 'Cuántico';
}

export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { name: 'Resonancia Schumann', hz: 7.83, description: 'Frecuencia base electromagnética de la Tierra', category: 'Humano' },
  { name: 'Frecuencia Pineal', hz: 432.0, description: 'Armonía universal y apertura del tercer ojo', category: 'Humano' },
  { name: 'Restauración ADN', hz: 528.0, description: 'Frecuencia de transformación y milagros (Solfeggio)', category: 'Cuántico' },
  { name: 'Despertar Galáctico', hz: 741.0, description: 'Desintoxicación celular y conexión extraterrestre', category: 'Extraterrestre' },
  { name: 'Vacío Cuántico Absoluto', hz: 963.0, description: 'Conexión con la fuente divina y orden cósmico', category: 'Divino' },
];
