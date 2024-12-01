import { format, subDays } from 'date-fns';

const WS_ENDPOINT = 'wss://stream.binance.com:9443/ws';
const REST_ENDPOINT = 'https://api.binance.com/api/v3';
const BINANCE_API_KEY = import.meta.env.VITE_BINANCE_API_KEY;
const BINANCE_API_SECRET = import.meta.env.VITE_BINANCE_API_SECRET;

class BinanceService {
  private ws: WebSocket | null = null;
  private subscribers: ((data: any) => void)[] = [];
  private dataCache: Map<string, any[]> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.ws = new WebSocket(WS_ENDPOINT);

    this.ws.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
      this.subscribe('bchusdt@kline_1m');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.subscribers.forEach(callback => callback(data));
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket bağlantısı kapandı');
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  private subscribe(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: [channel],
        id: Date.now()
      }));
    }
  }

  public onKlineData(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private async fetchKlineSegment(startTime: number, endTime: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${REST_ENDPOINT}/klines?symbol=BCHUSDT&interval=1m&limit=1000&startTime=${startTime}&endTime=${endTime}`
      );
      
      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Veri çekme hatası:', error);
      return [];
    }
  }

  public async fetchHistoricalData(days: number = 365): Promise<any[]> {
    const cacheKey = `historical_${days}`;
    const now = Date.now();

    if (
      this.dataCache.has(cacheKey) &&
      now - this.lastFetchTime < this.CACHE_DURATION
    ) {
      console.log('Önbellekten veri alınıyor');
      return this.dataCache.get(cacheKey)!;
    }

    const endTime = now;
    const startTime = subDays(now, days).getTime();
    let allKlines: any[] = [];

    console.log(`${format(startTime, 'dd/MM/yyyy HH:mm')} - ${format(endTime, 'dd/MM/yyyy HH:mm')} arası veriler çekiliyor`);

    let currentStartTime = startTime;
    while (currentStartTime < endTime) {
      const segmentEndTime = Math.min(currentStartTime + (1000 * 60 * 1000), endTime);
      const klines = await this.fetchKlineSegment(currentStartTime, segmentEndTime);
      
      if (klines.length === 0) break;

      allKlines = [...allKlines, ...klines];
      currentStartTime = klines[klines.length - 1][0] + 1;

      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // İlerleme durumunu göster
      const progress = ((currentStartTime - startTime) / (endTime - startTime) * 100).toFixed(2);
      console.log(`Veri çekme ilerlemesi: %${progress}`);
    }

    const processedData = allKlines.map(kline => ({
      time: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      trades: parseInt(kline[8]),
      buyVolume: parseFloat(kline[9]),
      quoteVolume: parseFloat(kline[7])
    }));

    this.dataCache.set(cacheKey, processedData);
    this.lastFetchTime = now;

    console.log(`Toplam ${processedData.length} veri noktası çekildi`);
    return processedData;
  }

  public clearCache() {
    this.dataCache.clear();
    this.lastFetchTime = 0;
  }
}

export const binanceService = new BinanceService();

export const fetchKlines = (days: number = 365) => 
  binanceService.fetchHistoricalData(days);