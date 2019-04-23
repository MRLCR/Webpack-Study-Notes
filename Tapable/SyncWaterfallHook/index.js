const BaseHook = require('../base');

class SyncWaterfallHook extends BaseHook {
  call(...args) {
    const {
      tasks=[],
    } = this;
    const [fristFn, ...otherTasks] = tasks;
    console.log(fristFn);
    otherTasks.reduce((res, item) => {
      return item.task(res);
    }, fristFn.task(...args));
  }
}

module.exports = SyncWaterfallHook;
