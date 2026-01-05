import { exec } from 'child_process';

const scriptPath = '../scripts/update-imports.js';

const args = process.argv.slice(2);
const command = `node ${scriptPath} ${args.join(' ')}`;

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