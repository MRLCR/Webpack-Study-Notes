# 简介
JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，它会在内部构建一个 依赖图(dependency graph)，此依赖图会映射项目所需的每个模块，并生成一个或多个 bundle。(引用自官方解释)
其初衷是想达到 require everything, bundle everything 从而处理文件的模块依赖与内容转化，为项目预编译模块化提供工具支持。

## 优点

- 功能集成度高
- 功能完善，持续更新吸收别的项目的优点
- 社区活跃，生态链强，便于学习和团队项目中使用

### 缺点
只适用于模块化的项目

### loader

webpack 只能理解 JavaScript 和 JSON 文件。loader 让 webpack 能够去处理其他类型的文件，并将它们转换为有效 模块，以供应用程序使用，以及被添加到依赖图中

### plugin

loader 用于转换某些类型的模块，而插件则可以用于执行范围更广的任务。包括：打包优化，资源管理，注入环境变量。

# [版本更替](https://github.com/webpack/webpack/tags)

以下仅列举部分

## 3.0 -> 4.0

### 添加

- "mode" 模式必选，"development" 和 "production"，两个模式下均引入了一些默认配置和插件，默认是 "production"
- 可以本地导入导出处理json文件

### 删除
- 不支持 Node.js 4 版本，需要升级到更高版本

### 变化

- import() 始终返回命名空间对象, CommonJS模块包含在default属性中

## 2.0 -> 3.0

### 添加

- Tree shaking 可以剔除掉不适用的模块代码

# 同类型对比

[官方的同类型对比](https://www.webpackjs.com/comparison/)，感觉还是选择性客观的

## [glup](https://www.gulpjs.com.cn/)
Gulp 是一个基于流的自动化构建工具。它是一个 Task Runner, 主要工作就是负责管理一个个任务，但任务内容它则不参与。 

### 优点
1. 灵活好用

### 缺点
1. 集成度不高 需要配合使用

相同点： 都是工具，都能处理转化文件
不同点： 定位不同，webapck 注重项目的预编译模块化解决方案， 后者侧重于便捷的自动化执行任务流。

早期有 gulp-webpack 的npm包, 两者处于合作关系，后来被 npm srcipt + webapck 所取代, gulp 的功能被两者所分散

## [Rollup](https://www.rollupjs.com/guide/zh)
Rollup 是一个和 Webpack 很类似但专注于 ES6 的模块打包工具。 Rollup 的亮点在于能针对 ES6 源码进行 Tree Shaking 以去除那些已被定义但没被使用的代码，以及 Scope Hoisting 以减小输出文件大小提升运行性能。 然而 Rollup 的这些亮点随后就被 Webpack 模仿和实现。

### 差别：

#### 优点
1. 没有模块的加载、执行和缓存，速度快
2. 针对ES6源码做了抽象树的优化

#### 缺点
1. 出来的晚，功能不完善，社区生态链不完善
2. 不支持 Code Spliting

## 历史
在 Npm Script 时代，Web 开发要做的事情变多，流程复杂，自动化思想被引入，用于简化流程；
在 Gulp 时代开始出现一些新语言用于提高开发效率，流式处理思想的出现是为了简化文件转换的流程，例如将 ES6 转换成 ES5。
在 Webpack 时代由于单页应用的流行，一个网页的功能和实现代码变得庞大，Web 开发向模块化改进。

## 选择
1. 对大型项目提供了很好的基建支持
2. 社区生态好
