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
