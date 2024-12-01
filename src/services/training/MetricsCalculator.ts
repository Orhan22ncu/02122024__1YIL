import { TrainingMetrics } from './types';
import { logger } from '../../utils/logger';

export class MetricsCalculator {
  static calculateTrainingMetrics(logs: any): TrainingMetrics {
    try {
      return {
        accuracy: logs.accuracy || 0,
        loss: logs.loss || 0,
        validationScore: logs.val_accuracy || 0
      };
    } catch (error) {
      logger.error('Failed to calculate metrics:', error);
      return {
        accuracy: 0,
        loss: 0,
        validationScore: 0
      };
    }
  }

  static calculateProgress(
    currentEpoch: number,
    totalEpochs: number
  ): number {
    const baseProgress = 20;
    const trainingWeight = 70;
    return Math.min(
      baseProgress + (currentEpoch / totalEpochs) * trainingWeight,
      90
    );
  }
}