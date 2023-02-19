import fetch from "sync-fetch";

let apiKey = ""; //process.env.YAO_API_KEY;
let proxyServerUrl = ""; //process.env.YAO_PROXY_SERVER_URL; //"http://localhost:5199/api/proxy/call";

require("dotenv").config();
if (process.env.YAO_API_KEY) {
  apiKey = process.env.YAO_API_KEY;
}
if (process.env.YAO_PROXY_SERVER_URL) {
  proxyServerUrl = process.env.YAO_PROXY_SERVER_URL;
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

export default RemoteRequest;
