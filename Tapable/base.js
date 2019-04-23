class BaseHook {
  constructor(args) {
    // 保留参数名称
    this.args = args;
    // 任务列表
    this.tasks = [];
  }
  /**
   * 注册流程
   * @param {string} name 任务名称
   * @param {Function} task 要执行的任务 
   */
  tap(name, task) {
    // 添加到任务列表中
    this.tasks.push({ name, task });
  }
}

module.exports = BaseHook;
