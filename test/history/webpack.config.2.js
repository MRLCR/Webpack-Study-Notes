const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = (env) => {

  console.log('------------');
  console.log('env: ', env);
  console.log('------------');

  return {
    mode: 'development',
    entry: './src/index.js',
    output: {
      filename: 'index.js', 
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_moudles/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { "legacy": true }], //es7 decorators语法
                ["@babel/plugin-proposal-class-properties", { "loose" : true }], // es7 class 属性定义语法处理
                ["@babel/plugin-transform-runtime"], // js 高级语法支持和简单的优化
              ],
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
          ]
        }
      ]
    },
    // 生成一个独立的源代码映射文件
    // 1. source-map 单独文件，代码关联到源文件
    // 2. eval-source-map  集成在 js 文件中  代码关联到源文件
    // 3. cheap-source-map 单独文件 代码关联到编译文件
    // ...
    devtool: 'eval-source-map',
    // watch: true,
    // watchOptions: {
    //   poll: 1000, // 轮询时间间隔
    //   aggregateTimeout: 500, // 防抖延迟
    //   ignored: /node_moudles/, // 忽略文件
    // },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new webpack.BannerPlugin('create 2019.04.14 by LinChuran'),
      new webpack.DefinePlugin({
        ENV: JSON.stringify(env),
      }),
    ],
    devServer: {
      before(app) {// 请求拦截，返回默认数据
        app.get('/api/user', (req, res) => {
          res.json({ name: 'mock linchuran'});
        });
      },
      proxy: {
        // 配置代理
        '/api': {
          target: 'http://localhost:8888/',
          pathRewrite: {'/api': ''},
        }
      }
    },
    resolve: { // 配置解析第三方包规则
      modules: [path.resolve(__dirname, 'node_modules')], // 解析根路径
      extensions: ['.js', '.vue'], // 默认添加的扩展名
      mainFields: ['style', 'main'], // 导入模块时, 决定在package.json中使用哪个字段导入模块
      alias: { // 配置引用别名
        xxxCss: 'xxx/dist/css/xxx.css',
      },
    },
  }
}

module.exports = config;
