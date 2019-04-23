module.exports = function(sourceCode) {
  return `
    const style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(sourceCode)}
    document.head.appendChild(style);
  `
}