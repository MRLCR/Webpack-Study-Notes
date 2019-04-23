const SyncHook = require('./SyncHook');
const SyncBailHook = require('./SyncBailHook');
const SyncWaterfallHook = require('./SyncWaterfallHook');
const SyncLoopHook = require('./SyncLoopHook');

class Vacation{
  constructor() {
    this.hooks = {
      apply: new SyncLoopHook(['name', 'content']),
    }
  }
  // 注册流程
  tap() {
    const {
      apply,
    } = this.hooks;
    apply.tap('班主任', (name, content) => {
      const res = '班主任, 同意：' + name + ', 关于“ ' + content + ' ”的请假';
      console.log(res);
      return res;
    });
    apply.tap('年级主任', (name, content) => {
      const res = '年级主任, 同意：' + name + ', 关于“ ' + content + ' ”的请假';
      console.log(res);
    });
  }
  // 发起流程
  start(name, content) {
    this.hooks.apply.call(name, content);
  }
}

const vacation = new Vacation();
vacation.tap();
vacation.start('张三', '身体不舒服');
