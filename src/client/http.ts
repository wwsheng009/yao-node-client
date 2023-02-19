import RemoteRequest from "./request";

export type HttpHeaders = object | object[];

/**
 * 使用 http 对象发送 HTTP 请求，参数表与返回值与 http.* 处理器一致
 * 虽然可以直接使用fetch，但是在参数与文件处理上比较麻烦
 */
export const http = {
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
