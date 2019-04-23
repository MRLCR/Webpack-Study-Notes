const BaseHook = require('../base');

class SyncBailHook extends BaseHook {
  // 执行任务
  call(...args) {
    const {
      tasks = [],
    } = this;
    const len = tasks.length;

    for(let i = 0; i < len; i++) {
      const { task } = tasks[i];
      const res = task(...args);
      if (res === undefined) {
        return;
      }
    }
  }
}

module.exports = SyncBailHook;
