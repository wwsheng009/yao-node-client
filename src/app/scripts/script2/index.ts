import { ProcessEnum } from "@/yao-node-client";
import { Process } from "@/yao-node-client";

export function demo() {
  // console.log(Process(ProcessEnum.utils.app.Ping));

  // console.log(Process(ProcessEnum.utils.app.Inspect));

  // console.log(Process(ProcessEnum.utils.app.Inspect,'xtest','xtex'));
  let rest = Process(ProcessEnum.http.Get, "http://www.baidu.com");
  console.log(rest);
  // utils.app.Inspect
}
demo();
