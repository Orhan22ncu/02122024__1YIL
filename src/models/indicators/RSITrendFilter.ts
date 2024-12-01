import { RSI } from 'technicalindicators';

export class RSITrendFilter {
  static calculate(prices: number[], options = {
    rsiLength: 14,
    rsiMAPeriod: 100,
    emaLength: 20
  }) {
    const { rsiLength, rsiMAPeriod, emaLength } = options;
    
    // Calculate original RSI
    const originalRSI = RSI.calculate({
      period: rsiLength,
      values: prices
    });

    // Calculate adjusted RSI (RSI-based price)
    const atr = this.calculateATR(prices, 100);
    const adjustedRSI = prices.map((price, i) => {
      if (i < originalRSI.length) return price;
      return price + (atr[i] * originalRSI[i - originalRSI.length] / 100);
    });

    // Calculate RSI MA
    const rsiMA = this.calculateEMA(adjustedRSI, rsiMAPeriod);
    
    // Calculate final RSI EMA
    const rsiTrendEMA = this.calculateEMA(adjustedRSI, emaLength);

    return {
      adjustedRSI,
      rsiMA,
      rsiTrendEMA,
      trend: adjustedRSI.map((rsi, i) => {
        if (i < rsiMA.length) return 0;
        return rsi > rsiMA[i - rsiMA.length] ? 1 : -1;
      })
    };
  }

  private static calculateATR(prices: number[], period: number): number[] {
    const tr = prices.map((price, i) => {
      if (i === 0) return 0;
      const high = Math.max(price, prices[i - 1]);
      const low = Math.min(price, prices[i - 1]);
      return high - low;
    });

    return this.calculateEMA(tr, period);
  }

  private static calculateEMA(values: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema = [];
    let prevEMA = values[0];

    for (const value of values) {
      const currentEMA = value * k + prevEMA * (1 - k);
      ema.push(currentEMA);
      prevEMA = currentEMA;
    }

    return ema;
  }
}