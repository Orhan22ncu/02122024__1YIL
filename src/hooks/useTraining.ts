import { useCallback } from 'react';
import { useTrainingStore } from '../stores/trainingStore';
import { useBacktestStore } from '../stores/backtestStore';
import { logger } from '../utils/logger';
import { TrainingOrchestrator } from '../services/training/TrainingOrchestrator';

export function useTraining() {
  const { startTraining, updateProgress, updateMetrics } = useTrainingStore();
  const { updateMetrics: updateBacktestMetrics } = useBacktestStore();
  const orchestrator = TrainingOrchestrator.getInstance();

  const handleTrainingProgress = useCallback(({ progress, log, metrics }) => {
    if (metrics) {
      updateMetrics(metrics);
      updateBacktestMetrics({
        winRate: metrics.accuracy * 100,
        profitFactor: 1 / Math.max(metrics.loss, 0.01),
        sharpeRatio: metrics.validationScore,
        maxDrawdown: Math.min(metrics.loss * 100, 100)
      });
    }
    updateProgress(progress, log);
    logger.info(log, { progress, metrics });
  }, [updateProgress, updateMetrics, updateBacktestMetrics]);

  const initialize = useCallback(async () => {
    if (orchestrator.isTrainingInProgress()) {
      return;
    }

    try {
      await startTraining();
      await orchestrator.startTraining(handleTrainingProgress);
    } catch (error) {
      logger.error('Eğitim başlatma hatası:', error);
    }
  }, [startTraining, handleTrainingProgress, orchestrator]);

  const abort = useCallback(() => {
    orchestrator.abortTraining();
  }, [orchestrator]);

  return {
    initialize,
    abort
  };
}