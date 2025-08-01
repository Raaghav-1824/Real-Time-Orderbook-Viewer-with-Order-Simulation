import { create } from 'zustand';
import { SimulationResult } from '@/lib/types/simulation';

interface SimulationState {
  currentSimulation: SimulationResult | null;
  isSimulating: boolean;
  
  // Actions
  setSimulation: (simulation: SimulationResult) => void;
  clearSimulation: () => void;
  setSimulating: (loading: boolean) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  currentSimulation: null,
  isSimulating: false,
  
  setSimulation: (simulation) => set({ currentSimulation: simulation, isSimulating: false }),
  clearSimulation: () => set({ currentSimulation: null }),
  setSimulating: (loading) => set({ isSimulating: loading }),
}));