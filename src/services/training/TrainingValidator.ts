import * as tf from '@tensorflow/tfjs';
import { TrainingError } from './TrainingError';
import { logger } from '../../utils/logger';

export class TrainingValidator {
  static validateTensors(features: tf.Tensor2D, labels: tf.Tensor2D): void {
    try {
      if (!features || !labels) {
        throw new TrainingError('Invalid tensors: features or labels are null');
      }

      const [numSamples, numFeatures] = features.shape;
      const [numLabels, labelDim] = labels.shape;

      if (numSamples !== numLabels) {
        throw new TrainingError(
          `Tensor shape mismatch: features ${features.shape}, labels ${labels.shape}`,
          { featuresShape: features.shape, labelsShape: labels.shape }
        );
      }

      if (numFeatures !== 20) {
        throw new TrainingError(
          'Feature dimension must be 20',
          { shape: features.shape }
        );
      }

      if (labelDim !== 3) {
        throw new TrainingError(
          'Label dimension must be 3',
          { shape: labels.shape }
        );
      }

      logger.debug('Tensor validation passed', {
        samples: numSamples,
        features: numFeatures,
        labels: labelDim
      });
    } catch (error) {
      throw TrainingError.handleError(error);
    }
  }

  static validateData(data: any[]): void {
    try {
      if (!Array.isArray(data)) {
        throw new TrainingError('Invalid data format: not an array');
      }

      if (data.length < 100) {
        throw new TrainingError(
          'Insufficient data points (minimum 100 required)',
          { length: data.length }
        );
      }

      const requiredFields = ['close', 'volume', 'time'];
      const sample = data[0];

      requiredFields.forEach(field => {
        if (!(field in sample)) {
          throw new TrainingError(
            `Missing required field: ${field}`,
            { sample }
          );
        }
      });

      // Validate data types
      data.forEach((point, index) => {
        if (typeof point.close !== 'number' || isNaN(point.close)) {
          throw new TrainingError(`Invalid close price at index ${index}`);
        }
        if (typeof point.volume !== 'number' || isNaN(point.volume)) {
          throw new TrainingError(`Invalid volume at index ${index}`);
        }
      });

      logger.debug('Data validation passed', { dataPoints: data.length });
    } catch (error) {
      throw TrainingError.handleError(error);
    }
  }
}