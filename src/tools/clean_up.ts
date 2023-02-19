import * as fs from "fs";
import path from "path";

let filesall = [] as string[];

function getFiles(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(function (file: string) {
    const filePath = dir + "/" + file;
    const fileStat = fs.lstatSync(filePath);

    if (fileStat.isDirectory()) {
      getFiles(filePath);
    } else {
      // console.log(filePath);
      filesall.push(filePath);
    }
  });
  return filesall;
}

function checkExtension(filePath: string) {
  const ext = path.extname(filePath);
  return ext === ".js";
}

/**
 * 简单处理js文件
 * @param filename 文件名
 */
function process(filename: string) {
  const isJSFile = checkExtension("/path/to/file.js");
  if (!isJSFile) {
    return;
  }

  fs.readFile(filename, "utf8", function (err, data) {
    if (err) throw err;

    // add comment
    const comment = "// ";
    const lines = data.split("\n");
    // lines[0] = comment + lines[0];

    let needProcess = false;
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line.startsWith("import ")) {
        lines[index] = comment + line;
        needProcess = true;
      } else if (line.startsWith("export function")) {
        lines[index] = line.slice("export ".length);
        needProcess = true;
      }
      //other case
    }
    if (!needProcess) {
      return;
    }
    const commentedData = lines.join("\n");

    // save to new file
    fs.writeFile(filename, commentedData, function (err) {
      if (err) throw err;
      console.log(`File ${filename} saved!`);
    });
  });
}
function main() {
  const folder = path.resolve("./yao/app");
  const files = getFiles(folder);

  for (const file of files) {
    process(file);
  }
}
main();
