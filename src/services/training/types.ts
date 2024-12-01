export interface TrainingMetrics {
  accuracy: number;
  loss: number;
  validationScore: number;
}

export interface TrainingProgress {
  progress: number;
  log: string;
  metrics?: TrainingMetrics;
}

export interface TrainingState {
  isTraining: boolean;
  progress: number;
  logs: string[];
  error: string | null;
  metrics: TrainingMetrics & {
    previousAccuracy: number;
    previousLoss: number;
    previousValidationScore: number;
  };
}