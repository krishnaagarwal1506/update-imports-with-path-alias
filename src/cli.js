import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, "../scripts/update-imports.js");

const args = process.argv.slice(2);
const command = `node ${scriptPath} ${args.join(" ")}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Script stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});
