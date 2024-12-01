import React, { useEffect } from 'react';
import { Brain, Activity } from 'lucide-react';
import { useTrainingStore } from '../../stores/trainingStore';
import { useTraining } from '../../hooks/useTraining';
import TrainingMetrics from './TrainingMetrics';
import BacktestResults from './BacktestResults';
import TrainingLogs from './TrainingLogs';
import TrainingProgress from './TrainingProgress';

const TrainingDashboard: React.FC = () => {
  const { isTraining, progress } = useTrainingStore(state => ({
    isTraining: state.isTraining,
    progress: state.progress
  }));
  
  const { initialize } = useTraining();

  useEffect(() => {
    initialize();
  }, []); // Sadece bir kez çalıştır

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
                AI Training Dashboard
              </span>
            </div>
            {isTraining && (
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-purple-400">Training in Progress: {progress.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <TrainingProgress />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrainingMetrics />
            <BacktestResults />
          </div>

          <TrainingLogs />
        </div>
      </main>
    </div>
  );
};

export default TrainingDashboard;