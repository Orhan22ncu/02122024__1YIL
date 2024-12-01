import { logger } from '../../utils/logger';

export class TrainingError extends Error {
  constructor(
    message: string,
    public readonly details?: any,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'TrainingError';

    // Log detailed error information
    logger.error('Training error occurred:', {
      message,
      details,
      code,
      stack: this.stack
    });
  }

  static handleError(error: unknown): TrainingError {
    if (error instanceof TrainingError) {
      return error;
    }

    if (error instanceof Error) {
      return new TrainingError(error.message, error);
    }

    return new TrainingError('An unexpected error occurred during training');
  }
}