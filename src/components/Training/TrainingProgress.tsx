import React from 'react';
import { useTrainingStore } from '../../stores/trainingStore';
import { AlertTriangle } from 'lucide-react';

const TrainingProgress: React.FC = () => {
  const { progress, isTraining, error } = useTrainingStore();

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <h3 className="text-lg font-semibold text-purple-400 mb-4">Training Progress</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
        <div 
          className="bg-gradient-to-r from-purple-400 to-cyan-400 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-400">
        <span>{progress.toFixed(2)}% Complete</span>
        {isTraining && <span>Training in progress...</span>}
      </div>
    </div>
  );
};

export default TrainingProgress;