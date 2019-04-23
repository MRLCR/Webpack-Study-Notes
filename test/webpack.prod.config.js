const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base.config');

const prodConfig = (env) => {
  console.log('---------------');
  console.log('prod evn: ', env);
  console.log('---------------');
  return webpackMerge(baseConfig(env), {
    mode: 'production',
    // watch: true,
    // watchOptions: {
    //   poll: 1000, // 轮询时间间隔
    //   aggregateTimeout: 500, // 防抖延迟
    //   ignored: /node_moudles/, // 忽略文件
    // },
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
  });
}

module.exports = prodConfig;
