# 多页应用打包

### 添加依赖


```bash
yarn add -D webpack webpack-cli webpack-dev-server
```

```bash
yarn add -D html-webpack-plugin
```

### 配置声明
```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html插件
```

### 配置代码
```js
const config = {
  // 多入口
  entry: {
    home: './src/index.js',
    login: './src/login.js',
  },
  output: {
    filename: '[name]/index.js', // [name] => 对应 entry 的 key
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'home/index.html',
      chunks: ['home'], // 引用对应入口的js
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'login/index.html',
      chunks: ['login'],
    }),
  ]
}

module.exports = config;
```

### 配置说明
- [HtmlWebpackPlugin](https://www.npmjs.com/package/html-webpack-plugin

# 关于调试的source-map
语法报错时，添加源码映射，方便排查错误

## js

### 配置代码

```json
{
  // 生成一个独立的源代码映射文件
  // 1. source-map 单独文件，代码关联到源文件
  // 2. eval-source-map  集成在 js 文件中  代码关联到源文件
  // 3. cheap-source-map 单独文件 代码关联到编译文件
  // ...
  devtool: 'source-map',
}
```

### 配置说明
- ["source-map"属性](https://webpack.docschina.org/configuration/devtool/#devtool)

# 监听文件变动 watch

### 配置代码

```json
{
  watch: true,
  watchOptions: {
    poll: 1000, // 轮询时间间隔
    aggregateTimeout: 500, // 防抖延迟
    ignored: /node_moudles/, // 忽略文件
  },
}
```

### 配置说明

- [watchOptions](https://webpack.docschina.org/configuration/watch/)

# 代理 proxy

## webpack-dev-server 来代理

### 配置代码

```json
devServer: {
  proxy: {
    // 配置代理
    '/api': {
      target: 'http://localhost:8888/', // 代理地址
      pathRewrite: { '/api': '' }, // 重写路径中的 '/api'
    }
  }
},
```

### 配置说明

- [proxy](https://webpack.docschina.org/configuration/dev-server/#devserver-proxy)

## webpack-dev-server 来mock数据

### 配置代码

```json
devServer: {
  before(app) { // 请求拦截，返回默认数据
    app.get('/api/user', (req, res) => {
      res.json({ name: 'mock linchuran'});  // 返货mock数据
    });
  },
},
```

### 配置说明

- [devServer.before](https://webpack.docschina.org/configuration/dev-server/#devserver-before)


## node 中间件处理

### 配置代码

```js
const webpack = require('webpack');
const middle = require('webpack-dev-middleware');
const config = require('./webpack.config.js'); // 获取webpack配置文件
const compiler = webpack(config);// webapck编译处理
const app = express();
app.use(middle(compiler)); // 引用中间件
```

# 解析第三方包规则配置 resolve

### 配置代码

```js
resolve: { // 配置解析第三方包规则
  modules: path.resolve(__dirname, 'node_modules'),
  alias: { // 配置引用别名
    xxxCss: 'xxx/dist/css/xxx.css',
  },
},
```

### 配置说明

- [resolve](https://webpack.docschina.org/configuration/resolve/)

# 环境变量

## 命令行

### 配置代码
在 package.json 脚本中添加到 --env 变量下

```bash
webpack-dev-server --env.NODE_ENV='dev'
```

在配置文件中引用
```js
module.exports = (env) => {
  console.log(env); // env => { NODE_ENV: 'dev' }

  return {
    ...
  }
}
```

### 配置说明

- [环境变量](https://webpack.docschina.org/guides/environment-variables/)

## 使用内置插件 webpack.DefinePlugin 定义全局变量

### 配置代码

```js
plugins: [
  new webpack.DefinePlugin({
    ENV: JSON.stringify(env), // 定义变量ENV在项目中使用
  }),
],
```

### 配置说明

- [DefinePlugin](https://webpack.docschina.org/plugins/define-plugin/);

# 根据环境选择配置

利用 webpack-merge 抽离公共代码

### 配置代码

命令行
```base
webpack --env.NODE_ENV='pro' --progress --config webpack.prod.config.js
```

```js
const webpackMerge = require('webpack-merge');
module.exports = (env) => {
  console.log('---------------');
  console.log('prod evn: ', env);
  console.log('---------------');
  return webpackMerge(baseConfig(env), {
    watch: false,
    watchOptions: {
      poll: 1000, // 轮询时间间隔
      aggregateTimeout: 500, // 防抖延迟
      ignored: /node_moudles/, // 忽略文件
    },
  });
}
```
### 配置说明 

- [配置文件](https://webpack.docschina.org/guides/production/)
