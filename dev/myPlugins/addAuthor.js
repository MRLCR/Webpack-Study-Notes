const fs = require('fs');
const path = require('path');

class Plugin_AddAuthor{
  constructor(name) {
    if(typeof name === 'undefined'){
      throw Error('Plugin_AddAuthor init need a name');
    }
    this.name = name;
  }
  apply(compiler) {
    const {
      name,
    } = this;
    compiler.hooks.done.tap('addName', () => {
      fs.writeFileSync(path.join(compiler.config.output.path, '/author.txt'), name);
    });
  }
}

module.exports = Plugin_AddAuthor;
