import { binanceService } from './binance';

class TradingService {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_BINANCE_API_KEY;
    this.apiSecret = import.meta.env.VITE_BINANCE_API_SECRET;
  }

  private async generateSignature(queryString: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = encoder.encode(this.apiSecret);
    const message = encoder.encode(queryString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public async executeOrder(
    type: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): Promise<any> {
    try {
      const timestamp = Date.now();
      const queryString = `symbol=BCHUSDT&side=${type}&type=LIMIT&timeInForce=GTC&quantity=${quantity}&price=${price}&timestamp=${timestamp}`;
      const signature = await this.generateSignature(queryString);

      const response = await fetch(`https://api.binance.com/api/v3/order?${queryString}&signature=${signature}`, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Order execution failed: ${response.statusText}`);
      }

      const orderResult = await response.json();
      console.log(`${type} order executed:`, orderResult);
      
      return {
        orderId: orderResult.orderId,
        type,
        size: quantity,
        price,
        status: orderResult.status,
        timestamp: orderResult.transactTime
      };
    } catch (error) {
      console.error('Order execution error:', error);
      throw error;
    }
  }
}

export const tradingService = new TradingService();

export const executeOrder = (type: 'BUY' | 'SELL', quantity: number, price: number) => 
  tradingService.executeOrder(type, quantity, price);