const BaseAsyncHook = require('../baseAsync');

class AsyncSeriesWaterfall extends BaseAsyncHook {
  callAsync(...args) {
    const {
      tasks
    } = this;
    const finalCallback = args.pop();
    const tasksLen = tasks.length;
    let index = 0;
    const next = (error, ...data) => {
      if (error !== null && error !== '' && typeof error !== 'undefined') {
        throw Error(error);
      }
      if (index === tasksLen) {
        try {
          finalCallback();
        } catch (e) {
          throw Error(e);
        }
      } else {
        const {task} = tasks[index];
        index++;
        try {
          task(...data, next);
        } catch (e) {
          throw Error(e);
        }
      }
    }
    next(null, ...args);
  }
  promise(...args) {
    const {
      tasks,
    } = this;
    const [{task: fristTask}, ...otherTasks] = tasks;
    return otherTasks.reduce((p, next) => {
      const {task: nextTask} = next;
      return p.then(nextTask);
    }, fristTask(null, ...args));
  }
}

module.exports = AsyncSeriesWaterfall;
