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
pnpm i -D glob

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

rollup.config.mjs

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
