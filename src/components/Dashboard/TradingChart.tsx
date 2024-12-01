import React, { useEffect, useRef } from 'react';
import { LineChart } from 'lucide-react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData } from 'lightweight-charts';
import { useTradingStore } from '../../stores/tradingStore';
import { binanceService } from '../../services/binance';
import { RSITrendFilter } from '../../models/indicators/RSITrendFilter';

const TradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiMASeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const { currentPrice } = useTradingStore();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgb(17, 24, 39)' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(55, 65, 81, 0.5)' },
        horzLines: { color: 'rgba(55, 65, 81, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    rsiSeriesRef.current = chartRef.current.addLineSeries({
      color: '#60a5fa',
      lineWidth: 2,
      priceScaleId: 'right',
      priceFormat: {
        type: 'price',
        precision: 2,
      },
    });

    rsiMASeriesRef.current = chartRef.current.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      priceScaleId: 'right',
      priceFormat: {
        type: 'price',
        precision: 2,
      },
    });

    loadChartData();

    const unsubscribe = binanceService.onKlineData((data) => {
      if (data.e === 'kline' && candlestickSeriesRef.current) {
        const candle: CandlestickData = {
          time: data.k.t / 1000,
          open: parseFloat(data.k.o),
          high: parseFloat(data.k.h),
          low: parseFloat(data.k.l),
          close: parseFloat(data.k.c),
        };
        
        candlestickSeriesRef.current.update(candle);
        updateRSIIndicator([candle]);
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  const updateRSIIndicator = (candles: CandlestickData[]) => {
    if (!rsiSeriesRef.current || !rsiMASeriesRef.current) return;

    const prices = candles.map(c => c.close);
    const rsiData = RSITrendFilter.calculate(prices);

    const rsiLineData: LineData[] = rsiData.adjustedRSI.map((value, i) => ({
      time: candles[i].time,
      value,
    }));

    const rsiMALineData: LineData[] = rsiData.rsiMA.map((value, i) => ({
      time: candles[i].time,
      value,
    }));

    rsiSeriesRef.current.setData(rsiLineData);
    rsiMASeriesRef.current.setData(rsiMALineData);
  };

  const loadChartData = async () => {
    try {
      const historicalData = await binanceService.fetchHistoricalData(30); // 30 günlük veri
      if (candlestickSeriesRef.current) {
        const formattedData: CandlestickData[] = historicalData.map(candle => ({
          time: candle.time / 1000,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));
        
        candlestickSeriesRef.current.setData(formattedData);
        updateRSIIndicator(formattedData);
      }
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  };

  const handleTimeframeChange = async (days: number) => {
    try {
      const data = await binanceService.fetchHistoricalData(days);
      if (candlestickSeriesRef.current) {
        const formattedData: CandlestickData[] = data.map(candle => ({
          time: candle.time / 1000,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));
        
        candlestickSeriesRef.current.setData(formattedData);
        updateRSIIndicator(formattedData);
      }
    } catch (error) {
      console.error('Failed to update timeframe:', error);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-semibold">BCH/USD Live Chart</h3>
          {currentPrice > 0 && (
            <span className="text-gray-300 ml-2">${currentPrice.toFixed(2)}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleTimeframeChange(1)} 
            className="px-3 py-1 bg-gray-800 text-cyan-400 rounded hover:bg-gray-700"
          >
            1D
          </button>
          <button 
            onClick={() => handleTimeframeChange(7)} 
            className="px-3 py-1 bg-gray-800 text-cyan-400 rounded hover:bg-gray-700"
          >
            7D
          </button>
          <button 
            onClick={() => handleTimeframeChange(30)} 
            className="px-3 py-1 bg-cyan-900 text-cyan-300 rounded"
          >
            30D
          </button>
        </div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
          <span className="text-sm text-gray-300">RSI Trend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
          <span className="text-sm text-gray-300">RSI MA</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="h-[400px]" />
    </div>
  );
};

export default TradingChart;