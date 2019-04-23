#! /usr/bin/env node
// shell 语法 调用 node 环境来执行

// 默认读取的配置文件名
const defaultConfigName = 'webpack.config.js';

const path = require('path');
const config = require(path.resolve(defaultConfigName));
const Compiler = require('../lib/Compiler.js');

// 创建一个编译器并执行编译
const compiler = new Compiler(config);
// 挂载生命周期事件
compiler.hooks.afterInit.call();

compiler.run();
