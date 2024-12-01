import * as tf from '@tensorflow/tfjs';
import { TrainingError } from './TrainingError';
import { logger } from '../../utils/logger';

export class TensorflowSetup {
  private static instance: TensorflowSetup | null = null;
  private isInitialized = false;
  private memoryWatcherId: number | null = null;

  private constructor() {}

  static getInstance(): TensorflowSetup {
    if (!TensorflowSetup.instance) {
      TensorflowSetup.instance = new TensorflowSetup();
    }
    return TensorflowSetup.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await this.cleanup();

      // TensorFlow.js başlatma
      await tf.ready();
      
      // CPU backend'i zorla
      await tf.setBackend('cpu');
      
      if (tf.getBackend() !== 'cpu') {
        throw new TrainingError('CPU backend başlatılamadı');
      }

      // Bellek yönetimi
      tf.engine().startScope();
      tf.tidy(() => {
        const testTensor = tf.tensor2d([[1, 2], [3, 4]]);
        testTensor.dispose();
      });

      // Çevre yapılandırması
      tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0);
      tf.env().set('WEBGL_CPU_FORWARD', true);

      // Bellek izleme başlat
      this.startMemoryMonitoring();

      this.isInitialized = true;
      logger.info('TensorFlow.js CPU backend ile başarıyla başlatıldı');
    } catch (error) {
      this.isInitialized = false;
      logger.error('TensorFlow başlatma hatası:', error);
      throw new TrainingError('TensorFlow.js başlatılamadı', error);
    }
  }

  private startMemoryMonitoring(): void {
    if (this.memoryWatcherId) {
      clearInterval(this.memoryWatcherId);
    }

    this.memoryWatcherId = window.setInterval(() => {
      tf.tidy(() => {
        try {
          const memoryInfo = tf.memory();
          if (memoryInfo.numTensors > 1000) {
            logger.warn('Yüksek tensor sayısı tespit edildi:', memoryInfo);
            tf.engine().endScope();
            tf.engine().startScope();
          }
        } catch (error) {
          logger.error('Bellek izleme hatası:', error);
        }
      });
    }, 5000);
  }

  async cleanup(): Promise<void> {
    try {
      if (this.memoryWatcherId) {
        clearInterval(this.memoryWatcherId);
        this.memoryWatcherId = null;
      }

      tf.disposeVariables();
      tf.engine().endScope();
      tf.engine().startScope();

      this.isInitialized = false;
      logger.debug('TensorFlow belleği temizlendi');
    } catch (error) {
      logger.warn('TensorFlow temizleme hatası:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}