# webpack 原理学习2

## loader

### 处理 loader

在读取模块内柔后，添加一层对源码的解析出来

#### 修改原先的 readSourceContent

```js
/**
 * 读取模块内容
 * @param {string} modulePath 模块路径
 * @returns {string} 模块内容
 */
readSourceContent(modulePath) {
  const content = fs.readFileSync(modulePath, 'utf-8');
  return this.handleLoader(content, modulePath);
}
```

### 添加 handleLoader 来处理模块内容

```js
/**
 * 根据 loader 来转化模块文件内容
 * @param {*} content 源内容
 * @param {*} modulePath 模块文件路径
 */
handleLoader(content, modulePath) {
  const {
    module = {}
  } = this.config;
  const {
    rules = [],
  } = module;
  let loaderContent = content;
  const rulesLen = rules.length;
  if (rulesLen !== 0) {
    rules.forEach(({test, use = []}) => {
      // 路径匹配时， 调用use
      if (test.test(modulePath)) {
        let i = use.length - 1;
        // 获取经过 loader 处理后的内容
        function getLoaderContent() {
          const loader = require(use[i]);
          loaderContent = loader(loaderContent);
          i--;
          if (i >= 0) {
            getLoaderContent();
          }
        }
        getLoaderContent();
      }
    })
  }
  return loaderContent
}
```

### 编写 loader

注： 为方便实验，此处改用官方 webpack 打包 不适用自己写的webpack
这里简单的列举了一些例子
#### 配置准备

添加配置，方便读取本地路径

```json
resolveLoader: {
  modules: ['node_modules', path.resolve(__dirname, 'myloader')],
  moduleExtensions: ['.js'],
},
```
```js
rules: [
  // ...
  {
    test: /\.js$/,
    use: [
      {
        loader: 'banner-loader',
        options: {
          name: 'lin',
        }
      },
    ],
  },
]
```

#### banner-loader
在文件头插入时间和作者

```js
const loaderUtils = require('loader-utils'); // 用于 loader 开发的一些工具方法
const schemaUtils = require('schema-utils'); // 用于结构验证

function loader(source) {
  const options = loaderUtils.getOptions(this); // 获取 webapck.config.js 中 loader options的参数内容
  const cb = this.async(); // 处理异步返回，同步也可使用
  const schema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      }
    }
  }
  schemaUtils(schema, options, 'banner-loader');
  cb(null, `/** made in ${(new Date()).toLocaleString()} by ${options.name} **/\n ${source}`);
}

module.exports = loader;

```

#### style-loader

```js
module.exports = function(sourceCode) {
  return `
    const style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(sourceCode)}
    document.head.appendChild(style);
  `
}
```

#### less-loader

```js
let less = require('less');

module.exports = function(sourceCode) {
  let css = '';
  less.render(sourceCode, (err, res) => {
    css = res.css;
  });
  // css = css.replace(/\n/g, "\\n");
  return css;
}
```

***
## plugins

### 处理 plugin
利用 tepable 来添加生命周期，之后再周期上过载插件

#### 1. 引用
这里调用了本地自己写的tapable
```js
const { SyncHook } = require('../Tapable/index.js');
```
使用官方的
```js
const { SyncHook } = require('tapable');
```

#### 2. 初始化

在 constructor 中添加 挂载插件
```js
// 定义生命周期
this.hooks = {
  afterInit: new SyncHook(), // 初始化实例之后
  beforeCompiler: new SyncHook(), // 编译之前
  afterCompiler: new SyncHook(), // 编译之后
  afterSetPlugins: new SyncHook(), // 插件挂载完成后
  beforeRun: new SyncHook(), // 运行之前
  beforeWriteFile: new SyncHook(), // 写文件之前
  afterWriteFile: new SyncHook(), // 写文件之后
  done: new SyncHook(), // 运行结束前
}

// 开始挂载插件
const { plugins = [] } = config;
if (Array.isArray(plugins)) {
  plugins.forEach((plugin) => {
    plugin.apply(this);
  });
}
// 加载生命周期
this.hooks.afterSetPlugins.call();
```

#### 3. 将生命周期挂载在代码中

例如
```js
run() {
  // 挂载生命周期事件
  this.hooks.beforeRun.call();

  const {
    root,
    entry,
  } = this;

  // 挂载生命周期事件
  this.hooks.beforeCompiler.call();
  // 创建模块
  this.buildModule(path.resolve(root, entry), true);
  // 挂载生命周期事件
  this.hooks.afterCompiler.call();

  // 挂载生命周期事件
  this.hooks.beforeWriteFile.call();
  // 创建编译后的文件
  this.createFile();
  // 挂载生命周期事件
  this.hooks.afterWriteFile.call();

  // 挂载生命周期事件
  this.hooks.done.call();
}
```

### 编写 plugin

#### 代码
例如, 在编译后添加作者名称的信息文件

```js
const fs = require('fs');
const path = require('path');

class Plugin_AddAuthor{
  constructor(name) {
    if(typeof name === 'undefined'){
      throw Error('Plugin_AddAuthor init need a name');
    }
    this.name = name;
  }
  apply(compiler) {
    const {
      name,
    } = this;
    compiler.hooks.done.tap('addName', () => {
      fs.writeFileSync(path.join(compiler.config.output.path, '/author.txt'), name);
    });
  }
}

module.exports = Plugin_AddAuthor;
```

#### 调用

```js
const AddAuthor = require('./myPlugins/addAuthor.js');
```
```json
plugins: [
  new AddAuthor('linchuran'),
]
```
