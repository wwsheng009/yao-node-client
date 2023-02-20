import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";

import glob from "glob";
import { fileURLToPath } from "node:url";

const __dirname = path.resolve();

// 命令行定义环境变量，在脚本中可以直接获取
console.log(process.env.TEST);

export default {
  input: Object.fromEntries(
    glob.sync("dist/app/**/index.js").map((file) => [
      // This remove `src/` as well as the file extension from each
      // file, so e.g. src/nested/foo.js becomes nested/foo
      path.relative(
        "dist/app",
        file.slice(0, file.length - path.extname(file).length)
      ),
      // This expands the relative paths to absolute paths, so e.g.
      // src/nested/foo becomes /project/src/nested/foo.js
      fileURLToPath(new URL(file, import.meta.url)),
    ])
  ),
  output: {
    // file: "./dist/app/scripts/rollup/index.esm.js",
    // format: "esm",
    sourcemap: false,
    format: "es",
    dir: "yao",
  },

  plugins: [
    nodeResolve({ preferBuiltins: true }),
    json(),
    //路径别名
    alias({
      entries: [
        {
          find: "@",
          replacement: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    // typescript({ module: "esnext" }),
    commonjs({ include: "node_modules/**" }),
  ],
  external: [/.*yao-node-proxy-client$/], //yao的代理客户端不要打包
};
