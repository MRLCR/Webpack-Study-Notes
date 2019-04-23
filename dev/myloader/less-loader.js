let less = require('less');

module.exports = function(sourceCode) {
  let css = '';
  less.render(sourceCode, (err, res) => {
    css = res.css;
  });
  // css = css.replace(/\n/g, "\\n");
  return css;
}