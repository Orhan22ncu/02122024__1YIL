import { TrainingError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export class DataValidator {
  static validateHistoricalData(data: any[]): void {
    try {
      if (!Array.isArray(data)) {
        throw new TrainingError('Invalid historical data format: not an array');
      }

      if (data.length < 100) {
        throw new TrainingError('Insufficient historical data points (minimum 100 required)');
      }

      const requiredFields = ['close', 'volume', 'time'];
      const missingFields = requiredFields.filter(field => !data[0]?.[field]);

      if (missingFields.length > 0) {
        throw new TrainingError(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data types
      data.forEach((point, index) => {
        if (typeof point.close !== 'number' || isNaN(point.close)) {
          throw new TrainingError(`Invalid close price at index ${index}`);
        }
        if (typeof point.volume !== 'number' || isNaN(point.volume)) {
          throw new TrainingError(`Invalid volume at index ${index}`);
        }
      });

      logger.debug('Historical data validation passed');
    } catch (error) {
      logger.error('Data validation failed:', error);
      throw new TrainingError('Data validation failed', error);
    }
  }
}