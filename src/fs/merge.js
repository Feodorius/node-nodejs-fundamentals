import { readdir, readFile, writeFile } from "fs/promises";
import { extname, join } from "path";
import { cwd } from "process";

const workspaceFolderName = "workspace";
const partsFolderName = "parts";
const rootPath = cwd();
const fullPath = join(rootPath, workspaceFolderName, partsFolderName);
const targetFileName = "merged.txt";
const targetPath = join(rootPath, workspaceFolderName, targetFileName);
const defaultFileExt = ".txt";


// accepts comma-separated names like --files name1,name2,name3
const merge = async () => {
  try {
    let names = [];
    let resultParts = [];

    const [flag, filenames] = process.argv.slice(2);

    if (flag === "--files"
      && filenames?.split(",").length) {
      names = filenames.split(",");
    }

    if (names.length) {
      for (const name of names) {
        const content = await readFile(join(fullPath, name + defaultFileExt), "utf-8");
        resultParts.push(content);
      }
    }
    else {
      const dirData = await readdir(fullPath);
      const txtFiles = dirData.filter(name => extname(name) === defaultFileExt);
      if (!txtFiles.length) {
        throw new Error();
      } else {
        for (const name of txtFiles) {
          const content = await readFile(join(fullPath, name), "utf-8");
          resultParts.push(content);
        }
        resultParts.sort();
      }
    }
    await writeFile(targetPath, resultParts.join(""), "utf-8");

  } catch (error) {
    console.log("FS operation failed");
  }
};

await merge();
