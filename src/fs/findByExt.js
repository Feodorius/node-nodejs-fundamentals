import { readdir, readFile, stat, writeFile } from "fs/promises";
import { extname, join, relative, sep } from "path";
import { cwd } from "process";

const folderName = "workspace";
const rootPath = cwd();
const fullPath = join(rootPath, folderName);
const normalizePath = value => value.split(sep).join("/");


const findByExt = async () => {
  let extension = ".txt";
  const [flag, ext] = process.argv.slice(2);
  if (flag === "--ext" && ext?.length) {
    extension = ext.startsWith(".") ? ext : `.${ext}`;
  }

  try {
    const dirData = await readdir(fullPath, { withFileTypes: true, recursive: true });
    const result = [];

    for (const dirent of dirData) {

      const { name, parentPath } = dirent;
      const dirPath = join(parentPath, name);
      const path = normalizePath(relative(fullPath, dirPath));

      if (dirent.isFile()) {
        const extensionName = extname(path);
        if (extensionName === extension) {
          result.push(path);
        }
      }
    }

    result.sort();
    result.forEach(item => console.log(item));

  } catch (error) {
    console.log("FS operation failed");
  }
};

await findByExt();
