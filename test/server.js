const express = require('express');
const webpack = require('webpack');
const middle = require('webpack-dev-middleware');

const config = require('./webpack.config.js');

const compiler = webpack(config);

const app = express();

app.use(middle(compiler));

app.get('/api/user', (req, res) => {
  res.json({ name: 'linchuran' });
});

const server = app.listen(8888, () => {
  const host = server.address().address
  const port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
});