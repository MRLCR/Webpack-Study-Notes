const BaseHook = require('../base');

class SyncHook extends BaseHook {
  // 执行任务
  call(...args) {
    const {
      tasks,
    } = this;
    tasks.forEach(({ task }) => {
      task(...args);
    });
  }
}

module.exports = SyncHook;
