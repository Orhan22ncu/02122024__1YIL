import * as tf from '@tensorflow/tfjs';
import { BaseModel } from './BaseModel';

export class EvolutionaryModel extends BaseModel {
  private readonly memoryBuffer: Array<{
    state: number[];
    action: number[];
    reward: number;
  }> = [];
  private readonly bufferSize = 10000;
  private learningRate = 0.001;
  private mutationRate = 0.05;

  protected createModel(): tf.LayersModel {
    const model = tf.sequential();
    
    // Reshape input for time series processing
    model.add(tf.layers.reshape({
      targetShape: [1, 30],
      inputShape: [30]
    }));
    
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu'
    }));
    
    model.add(tf.layers.lstm({
      units: 128,
      returnSequences: false
    }));
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dropout({ rate: 0.4 }));
    
    model.add(tf.layers.dense({
      units: 3,
      activation: 'softmax'
    }));

    model.compile({
      optimizer: tf.train.adamax(this.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async evolve(reward: number) {
    this.learningRate *= (1 + reward * 0.1);
    this.mutationRate *= (1 - reward * 0.05);
    
    const weights = this.model.getWeights();
    const mutatedWeights = weights.map(weight => {
      const shouldMutate = Math.random() < this.mutationRate;
      if (shouldMutate) {
        const mutation = tf.randomNormal(weight.shape, 0, 0.1);
        return weight.add(mutation);
      }
      return weight;
    });
    
    this.model.setWeights(mutatedWeights);
  }

  async learn(state: number[], action: number[], reward: number) {
    this.memoryBuffer.push({ state, action, reward });
    if (this.memoryBuffer.length > this.bufferSize) {
      this.memoryBuffer.shift();
    }

    const batchSize = Math.min(32, this.memoryBuffer.length);
    const batch = this.selectBatch(batchSize);

    const states = tf.tensor2d(
      batch.map(exp => exp.state),
      [batchSize, state.length]
    );
    
    const actions = tf.tensor2d(
      batch.map(exp => exp.action),
      [batchSize, action.length]
    );

    await this.model.trainOnBatch(states, actions);

    const averageReward = batch.reduce((sum, exp) => sum + exp.reward, 0) / batchSize;
    await this.evolve(averageReward);

    states.dispose();
    actions.dispose();
  }

  private selectBatch(size: number) {
    const batch = [];
    const indices = new Set<number>();
    
    while (indices.size < size) {
      const idx = Math.floor(Math.random() * this.memoryBuffer.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        batch.push(this.memoryBuffer[idx]);
      }
    }
    
    return batch;
  }
}