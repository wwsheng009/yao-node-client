# 使用 typescript 开发 yao 脚本

## yao 本地 js 文件调试

yao 在调用 js 脚本时会自动的插入一些 yao 引擎特有的 js 对象。比如 Process,Query，这些在 nodejs 里是没有的。如果我们直接使用 nodejs 直接去调用 js 脚本，遇到这些 yao 对象时，nodejs 就会报错，提示找不到这些对象。

想到的解决方法就是使用远程调用 api 的方法模拟出函数调用。

在 yao 服务端建立一个代理**服务端**。在 nodejs 环境里建立代理**客户端**。当在 nodejs 调用 yao 对象时，会远程调用 yao 服务端的 api 接口，并返回最终的值。

代理客户端 <<======>> 代理服务端。

## yao app 配置

要使用 yao-node-client,在 yao 应用中需要以下的配置

在 yao 应用的 apis 目录下创建一个`/apis/proxy.http.yao` 的配置文件

```json
{
  "name": "代理yao的请求",
  "version": "1.0.0",
  "description": "调试本地yao js脚本",
  "group": "",
  "guard": "-",
  "paths": [
    {
      "guard": "scripts.jsproxy.CheckAccessKey",
      "path": "/call",
      "method": "POST",
      "process": "scripts.jsproxy.ProxyServer",
      "in": [":payload"],
      "out": {
        "status": 200,
        "type": "application/json"
      }
    }
  ]
}
```

在 yao app 应用 scripts 目录下创建 `/scripts/jsproxy.js` 文件，用于处理远程客户端的调用请求。
当然你也可以把这两个函数放在另外的路径下，但是相应的也需要调整 api 文件的定义。

```js
//代理js api请求
/**
 * api 代理服务，可以放在yao应用下
 * @param {object} payload
 * @returns
 */
function ProxyServer(payload) {
  let resp = {
    code: 200,
    message: "",
    // error: null as Error, //undefined不会出现在返回json key中
    data: null,
  };
  try {
    const type = payload.type;
    const method = payload.method;
    const args = payload.args;
    const space = payload.space; //"dsl","script","system"
    const engine = payload.engine;
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
        //0.10.3-dev
        __yao_data = { ROOT: true };
        resp.data = Studio(method, ...localParams);
        break;
      case "Query":
        if (engine) {
          const query = new Query(engine);
          //@ts-ignore
          resp.data = query[method](args);
        } else {
          const query = new Query();
          //@ts-ignore
          resp.data = query[method](args);
        }
        break;
      case "FileSystem":
        const fs = new FS(space);
        //@ts-ignore
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
        //@ts-ignore
        resp.data = http[method](...args);
        break;
      case "Log":
        //@ts-ignore
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
        resp.code = 500;
        resp.message = `不支持的方法调用${type}`;
    }
  } catch (error) {
    resp.code = error.code || 500;
    resp.message = error.message || "接口调用异常";
  }
  return resp;
}

/**
 * api guard
 * @param {string} path api path
 * @param {map} params api path params
 * @param {map} queries api queries in url query string
 * @param {object|string} payload json object or string
 * @param {map} headers request headers
 */
function CheckAccessKey(path, params, queries, payload, headers) {
  let token = null;
  let auth = headers["Authorization"];
  if (auth) {
    token = auth[0].replace("Bearer ", "");
  }
  token = token || (queries["token"] && queries["token"][0]);
  if (!token) {
    throw new Exception("Debug Proxy Call token Not set", 403);
  }
  const access_key = Process("yao.env.get", "YAO_API_ACCESS_KEY");
  if (!access_key) {
    throw new Exception("YAO_API_ACCESS_KEY Not set", 403);
  }
  if (access_key !== token) {
    throw new Exception("YAO_API_ACCESS_KEY not equal token", 403);
  }
}
```

## 配置环境变量

在 Yao 应用端需要配置环境变量 YAO_API_ACCESS_KEY，用于检验客户端的请求，在 YAO 应用中这个环境变量名称可以修改成其它的值，相应的需要修改上面 js 文件中的代码。

```sh
YAO_API_ACCESS_KEY=123456
```

在客户端也需要配置同样的环境变量,在客户端，这个变量名是不能修改的。

```sh
YAO_API_ACCESS_KEY=123456
```
