import WebSocketClient from "ws";

import RemoteRequest from "./request";

/**
 * 模拟ws客户端。
 *
 * https://github.com/websockets/ws
 */
export class WebSocket {
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
