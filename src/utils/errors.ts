export class TrainingError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'TrainingError';
    
    // Preserve the original error stack if available
    if (originalError?.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }

  toString(): string {
    return this.originalError ? 
      `${this.message} (Caused by: ${this.originalError.message})` : 
      this.message;
  }
}