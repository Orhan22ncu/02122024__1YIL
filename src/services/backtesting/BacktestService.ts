import { TrainingMetrics } from '../training/types';
import { useBacktestStore } from '../../stores/backtestStore';
import { logger } from '../../utils/logger';

export class BacktestService {
  static calculateMetrics(predictions: number[][], actualPrices: number[]): void {
    const store = useBacktestStore.getState();
    
    try {
      // Calculate win rate
      let wins = 0;
      let trades = 0;
      let totalProfit = 0;
      let totalLoss = 0;
      let maxDrawdown = 0;
      let currentDrawdown = 0;
      let returns: number[] = [];

      predictions.forEach((prediction, i) => {
        if (i < actualPrices.length - 1) {
          const [buy, sell] = prediction;
          const priceChange = (actualPrices[i + 1] - actualPrices[i]) / actualPrices[i];
          
          if (buy > 0.5 || sell > 0.5) {
            trades++;
            const isWin = (buy > sell && priceChange > 0) || (sell > buy && priceChange < 0);
            
            if (isWin) {
              wins++;
              totalProfit += Math.abs(priceChange);
            } else {
              totalLoss += Math.abs(priceChange);
              currentDrawdown += Math.abs(priceChange);
              maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
            }

            returns.push(priceChange);
          }
        }
      });

      const winRate = trades > 0 ? (wins / trades) * 100 : 0;
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;
      
      // Calculate Sharpe Ratio
      const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
      const stdDev = Math.sqrt(
        returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / Math.max(returns.length, 1)
      );
      const sharpeRatio = stdDev !== 0 ? avgReturn / stdDev : 0;

      store.updateMetrics({
        winRate,
        profitFactor,
        maxDrawdown: maxDrawdown * 100,
        sharpeRatio
      });
    } catch (error) {
      logger.error('Backtest metrics calculation failed:', error);
    }
  }

  static async updateMetricsFromTraining(metrics: TrainingMetrics): Promise<void> {
    try {
      const store = useBacktestStore.getState();
      
      store.updateMetrics({
        winRate: metrics.accuracy * 100,
        profitFactor: Number((1 / Math.max(metrics.loss, 0.01)).toFixed(2)),
        sharpeRatio: Number(metrics.validationScore.toFixed(2)),
        maxDrawdown: Number((metrics.loss * 100).toFixed(2))
      });
    } catch (error) {
      logger.error('Failed to update metrics from training:', error);
    }
  }
}