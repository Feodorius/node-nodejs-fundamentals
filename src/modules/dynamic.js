import { existsSync } from 'fs';
import path from 'path';
import { exit } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginsFolderPath = path.resolve(__dirname, 'plugins');

const dynamic = async () => {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.log("No plugins selected");
    exit(1);
  }

  for (const name of args) {
    const pluginPath = path.resolve(pluginsFolderPath, `${name}.js`);
    if (!existsSync(pluginPath)) {
      console.log("Plugin not found");
      exit(1);
    }

    try {
      const moduleUrl = pathToFileURL(pluginPath).href;
      const plugin = await import(moduleUrl);
      if (typeof plugin.run === "function") {
        const result = await plugin.run();
        console.log(result);
      }

    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        console.log('Plugin not found');
      } else {
        console.log(error);
      }
      process.exit(1);
    }
  }
};

await dynamic();
