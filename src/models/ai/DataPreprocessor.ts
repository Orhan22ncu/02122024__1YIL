import * as tf from '@tensorflow/tfjs';
import { logger } from '../../utils/logger';

export class DataPreprocessor {
  static prepareFeatures(indicators: any): tf.Tensor2D {
    try {
      const features = [];
      const requiredLength = 20; // Reduced feature length for better stability

      // Extract and normalize features
      for (let i = requiredLength; i < indicators.sma.length; i++) {
        const feature = [
          ...this.normalizeArray(indicators.sma.slice(i - 10, i)),         // 10 features
          ...this.normalizeArray(indicators.rsi.slice(i - 5, i)),          // 5 features
          indicators.volatility,                                           // 1 feature
          ...this.normalizeArray(indicators.momentum.slice(i - 4, i))      // 4 features
        ];

        // Validate feature length
        if (feature.length === requiredLength) {
          features.push(feature);
        }
      }

      if (features.length === 0) {
        throw new Error('No valid features could be generated');
      }

      const tensorFeatures = tf.tensor2d(features);
      logger.debug('Feature tensor shape:', tensorFeatures.shape);
      return tensorFeatures;
    } catch (error) {
      logger.error('Feature preparation failed:', error);
      throw error;
    }
  }

  static prepareLabels(prices: number[]): tf.Tensor2D {
    try {
      const labels = [];
      const window = 20; // Match feature window size

      for (let i = window; i < prices.length; i++) {
        const futurePriceChange = 
          (prices[i] - prices[i - 1]) / prices[i - 1];

        // One-hot encoded labels
        const label = [
          futurePriceChange > 0.001 ? 1 : 0,  // Buy
          futurePriceChange < -0.001 ? 1 : 0, // Sell
          Math.abs(futurePriceChange) <= 0.001 ? 1 : 0  // Hold
        ];

        labels.push(label);
      }

      if (labels.length === 0) {
        throw new Error('No valid labels could be generated');
      }

      const tensorLabels = tf.tensor2d(labels);
      logger.debug('Label tensor shape:', tensorLabels.shape);
      return tensorLabels;
    } catch (error) {
      logger.error('Label preparation failed:', error);
      throw error;
    }
  }

  private static normalizeArray(arr: number[]): number[] {
    if (!arr || arr.length === 0) {
      throw new Error('Cannot normalize empty array');
    }

    const max = Math.max(...arr);
    const min = Math.min(...arr);
    const range = max - min;

    if (range === 0) {
      return arr.map(() => 0.5); // Return mid-range value for constant arrays
    }

    return arr.map(val => (val - min) / range);
  }

  static validateTensors(features: tf.Tensor2D, labels: tf.Tensor2D): void {
    if (features.shape[0] !== labels.shape[0]) {
      throw new Error(`Tensor shape mismatch: features ${features.shape}, labels ${labels.shape}`);
    }
  }
}