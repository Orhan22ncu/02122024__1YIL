import * as tf from '@tensorflow/tfjs';

export abstract class BaseModel {
  protected model: tf.LayersModel;

  constructor() {
    this.model = this.createModel();
  }

  protected abstract createModel(): tf.LayersModel;

  getModel(): tf.LayersModel {
    return this.model;
  }

  async predict(input: tf.Tensor): Promise<tf.Tensor> {
    return this.model.predict(input) as tf.Tensor;
  }

  async train(xs: tf.Tensor, ys: tf.Tensor, config: tf.ModelFitArgs = {}): Promise<tf.History> {
    return await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      ...config
    });
  }
}