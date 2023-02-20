import { CallLocalProcess } from "./localcall";
import RemoteRequest from "./request";
import fs from "fs";
import path from "path";

export function CheckIsLocalProcessFilePath(name: string) {
  let paths = name.split(".");
  //有一些内部的process,比如Concat
  if (!paths || !paths.length) {
    return false;
  }
  if (!["scripts"].includes(paths[0])) {
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

/**
 * YAO Process处理器代理
 * @param {string} method 处理器名称
 * @param  {...any} args 参数
 * @returns
 */
export function Process(method: string, ...args: any[]) {
  // if (method.startsWith("scripts.")) {
  let obj = CheckIsLocalProcessFilePath(method);
  if (obj) {
    return CallLocalProcess(obj.fpath, obj.method, ...args);
  }

  return RemoteRequest({ type: "Process", method: method, args });
}
function testProcess() {
  Process("utils.fmt.Print", "hello");
}

// testProcess();
function testProcess2() {
  let res = Process("utils.str.Concat", "hello", "World");
  console.log(res);
}
