import { createHash } from "crypto";
import { createReadStream } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// !!! For faster cross-check uncomment the line below to create the needed files :)
// await createFiles();

const verify = async () => {
  try {
    const data = await readFile(join(__dirname, 'checksums.json'), 'utf-8');
    const checksums = JSON.parse(data);

    for (const [filename, expectedHash] of Object.entries(checksums)) {
      const hash = createHash('sha256');
      const filePath = join(__dirname, filename);
      const stream = createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('error', () => {
        throw new Error("FS operation failed");
      });
      stream.on('end', () => {
        const actualHash = hash.digest('hex');
        const status = actualHash === expectedHash ? 'OK' : 'FAIL';
        console.log(`${filename} — ${status}`);
      });
    }
  }
  catch (error) {
    throw new Error("FS operation failed");
  }
};

await verify();



async function createFiles() {
  const checksums = {
    'file1.txt': '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824', // hash for 'hello'
    'file2.txt': '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7', // hash for 'world'
  };

  await Promise.all([
    writeFile(join(__dirname, 'file1.txt'), 'hello'),
    writeFile(join(__dirname, 'file2.txt'), 'world_'), // wrong content on purpose
    writeFile(join(__dirname, 'checksums.json'), JSON.stringify(checksums, null, 2)),
  ]);

  console.log('Done!');
}