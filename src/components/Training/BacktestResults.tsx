import React from 'react';
import { History } from 'lucide-react';
import { useBacktestStore } from '../../stores/backtestStore';

const BacktestResults: React.FC = () => {
  const { metrics } = useBacktestStore();

  const formatMetric = (value: number): string => {
    return Number(value).toFixed(2);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-purple-400 mb-4">Backtest Results</h3>
      <div className="space-y-4">
        <ResultCard
          title="Win Rate"
          value={`${formatMetric(metrics.winRate)}%`}
          description="Success rate of trades"
          trend={metrics.winRate > 50 ? 'up' : 'down'}
        />
        <ResultCard
          title="Profit Factor"
          value={formatMetric(metrics.profitFactor)}
          description="Ratio of winning to losing trades"
          trend={metrics.profitFactor > 1 ? 'up' : 'down'}
        />
        <ResultCard
          title="Max Drawdown"
          value={`${formatMetric(metrics.maxDrawdown)}%`}
          description="Maximum portfolio value decline"
          trend={metrics.maxDrawdown < 20 ? 'up' : 'down'}
        />
        <ResultCard
          title="Sharpe Ratio"
          value={formatMetric(metrics.sharpeRatio)}
          description="Risk-adjusted return metric"
          trend={metrics.sharpeRatio > 1 ? 'up' : 'down'}
        />
      </div>
    </div>
  );
};

const ResultCard: React.FC<{
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down';
}> = ({ title, value, description, trend }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      <div className={`text-${trend === 'up' ? 'emerald' : 'rose'}-400 font-semibold`}>
        {value}
      </div>
    </div>
  </div>
);

export default BacktestResults;