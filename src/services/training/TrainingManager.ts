import { TrainingError } from './TrainingError';
import { logger } from '../../utils/logger';
import { useTrainingState } from './state/TrainingState';
import { useTradingStore } from '../../stores/tradingStore';
import { TensorflowSetup } from './TensorflowSetup';
import { DataPreprocessor } from './DataPreprocessor';
import { binanceService } from '../binance';
import { TrainingMetrics } from './types';
import * as tf from '@tensorflow/tfjs';

export class TrainingManager {
  private static instance: TrainingManager | null = null;
  private tensorflowSetup: TensorflowSetup;
  private abortController: AbortController | null = null;

  private constructor() {
    this.tensorflowSetup = TensorflowSetup.getInstance();
  }

  static getInstance(): TrainingManager {
    if (!this.instance) {
      this.instance = new TrainingManager();
    }
    return this.instance;
  }

  async initializeTraining(
    onProgress: (
      progress: number,
      log: string,
      metrics?: TrainingMetrics
    ) => void
  ): Promise<void> {
    const state = useTrainingState.getState();
    
    if (state.isTraining) {
      throw new TrainingError('Eğitim zaten devam ediyor');
    }

    try {
      state.setInitializing(true);
      
      // TensorFlow hazırlığı
      await this.tensorflowSetup.initialize();
      onProgress(5, 'TensorFlow.js hazırlandı');

      // 1 yıllık veri al
      const historicalData = await binanceService.fetchHistoricalData(365);
      onProgress(20, `${historicalData.length} adet veri noktası yüklendi`);

      const { features, labels } = await DataPreprocessor.prepareTrainingData(historicalData);
      onProgress(30, 'Veriler işlendi');

      // Daha derin model mimarisi
      const model = tf.sequential({
        layers: [
          tf.layers.dense({ 
            inputShape: [20], 
            units: 128, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({ 
            units: 64, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ 
            units: 32, 
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dense({ units: 3, activation: 'softmax' })
        ]
      });

      model.compile({
        optimizer: tf.train.adamax(0.0005),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      state.setTraining(true);
      this.abortController = new AbortController();

      // Daha uzun eğitim süreci
      await model.fit(features, labels, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            if (this.abortController?.signal.aborted) {
              throw new TrainingError('Eğitim kullanıcı tarafından iptal edildi');
            }

            const progress = Math.min(30 + (epoch / 100) * 70, 100);
            onProgress(progress, `Epoch ${epoch + 1}/100`, {
              accuracy: logs?.acc || 0,
              loss: logs?.loss || 0,
              validationScore: logs?.val_acc || 0
            });

            // Her 10 epoch'ta bir belleği temizle
            if (epoch % 10 === 0) {
              await tf.nextFrame();
              tf.engine().endScope();
              tf.engine().startScope();
            }
          }
        }
      });

      onProgress(100, 'Eğitim tamamlandı');
      await this.transitionToTrading(model);

    } catch (error) {
      logger.error('Eğitim başlatma hatası:', error);
      throw error;
    } finally {
      state.setInitializing(false);
      state.setTraining(false);
      if (this.abortController) {
        this.abortController = null;
      }
    }
  }

  private async transitionToTrading(model: tf.LayersModel): Promise<void> {
    try {
      const tradingStore = useTradingStore.getState();
      tradingStore.setModel(model);
      tradingStore.setIsTraining(false);
      await tradingStore.initializeTrading();
      logger.info('Trading moduna geçiş yapıldı');
    } catch (error) {
      logger.error('Trading moduna geçiş hatası:', error);
      throw new TrainingError('Trading moduna geçiş başarısız', error);
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  isInProgress(): boolean {
    return useTrainingState.getState().isTraining;
  }
}