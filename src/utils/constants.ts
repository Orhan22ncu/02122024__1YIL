export const API_CONFIG = {
  WS_ENDPOINT: 'wss://stream.binance.com:9443/ws',
  REST_ENDPOINT: 'https://api.binance.com/api/v3',
  BINANCE_API_KEY: import.meta.env.VITE_BINANCE_API_KEY,
  BINANCE_API_SECRET: import.meta.env.VITE_BINANCE_API_SECRET,
  INITIAL_PORTFOLIO_VALUE: Number(import.meta.env.VITE_INITIAL_PORTFOLIO_VALUE) || 100
};