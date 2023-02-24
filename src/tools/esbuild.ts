import esbuild from "esbuild";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .options({
    input: { alias: "i", type: "string", default: "dist_esm/client/index.js" },
    output: {
      alias: "o",
      type: "string",
      default: "dist_esm/client/index.dist_esm.js",
    },
  })
  .parseSync();

let input = argv.input;
let output = argv.output;

esbuild
  .build({
    allowOverwrite: true,
    write: true,
    entryPoints: [input],
    outfile: output,
    format: "esm", //这里不要使用cjs,而是使用esm，生成的格式才不会乱
    bundle: true, //不需要打包
    platform: "node",
    external: ["*/yao-node-client"],
  })
  .then(() => {
    console.log(`input: ${input}==>output: ${output}`);
  });
