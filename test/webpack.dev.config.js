const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

const devConfig = (env) => {
  return webpackMerge(baseConfig(env), {
    mode: 'development',
    // 生成一个独立的源代码映射文件
    // 1. source-map 单独文件，代码关联到源文件
    // 2. eval-source-map  集成在 js 文件中  代码关联到源文件
    // 3. cheap-source-map 单独文件 代码关联到编译文件
    // ...
    devtool: 'eval-source-map',
    devServer: {
      // before(app) {// 请求拦截，返回默认数据
      //   app.get('/api/user', (req, res) => {
      //     res.json({ name: 'mock linchuran'});
      //   });
      // },
      // proxy: {
      //   // 配置代理
      //   '/api': {
      //     target: 'http://localhost:8888/',
      //     pathRewrite: {'/api': ''},
      //   }
      // }
      open: true,
      hot: true,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(), // 热替换
    ],
  });
}

console.log(devConfig.plugins);

module.exports = devConfig;
