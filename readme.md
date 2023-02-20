# 使用 typescript 开发 yao 脚本

## yao 本地 js 文件调试

yao 在调用 js 脚本时会自动的插入一些 yao 引擎特有的 js 对象。比如 Process,Query，这些在 nodejs 里是没有的。如果我们直接使用 nodejs 直接去调用 js 脚本，遇到这些 yao 对象时，nodejs 就会报错，提示找不到这些对象。

想到的解决方法就是使用远程调用 api 的方法模拟出函数调用。

在 yao 服务端建立一个代理**服务端**。在 nodejs 环境里建立代理**客户端**。当在 nodejs 调用 yao 对象时，会远程调用 yao 服务端的 api 接口，并返回最终的值。

代理客户端 <<======>> 代理服务端。

## 功能实现

1 创建新的一个 nodejs 的开发环境，或是在现有的 nodejs 开发环境里升级。

```sh
cd scripts
npm init
npm i sync-fetch
```

### 服务器端

创建 yao 引擎 的 jsapi 服务器端代理处理程序。

把 jsProxy.js 放在 scripts 目录下，它的作用是充当 jsapi 的本地代理，提供给远程调用一个统一的处理入口。这里并不会作太多的数据检查，因为它是与客户端有协议的，对于的必要数据对象都需要在客户端填充。

这里一定要使用 js 脚本，而不是 ts 脚本，yao 并不直接支持 ts。

```js
/**
 * yao本地js api代理
 * @param {object} payload
 * @returns
 */
function Server(payload) {
  const type = payload.type;
  const method = payload.method;
  const args = payload.args;
  const space = payload.space; //"dsl","script","system"
  switch (type) {
    case "Process":
      let localParams = [];
      if (Array.isArray(args)) {
        localParams = args;
      } else {
        localParams.push(args);
      }
      return Process(method, ...localParams);
    case "Query":
      const query = new Query();
      return query[method](args);
    case "FileSystem":
      const fs = new FS(space);
      return fs[method](...args);
    case "Store":
      const cache = new Store(space);
      if (method == "Set") {
        return cache.Set(payload.key, payload.value);
      } else if (method == "Get") {
        return cache.Get(payload.key);
      }
    case "Http":
      return http[method](...args);
    case "Log":
      // console.log("Log args:", args);
      log[method](...args);
      return {};
    case "WebSocket":
      //目前yao只是实现了push一个方法，也是ws服务连接后push一条信息
      const ws = new WebSocket(payload.url, payload.protocols);
      if (method == "push") {
        ws.push(payload.message);
        return {};
      }
    case "Translate":
      return $L(payload.message);
    default:
      break;
  }
  throw new Exception("操作未支持", 404);
}
```

### 配置 api 接口

在 apis 目录下新增一个 api 配置，用于调用本地代理。所有的代理对象的调用都会通过这个接口进行流转

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

### 客户端

#### ts 开发环境准备

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
    "module": "commonjs", //指定生成哪个模块系统代码
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

其它依赖:

- @types/node 基础的 ts 类型
- nodemon 用于自动监测源文件的变动
- ts-node 用于直接自动编译执行 ts-node
- dotenv 解析环境变量文件.env
- tsc-alias tsc 别名引用问题
- tsconfig-paths ts-node 别名引用问题

```
pnpm i -D @types/node nodemon  ts-node
pnpm i dotenv
pnpm i -D tsc-alias
pnpm i -D concurrently
pnpm i -D tsconfig-paths
```

### vscode 调试使用

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

### 代理客户端

客户端的代码写在 src/client/index.ts 文件中。其中的函数定义都是对远程 yao jsapi 接口封装。导出以下几个对象,名称与在 yao 引擎的定义保持一致。

```ts
export { Process, http, Query, FS, Store, log, Exception, WebSocket, $L };
```

调试 yao 处理器 ts 脚本
在需要调试的 ts 脚本的头部分插入以下代码,这样 yao 的特定对象就可以在 nodejs 的环境中使用。

```ts
import {
  Process,
  http,
  FS,
  Query,
  Store,
  Exception,
  log,
  WebSocket,
  $L,
} from "../yao-client";
```

**注意：**
在调试过程中，代理的对象需要远程访问 yao 的服务器，所以需要在测试之前需要先启用 yao 服务器，在你的 yao 目录下执行:

```sh
yao start
```

### ts 代码开发测试

本质上与一般的 ts 开发是一样的。

在 src/app 目录下使用 ts 进行代码编写。scripts/services/studio 对应 yao 应用的目录结构.

### 运行

由于上面已经配置了 vscode 的运行调试配置，可以直接使用 vscode 的运行调试功能。

也可以在 package.json 里配置其它的执行命令。

```json
"scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/scripts/myscript.ts",
    "myscript": "pnpm run build  && ts-node src/scripts/myscript.ts",
    "build": "tsc",
    "run": "node dist/index.js",
    "build_lib": "tsc --module esnext",
    "build_yao": "rm -rf yao && tsc -p ./tsconfig-yao.json",
    "esbuild": "node build.js"
  }
```

```sh
# 编译执行特定的脚本
pnpm run myscript
```

## 单元测试

设置单元测试(https://www.testim.io/blog/typescript-unit-testing-101/)

安装必要的依赖

```sh
pnpm i -D jest ts-jest @types/jest
```

jest 测试配置 jest.config.js

```js
module.exports = {
  transform: { "^.+\\.ts?$": "ts-jest" }, //告诉 Jest 使用 ts-jest 预处理器来编译 TypeScript 文件。
  testEnvironment: "node", //告诉 Jest 在 Node 环境中运行测试。
  testRegex: "/tests/.*\\.(test|spec)?\\.(ts|tsx)$", //指定了 Jest 用于识别测试文件的 regex。
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"], //这是 Jest 用于查找测试文件的文件扩展名数组。
  coverageDirectory: "./coverage/", //这是 Jest 输出覆盖率信息的目录。
  collectCoverage: true, //这表明 Jest 是否应该收集覆盖率信息
};
```

更新 package.json

```json
"scripts":{
  "test": "jest"
}
```

## 编译生成

把 ts 代码转换成 js 脚本。

tsc 编译使用配置 module:commonjs 会对编译后的 js 代码作了格式转换，这并不是我们想要的结果。所以在最后编译 yao js 脚本时需要把 tsc 参数 module 需要设置成 esnext 或是 es2020。生成的 js 文件格式是我们想要的。

编译后，可以在 dist/app 目录找到生成的文件。

- 编译出 js 文件

```sh
pnpm run build_yao
```

- 使用 rollup 打包，rollup 可以自动的优化代码，没有引用的代码不会引用。

```sh
pnpm i -D rollup

#比较实用的插件
pnpm i -D rimraf deepmerge

# resolve
pnpm i -D @rollup/plugin-node-resolve
# commonjs
pnpm i -D @rollup/plugin-commonjs
# ts
pnpm i -D @rollup/plugin-typescript
# 别名
pnpm i -D @rollup/plugin-alias
# json 包含
pnpm i -D @rollup/plugin-json
```

rollup 配置文件，配置文件中需要剔除对 yao-proxy 的引用。

```js
export default {
  。。。
  external: [/.*yao-node-client$/], //yao的代理客户端不要打包
};
```

- 另外一个选择是使用 esbuild 进行合并，

需要安装插件

```sh
pnpm i -D esbuild
pnpm i -D esbuild-plugin-ignore
pnpm i -D glob
```

配置构建脚本 build.mjs,在配置中输入需要外部引用的包名称

```js
esbuild
  .build({
      。。。
      external: ["*/yao-node-client"],
  }
```

```sh

#使用参数
"esbuild"：ts-node build.mjs -i scripts/rollup/index.js -o scripts/rollup/index.dist.js",

pnpm run esbuild

```

- 在文件中注释对代理对象的引用

使用脚本修正脚本中的引用 import 与导出 export

```sh
pnpm run fix:export
```

- 注释 import 语句，yao 只支持单文件
- 在文件中删除所有的 export 关键字

- 把 dist/app 目录下的文件复制到 yao 应用的对应的目录下。

```sh
├── dist
│   ├── app
│   │   ├── scripts
│   │   │   ├── myscript.js
│   │   │   ├── script2.js
│   │   │   └── sub
│   │   │       ├── demo.js
│   │   ├── services
│   │   │   ├── foo.js
│   │   └── studio
│   │       ├── hello.js
```

## 支持哪些调用

- 语言翻译,可以直接使用$L 函数，注意在开发环境语言配置文件\*.yml 的修改不会自动重载，需要重启 yao 应用
- http 对象
- log 对象
- Exception 对象
- Query 类定义
- Store 类定义
- Process 函数
- FS 类定义
- WebSocket 定义

## Process 的开发本地调用

services/scripts/studio 目录的脚本优先调用开发目录的对象，不会进行远程调用。
比如 scripts/目录下有两个脚本 scripts/a.ts,scripts/b.ts,在 a.ts 调用 Process("scripts.b.fun1")时，会直接调用 scripts/b.ts 中的 fun1 函数

## 在 vscode 调试 esm 模块的第二种方法

设置 node 的运行参数,在 launch.json 配置文件里设置 `runtimeArgs -r esm` ,node 可以调用 esm 模块，但是在调试中 console.log 失效，无法显示内容,需要设置另外一个参数`"console": "integratedTerminal"`,

.vscode/launch.json

```json
"preLaunchTask": "tsc: build",
"console": "integratedTerminal",
"runtimeArgs": [
            "-r",
            "esm"
           ]
```

tsconfig.json 设置`module:ESNext`也不影响操作，对调试会有影响，加了中间层，断点会进入 esm 模块。

```
"compilerOptions": {
    "module": "ESNext",
    "sourceMap": true,
    "outDir": "dist",
  }
```

## yao 脚本编写

在 yao 中，基本上每一个 js 文件都是独立的功能点。脚本与脚本之间不能使用 import 或是 require 的方式进行引用。如果在一个脚本中需要引用别的脚本，需要使用 Process("scripts.script1.Fun")的方式进行调用。
