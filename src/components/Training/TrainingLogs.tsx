import React, { useEffect, useRef } from 'react';
import { Terminal, AlertTriangle } from 'lucide-react';
import { useTrainingStore } from '../../stores/trainingStore';
import { format } from 'date-fns';

const TrainingLogs: React.FC = () => {
  const { logs, error } = useTrainingStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const formatLogEntry = (log: string) => {
    if (log.includes('Error:')) {
      return (
        <div className="flex items-start gap-2 text-rose-400">
          <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
          <span>{log}</span>
        </div>
      );
    }
    return (
      <div className="text-gray-300">
        {log}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-purple-400">Training Logs</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span className="text-rose-400">{error}</span>
        </div>
      )}

      <div className="bg-gray-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Waiting for training to start...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-purple-400 whitespace-nowrap">
                [{format(new Date(), 'HH:mm:ss')}]
              </span>
              {formatLogEntry(log)}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default TrainingLogs;