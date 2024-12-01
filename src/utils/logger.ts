import { create } from 'zustand';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  details?: any;
};

interface LoggerStore {
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  clear: () => void;
}

const useLoggerStore = create<LoggerStore>((set) => ({
  logs: [],
  addLog: (entry) => set((state) => ({ 
    logs: [...state.logs, entry] 
  })),
  clear: () => set({ logs: [] })
}));

class Logger {
  private logLevel: LogLevel = 'info';

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      details
    };
  }

  private log(level: LogLevel, message: string, details?: any) {
    if (this.shouldLog(level)) {
      const entry = this.formatMessage(level, message, details);
      useLoggerStore.getState().addLog(entry);
      
      // Also log to console for development
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, details || '');
    }
  }

  debug(message: string, details?: any) {
    this.log('debug', message, details);
  }

  info(message: string, details?: any) {
    this.log('info', message, details);
  }

  warn(message: string, details?: any) {
    this.log('warn', message, details);
  }

  error(message: string, details?: any) {
    this.log('error', message, details);
  }

  getStore() {
    return useLoggerStore;
  }
}

export const logger = new Logger();