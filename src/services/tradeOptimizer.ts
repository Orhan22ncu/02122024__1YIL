import { RiskManagement } from './riskManagement';

export class TradeOptimizer {
  static calculateAggressiveStopLoss(
    entryPrice: number,
    type: 'long' | 'short',
    volatility: number
  ): number {
    // Volatiliteye göre dinamik stop-loss mesafesi
    const stopDistance = Math.max(
      volatility * entryPrice * 0.5, // Minimum stop mesafesi
      entryPrice * 0.002 // 0.2% minimum stop-loss
    );

    return type === 'long' 
      ? entryPrice - stopDistance
      : entryPrice + stopDistance;
  }

  static calculateAggressiveTakeProfit(
    entryPrice: number,
    type: 'long' | 'short',
    volatility: number,
    riskLevel: number
  ): number[] {
    // Çoklu take-profit seviyeleri
    const baseTP = volatility * entryPrice * (1 + riskLevel);
    
    const tp1Distance = baseTP * 0.5; // İlk hedef
    const tp2Distance = baseTP * 1.0; // İkinci hedef
    const tp3Distance = baseTP * 2.0; // Üçüncü hedef

    if (type === 'long') {
      return [
        entryPrice + tp1Distance,
        entryPrice + tp2Distance,
        entryPrice + tp3Distance
      ];
    } else {
      return [
        entryPrice - tp1Distance,
        entryPrice - tp2Distance,
        entryPrice - tp3Distance
      ];
    }
  }

  static calculatePositionSizes(
    portfolioValue: number,
    riskLevel: number
  ): number[] {
    // Kademeli pozisyon büyüklükleri
    const baseSize = portfolioValue * riskLevel * 0.2; // Base position size
    
    return [
      baseSize * 0.5,  // İlk pozisyon
      baseSize * 0.3,  // İkinci pozisyon
      baseSize * 0.2   // Üçüncü pozisyon
    ];
  }

  static shouldScaleOut(
    currentPrice: number,
    entryPrice: number,
    type: 'long' | 'short',
    profitTargets: number[]
  ): number {
    // Hangi take-profit seviyesinde olduğumuzu kontrol et
    const profit = type === 'long' 
      ? (currentPrice - entryPrice) / entryPrice
      : (entryPrice - currentPrice) / entryPrice;

    for (let i = 0; i < profitTargets.length; i++) {
      const target = type === 'long'
        ? (profitTargets[i] - entryPrice) / entryPrice
        : (entryPrice - profitTargets[i]) / entryPrice;

      if (profit >= target) return i + 1;
    }

    return 0;
  }
}