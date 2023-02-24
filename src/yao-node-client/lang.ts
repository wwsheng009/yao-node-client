import RemoteRequest from "./request";

/**
 * 翻译文本
 * @param args 文本
 * @returns
 */
function $L(args: string) {
  const payload = {
    type: "Translate",
    method: "",
    message: args,
  };
  return RemoteRequest(payload);
}

export { $L };
