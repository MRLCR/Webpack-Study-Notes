const BaseAsyncHook = require('../baseAsync');

class AsyncSeriesHook extends BaseAsyncHook {
  callAsync(...args) {
    const {
      tasks,
    } = this;
    const finalCallback = args.pop();
    const tasksLen = tasks.length;
    let index = 0;
    const next = () => {
      if (index === tasksLen) {
        try {
          finalCallback();
        } catch (e) {
          throw Error(e);
        }
      } else {
        try {
          const  { task } = tasks[index];
          index++;
          task(...args, next);
        } catch (e) {
          throw Error(e);
        }
      }
    }
    next();
  }
  promise(...args) {
    const {
      tasks,
    } = this;
    const [{task: fristTask = function(){}}, ...otherTasks] = tasks;
    return otherTasks.reduce((p, next) => {
      const {task: nextTask} = next;
      return p.then(() => nextTask(...args));
    }, fristTask(...args));
  }
}

module.exports = AsyncSeriesHook;
