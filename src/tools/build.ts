import esbuild from "esbuild";

/**
 * 把用户脚本输入参数转换成为字典，需要的格式是key=value
 * @param args 脚本输入参数
 * @returns
 */
const parseArgs = (args: any[]) => {
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
const args = parseArgs(process.argv.slice(2));

function getFlag(param: string) {
  const flag = process.argv.indexOf(param) > -1 ? true : false;
  return flag;
}
function getParams(param: string) {
  const inputIndex = process.argv.indexOf(param) || process.argv.indexOf(param);
  let inputValue = "";

  if (inputIndex > -1) {
    inputValue = process.argv[inputIndex + 1];
  }
  return inputValue;
}

let input = args["input"] || getParams("-i") || getParams("--input");
// let input = args.get("input") || getParams("-i") || getParams("--input");
if (!input) {
  input = "dist/client/index.js";
} else {
  input = "dist/app/" + input;
}

// let output = args.get("output") || getParams("-o") || getParams("--output");
let output = args["output"] || getParams("-o") || getParams("--output");
if (!output) {
  output = "dist/client/index.dist.js";
} else {
  output = "dist/app/" + output;
}

esbuild
  .build({
    allowOverwrite: true,
    write: true,
    entryPoints: [input],
    outfile: output,
    format: "esm", //这里不要使用cjs,而是使用esm，生成的格式才不会乱
    bundle: true, //不需要打包
    platform: "node",
    external: ["*/yao-node-proxy-client"],
  })
  .then(() => {
    console.log(`input: ${input}==>output: ${output}`);
  });
