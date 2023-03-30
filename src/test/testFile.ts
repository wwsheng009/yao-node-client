import { FS } from "@/yao-node-client";
function readDirAll() {
  const fs = new FS("dsl");
  const allfile = fs.ReadDir("./models", true);
  console.log(allfile);
}

function readDir() {
  const fs = new FS("dsl");
  const allfile = fs.ReadDir("./models", false);
  console.log(allfile);
}
readDir();
