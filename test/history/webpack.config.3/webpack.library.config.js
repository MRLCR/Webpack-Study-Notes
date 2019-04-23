const path = require('path');
const webpack = require('webpack');

const libraryConfig = () => {
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
      new webpack.DllPlugin({
        name: '_dll_[name]', // 暴露的模块名称
        path: path.resolve(__dirname, 'dist/dll', 'manifest.json'),
      }),
    ]
  }
}

module.exports = libraryConfig;
