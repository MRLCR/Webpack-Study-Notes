# webpack优化

## webpack4 生成环境自带优化

### [tree-shaking](https://webpack.docschina.org/guides/tree-shaking/) (使用import) 

当使用 es6 的 import 来获取模块时，webpack打包时会进行一个叫 tree-shaking 的操作，会去掉没有被调用的内容。

## noParse 忽略检查包是否含有别的依赖

注：仅当知道某个包不依赖其他外部模块时使用。

防止 webpack 解析那些任何与给定正则表达式相匹配的文件。忽略的文件中不应该含有 import, require, define 的调用，或任何其他导入机制。忽略大型的 library 可以提高构建性能。

### 配置代码

```json 
{
  module: {
    noParse: /jquery|lodash/,
  },
}
}
```

### 配置说明

-[noParse](https://webpack.docschina.org/configuration/module/#module-noparse)

## IgnorePlugin

依赖包中被匹配的路径将忽略引用

### 配置声明

```js
const webpack = require('webpack');
```

### 配置代码

```json
{
  plugins: [
    new webpck.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/, // 匹配(test)资源请求路径的正则表达式
      contextRegExp: /moment$/, //（可选）匹配(test)资源上下文（目录）的正则表达式
    })
  ]
}
```

### 配置说明

- [webpack.IgnorePlugin](https://webpack.docschina.org/plugins/ignore-plugin/)

## 配置动态链接库 dll

### 配置代码

#### 1. 声明链接库
配置一个单独的config文件用来编译库的代码， 例 webpack.library,config.js

```js
const path = require('path');
const webpack = require('webpack');

module.exports = () => {
  return {
    mode: 'production',
    entry: {
      react: ['react', 'react-dom'],
    },
    output: {
      filename: '_dll_[name].js',
      path: path.resolve(__dirname, 'dist/dll'),
      library: '_dll_[name]', // 将模块付给某个变量并暴露出来
    },
    plugins: [
      new webpack.DllPlugin({ // 声明动态链接库
        name: '_dll_[name]', // 暴露的模块名称
        path: path.resolve(__dirname, 'dist/dll', 'manifest.json'),
      }),
    ]
  }
}
```

#### 2. 编译生产环境的生成脚本
在 package.json 中提交脚本

```js
scripts: {
  //...
  "build:lib": "webpack --progress --config webpack.library.config.js",
}
```

#### 3. 在模板页中引用动态链接库
思考： 
  1. 这里手动配置感觉有点坑，感觉 HtmlWebpackPlugin 应该能做点什么。
  2. 这里应该同理可以直接使用cdn加载链接库，然后再webpack中配置忽略加载相关的依赖估计也可以。

```html
<script src="/dist/dll/_dll_react.js"></script>
```

#### 4. 在项目配置中加入引用

```js
plugins: [
  new webpack.DllReferencePlugin({
    manifest: path.resolve(__dirname, 'dist/dll', 'manifest.json'), // 引用动态链接库清单
  }),
]
```

### 配置说明

- [DllPlugin](https://webpack.docschina.org/plugins/dll-plugin/)

## 配置多进程打包

### 使用插件

happypack

#### 注
适合中大型项目，小型项目分配多个进程反而会减慢编译速度

### 配置代码

声明
```js
const HappyPack = require('happypack');
````

引用
```js
{
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_moudles/,
        use: 'happypack/loader?id=js',
      },
      {
        test: /\.css$/,
        use: 'happypack/loader?id=css',
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'js',
      loaders: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            plugins: [
              ["@babel/plugin-proposal-decorators", { "legacy": true }], //es7 decorators语法
              ["@babel/plugin-proposal-class-properties", { "loose" : true }], // es7 class 属性定义语法处理
              ["@babel/plugin-transform-runtime"], // js 高级语法支持和简单的优化
            ],
          }
        },
      ],
    }),
    new HappyPack({
      id: 'css',
      loaders: [
        'style-loader',
        'css-loader',
      ],
    }),
  ]
}
```

### 配置说明

-[happypack](https://github.com/amireh/happypack)

# 抽离公共代码

### 配置代码

```json
optimization: {
  splitChunks: { // 分割代码
    cacheGroups: { // 缓存组
      commons: { // 公共模块
        name: "commons",
        filename: 'commons.js',
        chunks: "initial",
        minSize: 0, // 抽离条件 最小代码内存空间大小
        minChunks: 2, // 抽离条件 最少重复次数
      },
      vendors: {
        name: 'vendor',
        priority: 1, // 优先级
        filename: 'vendor.js',
        test: /node_modules/,
        chunks: 'initial',
        minSize: 0,
        minChunks: 2,
      }
    }
  }
},
```

### 配置说明

- [splitChunks](https://webpack.docschina.org/configuration/optimization/#optimization-splitchunks)

# 懒加载

利用 es6 草案中的语法来实现

### 配置代码

添加 babel

```bash
yarn add @babel/plugin-syntax-dynamic-import -D
```

引用

```json
use: [
  {
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
      ],
      plugins: [
        ["@babel/plugin-syntax-dynamic-import"], // 支持import懒加载
      ],
    }
  },
]
```

### 配置说明

- [import](http://es6.ruanyifeng.com/#docs/module#import)
- [@babel/plugin-syntax-dynamic-import](https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import)

# 启用热替换模块

### 配置代码

```json
devServer: {
  hot: true,
},
```
```json
plugins: [
  new webpack.HotModuleReplacementPlugin(), // 热替换
],
```

### 配置说明

- [HotModuleReplacementPlugin](https://webpack.docschina.org/plugins/hot-module-replacement-plugin/)
