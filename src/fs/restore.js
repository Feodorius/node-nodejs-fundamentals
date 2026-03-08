import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { cwd } from "process";

const rootPath = cwd();
const fileName = "snapshot.json";
const workspaceFolderName = "workspace_restored";
const fullPath = join(rootPath, fileName);
const workspaceFolderPath = join(rootPath, workspaceFolderName);


const restore = async () => {
  try {
    const jsonContent = await readFile(fullPath, "utf-8");
    await mkdir(workspaceFolderPath);

    const snapshot = JSON.parse(jsonContent);
    const { entries } = snapshot;

    for (const entry of entries) {
      const { path, type, content } = entry;
      const absolutePath = join(workspaceFolderPath, path);
      const __dirname = dirname(absolutePath);

      if (!existsSync(__dirname)) {
        await mkdir(__dirname);
      }

      if (type === "directory") {
        !existsSync(absolutePath) && await mkdir(absolutePath);
      } else if (type === "file") {
        await writeFile(absolutePath, content, { encoding: "base64" });
      }
    }


  } catch (error) {
     throw new Error("FS operation failed");
  }
};

await restore();
