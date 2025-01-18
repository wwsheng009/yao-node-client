import { Process } from "./process"

export const time = {
    After(ms: number, process: string, ...args: any[]) {
      this.Sleep(ms);
      Process(process, ...args);
    },
    Sleep(delay: number) {
      const start = new Date().getTime();
      while (new Date().getTime() - start < delay) {
        continue;
      }
    }
  };
  