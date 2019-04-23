const path = require('path');
const AddAuthor = require('./myPlugins/addAuthor.js');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
  },
  resolveLoader: {
    modules: ['node_modules', path.resolve(__dirname, 'myloader')],
    moduleExtensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'banner-loader',
            options: {
              name: 'linchuran',
            }
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          // path.resolve(__dirname, 'myloader/style-loader.js'), // 注 我们的包工具和项目不在同一个根目录下
          // path.resolve(__dirname, 'myloader/less-loader.js'),
          'style-loader',
          'less-loader',
        ]
      }
    ]
  },
  // plugins: [
  //   new AddAuthor('linchuran'),
  // ],
}
