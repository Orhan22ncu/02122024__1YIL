import * as tf from '@tensorflow/tfjs';
import { EvolutionaryModel } from './EvolutionaryModel';
import { MainModel } from './MainModel';
import { RiskModel } from './RiskModel';

export class EnsembleModel {
  private models: {
    evolutionary: EvolutionaryModel;
    main: MainModel;
    risk: RiskModel;
  };
  
  private weights: {
    evolutionary: number;
    main: number;
    risk: number;
  };

  constructor() {
    this.models = {
      evolutionary: new EvolutionaryModel(),
      main: new MainModel(),
      risk: new RiskModel()
    };

    this.weights = {
      evolutionary: 0.4,
      main: 0.35,
      risk: 0.25
    };
  }

  getMainModel(): tf.LayersModel {
    return this.models.main.getModel();
  }

  async predict(input: tf.Tensor2D) {
    const reshaped = input.reshape([input.shape[0], input.shape[1]]);
    
    const predictions = await Promise.all([
      this.models.evolutionary.predict(reshaped),
      this.models.main.predict(reshaped),
      this.models.risk.predict(reshaped)
    ]);

    const weightedPredictions = predictions.map((pred, idx) => {
      const weight = Object.values(this.weights)[idx];
      return tf.mul(pred, tf.scalar(weight));
    });

    const ensemblePrediction = tf.add(
      weightedPredictions[0],
      tf.add(weightedPredictions[1], weightedPredictions[2])
    );

    predictions.forEach(p => p.dispose());
    weightedPredictions.forEach(p => p.dispose());
    reshaped.dispose();

    return ensemblePrediction;
  }

  async train(xs: tf.Tensor2D, ys: tf.Tensor2D) {
    await Promise.all([
      this.models.evolutionary.train(xs, ys),
      this.models.main.train(xs, ys),
      this.models.risk.train(xs, ys)
    ]);
  }

  updateWeights(performances: { evolutionary: number; main: number; risk: number }) {
    const total = Object.values(performances).reduce((a, b) => a + b, 0);
    
    this.weights = {
      evolutionary: performances.evolutionary / total,
      main: performances.main / total,
      risk: performances.risk / total
    };
  }

  async learn(state: number[], action: number[], reward: number) {
    await this.models.evolutionary.learn(state, action, reward);
  }
}