import * as tf from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel';

export class MainModel extends BaseModel {
  protected createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    // Input layer with correct shape for time series data
    model.add(tf.layers.reshape({
      targetShape: [1, 20],
      inputShape: [20]
    }));
    
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // LSTM layer with correct input shape
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: false
    }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }
}