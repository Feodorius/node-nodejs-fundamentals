import { Transform } from 'stream';

// Shows the line if matches the pattern, ignores the line if doesn't match
// if no CLI argument provided, returns the initial string

const filter = () => {
  const [flag, pattern] = process.argv.slice(2);

  const transform = new Transform({
    transform(chunk, _encoding, callback) {
      const data = chunk.toString().replace(/\n$/, '');

      let matchString = '';
      if (flag === "--pattern" && pattern.length) {
        matchString = pattern;
      }


      if (data.includes(matchString)) {
        this.push(data + '\n');
      }
      callback();
    }
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();
