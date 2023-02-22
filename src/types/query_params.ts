/**QueryOrder Order 查询排序 */
export interface QueryOrder {
  rel?: string;
  column: string;
  option?: string;
}
/**
 *  QueryWhere Where 查询条件
 */
export interface QueryWhere {
  /**Relation Name */
  rel?: string;
  column?: string;
  value?: string;
  /**where,orwhere, wherein, orwherein... */
  method?: string;
  /**操作 eq/gt/lt/ge/le/like... */
  op?: string;
  /**分组查询 */
  wheres?: QueryWhere[];
}
/**QueryParam 数据查询器参数 */
export interface QueryParam {
  model?: string;
  table?: string;
  alias?: string;
  export?: string;
  select?: object[];
  wheres?: QueryWhere[];
  orders?: QueryOrder[];
  limit?: number;
  page?: number;
  pagesize?: number;
  withs?: { [key: string]: QueryWith }; //Map<string, QueryWith>;
}

/**With relations 关联查询 */
export interface QueryWith {
  name: string;
  query: QueryParam;
}
