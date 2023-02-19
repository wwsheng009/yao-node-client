import RemoteRequest from "./request";

/**
 * 日志对象
 */
export const log = {
  Trace(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Trace",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Debug(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Debug",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Info(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Info",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Warn(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Warn",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Error(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Error",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Fatal(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Fatal",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
  Panic(format: string, ...args: any[]) {
    const payload = {
      type: "Log",
      method: "Panic",
      args: [format, ...args],
    };
    return RemoteRequest(payload);
  },
};
