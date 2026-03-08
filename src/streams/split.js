import { createReadStream, createWriteStream } from "fs";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { Transform } from "stream";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultLinesCount = 10;
const sourceFileName = 'source.txt';
const sourceFilePath = join(__dirname, sourceFileName);

// For faster cross-check uncomment the line below to create the source.txt file :) 
// await createSourceFile();

const split = async () => {
  try {
    const [flag, count] = process.argv.slice(2);
    let maxLinesPerChunk = defaultLinesCount;
    if (flag === "--lines" && count >= 0) {
      maxLinesPerChunk = +count;
    }

    let chunkIndex = 1;
    let chunkLeftovers = '';
    let lineCount = 0;

    const readStream = createReadStream(sourceFilePath, { encoding: "utf8" });
    let writeStream = createWriteStream(getChunkPath(chunkIndex));

    const splitTransform = new Transform({
      transform(chunk, _encoding, callback) {

        const data = chunkLeftovers + chunk.toString();
        const lines = data.split("\n");
        chunkLeftovers = lines.pop();

        for (const line of lines) {
          if (lineCount === maxLinesPerChunk) {
            writeStream.end();
            chunkIndex++;
            lineCount = 0;
            writeStream = createWriteStream(getChunkPath(chunkIndex));
          }

          writeStream.write(line + "\n");
          lineCount++;
        }

        callback();
      },

      flush(callback) {
        if (chunkLeftovers) {
          if (lineCount === maxLinesPerChunk) {
            writeStream.end();
            chunkIndex++;
            writeStream = createWriteStream(getChunkPath(chunkIndex));
          }
          writeStream.write(chunkLeftovers + "\n");
        }

        writeStream.end(() => {
          console.log(`Done! Created ${chunkIndex} chunk(s).`);
          callback();
        });
      },
    });

    readStream.pipe(splitTransform);

  } catch (error) {
    throw new Error("Streams operation failed");
  }
};

await split();

function getChunkPath(index) {
  return join(__dirname, `chunk_${index}.txt`);
}

async function createSourceFile() {
  await writeFile(
    sourceFilePath,
    "Hello World\n".repeat(203)
  );
  console.log("File created!");
};