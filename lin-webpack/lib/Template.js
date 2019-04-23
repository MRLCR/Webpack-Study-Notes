
const modulesTemplate = function (modules) {
  // 安装完的模块
  const installedModules = {};

  function __lin_webpack_require__(moduleName) {
    
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
    modules[moduleName].call(module.exports, module, module.exports, __lin_webpack_require__);

    module.l = true;

    return module.exports;
  }

  // 首次执行 导入主入口
  return __lin_webpack_require__(__lin_webpack_require__.s = "<%-entryName-%>");
};

const argumentsFnTemplate = function(module, exports, __lin_webpack_require__) {
  eval("<%-moduleContent-%>");
}

class Template{
  constructor(entryName, modules) {
    this.entryName = entryName;
    this.modules = modules;
  }
  createModulesTemplate() {
    const {
      entryName,
    } = this;
    return modulesTemplate.toString().replace(/<%-entryName-%>/, entryName);
  }
  createArgumentsTemplate() {
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
