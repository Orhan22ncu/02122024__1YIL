import * as tf from '@tensorflow/tfjs';
import { TrainingError } from './TrainingError';
import { logger } from '../../utils/logger';
import { TechnicalIndicators } from '../../models/indicators/TechnicalIndicators';
import { TrainingValidator } from './TrainingValidator';

export class DataPreprocessor {
  static prepareTrainingData(data: any[]) {
    return tf.tidy(() => {
      try {
        // Validate input data
        TrainingValidator.validateData(data);

        const window = 20;
        const features: number[][] = [];
        const labels: number[][] = [];

        // Calculate technical indicators
        const prices = data.map(d => d.close);
        const volumes = data.map(d => d.volume);
        const indicators = TechnicalIndicators.calculate(prices, volumes);

        // Create feature vectors and labels
        for (let i = window; i < data.length - 1; i++) {
          const feature = this.createFeatureVector(indicators, i);
          features.push(feature);

          const nextPrice = data[i + 1].close;
          const currentPrice = data[i].close;
          const priceChange = (nextPrice - currentPrice) / currentPrice;
          
          labels.push(this.createLabel(priceChange));
        }

        // Convert to tensors with explicit shapes
        const featureTensor = tf.tensor2d(features);
        const labelTensor = tf.tensor2d(labels);

        // Validate tensor shapes
        TrainingValidator.validateTensors(featureTensor, labelTensor);

        logger.debug('Training data prepared:', {
          featureShape: featureTensor.shape,
          labelShape: labelTensor.shape
        });

        return { features: featureTensor, labels: labelTensor };
      } catch (error) {
        logger.error('Failed to prepare training data:', error);
        throw TrainingError.handleError(error);
      }
    });
  }

  private static createFeatureVector(indicators: any, index: number): number[] {
    const feature = [
      indicators.sma[index] || 0,
      indicators.rsi[index] || 50,
      indicators.volatility || 0,
      indicators.macd[index]?.MACD || 0,
      indicators.macd[index]?.signal || 0,
      ...indicators.rsiTrendFilter.adjustedRSI
        .slice(Math.max(0, index - 15), index)
        .map((v: number) => v || 0)
    ];

    // Ensure exactly 20 features
    return feature
      .slice(0, 20)
      .concat(Array(Math.max(0, 20 - feature.length)).fill(0))
      .map(this.normalize);
  }

  private static normalize(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return Math.max(-1, Math.min(1, value));
  }

  private static createLabel(priceChange: number): number[] {
    const threshold = 0.001;
    return [
      Number(priceChange > threshold),
      Number(priceChange < -threshold),
      Number(Math.abs(priceChange) <= threshold)
    ];
  }
}