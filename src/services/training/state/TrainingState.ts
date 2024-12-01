import { create } from 'zustand';

export interface TrainingStateStore {
  isInitializing: boolean;
  isTraining: boolean;
  setInitializing: (state: boolean) => void;
  setTraining: (state: boolean) => void;
  reset: () => void;
}

export const useTrainingState = create<TrainingStateStore>((set) => ({
  isInitializing: false,
  isTraining: false,
  setInitializing: (state) => set({ isInitializing: state }),
  setTraining: (state) => set({ isTraining: state }),
  reset: () => set({ isInitializing: false, isTraining: false })
}));