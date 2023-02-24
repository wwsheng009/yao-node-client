// Query Declaration

import RemoteRequest from "./request";

/**
 * Store 使用缓存
 */
export class Store {
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
