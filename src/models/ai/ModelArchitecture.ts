import * as tf from '@tensorflow/tfjs';
import { logger } from '../../utils/logger';

export class ModelArchitecture {
  static createMainModel(): tf.LayersModel {
    const model = tf.sequential();

    try {
      // Input layer
      model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [20]
      }));

      // Hidden layers with regularization
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
      }));

      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
      }));

      // Output layer for buy/sell/hold predictions
      model.add(tf.layers.dense({
        units: 3,
        activation: 'softmax'
      }));

      model.compile({
        optimizer: tf.train.adam(0.0005),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      return model;
    } catch (error) {
      logger.error('Model creation failed:', error);
      throw error;
    }
  }

  static async trainModel(
    model: tf.LayersModel,
    features: tf.Tensor2D,
    labels: tf.Tensor2D,
    onEpochEnd: (epoch: number, logs: any) => void
  ): Promise<tf.History> {
    try {
      // Log shapes for debugging
      logger.debug('Training shapes:', {
        features: features.shape,
        labels: labels.shape
      });

      return await model.fit(features, labels, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd,
          earlyStopping: tf.callbacks.earlyStopping({
            monitor: 'val_loss',
            minDelta: 0.001,
            patience: 5,
            verbose: 1
          })
        }
      });
    } catch (error) {
      logger.error('Model training failed:', error);
      throw error;
    }
  }
}