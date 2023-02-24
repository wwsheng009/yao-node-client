/**
 * 把用户脚本输入参数转换成为字典，需要的格式是key=value
 * @param args 脚本输入参数
 * @returns
 */
const ParseArgs = (args: any[]) => {
  let parsedArgs: {
    [id: string]: string;
  } = {};

  args.forEach((arg: string) => {
    const parts = arg.split("=");
    // parsedArgs.set(parts[0], parts[1]);
    parsedArgs[parts[0]] = parts[1];
  });

  return parsedArgs;
};
const AllProcessArgs = ParseArgs(process.argv.slice(2));

/**
 * 获取标识
 * @param param 标识
 * @returns
 */
function GetFlag(param: string) {
  const flag = process.argv.indexOf(param) > -1 ? true : false;
  return flag;
}
/**
 * 获取参数
 * @param param 参数
 * @returns
 */
function GetParams(param: string) {
  const inputIndex = process.argv.indexOf(param);
  let inputValue = "";

  if (inputIndex > -1) {
    inputValue = process.argv[inputIndex + 1];
  }
  return inputValue;
}
