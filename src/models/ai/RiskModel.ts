import * as tf from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel';

export class RiskModel extends BaseModel {
  protected createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [10]
    }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 2,
      activation: 'sigmoid'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError'
    });

    return model;
  }
}