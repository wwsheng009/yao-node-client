import { Exception } from "./exception";
export { log } from "./log";
export { time } from "./time";
export { $L } from "./lang";
export { Store } from "./store";
export { Exception } from "./exception";
export { FS } from "./filesystem";
export { Process } from "./process";
export { Studio } from "./studio";
export { http } from "./http";
export { WebSocket } from "./websocket";
export { Query } from "./query";
export { Job } from "./job";

export function ssWrite(str:any){
    throw new Exception(`ssWrite Not support debug`);
}
export function Require(script: string) {
    throw new Exception(`Require Not support debug`);
}
