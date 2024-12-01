import { TrainingManager } from './TrainingManager';
import { BacktestService } from '../backtesting/BacktestService';
import { TrainingProgress } from './types';
import { logger } from '../../utils/logger';
import { TensorflowSetup } from './TensorflowSetup';
import { TrainingError } from './TrainingError';
import { API_CONFIG } from '../../utils/constants';
import { useTrainingState } from './state/TrainingState';

export class TrainingOrchestrator {
  private static instance: TrainingOrchestrator | null = null;
  private trainingManager: TrainingManager;
  private tensorflowSetup: TensorflowSetup;

  private constructor() {
    this.trainingManager = TrainingManager.getInstance();
    this.tensorflowSetup = TensorflowSetup.getInstance();
  }

  public static getInstance(): TrainingOrchestrator {
    if (!TrainingOrchestrator.instance) {
      TrainingOrchestrator.instance = new TrainingOrchestrator();
    }
    return TrainingOrchestrator.instance;
  }

  async startTraining(
    onProgress: (progress: TrainingProgress) => void
  ): Promise<void> {
    const state = useTrainingState.getState();
    
    if (state.isInitializing || state.isTraining) {
      logger.warn('Eğitim zaten başlatılmış durumda');
      return;
    }

    if (!API_CONFIG.BINANCE_API_KEY || !API_CONFIG.BINANCE_API_SECRET) {
      throw new TrainingError('API anahtarları eksik veya geçersiz');
    }

    try {
      await this.trainingManager.initializeTraining(async (progress, log, metrics) => {
        if (metrics) {
          try {
            await BacktestService.updateMetricsFromTraining(metrics);
          } catch (error) {
            logger.error('Backtest metrikleri güncellenemedi:', error);
          }
        }
        onProgress({ progress, log, metrics });
      });
    } catch (error) {
      const trainError = error instanceof TrainingError ? error : new TrainingError('Eğitim başlatılamadı', error);
      logger.error('Eğitim başlatma hatası:', trainError);
      onProgress({ 
        progress: 0, 
        log: `Hata: ${trainError.message}`,
        metrics: undefined 
      });
      throw trainError;
    }
  }

  abortTraining(): void {
    try {
      this.trainingManager.abort();
      this.tensorflowSetup.cleanup().catch(error => {
        logger.error('İptal sırasında temizleme hatası:', error);
      });
    } finally {
      useTrainingState.getState().reset();
    }
  }

  isTrainingInProgress(): boolean {
    const state = useTrainingState.getState();
    return state.isInitializing || state.isTraining;
  }
}