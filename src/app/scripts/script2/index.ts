import { ProcessEnum } from "@/yao-node-client";
import { Process } from "@/yao-node-client";

export function demo() {
  console.log(Process(ProcessEnum.utils.app.Ping));

  console.log(Process(ProcessEnum.utils.app.Inspect));

  console.log(Process(ProcessEnum.utils.app.Inspect,'xtest','xtex'));
  Process("models.model.Create");
  // utils.app.Inspect
}
demo();
