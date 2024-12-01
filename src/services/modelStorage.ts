import * as tf from '@tensorflow/tfjs';

export class ModelStorage {
  private static readonly MODEL_KEY = 'trading_model';
  private static readonly TRAINING_STATE_KEY = 'training_state';
  private static readonly LAST_TRAINING_DATE_KEY = 'last_training_date';

  static async saveModel(model: tf.LayersModel): Promise<void> {
    try {
      await model.save(`localstorage://${this.MODEL_KEY}`);
      localStorage.setItem(this.LAST_TRAINING_DATE_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Model kaydetme hatası:', error);
      throw error;
    }
  }

  static async loadModel(model: tf.LayersModel): Promise<boolean> {
    try {
      const models = await tf.io.listModels();
      const modelPath = `localstorage://${this.MODEL_KEY}`;
      
      if (models[modelPath]) {
        const loadedModel = await tf.loadLayersModel(modelPath);
        model.setWeights(loadedModel.getWeights());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Model yükleme hatası:', error);
      return false;
    }
  }

  static async saveTrainingState(state: any): Promise<void> {
    try {
      localStorage.setItem(this.TRAINING_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Eğitim durumu kaydetme hatası:', error);
      throw error;
    }
  }

  static getTrainingState(): any {
    try {
      const state = localStorage.getItem(this.TRAINING_STATE_KEY);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Eğitim durumu yükleme hatası:', error);
      return null;
    }
  }

  static getLastTrainingDate(): Date | null {
    const dateStr = localStorage.getItem(this.LAST_TRAINING_DATE_KEY);
    return dateStr ? new Date(dateStr) : null;
  }

  static needsTraining(): boolean {
    const lastTraining = this.getLastTrainingDate();
    if (!lastTraining) return true;

    const hoursSinceLastTraining = 
      (new Date().getTime() - lastTraining.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastTraining >= 24; // 24 saat geçtiyse tekrar eğit
  }

  static clearStorage(): void {
    localStorage.removeItem(this.MODEL_KEY);
    localStorage.removeItem(this.TRAINING_STATE_KEY);
    localStorage.removeItem(this.LAST_TRAINING_DATE_KEY);
  }
}