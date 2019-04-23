const SyncHook = require('./SyncHook/index.js');
const SyncBailHook = require('./SyncBailHook/index.js');
const SyncWaterfallHook = require('./SyncWaterfallHook.js');

class Vacation{
  constructor() {
    this.hooks = {
      apply: new SyncWaterfallHook(['name', 'content']),
    }
  }
  // 注册流程
  tap() {
    const {
      apply,
    } = this.hooks;
    apply.tap('班主任', (name, content) => {
      console.log('班主任, 不同意：' + name + ', 关于“ ' + content + ' ”的请假');
      return undefined;
    });
    apply.tap('年级主任', (name, lastContent) => {
      console.log('年级主任, 同意：' + name + ', ' + lastContent);
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