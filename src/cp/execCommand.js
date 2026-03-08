import { spawn } from "child_process";

const execCommand = () => {
  const command = process.argv[2];

  if (!command) {
    console.error("Error: No command provided");
    process.exit(1);
  }

  const [cmd, ...args] = command.split(" ");
  const child = spawn(cmd, args, {
    env: process.env,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });
};

execCommand();
