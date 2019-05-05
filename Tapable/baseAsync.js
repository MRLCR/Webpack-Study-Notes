const BaseHook = require('./base');

class BaseAsyncHook extends BaseHook {
  /**
   * 注册异步任务
   * @param {*} name 任务名称
   * @param {*} task 任务内容
   */
  tapAsync(name, task) {
    this.tasks.push({ name, task });
  }
  /**
   * 注册异步任务 Promise 版
   * @param {*} name 任务名称
   * @param {*} task 任务内容
   */
  tapPromise(name, task) {
    this.tasks.push({ name, task });
  }
}

module.exports = BaseAsyncHook;
