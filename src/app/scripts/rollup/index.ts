import { Process } from "@/yao-node-proxy-client";
import { Add } from "./part1";
import { Sub } from "./part2";

export function main(a: number, b: number) {
  Add(a, b);
  console.log(Sub(a, b));

  console.log(Process("scripts.setting"));
}
