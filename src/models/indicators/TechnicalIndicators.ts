import { SMA, RSI, MACD } from 'technicalindicators';
import { RSITrendFilter } from './RSITrendFilter';

export interface IndicatorValues {
  sma: number[];
  rsi: number[];
  macd: {
    MACD: number;
    signal: number;
    histogram: number;
  }[];
  volatility: number;
  momentum: number[];
  volumeProfile: number[];
  rsiTrendFilter: {
    adjustedRSI: number[];
    rsiMA: number[];
    rsiTrendEMA: number[];
    trend: number[];
  };
}

export class TechnicalIndicators {
  static calculate(prices: number[], volumes: number[]): IndicatorValues {
    const sma = SMA.calculate({ period: 14, values: prices });
    const rsi = RSI.calculate({ period: 14, values: prices });
    const macd = MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices
    });

    // RSI Trend Filter
    const rsiTrendFilter = RSITrendFilter.calculate(prices);

    // Volatilite hesaplama
    const returns = prices.slice(1).map((price, i) => 
      (price - prices[i]) / prices[i]
    );
    const volatility = Math.sqrt(
      returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length
    );

    // Momentum hesaplama
    const momentum = prices.slice(10).map((price, i) => 
      (price - prices[i]) / prices[i]
    );

    // Hacim profili
    const vwap = volumes.reduce((sum, vol, i) => sum + vol * prices[i], 0) / 
                volumes.reduce((sum, vol) => sum + vol, 0);
    const volumeProfile = [vwap];

    return { 
      sma, 
      rsi, 
      macd,
      volatility,
      momentum,
      volumeProfile,
      rsiTrendFilter
    };
  }
}