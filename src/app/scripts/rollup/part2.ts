import { Process } from "@/yao-node-proxy-client";

export function Sub(a: number, b: number) {
  console.log(Process("utils.str.Concat", "test1213", "xxxx"));
  return a - b;
}
