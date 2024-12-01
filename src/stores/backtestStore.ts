import { create } from 'zustand';

interface BacktestMetrics {
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

interface BacktestState {
  metrics: BacktestMetrics;
  updateMetrics: (newMetrics: Partial<BacktestMetrics>) => void;
}

const initialMetrics: BacktestMetrics = {
  winRate: 0,
  profitFactor: 0,
  maxDrawdown: 0,
  sharpeRatio: 0
};

export const useBacktestStore = create<BacktestState>((set) => ({
  metrics: initialMetrics,
  updateMetrics: (newMetrics: Partial<BacktestMetrics>) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        ...Object.fromEntries(
          Object.entries(newMetrics).map(([key, value]) => [
            key,
            typeof value === 'number' ? Number(value) : 0
          ])
        )
      }
    }))
}));