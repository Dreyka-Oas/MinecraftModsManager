const fs = require("fs/promises");
const { execFile } = require("child_process");
const { readJson, writeJson } = require("./files");
const { appConfigPaths, repoConfigPath } = require("./paths");

const normalizeRepoPath = (value = "") => String(value || "").replace(/\//g, "\\");
const shape = (data = {}) => ({
  lastRepoPath: normalizeRepoPath(data.lastRepoPath),
  repoPaths: [...new Set((data.repoPaths || []).map(normalizeRepoPath).filter(Boolean))],
  workspaces: data.workspaces && typeof data.workspaces === "object"
    ? Object.fromEntries(Object.entries(data.workspaces).map(([key, value]) => [normalizeRepoPath(key), value]))
    : {}
});

const mergeState = (base, current) => ({
  repoPaths: [...new Set([...(base.repoPaths || []), ...(current.repoPaths || [])])],
  lastRepoPath: current.lastRepoPath || base.lastRepoPath || "",
  workspaces: { ...(base.workspaces || {}), ...(current.workspaces || {}) }
});

const loadBootstrap = async (app) => (await Promise.all(appConfigPaths(app).map((file) => readJson(file, {}))))
  .map(shape)
  .reduce(mergeState, shape());

const writeAppState = async (app, data) => {
  let lastError = null;
  for (const file of appConfigPaths(app)) try {
    await writeJson(file, data);
    return { ok: true, file };
  } catch (error) { lastError = error; }
  throw lastError || new Error("Impossible d'enregistrer la configuration locale.");
};

const saveAppState = async (app, repoPaths = [], lastRepoPath = "") => {
  const current = await loadBootstrap(app);
  return writeAppState(app, shape({ ...current, repoPaths, lastRepoPath }));
};

const saveAppRepo = async (app, repoPath) => {
  const current = await loadBootstrap(app);
  const currentRepo = normalizeRepoPath(repoPath);
  const repoPaths = [...current.repoPaths.filter((item) => item !== currentRepo), currentRepo];
  return saveAppState(app, repoPaths, currentRepo);
};

const syncAppRepos = async (app, repoPaths, lastRepoPath = "") => {
  const valid = [];
  for (const item of repoPaths.map(normalizeRepoPath)) try { await fs.access(item); valid.push(item); } catch {}
  const currentRepo = normalizeRepoPath(lastRepoPath);
  const current = valid.includes(currentRepo) ? currentRepo : valid[0] || "";
  return saveAppState(app, valid, current);
};

const loadWorkspaceState = async (app, repoPath) => {
  if (!repoPath) return null;
  const current = await loadBootstrap(app);
  return current.workspaces?.[normalizeRepoPath(repoPath)] || null;
};

const saveWorkspaceState = async (app, repoPath, workspace) => {
  if (!repoPath) return { ok: false };
  const current = await loadBootstrap(app);
  return writeAppState(app, shape({ ...current, workspaces: { ...current.workspaces, [normalizeRepoPath(repoPath)]: workspace } }));
};

const readRepoConfig = async (repoPath) =>
  readJson(repoConfigPath(repoPath), { githubToken: "", githubRemote: "" });

const runGit = (args, cwd) =>
  new Promise((resolve, reject) => {
    execFile("git", args, { cwd }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr.trim() || stdout.trim() || error.message));
      else resolve(stdout.trim());
    });
  });

const saveGithubConfig = async ({ repoPath, githubToken, githubRemote }) => {
  if (!repoPath) throw new Error("Repo absent.");
  if (!githubRemote?.trim()) throw new Error("Remote GitHub invalide.");
  const data = { githubToken: githubToken?.trim() || "", githubRemote: githubRemote.trim() };
  await runGit(["init"], repoPath).catch(() => "");
  const hasOrigin = await runGit(["remote", "get-url", "origin"], repoPath).then(() => true).catch(() => false);
  await runGit(hasOrigin ? ["remote", "set-url", "origin", data.githubRemote] : ["remote", "add", "origin", data.githubRemote], repoPath);
  await writeJson(repoConfigPath(repoPath), data);
  return { ok: true, config: data };
};

module.exports = { loadBootstrap, saveAppRepo, syncAppRepos, loadWorkspaceState, saveWorkspaceState, readRepoConfig, saveGithubConfig };
