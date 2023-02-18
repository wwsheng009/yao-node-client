//用于nodejs 调试代理

//需要同步调用，方便调试
// cd scripts
// npm init
// npm i  sync-fetch

import { QueryDSL } from "@/types/dsl";
import fetch from "sync-fetch";
import WebSocketClient from "ws";
import { CallProcess, CheckFilePath } from "./local";

let apiKey = ""; //process.env.YAO_API_KEY;
let proxyServerUrl = ""; //process.env.YAO_PROXY_SERVER_URL; //"http://localhost:5199/api/proxy/call";

require("dotenv").config();
if (process.env.YAO_API_KEY) {
  apiKey = process.env.YAO_API_KEY;
}
if (process.env.YAO_PROXY_SERVER_URL) {
  proxyServerUrl = process.env.YAO_PROXY_SERVER_URL;
}

function RemoteRequest(payload: {
  type: string;
  method: string;
  params?: object;
  space?: string;
  key?: string;
  value?: object;
  message?: string;
}) {
  if (!proxyServerUrl || !proxyServerUrl.length) {
    throw new Error("代理地址为空，请配置环境变量YAO_PROXY_SERVER_URL");
  }
  const es = fetch(proxyServerUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  return es.json();
}

/**
 * YAO Process处理器代理
 * @param {string} method 处理器名称
 * @param  {...any} params 参数
 * @returns
 */
function Process(method: string, ...params: any[]) {
  if (method.startsWith("scripts.")) {
    let obj = CheckFilePath(method);
    if (obj) {
      return CallProcess(obj.fpath, obj.method, ...params);
    }
  }

  return RemoteRequest({ type: "Process", method: method, params });
}
function testProcess() {
  Process("utils.fmt.Print", "hello");
}

// testProcess();
function testProcess2() {
  let res = Process("utils.str.Concat", "hello", "World");
  console.log(res);
}

/**
 * Yao Query 查询引擎代理
 */
class Query {
  /**
   * 执行查询并返回数据记录集合
   *
   * query.Get({"select":["id"], "from":"user", "limit":1})
   *
   * @param {object} params 查询条件
   * @returns []Record
   */
  Get(params: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Get", params });
  }

  // Paginate  {
  // "items"`// 数据记录集合
  // "total"`// 总记录数
  // "next"` // 下一页，如没有下一页返回 -1
  // "prev"` // 上一页，如没有上一页返回 -1
  // "page"` // 当前页码
  // "pagesize"` // 每页记录数量
  // "pagecnt"`  // 总页数
  // }
  /**
   * 执行查询并返回带分页信息的数据记录数组
   *
   * query.Paginate({"select":["id"], "from":"user"})
   *
   * @param {QueryDSL} params 查询条件
   * @returns Paginate
   */
  Paginate(params: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Paginate", params });
  }
  /**
   * 执行查询并返回一条数据记录
   *
   * query.First({"select":["id"], "from":"user"})
   *
   * @param {QueryDSL} params 查询条件
   * @returns Record
   */
  First(params: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "First", params });
  }
  /**
   * 执行查询根据查询条件返回结果
   *
   * query.Run({"stmt":"show version"})
   *
   * @param {*} params
   * @returns object
   */
  Run(params: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Run", params });
  }
}
// Query Declaration
/**
 * Store 使用缓存
 */
class Store {
  space: string;
  /**
   *
   * @param {string} space
   */
  constructor(space: string) {
    this.space = space;
  }
  /**
   * Get 获取缓存数据
   * @param {string} key
   * @returns
   */
  Get(key: string) {
    return RemoteRequest({
      type: "Store",
      method: "Get",
      space: this.space,
      key,
    });
  }
  /**
   * Set 设置缓存
   * @param {string} key
   * @param {any} value
   * @returns
   */
  Set(key: string, value: any) {
    return RemoteRequest({
      type: "Store",
      method: "Get",
      space: this.space,
      key,
      value,
    });
  }
}
// Query Declaration

/**
 * 使用 FS 对象实现文件操作。 Yao 提供 System, DSL, Script 三个空间,
 * System 用于应用数据操作,
 * DSL 用于DSL文件操作,
 * Script 用于脚本文件操作;
 * DSL 和 Script 只能用于 stuido 脚本。
 *
 * let fs = new FS("system");
 * let data = fs.ReadFile("/f1.txt"); // /data/app/data/f1.txt
 */
class FS {
  space: string;
  constructor(space: string) {
    this.space = space;
  }
  ReadFile(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFile",
      params: [path],
    });
  }
  ReadFileBuffer(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFileBuffer",
      params: [path],
    });
  }
  WriteFile(path: string, str: any, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFile",
      params: [path, str, mode],
    });
  }
  WriteFileBuffer(path: string, buffer: any, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFileBuffer",
      params: [path, buffer, mode],
    });
  }
  ReadDir(path: string, recursive?: boolean) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadDir",
      params: [path, recursive],
    });
  }
  Mkdir(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Mkdir",
      params: [path, mode],
    });
  }
  MkdirAll(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirAll",
      params: [path, mode],
    });
  }
  MkdirTemp(path: string, fitler?: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirTemp",
      params: [path, fitler],
    });
  }
  Exists(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Exists",
      params: [path],
    });
  }
  IsDir(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "IsDir",
      params: [path],
    });
  }
  IsFile(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "IsFile",
      params: [path],
    });
  }
  Remove(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Remove",
      params: [path],
    });
  }
  RemoveAll(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "RemoveAll",
      params: [path],
    });
  }
  Chmod(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Chmod",
      params: [path, mode],
    });
  }
  BaseName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "BaseName",
      params: [path],
    });
  }
  DirName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "DirName",
      params: [path],
    });
  }
  ExtName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ExtName",
      params: [path],
    });
  }
  MimeType(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MimeType",
      params: [path],
    });
  }
  Mode(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Mode",
      params: [path],
    });
  }
  Size(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Size",
      params: [path],
    });
  }
  ModTime(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ModTime",
      params: [path],
    });
  }
  Copy(path: string, target: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Copy",
      params: [path, target],
    });
  }
  Move(path: string, target: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Move",
      params: [path, target],
    });
  }
}

export type HttpHeaders = object | object[];
//
//
// http.Head	[<URL>, <Payload (可选)>, <Query (可选)>, <Headers (可选)>]	响应结果	发送 HTTP HEAD 请求 示例 文档
// http.Put	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP PUT 请求 示例 文档
// http.Patch	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP PATCH 请求 示例 文档
// http.Delete	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP DELETE 请求 示例 文档
// http.Send	[<METHOD>, <URL>, <Query (可选)>, <Payload (可选)>, <Headers (可选)>]	响应结果	发送 HTTP POST 请求, 返回 JSON 数据 示例 文档

/**
 * 使用 http 对象发送 HTTP 请求，参数表与返回值与 http.* 处理器一致
 * 虽然可以直接使用fetch
 */
const http = {
  /**
   * YAO Http Post 代理
   * http.Post	[<URL>, <Payload (可选)>, <Files (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP POST 请求 示例 文档
   * @param {string} URL  目标网址
   * @param {object} Payload  请求数据, 示例: {"name":"Pet"}, http.Post 发送时候自动添加 Content-type: application/json; charset=utf-8 Header
   * @param {object} Files 上传文件, 示例: {"file":"/path/root/file"}, 文件路径为相对路径 相对地址, 示例: /text/foo.txt, 绝对路径为: /data/app/data/text/foo.txt。 如 Files 不为 null，自动添加 Content-type: multipart/form-data Header
   * @param {object} Query  Query 参数, 示例: {"foo":"bar", "arr[]":"hello,world"}, 对应 Query string: foo=bar&arr[]=hello&arr[]=world
   * @param {HttpHeaders} Headers  请求 Header, 示例: {"Secret":"********"} 或 [{"Secret":"********"}, {"Secret":"#####"}]
   * @returns
   */
  Post: function (
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Post",
      params: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Get 代理
   * http.Get	[<URL>, <Query (可选)>, <Headers (可选)>]	响应结果	发送 HTTP GET 请求 示例 文档
   * @param {string} URL 请求数据
   * @param {object} Query Query 参数
   * @param {object} Headers 请求 Header
   * @returns
   */
  Get: function (URL: string, Query?: object, Headers?: HttpHeaders) {
    const payload = {
      type: "Http",
      method: "Get",
      params: [URL, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Head 代理
   * @param {string} URL 目标网址
   * @param {object} Payload 请求数据
   * @param {object} Files 上传文件
   * @param {object} Query Query 参数
   * @param {object} Headers 请求 Header
   * @returns
   */
  Head: function (
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Head",
      params: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Put 代理
   * @param {string} URL 目标网址
   * @param {object} Payload 请求数据
   * @param {object} Files 上传文件
   * @param {object} Query Query 参数
   * @param {HttpHeaders} Headers 请求 Header
   * @returns
   */
  Put: function (
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Put",
      params: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Patch Put 代理
   * @param {string} URL 目标网址
   * @param {object} Payload 请求数据
   * @param {object} Files 上传文件
   * @param {object} Query Query 参数
   * @param {HttpHeaders} Headers 请求 Header
   * @returns
   */
  Patch: function (
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Patch",
      params: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Put 代理
   * @param {string} URL 目标网址
   * @param {object} Payload 请求数据
   * @param {object} Files 上传文件
   * @param {object} Query Query 参数
   * @param {HttpHeaders} Headers 请求 Header
   * @returns
   */
  Delete: function (
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Delete",
      params: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Send 代理
   * @param {string} URL 目标网址
   * @param {object} Payload 请求数据
   * @param {object} Files 上传文件
   * @param {object} Query Query 参数
   * @param {HttpHeaders} Headers 请求 Header
   * @returns
   */
  Send: function (
    METHOD: string,
    URL: string,
    Payload?: object,
    Files?: object,
    Query?: object,
    Headers?: HttpHeaders
  ) {
    const payload = {
      type: "Http",
      method: "Send",
      params: [METHOD, URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
};

/**
 * 日志对象
 */
const log = {
  Trace(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Trace",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Debug(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Debug",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Info(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Info",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Warn(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Warn",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Error(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Error",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Fatal(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Fatal",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
  Panic(format: string, ...params: any[]) {
    const payload = {
      type: "Log",
      method: "Panic",
      params: [format, ...params],
    };
    return RemoteRequest(payload);
  },
};

/**
 * Exception
 */
class Exception extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(`code:${code},message:${message}`);
    this.name = "Exception";
    this.message = message;
    this.code = code;
  }
}

class WebSocket {
  url: string;
  protocols: string;
  client: WebSocketClient;
  push: WebSocketClient["send"];
  constructor(url: string, protocols: string) {
    this.url = url;
    this.protocols = protocols;

    this.client = new WebSocketClient(this.url, protocols);
    // yao js api目前还不支持ws 回调函数
    // this.on = this.client.on;
    // this.emit = this.client.emit;
    // this.send = this.client.send;
    this.push = this.client.send;
    // this.onopen = this.client.onopen;
    // this.onmessage = this.client.onmessage;
    // this.onclose = this.client.onclose;
    // this.close = this.client.close;
  }
}

class WebSocketYao {
  url: string;
  protocols: string;
  constructor(url: string, protocols: string) {
    this.url = url;
    this.protocols = protocols;
  }
  push(message: string) {
    const payload = {
      type: "WebSocket",
      method: "push",
      message: message,
    };
    return RemoteRequest(payload);
  }
}

// exports.Process = Process;
// exports.http = http;
// exports.Query = Query;
// exports.FS = FS;
// exports.Store = Store;
// exports.log = log;
// exports.Exception = Exception;
// exports.WebSocket = WebSocket;

export { Process, http, Query, FS, Store, log, Exception, WebSocket };
