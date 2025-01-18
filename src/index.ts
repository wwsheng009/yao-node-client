// module.exports = require("./yao-node-client/src/client/index");

import { Exception } from "./yao-node-client/exception";
export { log } from "./yao-node-client/log";
export { time } from "./yao-node-client/time";
export { $L } from "./yao-node-client/lang";
export { Store } from "./yao-node-client/store";
export { Exception } from "./yao-node-client/exception";
export { FS } from "./yao-node-client/filesystem";
export { Process } from "./yao-node-client/process";
export { Studio } from "./yao-node-client/studio";
export { http } from "./yao-node-client/http";
export { WebSocket } from "./yao-node-client/websocket";
export { Query } from "./yao-node-client/query";
export { Job } from "./yao-node-client/job";

export function ssWrite(str:any){
    throw new Exception(`ssWrite Not support debug`);
}
export function Require(script: string) {
    throw new Exception(`Require Not support debug`);
}
