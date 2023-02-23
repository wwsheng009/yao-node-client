import { Process } from "@/yao-node-client";

export namespace utils {
  export namespace map {
    export function Get(object: { [key: string]: any }, key: string) {
      return Process("utils.map.Get", object, key);
    }

    export function Set(
      object: { [key: string]: any },
      key: string,
      value: any
    ) {
      return Process("utils.map.Set", object, key, value);
    }
  }
}
