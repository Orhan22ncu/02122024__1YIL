import * as tf from '@tensorflow/tfjs';
import { ModelArchitecture } from './ai/ModelArchitecture';
import { DataPreprocessor } from '../services/training/DataPreprocessor';
import { TechnicalIndicators } from './indicators/TechnicalIndicators';
import { logger } from '../utils/logger';

export class AITrader {
  private model: tf.LayersModel;
  private initialPortfolioValue: number;

  constructor(initialPortfolioValue: number) {
    this.initialPortfolioValue = initialPortfolioValue;
    this.model = ModelArchitecture.createMainModel();
  }

  getModel(): tf.LayersModel {
    return this.model;
  }

  async train(
    marketData: any[],
    onProgress: (epoch: number, logs: any) => void
  ): Promise<void> {
    if (!marketData || marketData.length < 100) {
      throw new Error('Insufficient market data for training');
    }

    let features: tf.Tensor2D | null = null;
    let labels: tf.Tensor2D | null = null;

    try {
      logger.info('Starting model training');

      // Prepare training data inside tidy
      const preparedData = DataPreprocessor.prepareTrainingData(marketData);
      features = preparedData.features;
      labels = preparedData.labels;

      // Train model with early stopping
      await this.model.fit(features, labels, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            onProgress(epoch, logs);
            // Allow UI updates
            await tf.nextFrame();
          }
        }
      });

      logger.info('Model training completed successfully');
    } catch (error) {
      logger.error('Training failed:', error);
      throw error;
    } finally {
      // Cleanup tensors
      if (features) features.dispose();
      if (labels) labels.dispose();
    }
  }

  async predict(currentData: any): Promise<{
    signals: { buy: number; sell: number; hold: number };
    risk: { riskLevel: number; positionSize: number };
  }> {
    return tf.tidy(() => {
      try {
        const preparedData = DataPreprocessor.prepareTrainingData([currentData]);
        const prediction = this.model.predict(preparedData.features) as tf.Tensor;
        const [buy, sell, hold] = Array.from(prediction.dataSync());

        return {
          signals: { buy, sell, hold },
          risk: {
            riskLevel: currentData.volatility || 0,
            positionSize: this.calculatePositionSize(currentData.volatility || 0)
          }
        };
      } catch (error) {
        logger.error('Prediction failed:', error);
        return {
          signals: { buy: 0, sell: 0, hold: 1 },
          risk: { riskLevel: 0, positionSize: 0 }
        };
      }
    });
  }

  private calculatePositionSize(volatility: number): number {
    const baseSize = 0.1;
    const volatilityFactor = Math.max(0, 1 - volatility * 2);
    return baseSize * volatilityFactor;
  }
}