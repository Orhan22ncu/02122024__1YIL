export class RiskManagement {
  private maxRiskPerTrade: number;
  private portfolioValue: number;

  constructor(portfolioValue: number, maxRiskPercentage: number = 2) {
    this.portfolioValue = portfolioValue;
    this.maxRiskPerTrade = (maxRiskPercentage / 100) * portfolioValue;
  }

  calculatePositionSize(
    currentPrice: number,
    stopLoss: number,
    riskLevel: number
  ): number {
    const riskAmount = this.maxRiskPerTrade * riskLevel;
    const stopLossDistance = Math.abs(currentPrice - stopLoss);
    const positionSize = riskAmount / stopLossDistance;
    
    // Maksimum pozisyon büyüklüğünü artır
    return Math.min(
      positionSize * 20, // 20x kaldıraç
      this.portfolioValue * 0.5 // Maksimum pozisyon büyüklüğü %50'ye çıkarıldı
    );
  }

  calculateStopLoss(
    entryPrice: number,
    type: 'long' | 'short',
    volatility: number
  ): number {
    // Daha yakın stop-loss seviyeleri
    const atr = volatility * entryPrice;
    const stopDistance = atr * 1.2; // 1.2x ATR
    
    return type === 'long' 
      ? entryPrice - stopDistance
      : entryPrice + stopDistance;
  }

  adjustForVolatility(
    baseSize: number,
    volatility: number
  ): number {
    // Volatiliteye göre pozisyon büyüklüğünü ayarla
    const volatilityFactor = 1 - Math.min(volatility * 1.5, 0.4);
    return baseSize * volatilityFactor;
  }

  calculateTrailingStop(
    currentPrice: number,
    entryPrice: number,
    type: 'long' | 'short',
    profitPercent: number
  ): number {
    const trailingDistance = Math.abs(currentPrice - entryPrice) * 0.3;
    
    if (type === 'long') {
      return currentPrice - trailingDistance;
    } else {
      return currentPrice + trailingDistance;
    }
  }
}