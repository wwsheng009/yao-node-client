const esbuild = require("esbuild");

esbuild
  .build({
    allowOverwrite: true,
    write: true,
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.bundle.js",
    format: "esm", //这里不要使用cjs,而是使用esm，生成的格式才不会乱
    bundle: false, //不需要打包
  })
  .then(() => {
    console.log("Done!");
  });
