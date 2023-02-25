import RemoteRequest from "./request";
import type { YaoQuery } from "../types/dsl/query";
/**
 * Yao Query 查询引擎代理
 */
export class Query {
  engine: string;
  constructor(engin?: string) {
    this.engine = engin;
  }
  // [key: string]: any;
  /**
   * 执行查询并返回数据记录集合
   *
   * query.Get({"select":["id"], "from":"user", "limit":1})
   *
   * @param {object} args 查询条件
   * @returns []Record
   */
  Get(args: YaoQuery.DSL) {
    return RemoteRequest({ type: "Query", method: "Get", args });
  }

  // Paginate  {
  // "items"`// 数据记录集合
  // "total"`// 总记录数
  // "next"` // 下一页，如没有下一页返回 -1
  // "prev"` // 上一页，如没有上一页返回 -1
  // "page"` // 当前页码
  // "pagesize"` // 每页记录数量
  // "pagecnt"`  // 总页数
  // }
  /**
   * 执行查询并返回带分页信息的数据记录数组
   *
   * query.Paginate({"select":["id"], "from":"user"})
   *
   * @param {YaoQuery.DSL} args 查询条件
   * @returns Paginate
   */
  Paginate(args: YaoQuery.DSL) {
    return RemoteRequest({ type: "Query", method: "Paginate", args });
  }
  /**
   * 执行查询并返回一条数据记录
   *
   * query.First({"select":["id"], "from":"user"})
   *
   * @param {YaoQuery.DSL} args 查询条件
   * @returns Record
   */
  First(args: YaoQuery.DSL) {
    return RemoteRequest({ type: "Query", method: "First", args });
  }
  /**
   * 执行查询根据查询条件返回结果
   *
   * query.Run({"stmt":"show version"})
   *
   * @param {*} args
   * @returns object
   */
  Run(args: YaoQuery.DSL) {
    return RemoteRequest({ type: "Query", method: "Run", args });
  }
}
