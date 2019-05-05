# webpack 原理学习

## 手写自己的webpack

### 0. 环境要求

需要向安装 node8.x+ ，毕竟 webpack 是基于node的产物
注： 本次项目与 mac 下编写 window 下还未验证

### 1 新建一个空白的文件夹

```bash
$ mkdir my-webpack
```

### 2 初始化

```bash
$ npm init -y
```
或者
```bash
$ yarn init -y
```

### 3 创建执行文件

新建文件夹 bin，在 bin 下创建一个 my-webpack.js 执行文件

新建文件夹 lib，在 lib 下创建一个 Compiler.js 用于处理编译逻辑，创建一个 Template.js 来输出编译代码的模板

#### my-webpack.js

```js
#! /usr/bin/env node
// shell 语法 调用 node 环境来执行

// 默认读取的配置文件名
const defaultConfigName = 'webpack.config.js';

const path = require('path');
const config = require(path.resolve(defaultConfigName));
const Compiler = require('../lib/Compiler.js');

// 创建一个编译器并执行编译
const compiler = new Compiler(config);
compiler.run();
```

#### Compiler.js

```js
const process = require('process');
const fs = require('fs');
const path = require('path');
const babylon = require('babylon'); // 将源码转化成 ast 抽象语法树
const t = require('@babel/types'); // ast 语法树节点的工具库
const traverse = require('@babel/traverse').default; // 维护 ast 语法树， 增删改（es6 对象）
const generator = require('@babel/generator').default; // 将 ast 抽象语法树转出源码（es6 对象）
const Template = require('./Template.js');

const log = (text) => console.log('---------- ' + text + ' ------------'); // 便于输出调试，可删

class Compiler {
  constructor(config) {
    // 保留配置文件
    this.config = config;
    // 入口模块名称
    this.entryName = null;
    // 主路口
    this.entry = config.entry;
    // 保存所有的模块依赖
    this.modules = {};
    // 工作根目录
    this.root = process.cwd();
    // 默认后缀名
    this.defaultExtname = '.js';
  }
  /**
   * 读取模块内容
   * @param {string} modulePath 模块路径
   * @returns {string} 模块内容
   */
  readSourceContent(modulePath) {
    return fs.readFileSync(modulePath, 'utf-8');
  }
  /**
   * 解析源码
   * @param {stirng} sourceContent 源码内容
   * @param {string} parentPath 父级路径
   * @returns {object} 解析后的源码和依赖 
   */
  parseSource(sourceContent, parentPath) {
    const {
      defaultExtname,
    } = this;
    // 将源码转成 ast 抽象语法树
    const astTree = babylon.parse(sourceContent);
    const dependencies = [];
    traverse(astTree, {
      CallExpression(p) {
        const node = p.node;
        if (node.callee.name === 'require') {
          // 转化成自己的require
          node.callee.name = '__my_webpack_require__';
          // 获取模块名称
          let moduleName = node.arguments[0].value;
          // 添加后缀名
          moduleName = moduleName + (path.extname(moduleName) ? '' : defaultExtname);
          // 转出相对路径
          moduleName = './' + path.join(parentPath, moduleName);
          // 记录依赖
          dependencies.push(moduleName);
          // 将节点属性内容替换成模块路径
          node.arguments = [t.stringLiteral(moduleName)];
        }
      }
    });
    const parsedSourceCode = generator(astTree).code;
    return {
      parsedSourceCode,
      dependencies,
    }
  }
  /**
   * 构建模块
   * @param {string} modulePath 模块路径 绝对路径
   * @param {boolean} isEntry 是否为主入口
   */
  buildModule(modulePath, isEntry) {
    const {
      root,
      modules,
    } = this;
    // 读取模块内容
    const sourceContent = this.readSourceContent(modulePath);
    // 用相对路径作为模块的名称
    const moduleName = './' + path.relative(root, modulePath);

    // 保存主入口
    if (isEntry) {
      this.entryName = moduleName;
    }

    // 解析文件内容
    const {parsedSourceCode, dependencies} = this.parseSource(sourceContent, path.dirname(moduleName));

    // 依赖递归解析
    dependencies.forEach((dep) => {
      this.buildModule(path.join(root, dep), false);
    });

    // 保留解析后的内容
    modules[moduleName] = parsedSourceCode;
  }
  /**
   * 创建编译后的文件
   */
  createFile(){
    const {
      config,
      entryName,
      modules,
    } = this;
    const {
      output = {},
    } = config;
    if (typeof output !== 'object' || output === null) {
      throw Error('output need object');
    }
    const outputPath = path.join(output.path, output.filename);
    const template = new Template(entryName, modules);
    const code = template.render();
    this.assets = {};
    this.assets[outputPath] = code;
    fs.writeFileSync(outputPath, code);
  }
  run() {
    log('my-webpack start run');
    const {
      root,
      entry,
    } = this;

    // 创建模块
    this.buildModule(path.resolve(root, entry), true);

    // 创建编译后的文件
    this.createFile();
  }

}

module.exports = Compiler;

```

#### Template.js

生成模板有很多方法，比如采用第三方的 ejs , 这里考虑的尽量不依赖第三方 所有自行处理的字符串

```js

const modulesTemplate = function (modules) {
  // 安装完的模块
  const installedModules = {};

  function __my_webpack_require__(moduleName) {
    
    // 如果已经安装过了 返回安装的模块内容
    if(installedModules[moduleName]) {
      return installedModules[moduleName].exports;
    }
    const module = installedModules[moduleName] = {
      i: moduleName, // 安装名称
      l: false, // 是否已经安装完成
      exports: {}, // 输出内容
    };

    // 执行导出内容
    modules[moduleName].call(module.exports, module, module.exports, __my_webpack_require__);

    module.l = true;

    return module.exports;
  }

  // 首次执行 导入主入口
  return __my_webpack_require__(__my_webpack_require__.s = "<%-entryName-%>");
};

const argumentsFnTemplate = function(module, exports, __my_webpack_require__) {
  eval("<%-moduleContent-%>");
}

class Template{
  constructor(entryName, modules) {
    this.entryName = entryName;
    this.modules = modules;
  }
  createModulesTemplate() { // 创建函数
    const {
      entryName,
    } = this;
    return modulesTemplate.toString().replace(/<%-entryName-%>/, entryName);
  }
  createArgumentsTemplate() { // 创建待执行的属性
    const {
      modules
    } = this;
    let result = '';
    for(let k in modules) {
      const moduleValue = modules[k].toString().replace(/\n/g,"\\n").replace(/\"/g, "\\\"");
      const moduleContent = "(" + argumentsFnTemplate.toString().replace(/<%-moduleContent-%>/, moduleValue) + "),";
      const str = "\n\"" + k + "\":\n" + moduleContent;
      result += str;
    }
    return result.substring(0, result.length - 1);
  }
  render() {
    return "(" + this.createModulesTemplate() + ")\n" + "({\n" + this.createArgumentsTemplate() + "});";
  }
}

module.exports = Template;

```

### 4 在 package.json 中添加添加 bin 来关联文件

```json
"bin": {
  "my-webpack": "./bin/my-webpack.js"
},
```
### 5 将项目临时管理到本地的 npm 仓库

在项目根目录下执行
```bash
$ npm link
```

### 6 关联到新项目中

新建一个项目，初始化后，关联 npm 仓库中临时的 my-webpack
注： 这里link的名字要与 package.js 中的 key 相对
```bash
$ npm link my-webpack
```

### 7 调用

```bash
npx my-webpack
```
或者在 package.json 中配置脚本来运行

## 相关资料

- [node api](http://nodejs.cn/api/)
- [babylon](https://www.npmjs.com/package/babylon)
- [@babel/types](https://www.npmjs.com/package/@babel/types)
- [@babel/traverse](https://www.npmjs.com/package/@babel/traverse)
- [@babel/generator](https://www.npmjs.com/package/@babel/generator)
- [fs](http://nodejs.cn/api/fs.html)
- [process](http://nodejs.cn/api/process.html)
- [npx](https://www.npmjs.com/package/npx)
- [npm link](https://docs.npmjs.com/cli/link.html)
- [AST 抽象语法树](https://astexplorer.net/)

***
## 事件流机制 Tapable 探索与学习

webpack使用事件流机制，采用的核心是Tapable, 其思想是发布订阅模式。

### 官方链接

- [Tapable](https://github.com/webpack/tapable)
- [Tapable in webpack](https://webpack.docschina.org/api/tapable/#src/components/Sidebar/Sidebar.jsx)

### 编写自己的Tapable

BaseHook

先写了一个基类的钩子 方便后面继承

```js
class BaseHook {
  constructor(args) {
    // 保留参数名称
    this.args = args;
    // 任务列表
    this.tasks = [];
  }
  /**
   * 注册流程
   * @param {string} name 任务名称
   * @param {Function} task 要执行的任务 
   */
  tap(name, task) {
    // 添加到任务列表中
    this.tasks.push({ name, task });
  }
}

module.exports = BaseHook;

```

用于测试的 test.js

```js
const SyncHook = require('./SyncHook/index.js');
const SyncBailHook = require('./SyncBailHook/index.js');

class Vacation{
  constructor() {
    this.hooks = {
      apply: new SyncBailHook(['name', 'content']),
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
    apply.tap('年级主任', (name, content) => {
      console.log('年级主任, 同意：' + name + ', 关于“ ' + content + ' ”的请假');;
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

```

#### SyncHook

```js
const BaseHook = require('../base.js');

class SyncHook extends BaseHook {
  // 执行任务
  call(...args) {
    const {
      tasks,
    } = this;
    tasks.forEach(({ task }) => {
      task(...args);
    });
  }
}

module.exports = SyncHook;

```

#### SyncBailHook

能中途停止的同步事件流

```js
const BaseHook = require('../base.js');

class SyncBailHook extends BaseHook {
  // 执行任务
  call(...args) {
    const {
      tasks,
    } = this;
    const len = tasks.length;
    for(let i = 0; i < len; i++) {
      const { task } = tasks[i];
      const res = task(...args);
      if (res === undefined) {
        return;
      }
    }
  }
}

module.exports = SyncBailHook;

```

#### SyncWaterfallHook

瀑布同步事件流，上个事件的结果作为下个事件的传参

```js
const BaseHook = require('../base');

class SyncWaterfallHook extends BaseHook {
  call(...args) {
    const {
      tasks=[],
    } = this;
    const [fristFn, ...otherTasks] = tasks;
    otherTasks.reduce((res, item) => {
      return item.task(res);
    }, fristFn.task(...args));
  }
}

module.exports = SyncWaterfallHook;

```

#### SyncLoopHook

循环同步事件流，某个事件重复执行多次再执行下一个事件

```js
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

```

***

BaseAsyncHook

先写了一个异步基类的钩子 方便后面继承

```js
const BaseHook = require('./base');

class BaseAsyncHook extends BaseHook {
  /**
   * 注册异步任务
   * @param {*} name 任务名称
   * @param {*} task 任务内容
   */
  tapAsync(name, task) {
    this.tasks.push({ name, task });
  }
  /**
   * 注册异步任务 Promise 版
   * @param {*} name 任务名称
   * @param {*} task 任务内容
   */
  tapPromise(name, task) {
    this.tasks.push({ name, task });
  }
}

module.exports = BaseAsyncHook;

```

#### AsyncParallelHook

异步并行事件流

```js
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

```

#### AsyncParallelBailHook

异步并行可终止的事件流

```js
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

```

#### AsyncSeriesHook

异步串行事件流

```js
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

```

#### AsyncSeriesBailHook

异步串行可终止的事件流

```js
const BaseAsyncHook = require('../baseAsync');

class AsyncSeriesBailHook extends BaseAsyncHook {
  callAsync(...args) {
    const {
      tasks,
    } = this;
    const finalCallback = args.pop();
    const tasksLen = tasks.length;
    let index = 0;
    const next = (res) => {
      if (typeof res !== 'undefined') {
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

module.exports = AsyncSeriesBailHook;

```

#### AsyncSeriesWaterfallHook

异步串行瀑布事件流

```js
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

```
