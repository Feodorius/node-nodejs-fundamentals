const defaultTotalDuration = 5000;
const defaultIntervalDuration = 100;
const defaultLength = 30;
const defaultColor = "";
const resetStyle = "\x1b[0m";


// For faster cross-check use copy/paste the script below :)
// node src/cli/progress.js --duration 1000 --interval 200 --length 120 --color "#88F181"

const progress = () => {
  const opts = parseArgs();
  let color = defaultColor;

  if (opts.color) {
    color = formatColor(opts.color);
  }

  const startTime = Date.now();

  const timer = setInterval(() => {
    const now = Date.now();
    let percent = (now - startTime) / opts.duration;
    if (percent > 1) {
      percent = 1;
    }

    process.stdout.write('\r' + renderBar(percent, opts.length, color));

    if (percent >= 1) {
      clearInterval(timer);
      process.stdout.write('\nDone!\n');
    }
  }, opts.interval);


};

progress();

function parseArgs() {
  const args = process.argv.slice(2);

  const opts = {
    duration: defaultTotalDuration,
    interval: defaultIntervalDuration,
    length: defaultLength,
    color: defaultColor
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--duration' && args[i + 1]) {
      opts.duration = Number(args[++i]);
    } else if (args[i] === '--interval' && args[i + 1]) {
      opts.interval = Number(args[++i]);
    } else if (args[i] === '--length' && args[i + 1]) {
      opts.length = Number(args[++i]);
    } else if (args[i] === '--color' && args[i + 1]) {
      opts.color = args[++i];
    }
  }

  return opts;
}

function formatColor(hexColor) {
  let hex = hexColor;
  if (hex.length === 3) {
    hex = hex.split('').map(ch => ch + ch).join('');
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return defaultColor;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m`;
}

function renderBar(percent, length, color) {
  const fullBlock = '\u2588';
  const emptyBlock = ' ';

  const filledLen = Math.round(length * percent);
  const emptyLen = length - filledLen;

  const filled = fullBlock.repeat(filledLen);
  const empty = emptyBlock.repeat(emptyLen);

  let result = '[';
  if (color && filledLen > 0) {
    result += color + filled + resetStyle + empty;
  } else {
    result += filled + empty;
  }
  result += `] ${Math.round(percent * 100)}%`;
  return result;
}