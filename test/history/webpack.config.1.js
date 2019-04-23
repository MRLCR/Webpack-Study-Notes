// webpack base config

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 自动生成html
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽离css样式到统一文件
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // js 优化压缩
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin'); // css 优化压缩插件

const config = {
  mode: 'development', // development or production
  entry: './src/entry.js',
  output: {
    filename: 'bundle.[hash:8].js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: 'xxx.xx.com', // 公共前缀
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: {
      //     loader: 'eslint-loader', // eslint校验
      //     options: {
      //       enforce: 'pre', // loader执行优先级 previous(提前) / post(滞后)
      //     }
      //   }
      // },
      {
        test: /\.(html|htm)$/,
        use: 'html-withimg-loader',
      },
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
            ],
          }
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader',
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minfiy: {
        removeAttributeQuotes: true,
      },
      hash: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/main.[hash:8].css',
      hash: true,
    }),
    new webpack.ProvidePlugin({ // 每个模块中注入 _ 代表 lodash
      _: 'lodash',
    }),
  ],
  devServer: {
    port: 8000,
    progress: true,
    contentBase: './dist',
    compress: true,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true, // 并行打包
        sourceMap: true, // 源码映射
      }),
      new OptimizeCssAssetsWebpackPlugin(),
    ]
  }
}

module.exports = config;