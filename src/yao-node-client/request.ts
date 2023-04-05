import fetch from "sync-fetch";

let apiKey = ""; //process.env.YAO_API_ACCESS_KEY;
let proxyServerUrl = ""; //process.env.YAO_APP_PROXY_ENDPOINT; //"http://localhost:5199/api/proxy/call";

require("dotenv").config();
if (process.env.YAO_API_ACCESS_KEY) {
  apiKey = process.env.YAO_API_ACCESS_KEY;
}
if (process.env.YAO_APP_PROXY_ENDPOINT) {
  proxyServerUrl = process.env.YAO_APP_PROXY_ENDPOINT;
}

export function RemoteRequest(payload: {
  type: string;
  method: string;
  engine?: string;
  args?: object;
  space?: string;
  key?: string;
  value?: object;
  message?: string;
}) {
  if (process.env.NODE_CLIENT_LOG) {
    console.log(`Remote Request Call:${payload.type}:${payload.method}`);
  }
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
  if (ret.code != 200) {
    throw Error(`远程程序执行异常:代码:${ret.code},消息：${ret.message}`);
  }
  return ret.data;
}

export default RemoteRequest;
