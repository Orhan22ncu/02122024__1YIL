import React from 'react';
import { useTradingStore } from './stores/tradingStore';
import TradingDashboard from './components/Dashboard/TradingDashboard';
import TrainingDashboard from './components/Training/TrainingDashboard';

function App() {
  const { isTraining } = useTradingStore();
  return isTraining ? <TrainingDashboard /> : <TradingDashboard />;
}

export default App;