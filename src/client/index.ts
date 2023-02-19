//用于nodejs 调试代理

//需要同步调用，方便调试
// cd scripts
// npm init
// npm i  sync-fetch

import { QueryDSL } from "@/types/dsl";
import fetch from "sync-fetch";
import WebSocketClient from "ws";
import {
  CallLocalProcess,
  CheckIsLocalProcessFilePath,
  CheckIsLocalStudio,
} from "./local";

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
  args?: object;
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
 * @param  {...any} args 参数
 * @returns
 */
function Process(method: string, ...args: any[]) {
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

function Studio(method: string, ...args: any[]) {
  let obj = CheckIsLocalStudio(method);
  if (obj) {
    return CallLocalProcess(obj.fpath, obj.method, ...args);
  }

  return RemoteRequest({ type: "Studio", method: method, args });
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
   * @param {object} args 查询条件
   * @returns []Record
   */
  Get(args: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Get", args });
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
   * @param {QueryDSL} args 查询条件
   * @returns Paginate
   */
  Paginate(args: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Paginate", args });
  }
  /**
   * 执行查询并返回一条数据记录
   *
   * query.First({"select":["id"], "from":"user"})
   *
   * @param {QueryDSL} args 查询条件
   * @returns Record
   */
  First(args: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "First", args });
  }
  /**
   * 执行查询根据查询条件返回结果
   *
   * query.Run({"stmt":"show version"})
   *
   * @param {*} args
   * @returns object
   */
  Run(args: QueryDSL) {
    return RemoteRequest({ type: "Query", method: "Run", args });
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

type FSSAPCE = "system" | "script" | "dsl";
/**
 * 使用 FS 对象实现文件操作。 Yao 提供 System, DSL, Script 三个空间,
 * System 用于应用数据操作,
 * DSL 用于DSL文件操作,
 * Script 用于脚本文件操作;
 * DSL 和 Script 只能用于 stuido 脚本。
 *
 * let fs = new FS("system");
 *
 * let data = fs.ReadFile("/f1.txt"); // /data/app/data/f1.txt
 */
class FS {
  space: FSSAPCE;
  constructor(space: FSSAPCE) {
    this.space = space;
  }
  ReadFile(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFile",
      args: [path],
    });
  }
  ReadFileBuffer(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFileBuffer",
      args: [path],
    });
  }
  WriteFile(path: string, str: any, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFile",
      args: [path, str, mode],
    });
  }
  WriteFileBuffer(path: string, buffer: any, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFileBuffer",
      args: [path, buffer, mode],
    });
  }
  ReadDir(path: string, recursive?: boolean) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadDir",
      args: [path, recursive],
    });
  }
  Mkdir(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Mkdir",
      args: [path, mode],
    });
  }
  MkdirAll(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirAll",
      args: [path, mode],
    });
  }
  MkdirTemp(path: string, fitler?: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirTemp",
      args: [path, fitler],
    });
  }
  Exists(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Exists",
      args: [path],
    });
  }
  IsDir(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "IsDir",
      args: [path],
    });
  }
  IsFile(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "IsFile",
      args: [path],
    });
  }
  Remove(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Remove",
      args: [path],
    });
  }
  RemoveAll(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "RemoveAll",
      args: [path],
    });
  }
  Chmod(path: string, mode?: number) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Chmod",
      args: [path, mode],
    });
  }
  BaseName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "BaseName",
      args: [path],
    });
  }
  DirName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "DirName",
      args: [path],
    });
  }
  ExtName(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ExtName",
      args: [path],
    });
  }
  MimeType(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "MimeType",
      args: [path],
    });
  }
  Mode(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Mode",
      args: [path],
    });
  }
  Size(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Size",
      args: [path],
    });
  }
  ModTime(path: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "ModTime",
      args: [path],
    });
  }
  Copy(path: string, target: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Copy",
      args: [path, target],
    });
  }
  Move(path: string, target: string) {
    return RemoteRequest({
      type: "FileSystem",
      method: "Move",
      args: [path, target],
    });
  }
}

export type HttpHeaders = object | object[];

/**
 * 使用 http 对象发送 HTTP 请求，参数表与返回值与 http.* 处理器一致
 * 虽然可以直接使用fetch，但是在参数与文件处理上比较麻烦
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
      args: [URL, Payload, Files, Query, Headers],
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
      args: [URL, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Head 代理
   *
   * http.Head	[<URL>, <Payload (可选)>, <Query (可选)>, <Headers (可选)>]	响应结果	发送 HTTP HEAD 请求 示例 文档
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
      args: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Put 代理
   *
   * http.Put	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP PUT 请求 示例 文档
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
      args: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Patch Put 代理
   *
   * http.Patch	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP PATCH 请求 示例 文档
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
      args: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Delete 代理
   *
   * http.Delete	[<URL>, <Payload (可选)>, <Query(可选)>, <Headers (可选)>]	响应结果	发送 HTTP DELETE 请求 示例 文档
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
      args: [URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
  /**
   * YAO Http Send 代理
   *
   * http.Send	[<METHOD>, <URL>, <Query (可选)>, <Payload (可选)>, <Headers (可选)>]	响应结果	发送 HTTP POST 请求, 返回 JSON 数据 示例 文档
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
      args: [METHOD, URL, Payload, Files, Query, Headers],
    };
    return RemoteRequest(payload);
  },
};

/**
 * 日志对象
 */
const log = {
  Trace(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Trace",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Debug(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Debug",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Info(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Info",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Warn(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Warn",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Error(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Error",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Fatal(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Fatal",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Panic(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Panic",
      args: [format, ...args],
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

/**
 * 模拟ws客户端。
 *
 * https://github.com/websockets/ws
 */
class WebSocket {
  url: string;
  protocols: string;
  client: WebSocketClient;
  ready: boolean;
  messages: any[];
  /**
   *
   * @param url ws服务地址
   * @param protocols 协议
   */
  constructor(url: string, protocols: string) {
    this.url = url;
    this.protocols = protocols;
    this.messages = [];
    this.client = new WebSocketClient(this.url, [protocols]);
    let ref = this;
    this.client.on("open", function open() {
      ref.ready = true;

      for (let index = 0; index < ref.messages.length; index++) {
        let obj = ref.messages.shift();
        ref.push(obj);
      }
    });

    this.client.on("error", () => {
      throw Error("连接异常");
    });

    this.client.on("message", function message(data) {
      console.log("received: %s", data);
    });
  }
  /**
   *发送数据
   * @param params 参数
   */
  push(params: any) {
    if (!this.ready) {
      this.messages.push(params);
    } else {
      this.client.send(params);
    }
  }
}

//另外一个可选项，使用远程调用的yao的push方法
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
      url: this.url,
      protocols: this.protocols,
      message: message,
    };
    return RemoteRequest(payload);
  }
}
/**
 * 翻译文本
 * @param args 文本
 * @returns
 */
function $L(args: string) {
  const payload = {
    type: "Translate",
    method: "",
    message: args,
  };
  return RemoteRequest(payload);
}

export {
  Process,
  Studio,
  http,
  Query,
  FS,
  Store,
  log,
  Exception,
  WebSocket,
  $L,
};
