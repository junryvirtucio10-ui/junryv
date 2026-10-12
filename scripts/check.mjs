import { readFile, readdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = await readFile(resolve(root, "index.html"), "utf8");
const errors = [];
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
if (new Set(ids).size !== ids.length) errors.push("Duplicate HTML IDs.");

let references = 0;
for (const [, reference] of html.matchAll(/\b(?:src|href|action)="([^"]+)"/g)) {
  if (reference.startsWith("#")) {
    if (!ids.includes(reference.slice(1))) errors.push(`Missing anchor: ${reference}`);
  } else if (!/^(?:[a-z]+:|\/\/)/i.test(reference)) {
    references += 1;
    try {
      await access(resolve(root, reference.split(/[?#]/)[0]));
    } catch {
      errors.push(`Missing file: ${reference}`);
    }
  }
}

const scripts = (await readdir(resolve(root, "assets/js"))).filter((name) => name.endsWith(".js"));
for (const name of scripts) {
  const filename = resolve(root, "assets/js", name);
  const source = await readFile(filename, "utf8");
  const syntax = spawnSync(process.execPath, ["--input-type=module", "--check"], {
    input: source,
    encoding: "utf8",
  });
  if (syntax.status !== 0) errors.push(`${name}: ${syntax.stderr.trim()}`);
  for (const [, dependency] of source.matchAll(/\bfrom\s+["'](\.[^"']+)["']/g)) {
    try {
      await access(resolve(dirname(filename), dependency));
    } catch {
      errors.push(`Missing module: ${name} → ${dependency}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Passed: ${references} local asset references, HTML anchors, and ${scripts.length} JavaScript modules.`,
  );
}
