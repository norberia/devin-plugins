#!/usr/bin/env node
// Validates the root meta-plugin and every plugin under plugins/.
// Run: node scripts/validate.mjs

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pluginsDir = join(root, "plugins");
const repoUrl = /github\.com\/norberia\/devin-plugins(\.git)?$/;
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const semver = /^\d+\.\d+\.\d+([-+].*)?$/;

const errors = [];
const fail = (msg) => errors.push(msg);

function parseJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`${label}: invalid JSON (${e.message})`);
    return null;
  }
}

// Returns the same-repo git-subdir paths listed in requiredPlugins.
function checkManifest(manifest, label) {
  if (!manifest.name) fail(`${label}: manifest missing "name"`);
  else if (!kebab.test(manifest.name))
    fail(`${label}: name "${manifest.name}" must be lowercase kebab-case`);
  if (manifest.version && !semver.test(manifest.version))
    fail(`${label}: version "${manifest.version}" is not semver`);

  const localPaths = [];
  for (const list of ["requiredPlugins", "optionalPlugins", "forbiddenPlugins"]) {
    if (manifest[list] === undefined) continue;
    if (!Array.isArray(manifest[list])) {
      fail(`${label}: "${list}" must be an array`);
      continue;
    }
    if (list === "forbiddenPlugins") continue;
    for (const ref of manifest[list]) {
      if (ref?.source !== "git-subdir" || !repoUrl.test(ref.url ?? "")) continue;
      if (typeof ref.path !== "string") {
        fail(`${label}: ${list} entry for this repo is missing "path"`);
        continue;
      }
      if (!existsSync(join(root, ref.path, ".devin-plugin", "plugin.json")))
        fail(`${label}: ${list} entry "${ref.path}" does not resolve to a plugin in this repo`);
      if (list === "requiredPlugins") localPaths.push(ref.path.replace(/^\.\//, "").replace(/\/$/, ""));
    }
  }
  return localPaths;
}

const rootLabel = ".devin-plugin/plugin.json";
const rootManifestPath = join(root, rootLabel);
const rootManifest = existsSync(rootManifestPath)
  ? parseJson(rootManifestPath, rootLabel)
  : (fail(`${rootLabel}: not found`), null);
const included = new Set(rootManifest ? checkManifest(rootManifest, rootLabel) : []);

const names = new Set();
for (const entry of existsSync(pluginsDir) ? readdirSync(pluginsDir) : []) {
  const dir = join(pluginsDir, entry);
  if (!statSync(dir).isDirectory()) continue;

  const label = `plugins/${entry}`;
  const manifestPath = join(dir, ".devin-plugin", "plugin.json");
  if (!existsSync(manifestPath)) {
    fail(`${label}: missing .devin-plugin/plugin.json`);
    continue;
  }
  const manifest = parseJson(manifestPath, `${label}/.devin-plugin/plugin.json`);
  if (!manifest) continue;

  checkManifest(manifest, label);
  if (manifest.name) {
    if (names.has(manifest.name)) fail(`${label}: duplicate plugin name "${manifest.name}"`);
    names.add(manifest.name);
    if (manifest.name !== entry)
      fail(`${label}: manifest name "${manifest.name}" should match directory "${entry}"`);
  }
  if (rootManifest && !included.has(label))
    fail(`${label}: not listed in requiredPlugins of ${rootLabel}`);

  for (const file of ["hooks.json", ".mcp.json"]) {
    const p = join(dir, file);
    if (existsSync(p)) parseJson(p, `${label}/${file}`);
  }
}
if (names.size === 0) fail("no plugins found under plugins/");

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("Validation passed.");
