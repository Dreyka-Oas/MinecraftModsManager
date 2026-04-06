const fs = require("fs/promises");
const path = require("path");
const { listDirs, walk, removeFiles } = require("./files");
const { isHidden } = require("./paths");
const { readRepoConfig } = require("./config");

const jarSkip = new Set([".git", ".gradle", "node_modules", ".idea", ".vscode"]);
const invalidRepo = (selectedPath = "", reason = "") => ({
  valid: false,
  repoPath: "",
  selectedPath,
  reason,
  projectName: "Aucun projet",
  repoLabel: "Aucun repo",
  loadersCount: 0,
  versionsCount: 0,
  loaders: [],
  javaRequirements: [],
  jars: [],
  githubConfig: { githubToken: "", githubRemote: "" }
});
const javaFromGradle = async (file) => {
  try {
    const text = await fs.readFile(file, "utf8");
    const match = text.match(/JavaLanguageVersion\.of\((\d+)\)|targetJavaVersion\s*=\s*(\d+)|options\.release\.set\((\d+)\)/);
    return match ? Number(match[1] || match[2] || match[3]) : null;
  } catch { return null; }
};

const buildJarItems = async (repoPath, loaders) => {
  const items = [];
  for (const loader of loaders) for (const version of loader.versions) {
    const base = path.join(repoPath, loader.name, version.name, "build", "libs");
    const jars = await walk(base, (full, name) => name.endsWith(".jar") && !full.endsWith("-sources.jar"), jarSkip);
    items.push(...jars.map((file) => ({ id: file, path: file, name: path.basename(file), targetId: `${loader.name}/${version.name}` })));
  }
  return items;
};

const scanRepo = async (repoPath) => {
  if (!repoPath) return invalidRepo();
  try {
    const rootDirs = (await listDirs(repoPath)).filter((name) => name !== "scripts" && !isHidden(name));
    const loaders = [];
    for (const name of rootDirs) loaders.push({ name, versions: await Promise.all((await listDirs(path.join(repoPath, name))).filter((v) => !isHidden(v)).map(async (version) => ({ name: version, java: await javaFromGradle(path.join(repoPath, name, version, "build.gradle")) }))) });
    const versionsCount = loaders.reduce((sum, loader) => sum + loader.versions.length, 0);
    const valid = versionsCount > 0;
    if (!valid) return invalidRepo(repoPath, "Selectionne la racine qui contient les loaders et leurs versions.");
    const githubConfig = valid ? await readRepoConfig(repoPath) : { githubToken: "", githubRemote: "" };
    return {
      valid,
      repoPath,
      selectedPath: repoPath,
      repoLabel: valid ? repoPath : "Aucun repo",
      projectName: valid ? path.basename(repoPath) : "Aucun projet",
      loadersCount: rootDirs.length,
      versionsCount,
      loaders,
      javaRequirements: loaders.flatMap((loader) => loader.versions.map((version) => ({ id: `${loader.name}/${version.name}`, java: version.java }))),
      jars: valid ? await buildJarItems(repoPath, loaders) : [],
      githubConfig
    };
  } catch {
    return invalidRepo(repoPath, "Le dossier selectionne n'a pas pu etre analyse.");
  }
};

const deleteJars = async ({ paths = [], repoPath }) => {
  await removeFiles(paths);
  return scanRepo(repoPath);
};

module.exports = { scanRepo, deleteJars };
