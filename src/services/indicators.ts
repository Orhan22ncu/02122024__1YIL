import { SMA, RSI, MACD, BollingerBands, Stochastic } from 'technicalindicators';

export class IndicatorService {
  static calculateAll(prices: number[], volumes: number[]) {
    return {
      sma: this.calculateSMA(prices),
      ema: this.calculateEMA(prices),
      rsi: this.calculateRSI(prices),
      macd: this.calculateMACD(prices),
      bollingerBands: this.calculateBollingerBands(prices),
      stochastic: this.calculateStochastic(prices),
      volumeProfile: this.calculateVolumeProfile(prices, volumes),
      volatility: this.calculateVolatility(prices)
    };
  }

  private static calculateVolatility(prices: number[]): number {
    const returns = prices.slice(1).map((price, i) => 
      (price - prices[i]) / prices[i]
    );
    return Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
  }

  private static calculateSMA(prices: number[], period: number = 14) {
    return SMA.calculate({ period, values: prices });
  }

  private static calculateEMA(prices: number[], period: number = 14) {
    return SMA.calculate({ period, values: prices });
  }

  private static calculateRSI(prices: number[], period: number = 14) {
    return RSI.calculate({ period, values: prices });
  }

  private static calculateMACD(prices: number[]) {
    return MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices
    });
  }

  private static calculateBollingerBands(prices: number[], period: number = 20) {
    return BollingerBands.calculate({
      period,
      values: prices,
      stdDev: 2
    });
  }

  private static calculateStochastic(prices: number[]) {
    return Stochastic.calculate({
      high: prices,
      low: prices,
      close: prices,
      period: 14,
      signalPeriod: 3
    });
  }

  private static calculateVolumeProfile(prices: number[], volumes: number[]) {
    const vwap = volumes.reduce((acc, vol, i) => acc + vol * prices[i], 0) / 
                volumes.reduce((acc, vol) => acc + vol, 0);
    return { vwap };
  }
}