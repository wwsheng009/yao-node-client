export function CallLocalProcess(
  fpath: string,
  method: string,
  ...params: any[]
) {
  const module = require(fpath);
  if (!module[method]) {
    throw Error("调用的方法不存在或没有导出");
  }
  return module[method](...params);
}
