const BaseAsyncHook = require('../baseAsync');

class AsyncParralleHook extends BaseAsyncHook {
  /**
   * 执行所有 task
   * @param  {...any} args task 获取的参数 最后一个参数为回调参数
   */
  callAsync(...args) {
    const {
      tasks,
    } = this;
    const finalCallback = args.pop(); // 执行的回调函数
    if (typeof finalCallback !== 'function') {
      throw Error ('need a callback function');
    }
    const tasksLen = tasks.length;
    let index = 0;
    const done = () => {
      index ++;
      if (index === tasksLen) {
        try {
          finalCallback();
        } catch (e) {
          throw Error(e);
        }
      }
    }
    tasks.forEach(({ task }) => {
      try {
        task(...args, done);
      } catch (e) {
        throw Error(e);
      }
    });
  }
  promise(...args) {
    const {
      tasks,
    } = this;
    return Promise.all(tasks.map(({ task }) => {
      try {
        const res = task(...args);
        if (!(res instanceof Promise)) {
          throw Error('task result need a Promise');
        }
        return res;
      } catch (e) {
        throw Error(e);
      }
    }));
  }
}

module.exports = AsyncParralleHook;
