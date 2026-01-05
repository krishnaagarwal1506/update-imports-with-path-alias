import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const tsconfigPath = path.join(repoRoot, 'tsconfig.app.json');

function stripJsonComments(str) {
  return str.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function readJSON(p) {
  const raw = fs.readFileSync(p, 'utf8');
  const cleaned = stripJsonComments(raw);
  return JSON.parse(cleaned);
}

function collectFiles(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...collectFiles(full, exts));
    } else if (exts.includes(path.extname(name))) {
      out.push(full);
    }
  }
  return out;
}

function buildMappings(tsconfig) {
  const paths = tsconfig.compilerOptions && tsconfig.compilerOptions.paths;
  if (!paths) return [];
  const mappings = [];
  for (const alias in paths) {
    const targets = paths[alias];
    if (!targets || !targets.length) continue;
    const target = targets[0];
    const aliasKey = alias.replace(/\*$/, '').replace(/\/$/, '');
    const targetRel = target.replace(/\*$/, '').replace(/^\.\//, '');
    const absTarget = path.resolve(repoRoot, targetRel);
    mappings.push({ alias: aliasKey, target: absTarget });
  }
  return mappings;
}

function replaceImportsInFile(filePath, mappings) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /(from\s+)(['"])(\.\.?\/[\w\-./@?=%#]+)(\2)/g;
  let changed = false;

  content = content.replace(
    importRegex,
    (match, fromWord, quote, relPath, _q) => {
      const [purePath] = relPath.split(/(\?.*)/).filter(Boolean);
      const suffixPart = relPath.slice(purePath.length);

      const fileDir = path.dirname(filePath);
      const resolved = path.resolve(fileDir, purePath);

      for (const m of mappings) {
        if (resolved === m.target || resolved.startsWith(m.target + path.sep)) {
          let relInside = path.relative(m.target, resolved).replace(/\\/g, '/');
          if (!relInside) relInside = '';
          const aliasPath = (
            m.alias +
            (relInside ? '/' + relInside : '') +
            suffixPart
          ).replace(/\\\\/g, '/');
          changed = true;
          return fromWord + quote + aliasPath + quote;
        }
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', path.relative(repoRoot, filePath));
  }
  return changed;
}

function main() {
  const tsconfig = readJSON(tsconfigPath);
  const mappings = buildMappings(tsconfig);
  const srcDir = path.join(repoRoot, 'src');
  const files = collectFiles(srcDir);
  let totalChanged = 0;
  for (const f of files) {
    try {
      const c = replaceImportsInFile(f, mappings);
      if (c) totalChanged++;
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }
  console.log(
    'Processed',
    files.length,
    'files. Updated',
    totalChanged,
    'files.'
  );
}

main();