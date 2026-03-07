import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, relative, sep } from "path";
import { cwd } from "process";

const folderName = "workspace";
const resultFileName = "snapshot.json";
const rootPath = cwd();
const fullPath = join(rootPath, folderName);
const normalizePath = value => value.split(sep).join("/");

// !!! In order to make checking process faster you can uncomment the line below and run the folder creation function :) 
// await createWorkspaceFolder();

const snapshot = async () => {

  const resultJSON = {
    rootPath: normalizePath(fullPath),
    entries: [],
  };
  try {
    const dirData = await readdir(fullPath, { withFileTypes: true, recursive: true });

    for (const dirent of dirData) {

      const { name, parentPath } = dirent;
      const dirPath = join(parentPath, name);
      const path = normalizePath(relative(fullPath, dirPath));

      if (dirent.isDirectory()) {
        resultJSON.entries.push({ path, type: "directory" });
      }
      else if (dirent.isFile()) {
        const [{ size }, content] = await Promise.all([
          stat(dirPath),
          readFile(dirPath, "base64")
        ]);

        resultJSON.entries.push({
          path,
          type: "file",
          size,
          content,
        })
      }
    }

    await writeFile(resultFileName, JSON.stringify(resultJSON));

  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await snapshot();



async function createWorkspaceFolder() {
  if (existsSync(folderName)) return;

  const nestedFolderName = "subdir";
  const nestedFolderFileName = "nested.txt";
  const fileName = "file1.txt";

  await mkdir(fullPath);
  await writeFile(join(folderName, fileName), "Some random text");

  const nestedFolderPath = join(folderName, nestedFolderName);
  await mkdir(nestedFolderPath);
  await writeFile(join(nestedFolderPath, nestedFolderFileName), "Some another random text for testing");
  console.log("The folder with nested files created!");
};

