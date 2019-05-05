const BaseAsyncHook = require('../baseAsync');

class AsyncParralleBailHokk extends BaseAsyncHook {
  callAsync(...args) {
    const {
      tasks,
    } = this;
    const finalCallback = args.pop();
    if (typeof finalCallback !== 'function') {
      throw Error('need a callback function');
    }
    const tasksLen = tasks.length;
    let index = 0;
    const done = () => {
      index++;
      if (index === tasksLen) {
        try {
          finalCallback();
        } catch (e) {
          throw Error(e);
        }
      }
    }
    let taskRes = null;
    for(let i = 0; i < tasks.length; i++) {
      try {
        taskRes = taskRes[i](...args, done);
        // 如果有事件返回 undefined 停止执行
        if (typeof taskRes === 'undefined') {
          return;
        }
      } catch (e) {
        throw Error(e);
      }
    }
  }
}

module.exports = AsyncParralleBailHokk;
