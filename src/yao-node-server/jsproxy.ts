//代理js api请求

import {
  $L,
  Exception,
  FS,
  http,
  log,
  Process,
  Query,
  Store,
  Studio,
  WebSocket,
} from "../yao-node-client";

/**
 * yao本地js api代理
 * @param {object} payload
 * @returns
 */
function Server(payload: {
  type: string;
  method: string;
  args?: any;
  space?: any;
  key?: any;
  value?: any;
  url?: string | URL;
  protocols?: string;
  message?: any;
}) {
  // console.log("request received");
  // console.log(payload);
  // log.Info("debug served called");
  // log.Info(payload);

  // JSON.stringify({'a':null,'b':undefined})
  // '{"a":null}'

  let resp = {
    error: null as Error, //undefined不会出现在返回json key中
    data: null as any,
  };
  try {
    const type = payload.type;
    const method = payload.method;
    const args = payload.args;
    const space = payload.space; //"dsl","script","system"
    let localParams = [];
    if (Array.isArray(args)) {
      localParams = args;
    } else {
      localParams.push(args);
    }
    switch (type) {
      case "Process":
        resp.data = Process(method, ...localParams);
        break;
      case "Studio":
        // @ts-ignore
        __YAO_SU_ROOT = true;
        resp.data = Studio(method, ...localParams);
        break;
      case "Query":
        const query = new Query();
        resp.data = query[method](args);
        break;
      case "FileSystem":
        const fs = new FS(space);
        resp.data = fs[method](...args);
        break;
      case "Store":
        const cache = new Store(space);
        if (method == "Set") {
          resp.data = cache.Set(payload.key, payload.value);
        } else if (method == "Get") {
          resp.data = cache.Get(payload.key);
        }
        break;
      case "Http":
        resp.data = http[method](...args);
        break;
      case "Log":
        // console.log("Log args:", args);
        log[method](...args);
        resp.data = {};
        break;
      case "WebSocket":
        //目前yao只是实现了push一个方法，也是ws服务连接后push一条信息
        const ws = new WebSocket(payload.url, payload.protocols);
        if (method == "push") {
          ws.push(payload.message);
          resp.data = {};
        }
        break;
      case "Translate":
        resp.data = $L(payload.message);
        break;
      default:
        break;
    }
  } catch (error) {
    resp.error = error;
  }
  return resp;
}
