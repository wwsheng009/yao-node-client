
## 功能实现

1 创建新的一个 nodejs 的开发环境，或是在现有的 nodejs 开发环境里升级。

```sh
pnpm init
```

### 服务器端

创建 yao 引擎 的 jsapi 服务器端代理处理程序。

把 jsProxy.js 放在 scripts 目录下，它的作用是充当 jsapi 的本地代理，提供给远程调用一个统一的处理入口。这里并不会作太多的数据检查，因为它是与客户端有协议的，对于的必要数据对象都需要在客户端填充。

这里一定要使用 js 脚本，而不是 ts 脚本，yao 并不直接支持 ts。

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

### 将 npm 包文件引入项目

在项目 A 的根目录下使用 pnpm link --global 命令将 npm 包模块注册到全局，在全局的 node_modules 目录下会出现当前包所在项目的快捷方式引用。
在项目 B 的根目录下使用 pnpm link --global yao-node-client 命令将包关联到项目中，然后正常使用即可。

### 从项目中解除 pnpm 包文件

在 项目 A 的根目录下使用 pnpm unlink --global 命令解除项目与全局的关联。
在 项目 B 的根目录下使用 pnpm unlink yao-node-client 命令解除项目与本地 npm 包的关联。

### 目录

- dist 开发 ts 时自动生成 commonjs 调试时用的，nodejs 并不直接支持 esm。
- dist_esm 目录是生成 esm 目录时用的，生成 yao 需要的 js 格式。
- yao 是 rollup 打包生成文件后用的，合并多个文件，如果 dist_esm/src/app 目录下有 index.js，会自动的合并到对应的目录/yao/app 下。
