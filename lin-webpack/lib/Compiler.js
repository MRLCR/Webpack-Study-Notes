const process = require('process');
const fs = require('fs');
const path = require('path');
const babylon = require('babylon'); // 将源码转化成 ast 抽象语法树
const t = require('@babel/types'); // ast 语法树节点的工具库
const traverse = require('@babel/traverse').default; // 维护 ast 语法树， 增删改（es6 对象）
const generator = require('@babel/generator').default; // 将 ast 抽象语法树转出源码（es6 对象）
const { SyncHook } = require('tapable');
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
  }
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
  /**
   * 读取模块内容
   * @param {string} modulePath 模块路径
   * @returns {string} 模块内容
   */
  readSourceContent(modulePath) {
    const content = fs.readFileSync(modulePath, 'utf-8');
    return this.handleLoader(content, modulePath);
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
          node.callee.name = '__lin_webpack_require__';
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

}

module.exports = Compiler;
