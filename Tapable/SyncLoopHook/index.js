const BaseHook = require('../base');

class SyncLoopHook extends BaseHook {
  call(...args) {
    const {
      tasks = [],
    } = this;
    const maxLoop = 3;
    
    tasks.forEach(({ task }) => {
      let res;
      for(let i = 0; i < maxLoop; i ++) {
        res = task(...args);
        if (typeof res === 'undefined') {
          break;
        }
      }
      return res;
    });
  }
}

module.exports = SyncLoopHook;
