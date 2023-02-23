import { CallLocalProcess, GetFileName } from "./localcall";
import RemoteRequest from "./request";

export function Studio(method: string, ...args: any[]) {
  const tmp_method = "studio." + method;
  let fpath = GetFileName(tmp_method);
  if (fpath) {
    return CallLocalProcess(fpath, tmp_method, ...args);
  }
  return RemoteRequest({ type: "Studio", method: method, args });
}
