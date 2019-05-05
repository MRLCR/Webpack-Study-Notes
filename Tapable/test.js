const SyncHook = require('./SyncHook');
const SyncBailHook = require('./SyncBailHook');
const SyncWaterfallHook = require('./SyncWaterfallHook');
const SyncLoopHook = require('./SyncLoopHook');

const AsyncParralleHook = require('./AsyncParralleHook');
const AsyncPallalleBailHook = require('./AsyncParralleBailHook');
const AsyncSeriesHook = require('./AsyncSeriesHook');
const AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook');

class Vacation{
  constructor() {
    this.hooks = {
      apply: new AsyncSeriesWaterfall(['name', 'content']),
    }
  }
  // 注册流程
  tapPromise() {
    const {
      apply,
    } = this.hooks;
    apply.tapAsync('班主任', (name, content, cb) => {
      setTimeout(() => {
        const res = `${name} 关于 ${content} 的请假内容，班主任同意`;
        console.log(res);
        cb(null, res);
      }, 1000);
    });
    apply.tapAsync('年级主任', (lastRes, cb) => {
      setTimeout(() => {
        const res = `${lastRes}，年级主任也同意`;
        console.log(res);
        cb(null, res);
      }, 500);
    });
  }
  // 发起流程
  start(name, content) {
    this.hooks.apply.callAsync(name, content, () => {
      console.log(`通知${name}`);
    });
  }
}

const vacation = new Vacation();
vacation.tapPromise();
vacation.start('张三', '身体不舒服');
