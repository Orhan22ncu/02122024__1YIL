import React from 'react';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTradingStore } from '../../stores/tradingStore';
import { format } from 'date-fns';

const TradeHistory: React.FC = () => {
  const { trades } = useTradingStore();

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-cyan-400 font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Trades
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="text-left pb-4">Pair</th>
              <th className="text-left pb-4">Type</th>
              <th className="text-left pb-4">Amount</th>
              <th className="text-left pb-4">Price</th>
              <th className="text-left pb-4">Time</th>
              <th className="text-right pb-4">Total Value</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No trades executed yet
                </td>
              </tr>
            ) : (
              trades.map((trade, index) => (
                <tr key={index} className="border-t border-gray-800">
                  <td className="py-4 text-white">BCH/USD</td>
                  <td className="py-4">
                    <span className={`flex items-center ${trade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.type === 'BUY' ? 
                        <ArrowUpRight className="w-4 h-4 mr-1" /> : 
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      }
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">{trade.size.toFixed(8)} BCH</td>
                  <td className="py-4 text-gray-300">${trade.price.toFixed(2)}</td>
                  <td className="py-4 text-gray-400">
                    {format(new Date(trade.timestamp), 'HH:mm:ss')}
                  </td>
                  <td className="py-4 text-right text-gray-300">
                    ${(trade.size * trade.price).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;