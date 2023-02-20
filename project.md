## yao-ts 项目配置

###

```sh
pnpm init
pnpm i typescript -D
pnpm i -D @types/node nodemon  ts-node
pnpm i dotenv
pnpm i -D tsc-alias
pnpm i -D concurrently
pnpm i -D tsconfig-paths

pnpm exec tsc --init --rootDir src --outDir dist

```

typescript 配置 tsconfig.json

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

配置 vscode 编辑器的 launch.json

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

vscode tasks.json

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

使用 rollup 打包

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

重要,链接 yao-node-client

```
pnpm link --global yao-node-client
```

配置 rollup 配置文件 rollup.config.mjs

```js

```

创建必要的目录

```sh
mkdir -p src/app/scripts
mkdir -p src/app/services
mkdir -p src/app/studio

#存放yao的配置
mkdir -p server/scripts
mkdir -p server/apis
```

配置 server 的代理与 api 服务
server/apis/proxy.http.json
server/scripts/jsproxy.js

package.json

```json
"scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec 'ts-node' -r tsconfig-paths/register src/app/scripts/myscript.ts",
    "run": "pnpm run build  && ts-node -r tsconfig-paths/register src/app/scripts/myscript.ts",
    "build": "tsc && tsc-alias",
    "build:watch": "concurrently --kill-others \"tsc -w\" \"tsc-alias -w\"",

  }
```
