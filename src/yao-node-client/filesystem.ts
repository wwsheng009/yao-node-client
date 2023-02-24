import { RemoteRequest } from "./request";
import fs from "fs";
import path from "path";
import mime from "mime";
export enum FSSAPCE {
  System = "system",
  Script = "script",
  Dsl = "dsl",
}
/**
 * 使用 FS 对象实现文件操作。 Yao 提供 System, DSL, Script 三个空间,
 * System 用于应用数据操作,
 * DSL 用于DSL文件操作,
 * Script 用于脚本文件操作;
 * DSL 和 Script 只能用于 stuido 脚本。
 *
 * let fs = new FS("system");
 *
 * let data = fs.ReadFile("/f1.txt"); // /data/app/data/f1.txt
 */

export class FS {
  // [key: string]: any;
  space: FSSAPCE;
  isLocal: boolean;
  basePath: string;
  /**
   * system	/data/app/data	应用数据
   * dsl	/data/app	除 scripts 外的所有目录(仅 Studio 脚本可用)
   * script	/data/app/scirpts	脚本目录(仅 Studio 脚本可用)
   * @param space
   */
  constructor(space: FSSAPCE) {
    this.space = space;
    let yao_app_root = process.env.YAO_APP_ROOT;
    if (typeof yao_app_root === "string") {
      yao_app_root = path.resolve(yao_app_root);
      const isValidPath = fs.existsSync(yao_app_root);
      if (isValidPath) {
        this.isLocal = true;
        switch (this.space) {
          case "system":
            this.basePath = path.join(yao_app_root, "data", path.sep);
            break;
          case "script":
            this.basePath = path.join(yao_app_root, "scripts", path.sep);
            break;
          case "dsl":
            this.basePath = path.join(yao_app_root, path.sep);
            break;
          default:
            this.isLocal = false;
            break;
        }
      }
    }
  }
  ReadFile(src: string): string {
    if (this.isLocal) {
      return fs.readFileSync(path.join(this.basePath, src), "utf8");
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFile",
      args: [src],
    });
  }
  ReadFileBuffer(src: string): Buffer {
    if (this.isLocal) {
      return fs.readFileSync(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadFileBuffer",
      args: [src],
    });
  }
  WriteFile(src: string, str: any, mode?: number) {
    if (this.isLocal) {
      return fs.writeFileSync(path.join(this.basePath, src), str, { mode });
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFile",
      args: [src, str, mode],
    });
  }
  WriteFileBuffer(
    src: string,
    buffer: string | NodeJS.ArrayBufferView,
    mode?: number
  ) {
    if (this.isLocal) {
      return fs.writeFileSync(path.join(this.basePath, src), buffer, { mode });
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "WriteFileBuffer",
      args: [src, buffer, mode],
    });
  }
  ReadDir(src: string, recursive?: boolean): string[] {
    if (this.isLocal) {
      if (recursive) {
        return readDirAll(path.join(this.basePath, src));
      } else {
        return readDir(path.join(this.basePath, src));
      }
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "ReadDir",
      args: [src, recursive],
    });
  }
  Mkdir(src: string, mode?: number) {
    if (this.isLocal) {
      return fs.mkdirSync(path.join(this.basePath, src), { mode });
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Mkdir",
      args: [src, mode],
    });
  }
  /**
   * 根据目录，创建必须的目录
   * @param src 目录
   * @param mode 目录权限
   * @returns
   */
  MkdirAll(src: string, mode?: number): string {
    if (this.isLocal) {
      return fs.mkdirSync(path.join(this.basePath, src), {
        recursive: true,
        mode,
      });
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirAll",
      args: [src, mode],
    });
  }
  /**
   * 创建一个临时目录，该目录具有唯一的、随机生成的名称，并且只能由当前用户访问
   * @param src 目录
   * @param pattern 指定临时目录的前缀
   * @returns 创建的临时目录的路径
   */
  MkdirTemp(src: string, pattern?: string): string {
    if (this.isLocal) {
      fs.mkdirSync(path.join(this.basePath, src), { recursive: true });
      let newpath = path.join(path.join(this.basePath, src), pattern);
      return fs.mkdtempSync(newpath);
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "MkdirTemp",
      args: [src, pattern],
    });
  }
  Exists(src: string): boolean {
    if (this.isLocal) {
      return fs.existsSync(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Exists",
      args: [src],
    });
  }
  IsDir(src: string): boolean {
    if (this.isLocal) {
      const stat = fs.statSync(path.join(this.basePath, src));
      return stat.isDirectory();
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "IsDir",
      args: [src],
    });
  }
  IsFile(src: string): boolean {
    if (this.isLocal) {
      const stat = fs.statSync(path.join(this.basePath, src));
      return stat.isFile();
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "IsFile",
      args: [src],
    });
  }
  Remove(src: string): void {
    if (this.isLocal) {
      rmoveLocal(path.join(this.basePath, src));
      return;
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Remove",
      args: [src],
    });
  }
  RemoveAll(src: string): void {
    if (this.isLocal) {
      rmoveLocal(path.join(this.basePath, src));
      return;
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "RemoveAll",
      args: [src],
    });
  }
  Chmod(src: string, mode: number): void {
    if (this.isLocal) {
      return fs.chmodSync(path.join(this.basePath, src), mode);
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Chmod",
      args: [src, mode],
    });
  }
  BaseName(src: string): string {
    if (this.isLocal) {
      return path.basename(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "BaseName",
      args: [src],
    });
  }
  DirName(src: string): string {
    if (this.isLocal) {
      return path.dirname(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "DirName",
      args: [src],
    });
  }
  ExtName(src: string): string {
    if (this.isLocal) {
      return path.extname(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "ExtName",
      args: [src],
    });
  }
  MimeType(src: string): string {
    if (this.isLocal) {
      return mime.getType(path.join(this.basePath, src));
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "MimeType",
      args: [src],
    });
  }
  Mode(src: string): number {
    if (this.isLocal) {
      const stat = fs.statSync(path.join(this.basePath, src));
      return stat.mode;
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Mode",
      args: [src],
    });
  }
  Size(src: string): number {
    if (this.isLocal) {
      const stat = fs.statSync(path.join(this.basePath, src));
      return stat.size;
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Size",
      args: [src],
    });
  }
  ModTime(src: string): Date {
    if (this.isLocal) {
      const stat = fs.statSync(path.join(this.basePath, src));
      return stat.mtime;
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "ModTime",
      args: [src],
    });
  }
  Copy(src: string, target: string): void {
    if (this.isLocal) {
      return localCopy(
        path.join(this.basePath, src),
        path.join(this.basePath, target)
      );
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Copy",
      args: [src, target],
    });
  }
  Move(src: string, target: string): void {
    if (this.isLocal) {
      const old = path.join(this.basePath, src);
      const newPath = path.join(this.basePath, target);
      return fs.renameSync(old, newPath);
    }
    return RemoteRequest({
      type: "FileSystem",
      method: "Move",
      args: [src, target],
    });
  }
}

function readDir(dir: string) {
  let files: string[] = [];
  fs.readdirSync(dir).forEach((file) => {
    const src = `${dir}${path.sep}${file}`;
    files.push(src);
  });
  return files;
}

/**
 * 读取目录下所有的文件列表，包含子目录
 * @param dir 目录
 * @returns 目录所有的文件列表，包含子目录
 */
function readDirAll(dir: string) {
  let files: string[] = [];
  const readDirRecursive = (dir: string) => {
    fs.readdirSync(dir).forEach((file) => {
      const src = `${dir}${path.sep}${file}`;
      if (fs.statSync(src).isDirectory()) {
        readDirRecursive(src);
      } else {
        files.push(src);
      }
    });
  };
  return files;
}

function rmoveLocal(src: string) {
  const srcPath = path.join(this.basePath, src);
  const stat = fs.statSync(srcPath);
  if (stat.isDirectory()) {
    const files = fs.readdirSync(srcPath);
    files.forEach((file) => {
      fs.unlinkSync(`${path}${path.sep}${file}`);
    });
  } else {
    fs.unlinkSync(srcPath);
  }
}

function localCopy(src: string, target: string) {
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) {
    fs.copyFileSync(src, target);
  } else {
    let files = fs.readdirSync(src);
    files.forEach((file) => {
      // Source file
      const srcFile = `${src}${path.sep}${file}`;
      // Destination file
      const destFile = `${target}${path.sep}${file}`;
      localCopy(srcFile, destFile);
    });
  }
}
