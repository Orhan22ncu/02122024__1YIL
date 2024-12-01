export interface Trade {
  type: 'BUY' | 'SELL';
  price: number;
  size: number;
  timestamp: string;
}

export interface Portfolio {
  value: number;
  bch: number;
  usd: number;
}

export interface Predictions {
  signals: {
    buy: number;
    sell: number;
    hold: number;
  };
  risk: {
    riskLevel: number;
    positionSize: number;
  };
}