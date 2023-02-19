import path from "path";
import fs from "fs";

export function CallProcess(fpath: string, method: string, ...params: any[]) {
  // console.log(fpath);
  const module = require(fpath);
  if (!module[method]) {
    throw Error("调用的方法不存在或没有导出");
  }
  return module[method](...params);
}

export function CheckFilePath(name: string) {
  let paths = name.split(".");
  if (!paths || !paths.length) {
    throw Error("非法的Process名称");
  }
  if (!["scripts", "services", "studio"].includes(paths[0])) {
    //不代理
    return false;
  }

  if (paths.length < 2) {
    throw Error("错误的流程名称");
  }
  const tokens = paths.splice(-1, 1);

  const method = tokens[0];
  const fname = paths.join(path.sep);
  // console.log(tokens, paths);

  const filePath = `dist/app/${fname}.js`;
  const fpath = path.resolve(filePath);
  if (!fs.existsSync(fpath)) {
    return false;
  }
  return { fpath, method };
}

// function main() {
//   console.log("hello");

//   let script = "scripts.sub.demo.Main";
//   return process(script, "hello", "world");
// }
// main();
