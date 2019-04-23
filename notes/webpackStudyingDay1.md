# 简介
[webpack](https://www.webpackjs.com/concepts/) 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)

# 背景

## 版本
* webpack 4.x
* webpack-cli 3.x
* webpack-dev-server 3.x

## 主要参考网站
- [webpack中文网](https://www.webpackjs.com/)
- [npm](https://www.npmjs.com/)
- [babel](https://babeljs.io/)

# 基础配置

## 添加依赖

```bash
yarn add -D webpack webpack-cli webpack-dev-server
```

## 配置代码
```js
const config = {
  mode: 'development', // development or production
  entry: './src/entry.js',
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: 'xxx.xx.com', // 公共前缀
  },
}
module.exports = config
````

## 配置说明
- [mode](https://www.webpackjs.com/concepts/mode/) 编译模式，暂时只有 development 和 production
- [entry](https://www.webpackjs.com/concepts/entry-points/) 入口文件，添加需要打包的模块。支持多入口，本地模块和第三方模块分离等操作。
- [output](https://www.webpackjs.com/concepts/output/) 出口文件，控制webpack如何向硬盘写入编译文件（有且只有一个出口）

# Html插入

### 添加依赖

```bash
yarn add -D html-webpack-plugin
```

### 配置声明
```js
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html插件
```

### 配置代码
```js
plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // 模板html路径
      filename: 'index.html', // 输出文件名字
      minfiy: { // 优化
        removeAttributeQuotes: true, // 去除双引号
      },
      hash: true, // 文件hash
    }),
]
```

### 配置说明
- [plugins](https://www.webpackjs.com/concepts/plugins/)
- [HtmlWebpackPlugin](https://www.npmjs.com/package/html-webpack-plugin)

# 样式处理

## css基础处理

### 添加依赖

基础
```bash
yarn add -D style-loader css-loader
```

### 配置代码
说明： rules、use中规则从下到上，从右到左依次执行 先后顺序不当会报错
```js
module: {
  rules: [
    {
      test: /\.css$/,  // 匹配css文件
      use: [
        'style-loader', // 将文件插入到 html 的 head 标签内
        'css-loader', // 处理css文件中@import引用其他文件
      ]
    },
  ]
}
```

### 配置说明

- [module](https://www.webpackjs.com/concepts/modules/)
- [style-loader](https://www.npmjs.com/package/style-loader)
- [css-loader](https://www.npmjs.com/package/css-loader)

## less/sass/stylus
以less为例

### 添加依赖

```bash
yarn add -D less less-loader
```

### 配置代码

```js
module: {
  rules: [
    {
      test: /\.less$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader', // postcss-loader 需要在 css-loader之前处理
        'less-loader',
      ]
    },
  ]
}
```

### 配置说明

- [less](https://www.npmjs.com/package/less)
- [less-loader](https://www.npmjs.com/package/less-loader)

## 优化加强

- 统一抽离css到单独文件
- 自动补全适配前缀

### 添加依赖

```bash
yarn add -D postcss-loader autoprefixer
```

```bash
yarn add -D mini-css-extract-plugin
```

### 配置声明

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离css样式到统一文件
```

### 配置代码
```js
module: {
  rules: [
    {
      test: /\.css$/,  // 匹配css文件
      use: [
        MiniCssExtractPlugin.loader, // 使用插件抽离css，也可直接使用 style-loader 将样式插入<head>中
        'css-loader', // 处理css文件中@import引用其他文件
        'postcss-loader', // 转化成postcss 借助此来方便自动补全 注：需要在 css-loader之前处理
      ]
    },
  ]
}
```

### 添加配置文件
文件名：postcss.config.js

内容
```js
module.exports = {
  plugins: [require('autoprefixer')],
}
```

### 配置说明

- [postcss-loader](https://www.npmjs.com/package/postcss-loader)
- [autoprefixer](https://www.npmjs.com/package/autoprefixer)
- [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin)


# JS处理

## es6 降级处理

### 添加依赖

```bash
yarn add -D babel-loader @babel/core @babel/preset-env
```

```bash
yarn add -D babel-loader babel-preset-env
```

### 配置代码

```js
module: {
  rules: [
    {
      test: /\.js$/, // 匹配js文件
      include: path.resolve(__dirname, 'src'), // 仅包含src下的文件
      exclude: /node_modules/, // 剔除依赖包
      use: {
        loader: 'babel-loader',
        options: {
          presets: [ // 预设处理
            '@babel/preset-env', // es语法处理
          ],
        }
      },
    },
  ]
}
```

### 配置说明

- [babel-loader](https://www.npmjs.com/package/babel-loader)
- [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)
- [babel-preset-env](https://www.npmjs.com/package/babel-preset-env)

## es7+ 高版本语法支持

### 添加依赖

```bash
yarn add -D uglifyjs-webpack-plugin
```

```bash
yarn add -D @babel/plugin-proposal-decorators
```

```bash
yarn add -D @babel/plugin-proposal-class-properties
```

```bash
yarn add -D @babel/plugin-proposal-class-properties
```

### 配置声明

```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // js 优化压缩
```

### 配置代码

```js
{
  test: /\.js$/,
  include: path.resolve(__dirname, 'src'),
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env', // es语法处理
      ],
      plugins: [
        ["@babel/plugin-proposal-decorators", { "legacy": true }], //es7 decorators语法
        ["@babel/plugin-proposal-class-properties", { "loose" : true }], // es7 class 属性定义语法处理
        ["@babel/plugin-transform-runtime"], // js 高级语法支持和简单的优化
      ]
    }
  },
},
```

```js
plugins: [
  new MiniCssExtractPlugin({
    filename: 'css/main.[hash:8].css', // 统一放在css文件夹下
    hash: true,
  }),
]
```

### 配置说明

- [@babel/plugin-proposal-decorators](https://www.npmjs.com/package/@babel/plugin-proposal-decorators)
- [@@babel/plugin-proposal-class-properties](https://www.npmjs.com/package/@babel/plugin-proposal-class-properties)
- [@babel/plugin-transform-runtime](https://www.npmjs.com/package/@babel/plugin-transform-runtime)
- [@uglifyjs-webpack-plugin](https://www.npmjs.com/package/uglifyjs-webpack-plugin)

## 添加全局变量
这里采用每个模块默认注入的方式，而不使用暴露模块到全局的操作

### 加载依赖

```bash
yarn add -D webpack webpack-cli
```

### 配置声明

```js
const webpack = require('webpack');
```

### 配置代码
注：以lodash库为例，请自行添加依赖
```js
plugins: [
  new webpack.ProvidePlugin({ // 每个模块中注入 _ 代表 lodash
    _: 'lodash',
  }),
],
```

### 配置说明

- [ProvidePlugin](https://www.webpackjs.com/plugins/provide-plugin)

# 图片处理
这里根据图片大小做了区分处理，大图引用图片静态资源，小图直接转 base64 到文件中

## 加载依赖

```bash
yarn add -D file-loader url-loader
```

## 配置代码

```js
{
  test: /\.(png|jpg|jpeg|gif)$/,
  use: [
    {
      loader: 'url-loader',
      options: {
        limit: 10 * 1024, // 设置图片限制，超过的使用 file-loader 加载 未超过的转base加载到
        outputPath: 'img/', // 输出到一个文件夹中
        // publicPath: 'xxx.xx.com.cn', // 公共前缀 用于cdn引用等
      }
    }
  ]
},
```

## 配置说明

- [file-loader](https://www.npmjs.com/package/file-loader)
- [url-loader](https://www.npmjs.com/package/url-loader)
