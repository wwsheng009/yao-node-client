import fetch from "sync-fetch";

let apiKey = ""; //process.env.YAO_API_KEY;
let proxyServerUrl = ""; //process.env.YAO_APP_PROXY_ENDPOINT; //"http://localhost:5199/api/proxy/call";

require("dotenv").config();
if (process.env.YAO_API_KEY) {
  apiKey = process.env.YAO_API_KEY;
}
if (process.env.YAO_APP_PROXY_ENDPOINT) {
  proxyServerUrl = process.env.YAO_APP_PROXY_ENDPOINT;
}

export function RemoteRequest(payload: {
  type: string;
  method: string;
  args?: object;
  space?: string;
  key?: string;
  value?: object;
  message?: string;
}) {
  if (!proxyServerUrl || !proxyServerUrl.length) {
    throw new Error("代理地址为空，请配置环境变量YAO_APP_PROXY_ENDPOINT");
  }
  const es = fetch(proxyServerUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  let ret = es.json();
  if (ret.code && ret.message) {
    throw Error(`远程程序执行异常:代码:${ret.code},消息：${ret.message}`);
  }
  if (ret.data) {
    return ret.data;
  } else {
    if (ret.error) {
      throw Error(ret.error);
    }
  }
}

export default RemoteRequest;
