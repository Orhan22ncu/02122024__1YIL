import React from 'react';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTradingStore } from '../../stores/tradingStore';

const AIInsights: React.FC = () => {
  const { predictions, currentPrice, volatility } = useTradingStore();
  
  const getSignalStrength = () => {
    const { signals } = predictions;
    const maxSignal = Math.max(signals.buy, signals.sell);
    return Math.round(maxSignal * 100);
  };

  const getMarketTrend = () => {
    const { signals } = predictions;
    if (signals.buy > signals.sell) return 'Bullish';
    if (signals.sell > signals.buy) return 'Bearish';
    return 'Neutral';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-cyan-400 font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Trading Insights
        </h3>
      </div>
      <div className="space-y-4">
        <InsightCard
          type="prediction"
          title={`${getMarketTrend()} Pattern Detected`}
          description={`AI models predict a potential ${Math.abs(predictions.signals.buy - predictions.signals.sell).toFixed(2)}% movement in the next 4 hours. Current price: $${currentPrice.toFixed(2)}`}
          confidence={getSignalStrength()}
        />
        <InsightCard
          type="alert"
          title="Volatility Warning"
          description={`Market volatility: ${(volatility * 100).toFixed(2)}%. ${volatility > 0.02 ? 'Consider adjusting stop-loss positions.' : 'Market conditions are stable.'}`}
          confidence={Math.round(volatility * 100)}
        />
        <InsightCard
          type="trend"
          title="Risk Analysis"
          description={`Current risk level: ${(predictions.risk.riskLevel * 100).toFixed(0)}%. Recommended position size: ${(predictions.risk.positionSize * 100).toFixed(0)}% of portfolio.`}
          confidence={Math.round(predictions.risk.riskLevel * 100)}
        />
      </div>
    </div>
  );
};

const InsightCard: React.FC<{
  type: 'prediction' | 'alert' | 'trend';
  title: string;
  description: string;
  confidence: number;
}> = ({ type, title, description, confidence }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'prediction':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getTypeIcon()}
          <div>
            <h4 className="text-white font-medium mb-1">{title}</h4>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
        <div className="bg-gray-900 px-2 py-1 rounded">
          <span className="text-xs text-cyan-400">{confidence}% confidence</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;