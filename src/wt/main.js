import { Worker } from 'worker_threads';
import { readFile, writeFile } from 'fs/promises';
import { cpus } from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// !!! To create the data.json file uncomment the function below :)
// await generateDataFile();

class MinHeap {
  constructor() {
    this.heap = [];
  }
  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  extractMin() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return min;
  }
  _bubbleUp(idx) {
    const element = this.heap[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.heap[parentIdx];
      if (element.value >= parent.value) break;
      this.heap[parentIdx] = element;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
  }
  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];
    while (true) {
      let leftIdx = 2 * idx + 1;
      let rightIdx = 2 * idx + 2;
      let swap = null;
      if (leftIdx < length) {
        if (this.heap[leftIdx].value < element.value) swap = leftIdx;
      }
      if (rightIdx < length) {
        if (
          (swap === null && this.heap[rightIdx].value < element.value) ||
          (swap !== null && this.heap[rightIdx].value < this.heap[leftIdx].value)
        ) {
          swap = rightIdx;
        }
      }
      if (swap === null) break;
      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }
}

const main = async () => {
  try {
    const raw = await readFile(join(__dirname, 'data.json'), 'utf-8');
    const numbers = JSON.parse(raw);

    const N = cpus().length;
    const chunkSize = Math.ceil(numbers.length / N);
    const chunks = Array.from({ length: N }, (_, i) =>
      numbers.slice(i * chunkSize, (i + 1) * chunkSize)
    ).filter((chunk) => chunk.length > 0);


    const workerPath = join(__dirname, 'worker.js');
    const sortedChunks = await Promise.all(
      chunks.map(
        (chunk) =>
          new Promise((resolve, reject) => {
            const worker = new Worker(workerPath);

            worker.on('message', (sortedChunk) => {
              resolve(sortedChunk);
              worker.terminate();
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
              if (code !== 0) {
                reject(new Error(`Worker exited with code ${code}`));
              }
            });

            worker.postMessage(chunk);
          })
      )
    );
    const merged = kWayMerge(sortedChunks);

    console.log(merged);
  } catch (error) {
    console.log(error);
  }
};

await main();

function kWayMerge(arrays) {
  const heap = new MinHeap();
  const result = [];

  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      heap.insert({ value: arrays[i][0], arrayIndex: i, elementIndex: 0 });
    }
  }
  while (heap.heap.length > 0) {
    const { value, arrayIndex, elementIndex } = heap.extractMin();
    result.push(value);
    if (elementIndex + 1 < arrays[arrayIndex].length) {
      heap.insert({
        value: arrays[arrayIndex][elementIndex + 1],
        arrayIndex,
        elementIndex: elementIndex + 1,
      });
    }
  }
  return result;
}

async function generateDataFile() {
  const count = 100;
  const min = 1;
  const max = 10000;

  const numbers = Array.from({ length: count }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );

  await writeFile(
    join(__dirname, 'data.json'),
    JSON.stringify(numbers, null, 2),
    'utf-8'
  );

  console.log(`Generated data.json`);
}