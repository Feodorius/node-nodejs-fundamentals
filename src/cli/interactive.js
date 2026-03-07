import { cwd, exit, uptime } from "process";
import readline from "readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.prompt();

  rl.on('close', () => {
    console.log('Goodbye!');
    exit(0);
  });

  rl.on('SIGINT', () => {
    console.log('Goodbye!');
    exit(0);
  });

  rl.on("line", (line) => {
    switch (line.trim()) {
      case 'uptime':
        console.log(`Uptime: ${uptime().toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(cwd());
        break;
      case 'date':
        console.log(new Date().toISOString());
        break;
      case 'exit':
        console.log('Goodbye!');
        process.exit(0);
      default:
        console.log('Unknown command');
    }
    rl.prompt();
  });
};

interactive();
