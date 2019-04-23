(function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {

    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    module.l = true;

    return module.exports;
  }

  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
({

  "./src/a.js":
  (function(module, exports, __webpack_require__) {
    eval("const { name } = __webpack_require__(/*! ./base/index.js */ \"./src/base/index.js\");\n\nmodule.exports = \"hello, \" + name;\n\n\n//# sourceURL=webpack:///./src/a.js?");
  }),

  "./src/base/index.js":
  (function(module, exports) {
    eval("\nconst name = 'linchuran';\n\nmodule.exports = { name };\n\n//# sourceURL=webpack:///./src/base/index.js?");
  }),

  "./src/index.js":
  (function(module, exports, __webpack_require__) {
    eval("const  str = __webpack_require__(/*! ./a.js */ \"./src/a.js\");\n\nconsole.log(str);\n\n//# sourceURL=webpack:///./src/index.js?");
  })

});