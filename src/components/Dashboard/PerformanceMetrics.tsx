import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import { useTradingStore } from '../../stores/tradingStore';

const PerformanceMetrics: React.FC = () => {
  const { portfolio } = useTradingStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Portfolio Value"
        value={`$${portfolio.value.toFixed(2)}`}
        change={((portfolio.value - 100) / 100 * 100).toFixed(2) + '%'}
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        trend={portfolio.value >= 100 ? 'up' : 'down'}
      />
      <MetricCard
        title="BCH Holdings"
        value={`${portfolio.bch.toFixed(8)} BCH`}
        change={`$${(portfolio.bch * portfolio.value).toFixed(2)}`}
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        trend="up"
      />
      <MetricCard
        title="USD Balance"
        value={`$${portfolio.usd.toFixed(2)}`}
        change={((portfolio.usd - 100) / 100 * 100).toFixed(2) + '%'}
        icon={<BarChart2 className="w-5 h-5 text-cyan-400" />}
        trend={portfolio.usd >= 100 ? 'up' : 'down'}
      />
      <MetricCard
        title="Active Trades"
        value="0"
        change="No active trades"
        icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
        trend="neutral"
      />
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}> = ({ title, value, change, icon, trend }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-400';
      case 'down':
        return 'text-rose-400';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-white mb-1">{value}</span>
        <span className={`text-sm ${getTrendColor()}`}>{change}</span>
      </div>
    </div>
  );
};

export default PerformanceMetrics;