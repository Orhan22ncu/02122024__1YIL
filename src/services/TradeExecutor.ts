import { RiskManagement } from './riskManagement';
import { TradeOptimizer } from './tradeOptimizer';

export class TradeExecutor {
  private riskManager: RiskManagement;

  constructor(initialPortfolio: number) {
    this.riskManager = new RiskManagement(initialPortfolio);
  }

  async executeTrade(prediction: any, currentPrice: number, portfolio: any) {
    const { signals, risk } = prediction;
    
    const action = this.determineAction(signals);
    if (action === 'HOLD') return null;

    const type = action === 'BUY' ? 'long' : 'short';
    
    // Agresif stop-loss ve take-profit seviyeleri
    const stopLoss = TradeOptimizer.calculateAggressiveStopLoss(
      currentPrice,
      type,
      risk.volatility
    );

    const takeProfits = TradeOptimizer.calculateAggressiveTakeProfit(
      currentPrice,
      type,
      risk.volatility,
      risk.riskLevel
    );

    const positionSizes = TradeOptimizer.calculatePositionSizes(
      portfolio.value,
      risk.riskLevel
    );

    try {
      const trades = positionSizes.map((size, index) => ({
        type: action,
        price: currentPrice,
        size: size * 20, // 20x kaldıraç
        stopLoss,
        takeProfit: takeProfits[index],
        timestamp: new Date().toISOString()
      }));

      // Update portfolio
      this.updatePortfolio(trades, portfolio);

      return trades;
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  private determineAction(signals: any) {
    const { buy, sell } = signals;
    const threshold = 0.6; // Daha düşük eşik değeri

    if (buy > threshold) return 'BUY';
    if (sell > threshold) return 'SELL';
    return 'HOLD';
  }

  private updatePortfolio(trades: any[], portfolio: any) {
    trades.forEach(trade => {
      const value = trade.price * trade.size;
      
      if (trade.type === 'BUY') {
        portfolio.bch += trade.size;
        portfolio.usd -= value;
      } else {
        portfolio.bch -= trade.size;
        portfolio.usd += value;
      }
    });

    portfolio.value = portfolio.usd + (portfolio.bch * trades[0].price);
  }
}