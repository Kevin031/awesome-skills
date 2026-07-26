#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");

const TARGETS = {
  cursor: path.join(os.homedir(), ".cursor", "skills"),
  claude: path.join(os.homedir(), ".claude", "skills"),
  codex: path.join(os.homedir(), ".codex", "skills"),
};

const args = process.argv.slice(2);
const unlink = args.includes("--unlink");
const statusOnly = args.includes("--status");
const selectedTargets = args.filter((arg) => !arg.startsWith("--"));

function usage() {
  console.log(`Usage:
  pnpm skills:link              Link all skills to cursor, claude, and codex
  pnpm skills:link:cursor       Link to ~/.cursor/skills
  pnpm skills:link:claude       Link to ~/.claude/skills
  pnpm skills:link:codex        Link to ~/.codex/skills
  pnpm skills:unlink            Remove symlinks created by this project
  pnpm skills:status            Show symlink status

  pnpm skills:link cursor       Link to a specific target only
  pnpm skills:unlink claude
`);
}

function getSkillNames() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, "SKILL.md")))
    .sort();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readLinkTarget(linkPath) {
  try {
    return fs.readlinkSync(linkPath);
  } catch {
    return null;
  }
}

function isManagedLink(linkPath, skillName) {
  const target = readLinkTarget(linkPath);
  if (!target) {
    return false;
  }

  const expectedSource = path.join(SKILLS_DIR, skillName);
  const resolved = path.resolve(path.dirname(linkPath), target);
  return resolved === expectedSource;
}

function linkSkill(targetDir, skillName) {
  const source = path.join(SKILLS_DIR, skillName);
  const linkPath = path.join(targetDir, skillName);
  const relativeSource = path.relative(path.dirname(linkPath), source);

  if (fs.existsSync(linkPath)) {
    if (isManagedLink(linkPath, skillName)) {
      return { action: "skip", skillName, linkPath };
    }

    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) {
      const current = readLinkTarget(linkPath);
      fs.unlinkSync(linkPath);
      fs.symlinkSync(relativeSource, linkPath);
      return { action: "replace", skillName, linkPath, previous: current };
    }

    return { action: "blocked", skillName, linkPath, reason: "path exists and is not a symlink" };
  }

  fs.symlinkSync(relativeSource, linkPath);
  return { action: "create", skillName, linkPath };
}

function unlinkSkill(targetDir, skillName) {
  const linkPath = path.join(targetDir, skillName);

  if (!fs.existsSync(linkPath)) {
    return { action: "missing", skillName, linkPath };
  }

  if (!isManagedLink(linkPath, skillName)) {
    return { action: "skip", skillName, linkPath, reason: "not managed by awesome-skills" };
  }

  fs.unlinkSync(linkPath);
  return { action: "remove", skillName, linkPath };
}

function printResults(platform, results) {
  const created = results.filter((item) => item.action === "create");
  const replaced = results.filter((item) => item.action === "replace");
  const skipped = results.filter((item) => item.action === "skip");
  const blocked = results.filter((item) => item.action === "blocked");
  const removed = results.filter((item) => item.action === "remove");
  const missing = results.filter((item) => item.action === "missing");

  console.log(`\n[${platform}] ${TARGETS[platform]}`);

  for (const item of created) {
    console.log(`  + ${item.skillName}`);
  }
  for (const item of replaced) {
    console.log(`  ~ ${item.skillName} (replaced: ${item.previous})`);
  }
  for (const item of removed) {
    console.log(`  - ${item.skillName}`);
  }
  for (const item of skipped) {
    const reason = item.reason ? ` (${item.reason})` : "";
    console.log(`  = ${item.skillName}${reason}`);
  }
  for (const item of blocked) {
    console.log(`  ! ${item.skillName} blocked: ${item.reason}`);
  }
  for (const item of missing) {
    console.log(`  ? ${item.skillName} not linked`);
  }

  if (
    created.length === 0 &&
    replaced.length === 0 &&
    removed.length === 0 &&
    skipped.length === 0 &&
    blocked.length === 0 &&
    missing.length === 0
  ) {
    console.log("  (no skills)");
  }
}

function showStatus(skillNames, platforms) {
  console.log(`Skills source: ${SKILLS_DIR}`);
  console.log(`Found ${skillNames.length} skill(s): ${skillNames.join(", ") || "(none)"}`);

  for (const platform of platforms) {
    const targetDir = TARGETS[platform];
    const results = skillNames.map((skillName) => {
      const linkPath = path.join(targetDir, skillName);
      if (!fs.existsSync(linkPath)) {
        return { action: "missing", skillName, linkPath };
      }
      if (isManagedLink(linkPath, skillName)) {
        return { action: "linked", skillName, linkPath };
      }
      return { action: "foreign", skillName, linkPath, reason: "points elsewhere or is not a symlink" };
    });

    console.log(`\n[${platform}] ${targetDir}`);
    for (const item of results) {
      if (item.action === "linked") {
        console.log(`  ✓ ${item.skillName}`);
      } else if (item.action === "missing") {
        console.log(`  ✗ ${item.skillName}`);
      } else {
        console.log(`  ? ${item.skillName} (${item.reason})`);
      }
    }
  }
}

function resolvePlatforms() {
  if (selectedTargets.length === 0) {
    return Object.keys(TARGETS);
  }

  const unknown = selectedTargets.filter((name) => !(name in TARGETS));
  if (unknown.length > 0) {
    console.error(`Unknown target(s): ${unknown.join(", ")}`);
    console.error(`Available targets: ${Object.keys(TARGETS).join(", ")}`);
    process.exit(1);
  }

  return selectedTargets;
}

function main() {
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }

  const platforms = resolvePlatforms();
  const skillNames = getSkillNames();

  if (statusOnly) {
    showStatus(skillNames, platforms);
    return;
  }

  if (skillNames.length === 0) {
    console.log(`No skills found in ${SKILLS_DIR}`);
    console.log("Add a directory with SKILL.md under skills/ first.");
    return;
  }

  console.log(`${unlink ? "Unlinking" : "Linking"} ${skillNames.length} skill(s) from ${SKILLS_DIR}`);

  for (const platform of platforms) {
    const targetDir = TARGETS[platform];
    ensureDir(targetDir);

    const results = skillNames.map((skillName) =>
      unlink ? unlinkSkill(targetDir, skillName) : linkSkill(targetDir, skillName),
    );

    printResults(platform, results);
  }
}

main();
