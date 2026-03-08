import { createReadStream, createWriteStream } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import { createBrotliCompress } from "zlib";

const workspaceFolderName = 'workspace';
const toCompressFolderName = 'toCompress';
const compressedFolderName = 'compressed';
const targetArchiveName = 'archive.br';

const folderPath = join(cwd(), workspaceFolderName, toCompressFolderName);
const compressedFolderPath = join(cwd(), workspaceFolderName, compressedFolderName);
const archiveFilePath = join(compressedFolderPath, targetArchiveName);

// !!! To make cross-check process faster uncomment the line below to create the needed folder :)
// await createFolderWithFiles();

const compressDir = async () => {
  try {
    const entries = await readdir(folderPath, { withFileTypes: true, recursive: true });
    const pathArray = entries
      .filter(entry => entry.isFile())
      .map(entry => join(entry.parentPath, entry.name));

    await mkdir(compressedFolderPath, { recursive: true });

    const brotliCompress = createBrotliCompress();
    const writeStream = createWriteStream(archiveFilePath);
    writeStream.on("close", () => {
      console.log("Compression finished!");
    });

    brotliCompress.pipe(writeStream);

    for (const file of pathArray) {
      await new Promise((resolve, reject) => {
        const readStream = createReadStream(file);

        readStream.on('data', chunk => brotliCompress.write(chunk));
        readStream.on('end', resolve);
        readStream.on('error', reject);
      });
    }
    brotliCompress.end();
  } catch (error) {
    throw new Error("FS operation failed");
  }
};

await compressDir();

async function createFolderWithFiles() {

  const fileName1 = "file1.txt";
  const fileName2 = "file2.txt";
  const nestedFileName = "nested_file1.txt";
  const nestedFolderName = "nested_folder";

  const nestedFolderPath = join(folderPath, nestedFolderName);

  await mkdir(folderPath, { recursive: true });
  await writeFile(join(folderPath, fileName1), "Some random text 1");
  await writeFile(join(folderPath, fileName2), "Some random text 2");
  await mkdir(nestedFolderPath);
  await writeFile(join(nestedFolderPath, nestedFileName), "Some another random text for testing");

  console.log("The folder with files created!");
}
