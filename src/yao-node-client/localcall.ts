import path from "node:path";
import fs from "fs";

/**
 * 动态的调用本地文件的方法，被调用的方法需要使用export
 * @param fpath js文件路径
 * @param name 方法名
 * @param params 参数
 * @returns 方法返回值
 */
export function CallLocalProcess(
  fpath: string,
  name: string,
  ...params: any[]
) {
  if (!fs.existsSync(fpath)) {
    throw Error(`调用的脚本不存在${fpath}`);
  }
  const method = GetMethodName(name);
  const module = require(fpath);
  if (!module[method]) {
    throw Error("调用的方法不存在或没有导出");
  }
  return module[method](...params);
}
export function GetMethodName(name: string) {
  let paths = name.split(".");
  if (paths.length < 2) {
    return "";
  }
  const tokens = paths.splice(-1, 1);

  const method = tokens[0];
  return method;
}
/**
 * 根据方法名判断是否存在脚本文件
 * @param name 调用的方法名
 * @returns undefind 或是文件名
 */
export function GetFileName(name: string) {
  let paths = name.split(".");
  if (!paths || paths.length < 3) {
    return;
  }
  if (!["scripts", "services", "studio"].includes(paths[0].toLowerCase())) {
    //不代理
    return;
  }
  paths.splice(-1, 1);
  let prefix = path.join("dist", "app");
  let config = process.env.LOCAL_DIST_APP_ROOT;
  if (typeof config === "string") {
    prefix = config;
  }
  let fname = paths.join(path.sep);

  let filePath = path.join(prefix, `${fname}.js`);
  let fpath = path.resolve(filePath);
  if (!fs.existsSync(fpath)) {
    console.log(`info:本地process文件不存在:${fname}`);
    console.log(`info:本地process文件不存在:${fpath}`);
    filePath = path.join(prefix, fname, "index.js"); // `dist/app/${fname}/index.js`;
    fpath = path.resolve(filePath);
    if (!fs.existsSync(fpath)) {
      console.log(`info:本地process文件不存在:${fname}/index.js`);
      console.log(`info:本地process文件不存在:${fpath}`);
      return;
    }
  }
  return fpath;
}
