import * as tf from '@tensorflow/tfjs';
import { IndicatorService } from '../services/indicators';

export class AIModel {
  private model: tf.LayersModel;
  private riskModel: tf.LayersModel;

  constructor() {
    this.model = this.createMainModel();
    this.riskModel = this.createRiskModel();
  }

  private createMainModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input layer
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [20] // Combined technical indicators
    }));

    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.lstm({ units: 64, returnSequences: true }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));

    // Output layer
    model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax' // Buy, Sell, Hold probabilities
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private createRiskModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [10]
    }));

    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    
    model.add(tf.layers.dense({
      units: 2,
      activation: 'sigmoid' // Risk level and position size
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }

  async train(data: any[]) {
    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const indicators = IndicatorService.calculateAll(prices, volumes);

    // Prepare training data
    const xs = this.prepareFeatures(indicators);
    const ys = this.prepareLabels(prices);

    // Train main model
    await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    });

    // Train risk model
    const riskXs = this.prepareRiskFeatures(indicators);
    const riskYs = this.prepareRiskLabels(prices);
    
    await this.riskModel.fit(riskXs, riskYs, {
      epochs: 50,
      batchSize: 32
    });
  }

  private prepareFeatures(indicators: any): tf.Tensor2D {
    // Combine all indicators into feature vectors
    const features = [];
    // ... feature preparation logic
    return tf.tensor2d(features);
  }

  private prepareLabels(prices: number[]): tf.Tensor2D {
    // Create labels based on price movements
    const labels = [];
    // ... label preparation logic
    return tf.tensor2d(labels);
  }

  private prepareRiskFeatures(indicators: any): tf.Tensor2D {
    // Prepare features for risk assessment
    const features = [];
    // ... risk feature preparation logic
    return tf.tensor2d(features);
  }

  private prepareRiskLabels(prices: number[]): tf.Tensor2D {
    // Create labels for risk assessment
    const labels = [];
    // ... risk label preparation logic
    return tf.tensor2d(labels);
  }

  async predict(currentData: any) {
    const features = this.prepareFeatures(currentData);
    const prediction = await this.model.predict(features) as tf.Tensor;
    const riskPrediction = await this.riskModel.predict(features) as tf.Tensor;

    const [buy, sell, hold] = Array.from(await prediction.data());
    const [riskLevel, positionSize] = Array.from(await riskPrediction.data());

    return {
      signals: { buy, sell, hold },
      risk: { riskLevel, positionSize }
    };
  }
}