import { CallLocalProcess } from "./localcall";
import RemoteRequest from "./request";
import fs from "fs";
import path from "path";

export function CheckIsLocalStudio(name: string) {
  let paths = name.split(".");
  if (!paths || !paths.length) {
    throw Error("非法的Process名称");
  }

  if (paths.length < 2) {
    throw Error("错误的流程名称");
  }
  const tokens = paths.splice(-1, 1);

  const method = tokens[0];
  const fname = paths.join(path.sep);
  // console.log(tokens, paths);

  const filePath = `dist/app/studio/${fname}.js`;
  const fpath = path.resolve(filePath);
  if (!fs.existsSync(fpath)) {
    return false;
  }
  return { fpath, method };
}

export function Studio(method: string, ...args: any[]) {
  let obj = CheckIsLocalStudio(method);
  if (obj) {
    return CallLocalProcess(obj.fpath, obj.method, ...args);
  }
  return RemoteRequest({ type: "Studio", method: method, args });
}
