const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HappyPack = require('happypack');

const config = (env) => {
  return {
    entry: './src/index.js',
    output: {
      filename: 'bundle.js', 
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_moudles/,
          use: [
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
                  ["@babel/plugin-syntax-dynamic-import"], // 支持import懒加载
                ],
              }
            },
          ],
          // use: 'happypack/loader?id=js',
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
          ],
          // use: 'happypack/loader?id=css',
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
      }),
      new webpack.BannerPlugin('Author: LinChuran'),
      new webpack.DefinePlugin({
        ENV: JSON.stringify(env),
      }),
      // new webpack.DllReferencePlugin({
      //   manifest: path.resolve(__dirname, 'dist/dll', 'manifest.json'), // 引用动态链接库清单
      // }),
      // new HappyPack({
      //   id: 'js',
      //   loaders: [
      //     {
      //       loader: 'babel-loader',
      //       options: {
      //         presets: [
      //           '@babel/preset-env',
      //           '@babel/preset-react',
      //         ],
      //         plugins: [
      //           ["@babel/plugin-proposal-decorators", { "legacy": true }], //es7 decorators语法
      //           ["@babel/plugin-proposal-class-properties", { "loose" : true }], // es7 class 属性定义语法处理
      //           ["@babel/plugin-transform-runtime"], // js 高级语法支持和简单的优化
      //         ],
      //       }
      //     },
      //   ],
      // }),
      // new HappyPack({
      //   id: 'css',
      //   loaders: [
      //     'style-loader',
      //     'css-loader',
      //   ],
      // }),
    ],
    resolve: { // 配置解析第三方包规则
      modules: [path.resolve(__dirname, 'node_modules')], // 解析根路径
      extensions: ['.js', '.vue', '.json'], // 默认添加的扩展名
      mainFields: ['style', 'main'], // 导入模块时, 决定在package.json中使用哪个字段导入模块
      // alias: { // 配置引用别名
      //   xxxCss: 'xxx/dist/css/xxx.css',
      // },
    },
  }
}

module.exports = config;
