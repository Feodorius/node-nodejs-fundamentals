import { Transform } from 'stream';

// To get the strict result (`1 | hello\n2 | world`) don't change anything
const separator = '\\n';

// to get every line on next line you can use the separator below.
// P.S. I just don't understand if the requirement is written correctly :)
// const separator = '\n';

const lineNumberer = () => {
  let lineNumber = 1;

  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      const data = chunk.toString().replace(/\\n/g, '\n');
      const lines = data.split('\n');
      lines.pop();

      const output = lines
        .map(line => `${lineNumber++} | ${line}`)
        .join(separator);

      if (output) {
        this.push(output + '\n');
      }
      callback();
    }
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();
