import { create } from 'zustand';
import { AITrader } from '../models/AITrader';
import { RiskManagement } from '../services/riskManagement';
import { fetchKlines } from '../services/binance';
import { executeOrder } from '../services/trading';
import { API_CONFIG } from '../utils/constants';
import { Portfolio, Trade, Predictions } from '../utils/types';
import * as tf from '@tensorflow/tfjs';
import { logger } from '../utils/logger';

interface TradingState {
  model: tf.LayersModel | null;
  portfolio: Portfolio;
  trades: Trade[];
  currentPrice: number;
  predictions: Predictions;
  isTraining: boolean;
  volatility: number;
  setModel: (model: tf.LayersModel) => void;
  setIsTraining: (isTraining: boolean) => void;
  initializeTrading: () => Promise<void>;
  updatePortfolio: (newValue: number) => void;
  executeTrade: (type: 'BUY' | 'SELL', amount: number) => Promise<void>;
}

const initialState = {
  model: null,
  portfolio: {
    value: API_CONFIG.INITIAL_PORTFOLIO_VALUE,
    bch: 0,
    usd: API_CONFIG.INITIAL_PORTFOLIO_VALUE
  },
  trades: [],
  currentPrice: 0,
  predictions: {
    signals: { buy: 0, sell: 0, hold: 0 },
    risk: { riskLevel: 0, positionSize: 0 }
  },
  isTraining: true,
  volatility: 0
};

export const useTradingStore = create<TradingState>((set, get) => ({
  ...initialState,

  setModel: (model: tf.LayersModel) => set({ model }),
  
  setIsTraining: (isTraining: boolean) => set({ isTraining }),

  initializeTrading: async () => {
    const { model } = get();
    if (!model) {
      logger.error('Model bulunamadı');
      return;
    }

    try {
      // Trading döngüsünü başlat
      const updateInterval = setInterval(async () => {
        const currentData = await fetchKlines(1);
        const lastCandle = currentData[currentData.length - 1];
        
        // Model tahminlerini al
        const inputFeatures = tf.tidy(() => {
          // Veriyi model için uygun formata dönüştür
          const features = [
            lastCandle.close,
            lastCandle.volume,
            lastCandle.high,
            lastCandle.low,
            lastCandle.trades,
            // Diğer özellikler için 0 değerleri ekle
            ...Array(15).fill(0)
          ];
          
          // [1, 20] şeklinde reshape et (batch_size=1, features=20)
          return tf.tensor2d([features], [1, 20]);
        });

        const prediction = model.predict(inputFeatures) as tf.Tensor;
        const [buy, sell, hold] = Array.from(await prediction.data());
        
        set(state => ({
          currentPrice: lastCandle.close,
          predictions: {
            signals: { buy, sell, hold },
            risk: {
              riskLevel: lastCandle.volatility || 0,
              positionSize: state.portfolio.value * 0.1
            }
          },
          volatility: lastCandle.volatility || 0
        }));

        // Tensorları temizle
        inputFeatures.dispose();
        prediction.dispose();
      }, 30000);

      return () => clearInterval(updateInterval);
    } catch (error) {
      logger.error('Trading başlatma hatası:', error);
    }
  },

  updatePortfolio: (newValue: number) => {
    set(state => ({
      portfolio: {
        ...state.portfolio,
        value: newValue
      }
    }));
  },

  executeTrade: async (type: 'BUY' | 'SELL', amount: number) => {
    const { currentPrice, portfolio } = get();
    
    try {
      const order = await executeOrder(type, amount, currentPrice);
      const orderValue = amount * currentPrice;
      
      set(state => ({
        trades: [...state.trades, order],
        portfolio: {
          ...portfolio,
          bch: type === 'BUY' ? 
            portfolio.bch + amount : 
            portfolio.bch - amount,
          usd: type === 'BUY' ? 
            portfolio.usd - orderValue : 
            portfolio.usd + orderValue
        }
      }));
      
      logger.info(`${type} işlemi gerçekleştirildi:`, order);
    } catch (error) {
      logger.error('İşlem hatası:', error);
      throw error;
    }
  }
}));