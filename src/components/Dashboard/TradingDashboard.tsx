import React from 'react';
import { Bot } from 'lucide-react';
import TradingChart from './TradingChart';
import PerformanceMetrics from './PerformanceMetrics';
import TradeHistory from './TradeHistory';
import AIInsights from './AIInsights';

const TradingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-cyan-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
                CryptoBot AI
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <PerformanceMetrics />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TradingChart />
            </div>
            <div>
              <AIInsights />
            </div>
          </div>

          <TradeHistory />
        </div>
      </main>
    </div>
  );
};

export default TradingDashboard;