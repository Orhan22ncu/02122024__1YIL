import React from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTrainingStore } from '../../stores/trainingStore';

const TrainingMetrics: React.FC = () => {
  const { metrics } = useTrainingStore();

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-purple-400 mb-4">Training Metrics</h3>
      <div className="space-y-4">
        <MetricCard
          icon={<Brain className="w-5 h-5 text-purple-400" />}
          title="Model Accuracy"
          value={`${(metrics.accuracy * 100).toFixed(2)}%`}
          trend={metrics.accuracy > 0.8 ? 'up' : 'down'}
          previousValue={metrics.previousAccuracy}
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          title="Loss Rate"
          value={metrics.loss.toFixed(4)}
          trend={metrics.loss < metrics.previousLoss ? 'down' : 'up'}
          previousValue={metrics.previousLoss}
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          title="Validation Score"
          value={metrics.validationScore.toFixed(3)}
          trend={metrics.validationScore > 0.85 ? 'up' : 'down'}
          previousValue={metrics.previousValidationScore}
        />
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: 'up' | 'down';
  previousValue: number;
}> = ({ icon, title, value, trend, previousValue }) => {
  const change = previousValue ? 
    ((parseFloat(value) - previousValue) / previousValue * 100).toFixed(2) : 
    '0.00';

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h4 className="text-gray-400 text-sm">{title}</h4>
            <p className="text-white font-medium mt-1">{value}</p>
          </div>
        </div>
        <div className={`text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change}%
          {trend === 'up' ? '↑' : '↓'}
        </div>
      </div>
    </div>
  );
};

export default TrainingMetrics;