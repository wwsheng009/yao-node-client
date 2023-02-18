# yao 本地 js 文件调试

yao 本身并不支持 js 文件的调试，这给开发造成不少的麻烦。

但是 js 脚本一般都是单文件，可以使用 nodejs 进行调试。脚本中可能会有 yao 一些特有的对象，比如 Process,Query，这些在 nodejs 里是没有的。

针对这些特定的 js 接口，使用 http 远程调用方式处理。

在项目目录下初始 nodejs 的项目 remote-debug,并安装 fetch 的同步 feth 插件 sync-fetch。

```sh
cd scripts
npm init
npm i sync-fetch
```

## server 与 client

### 服务器端

创建 yao 引擎 的 jsapi 服务器端代理处理程序。

把 jsProxy.js 放在 scripts 目录下，它的作用是充当 jsapi 的本地代理，提供给远程调用一个统一的处理入口。

### 客户端

客户端的代码写在 remote-debug/index.js 文件中。其中的函数定义都是对远程 yao jsapi 接口封装。导出以下几个对象,名称与在 yao 引擎的定义保持一致。

```js
exports.Process = Process;
exports.http = http;
exports.Query = Query;
exports.FS = FS;
exports.Store = Store;
```

## 配置 api 接口

在 apis 目录下新增一个 api 配置，用于调用本地代理

文件 apis/proxy.http.json

```json
{
  "name": "代理调试",
  "version": "1.0.0",
  "description": "代理调试本地yao js脚本",
  "group": "proxy",
  "guard": "",
  "paths": [
    {
      "guard": "-",
      "path": "/call",
      "method": "POST",
      "process": "scripts.jsProxy.Server",
      "in": [":payload"],
      "out": {
        "status": 200,
        "type": "application/json"
      }
    }
  ]
}
```

调试 yao 处理器 js 脚本
在需要调试的 js 脚本的头部分插入以下代码,这样 yao 的特定对象就可以在 nodejs 的环境中使用。

```js
const {
  Process,
  http,
  FS,
  Query,
  Store,
  Exception,
  log,
  WebSocket,
} = require("../yao-client");
```

在调试过程中，代理的对象需要远程访问 yao 的服务器，所以需要在测试之前需要先启用 yao 服务器

```sh
yao start
```

```sh
node test/testClient.js
```

功能测试成功后，把 js 脚本中的 YAO 对象引用行注释后再放到 yao 项目的 scripts 目录下

## 使用 typescript

安装 typescript 作为开发依赖，因为当我们部署 node 时，是将 ts 编译为 js 执行部署的。

```sh
pnpm i typescript -D

```

所有的 ts 项目必需在根目录设置配置文件 tsconfig.json 我们可以自动生成一些基本的设置

```sh
pnpm exec tsc --init --rootDir src --outDir dist
```

除此之外 tsconfig.json 还需要一些必要的设置

在开发阶段,module 设置成 commonjs,这个 nodejs 才能识别调用模块

```json
{
  "compilerOptions": {
    "module": "commonjs" //指定生成哪个模块系统代码
  }
}
```

在编译阶段，module 需要设置成 esnext 或是 es2020。这是因为需要把 ts 编译生成的 js 中的模块引入部分删除，使用 module:commonjs 会把 import 代码作了转换，这并不是我们想要的结果

```json
{
  "compilerOptions": {
    "module": "ESNext", //指定生成哪个模块系统代码
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "target": "es6", //目标代码类型
    "noImplicitAny": true, //在表达式和声明上有隐含的'any'类型时报错。
    "moduleResolution": "node",
    "sourceMap": true, //用于debug
    "outDir": "dist", //仅用来控制输出的目录结构
    "baseUrl": "."
  },
  "include": ["src/**/*"]
}
```

其它依赖

```
pnpm i -D @types/node nodemon  ts-node
pnpm i dotenv

```

## 运行

```json
"scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/scripts/myscript.ts",
    "myscript": "pnpm run build  && ts-node src/scripts/myscript.ts",
    "build": "tsc",
    "run": "node dist/index.js",
    "build_lib": "tsc --module esnext",
    "esbuild": "node build.js"
  }
```

## 调试

```sh
pnpm run myscript
```

## vscode 调试使用

配置 vscode 编辑器的 launch.json 配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${file}",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "cwd": "${workspaceFolder}",
      "outFiles": [
        //"sourceMap": true
        "${workspaceFolder}/dist/**/*.js"
      ]
    }
  ]
}
```

在文件 tasks.json 里配置一个前置编译任务，每次在 vscode 运行调试前会调用 package.json 中 scripts 的 build 脚本。

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "build",
      "group": "build",
      "problemMatcher": [],
      "label": "tsc: build - tsconfig.json",
      "detail": "tsc"
    }
  ]
}
```

## 编译生成

在 tsc 中指定参数 module=esnext，在 dist 目录找到生成的文件。
在文件中删除对代理 client 的引用
在文件中删除所有的 export 语句
复制到 yao 应用的/scripts 目录。

```sh
pnpm run build_lib
```
