import { TransmissionRecord } from '../types';

class QuantumNetworkService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((record: TransmissionRecord) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('chatz_quantum_network_v4');
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.listeners.forEach((cb) => cb(event.data));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported:', e);
      }
    }
  }

  public broadcast(record: TransmissionRecord) {
    try {
      if (this.channel) {
        this.channel.postMessage(record);
      }
      // Also persist to localStorage for cross-tab sync without BroadcastChannel
      const existing = JSON.parse(localStorage.getItem('chatz_network_queue') || '[]');
      localStorage.setItem('chatz_network_queue', JSON.stringify([record, ...existing].slice(0, 50)));
    } catch (e) {
      console.warn('Network broadcast failed:', e);
    }
  }

  public subscribe(cb: (record: TransmissionRecord) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }
}

export const quantumNetwork = new QuantumNetworkService();
