const SyncHook = require('./SyncBailHook');
const SyncBailHook = require('./SyncBailHook');
const SyncLoopHook = require('./SyncLoopHook');
const SyncWaterfallHook = require('./SyncWaterfallHook');


const AsyncParralleHook = require('./AsyncParralleHook');
const AsyncPallalleBailHook = require('./AsyncParralleBailHook');
const AsyncSeriesHook = require('./AsyncSeriesHook');
const AsyncSeriesBailHook = require('./AsyncSeriesBailHook');
const AsyncSeriesWaterfall = require('./AsyncSeriesWaterfallHook');

module.exports = { 
  SyncHook,
  SyncBailHook,
  SyncLoopHook,
  SyncWaterfallHook,
  AsyncParralleHook,
  AsyncPallalleBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
};