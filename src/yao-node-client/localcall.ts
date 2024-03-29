import path from "node:path";
import fs from "fs";

let ModuleCache: { [key: string]: any } = {};
let PathCache: { [key: string]: string } = {};
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
  if (method === "") {
    throw Error(`流程：${name}，调用的方法：${method}不合法`);
  }
  if (ModuleCache[name]) {
    return ModuleCache[name][method](...params);
  }
  const module = require(fpath);
  if (!module[method]) {
    throw Error(`流程：${name}，调用的方法：${method}不存在或没有导出！`);
  }
  ModuleCache[name] = module;
  PathCache[name] = fpath;

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
  if (PathCache[name]) {
    return PathCache[name];
  }
  let paths = name.split(".");
  if (!paths || paths.length < 3) {
    return;
  }
  if (
    !["scripts", "services", "studio", "widgets"].includes(
      paths[0].toLowerCase()
    )
  ) {
    //不代理
    return;
  }
  //不需要方法名
  paths.splice(-1, 1);
  let dir = path.join("dist", "app");

  if (process.env.LOCAL_APP_ROOT) {
    dir = process.env.LOCAL_APP_ROOT;
  }

  // if not exists ,fallback to current directory
  if (!fs.existsSync(dir)) {
    dir = "./";
  }
  //脚本路径
  let fname = paths.join(path.sep);
  let filePath = path.join(dir, `${fname}.js`);
  if (paths[0].toLowerCase() === "widgets") {
    //widget是固定的process.js
    filePath = path.join(fname, "process.js");
  }

  let fpath = path.resolve(filePath);
  if (!fs.existsSync(fpath)) {
    console.log(`info:本地process文件不存在:${fname}`);
    console.log(`info:本地process文件不存在:${fpath}`);
    filePath = path.join(dir, fname, "index.js"); // `dist/app/${fname}/index.js`;
    fpath = path.resolve(filePath);
    if (!fs.existsSync(fpath)) {
      console.log(`info:本地process文件不存在:${fname}/index.js`);
      console.log(`info:本地process文件不存在:${fpath}`);
      return;
    }
  }
  return fpath;
}
