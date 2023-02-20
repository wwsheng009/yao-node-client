import { CallLocalProcess } from "./localcall";
import RemoteRequest from "./request";
import fs from "fs";
import path from "path";
import {
  arrayColumn,
  arrayPluck,
  arraySplit,
  arrayKeep,
  ArrayTree,
  arrayUnique,
  MapT,
  ArrayMapSet,
  ArrayMapSetMapStr,
} from "./array";

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
  let process = method.toLowerCase();
  if (["utils.str.concat", "xiang.helper.StrConcat"].includes(process)) {
    return args.join("");
  }
  if ("utils.str.join" == process) {
    return args[0].join(args[2]);
  }
  if ("utils.str.joinpath" == process) {
    return path.join(...args);
  }
  if (
    ["xiang.flow.sleep", "xiang.sys.sleep", "yao.sys.sleep"].includes(process)
  ) {
    var waitTill = new Date(new Date().getTime() + args[0]);
    while (waitTill > new Date()) {}
  }
  // Time
  if (method.startsWith("utils.now")) {
    return processTime(method, ...args);
  }
  // Tree
  if (method == "utils.tree.Flatten") {
    return processFlatten(...args);
  }

  // Map
  if (method.startsWith("utils.map") || method.startsWith("xiang.helper.map")) {
    return processMap(method, ...args);
  }

  // Array
  if (
    method.startsWith("utils.arr") ||
    method.startsWith("xiang.helper.array")
  ) {
    return processArry(method, ...args);
  }
  return RemoteRequest({ type: "Process", method: method, args });
}
function processTime(method: string, ...args: any[]) {
  const process = method.toLowerCase();
  if ("utils.now.date" == process) {
    let dateBj = new Date();
    const offset = dateBj.getTimezoneOffset();
    dateBj = new Date(dateBj.getTime() - offset * 60 * 1000);
    return dateBj.toISOString().split("T")[0];
  }
  if ("utils.now.datetime" == process) {
    let dateBj = new Date();
    const offset = dateBj.getTimezoneOffset();
    dateBj = new Date(dateBj.getTime() - offset * 60 * 1000);
    return dateBj.toISOString().slice(0, 19).replace("T", " ");
  }

  if ("utils.now.time" == process) {
    let dateBj = new Date();
    const offset = dateBj.getTimezoneOffset();
    dateBj = new Date(dateBj.getTime() - offset * 60 * 1000);
    return dateBj.toLocaleTimeString();
  }

  if ("utils.now.timestamp" == process) {
    return new Date().getTime() / 1000;
  }
  if ("utils.now.timestampms" == process) {
    return new Date().getTime();
  }
  return RemoteRequest({ type: "Process", method: method, args });
}
function processMap(method: string, ...args: any[]) {
  let process = method.toLowerCase();
  //参数1是object，参数2是key
  if (["xiang.helper.mapget", "utils.map.get"].includes(process)) {
    return args[0][args[1]];
  }
  //参数1是object，参数2是key,参数3是值
  if (["xiang.helper.mapset", "utils.map.set"].includes(process)) {
    args[0][args[1]] = args[2];
    return args[0];
  }
  //参数1是object，参数2是key
  if (
    ["xiang.helper.mapdel", "utils.map.del", "utils.map.delmany"].includes(
      process
    )
  ) {
    let [record, ...keys] = args as unknown as [
      {
        record: { [id: string]: object };
      }
    ];
    if (Array.isArray(keys)) {
      for (const key of keys) {
        delete record[key];
      }
      return record;
    }
  }

  //参数1是object
  if (["xiang.helper.mapkeys", "utils.map.keys"].includes(process)) {
    return Object.keys(args[0]);
  }
  //参数1是object
  if (["xiang.helper.mapvalues", "utils.map.values"].includes(process)) {
    return Object.values(args[0]);
  }
  if (["xiang.helper.maptoarray", "utils.map.array"].includes(process)) {
    let res = [] as { key: string; value: object }[];
    for (const key in args[0]) {
      res.push({
        key: key,
        value: args[0][key],
      });
    }
    return res;
  }

  return RemoteRequest({ type: "Process", method: method, args });
}

function processArry(method: string, ...args: any[]) {
  let process = method.toLowerCase();
  if (["xiang.helper.arrayget", "utils.arr.get"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return args[0][args[1]];
  }
  if (["xiang.helper.arrayindexes", "utils.arr.indexes"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return args[0].map((_v, indx) => indx);
  }

  //将多个数据记录集合，合并为一个数据记录集合
  if (["xiang.helper.arraypluck", "utils.arr.pluck"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return arrayPluck(args[0], args[1]);
  }

  //将多条数记录集合，分解为一个 columns:[]string 和 values: [][]interface{}
  if (["xiang.helper.arraysplit", "utils.arr.split"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return arraySplit(args[0]);
  }

  if (["xiang.helper.arraycolumn", "utils.arr.column"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return arrayColumn(args[0], args[1]);
  }

  if (["xiang.helper.arraykeep", "utils.arr.keep"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return arrayKeep(args[0], args[1]);
  }

  if (["xiang.helper.arraytree", "utils.arr.tree"].includes(process)) {
    if (!Array.isArray(args[0])) {
      throw Error("参数1必须是数组");
    }
    return ArrayTree(args[0], args[1]);
  }

  if (["xiang.helper.arrayunique", "utils.arr.unique"].includes(process)) {
    if (args.length !== 1) {
      throw new Error("参数错误");
    }
    if (Array.isArray(args[0])) {
      return arrayUnique(args[0]);
    }
    return args[0];
  }
  if (["xiang.helper.arraymapset", "utils.arr.mapset"].includes(process)) {
    const arr = args[0] as MapT[];
    if (arr) {
      return ArrayMapSet(arr, args[1], args[2]);
    } else {
      const arr2 = args[0] as MapT[];
      if (arr2) {
        return ArrayMapSetMapStr(arr2, args[1], args[2]);
      }
    }
    return args[0];
  }

  return RemoteRequest({ type: "Process", method: method, args });
}

// ProcessFlatten utils.tree.Flatten cast to array
function processFlatten(...args: any[]): any {
  if (args.length < 1) {
    throw new Error("参数错误");
  }
  const array: any[] = args[0];
  const option: { [key: string]: any } = args[1] || {};
  if (!option.hasOwnProperty("primary")) {
    option.primary = "id";
  }
  if (!option.hasOwnProperty("children")) {
    option.children = "children";
  }
  if (!option.hasOwnProperty("parent")) {
    option.parent = "parent";
  }

  return flatten(array, option, null);
}

function flatten(array: any[], option: { [key: string]: any }, id: any): any[] {
  const parent: string = `${option.parent}`;
  const primary: string = `${option.primary}`;
  const childrenField: string = `${option.children}`;
  const res: any[] = [];
  for (const v of array) {
    const row: { [key: string]: any } = v as { [key: string]: any };
    if (!row) {
      continue;
    }
    if (!(row instanceof Object)) {
      continue;
    }
    row[parent] = id;
    const children: any[] = row[childrenField] as any[];
    delete row[childrenField];
    res.push(row);

    if (children) {
      res.push(...flatten(children, option, row[primary]));
    }
  }
  return res;
}
