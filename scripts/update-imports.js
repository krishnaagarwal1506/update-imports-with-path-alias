import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use current working directory (where user runs npx command)
const repoRoot = process.cwd();
const tsconfigPath = path.join(repoRoot, "tsconfig.app.json");

function stripJsonComments(str) {
  return str.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function readJSON(p) {
  const raw = fs.readFileSync(p, "utf8");
  const cleaned = stripJsonComments(raw);
  return JSON.parse(cleaned);
}

function collectFiles(dir, exts = [".ts", ".tsx", ".js", ".jsx"]) {
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
    const aliasKey = alias.replace(/\*$/, "").replace(/\/$/, "");
    const targetRel = target.replace(/\*$/, "").replace(/^\.\//, "");
    const absTarget = path.resolve(repoRoot, targetRel);
    mappings.push({ alias: aliasKey, target: absTarget });
  }
  return mappings;
}

function replaceImportsInFile(filePath, mappings) {
  let content = fs.readFileSync(filePath, "utf8");
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
          let relInside = path.relative(m.target, resolved).replace(/\\/g, "/");
          if (!relInside) relInside = "";
          const aliasPath = (
            m.alias +
            (relInside ? "/" + relInside : "") +
            suffixPart
          ).replace(/\\\\/g, "/");
          changed = true;
          return fromWord + quote + aliasPath + quote;
        }
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated", path.relative(repoRoot, filePath));
  }
  return changed;
}

function main() {
  // Check if tsconfig.json exists
  if (!fs.existsSync(tsconfigPath)) {
    console.error("❌ Error: tsconfig.json not found in current directory");
    console.error(
      "   Please run this command from your project root that contains tsconfig.json"
    );
    process.exit(1);
  }

  let tsconfig;
  try {
    tsconfig = readJSON(tsconfigPath);
  } catch (err) {
    console.error("❌ Error: Could not read tsconfig.json:", err.message);
    process.exit(1);
  }

  const mappings = buildMappings(tsconfig);

  if (!mappings.length) {
    console.error("❌ Error: No path aliases found in tsconfig.json");
    console.error("   Please add paths to your tsconfig.json compilerOptions:");
    console.error("   {");
    console.error('     "compilerOptions": {');
    console.error('       "paths": {');
    console.error('         "@/*": ["./src/*"]');
    console.error("       }");
    console.error("     }");
    console.error("   }");
    process.exit(1);
  }

  const srcDir = path.join(repoRoot, "src");

  if (!fs.existsSync(srcDir)) {
    console.error("❌ Error: src directory not found");
    console.error(
      '   This tool expects your source files to be in a "src" directory'
    );
    process.exit(1);
  }

  console.log(`🔍 Found ${mappings.length} path alias(es):`);
  mappings.forEach((m) =>
    console.log(`   ${m.alias} → ${path.relative(repoRoot, m.target)}`)
  );
  console.log("");

  const files = collectFiles(srcDir);

  if (!files.length) {
    console.log("📁 No TypeScript/JavaScript files found in src directory");
    process.exit(0);
  }

  console.log(`📂 Processing ${files.length} files...`);

  let totalChanged = 0;
  for (const f of files) {
    try {
      const c = replaceImportsInFile(f, mappings);
      if (c) totalChanged++;
    } catch (err) {
      console.error("Error processing", f, err.message);
    }
  }

  console.log("");
  if (totalChanged > 0) {
    console.log(`✅ Successfully updated ${totalChanged} file(s)!`);
  } else {
    console.log(
      "ℹ️  No files needed updating (no matching relative imports found)"
    );
  }
}

main();
