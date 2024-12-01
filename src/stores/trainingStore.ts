import { create } from 'zustand';
import { TrainingState, TrainingMetrics } from '../services/training/types';
import { logger } from '../utils/logger';

const initialMetrics: TrainingState['metrics'] = {
  accuracy: 0,
  previousAccuracy: 0,
  loss: 0,
  previousLoss: 0,
  validationScore: 0,
  previousValidationScore: 0
};

interface TrainingStore extends TrainingState {
  startTraining: () => Promise<void>;
  abortTraining: () => void;
  updateProgress: (progress: number, log: string) => void;
  updateMetrics: (newMetrics: Partial<TrainingMetrics>) => void;
}

export const useTrainingStore = create<TrainingStore>((set, get) => ({
  isTraining: false,
  progress: 0,
  logs: [],
  error: null,
  metrics: initialMetrics,

  startTraining: async () => {
    logger.info('Eğitim başlatılıyor');
    set({ 
      isTraining: true,
      progress: 0,
      logs: ['Eğitim başlatılıyor...'],
      error: null,
      metrics: initialMetrics
    });
  },

  abortTraining: () => {
    logger.info('Eğitim iptal ediliyor');
    set({ 
      isTraining: false,
      progress: 0,
      logs: [...get().logs, 'Eğitim iptal edildi']
    });
  },

  updateProgress: (progress: number, log: string) => {
    set(state => ({
      progress,
      logs: [...state.logs, log]
    }));
  },

  updateMetrics: (newMetrics: Partial<TrainingMetrics>) => {
    set(state => ({
      metrics: {
        ...state.metrics,
        previousAccuracy: state.metrics.accuracy,
        previousLoss: state.metrics.loss,
        previousValidationScore: state.metrics.validationScore,
        ...newMetrics
      }
    }));
  }
}));