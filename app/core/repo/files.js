const fs = require("fs/promises");
const path = require("path");

const readJson = async (file, fallback = {}) => {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return fallback; }
};

const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
};

const listDirs = async (dir) => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch { return []; }
};

const walk = async (dir, pick, skip = new Set()) => {
  const out = [];
  const visit = async (current) => {
    let entries = [];
    try { entries = await fs.readdir(current, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      if (skip.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(full);
      if (entry.isFile() && pick(full, entry.name)) out.push(full);
    }
  };
  await visit(dir);
  return out;
};

const removeFiles = async (paths) => {
  await Promise.all(paths.map((file) => fs.rm(file, { force: true })));
};

module.exports = { readJson, writeJson, listDirs, walk, removeFiles };
