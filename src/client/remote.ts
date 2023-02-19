import RemoteRequest from "./request";

// Query Declaration
/**
 * Store 使用缓存
 */
class Store {
  space: string;
  /**
   *
   * @param {string} space
   */
  constructor(space: string) {
    this.space = space;
  }
  /**
   * Get 获取缓存数据
   * @param {string} key
   * @returns
   */
  Get(key: string) {
    return RemoteRequest({
      type: "Store",
      method: "Get",
      space: this.space,
      key,
    });
  }
  /**
   * Set 设置缓存
   * @param {string} key
   * @param {any} value
   * @returns
   */
  Set(key: string, value: any) {
    return RemoteRequest({
      type: "Store",
      method: "Get",
      space: this.space,
      key,
      value,
    });
  }
}

/**
 * Exception
 */
class Exception extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(`code:${code},message:${message}`);
    this.name = "Exception";
    this.message = message;
    this.code = code;
  }
}

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

export { Store, Exception, $L };
