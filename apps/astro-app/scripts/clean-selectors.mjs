#!/usr/bin/env node
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { argv, exit, stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

const SCAN_EXTS = new Set([".ts", ".tsx", ".astro", ".mts", ".cts"]);
const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".astro",
  ".next",
  "build",
  ".git",
  ".turbo",
  "coverage",
  "playwright-report",
  "test-results",
]);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function isSelectorsFile(path) {
  return /[\\/]__e2e__[\\/]selectors\.ts$/.test(path);
}

function extractRegistries(content) {
  const re =
    /export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\]\s*as\s+const\s*;/g;
  const result = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    const [, name, body] = m;
    const stringRe = /["'`]([^"'`]+)["'`]/g;
    const selectors = [];
    let sm;
    while ((sm = stringRe.exec(body)) !== null) selectors.push(sm[1]);
    result.push({ name, selectors });
  }
  return result;
}

function isUsed(selector, corpus) {
  return (
    corpus.includes(`"${selector}"`) ||
    corpus.includes(`'${selector}'`) ||
    corpus.includes(`\`${selector}\``)
  );
}

async function main() {
  const arg = argv[2];
  if (!arg) {
    console.error("Usage: node scripts/clean-selectors.mjs <scanDir>");
    exit(2);
  }
  const root = resolve(arg);
  try {
    const s = await stat(root);
    if (!s.isDirectory()) throw new Error("not a directory");
  } catch {
    console.error(`Not a directory: ${root}`);
    exit(2);
  }

  const allFiles = (await walk(root)).filter((f) =>
    SCAN_EXTS.has(f.slice(f.lastIndexOf("."))),
  );
  const selectorsFiles = allFiles.filter(isSelectorsFile);
  const sourceFiles = allFiles.filter((f) => !isSelectorsFile(f));

  if (selectorsFiles.length === 0) {
    console.log("No __e2e__/selectors.ts files found.");
    return;
  }

  const sources = await Promise.all(
    sourceFiles.map((f) => readFile(f, "utf8")),
  );
  const corpus = sources.join("\n");

  const registries = [];
  for (const f of selectorsFiles) {
    const content = await readFile(f, "utf8");
    registries.push({ file: f, blocks: extractRegistries(content) });
  }

  let totalUnused = 0;
  const report = [];

  for (const reg of registries) {
    const blocks = [];
    for (const block of reg.blocks) {
      const unused = block.selectors.filter((sel) => !isUsed(sel, corpus));
      blocks.push({ name: block.name, unused });
      totalUnused += unused.length;
    }
    report.push({ file: reg.file, blocks });
  }

  console.log(
    `Scanned: ${selectorsFiles.length} registries, ${sourceFiles.length} source files`,
  );
  for (const r of report) {
    console.log(`\n${relative(root, r.file)}`);
    for (const b of r.blocks) {
      if (b.unused.length === 0) {
        console.log(`  ${b.name}: all used`);
      } else {
        console.log(`  ${b.name}: ${b.unused.length} unused`);
        for (const s of b.unused) console.log(`    - ${s}`);
      }
    }
  }
  console.log(`\nTotal unused: ${totalUnused}`);

  if (totalUnused <= 1) {
    console.log("Skip cleanup (<= 1 unused).");
    return;
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const ans = (
    await rl.question(`Remove ${totalUnused} unused selectors? [y/N] `)
  )
    .trim()
    .toLowerCase();
  rl.close();

  if (ans !== "y" && ans !== "yes") {
    console.log("Aborted.");
    return;
  }

  for (const r of report) {
    const unused = new Set(r.blocks.flatMap((b) => b.unused));
    if (unused.size === 0) continue;
    const original = await readFile(r.file, "utf8");
    const lines = original.split("\n");
    const kept = lines.filter((line) => {
      for (const sel of unused) {
        if (
          line.includes(`"${sel}"`) ||
          line.includes(`'${sel}'`) ||
          line.includes(`\`${sel}\``)
        )
          return false;
      }
      return true;
    });
    await writeFile(r.file, kept.join("\n"));
    console.log(
      `Cleaned: ${relative(root, r.file)} (${lines.length - kept.length} lines removed)`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  exit(1);
});
