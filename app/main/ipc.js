const { dialog, app, Menu } = require("electron");
const { loadBootstrap, saveAppRepo, syncAppRepos, loadWorkspaceState, saveWorkspaceState, saveGithubConfig } = require("../core/repo/config");
const { scanRepo, deleteJars } = require("../core/repo/scan");
const { startBuilds, cancelBuilds } = require("../core/tasks/build");
const { startClients, cancelClients } = require("../core/tasks/client");
const { refreshGithub, testGithub, receiveGithub } = require("../core/github/refresh");
const { publishGithub, setupGitignore } = require("../core/github/publish");
const { themeState, bindTheme } = require("./theme");
const { spawnSync } = require("child_process");
const { writeFile } = require("fs/promises");
const path = require("path");

const detectJava = () => {
  const result = spawnSync("java", ["-version"], { encoding: "utf8" });
  const text = `${result.stderr || ""}\n${result.stdout || ""}`;
  const match = text.match(/version \"(\d+)(?:\.(\d+))?/i) || text.match(/openjdk version \"(\d+)/i);
  return { home: process.env.JAVA_HOME || "", detected: match ? Number(match[1]) : "" };
};

let currentWin = null;
let registered = false;
let releaseTheme = () => {};
const canSend = () => currentWin && !currentWin.isDestroyed() && currentWin.webContents && !currentWin.webContents.isDestroyed();
const send = (type, payload) => { if (canSend()) currentWin.webContents.send("workspace:event", { type, payload }); };
const keepRepo = async (repo) => {
  if (!repo?.valid) return repo;
  try { await saveAppRepo(app, repo.repoPath); return repo; }
  catch (error) { return { ...repo, warning: "Repo charge mais non memorise. Configuration locale inaccessible." }; }
};
const soft = async (work) => {
  try { return await work(); }
  catch (error) { return { ok: false, error: error.message }; }
};
const exportText = async (payload = {}) => {
  const title = payload.title || "Extraire le contenu";
  const defaultName = payload.defaultName || "export.txt";
  const text = typeof payload.text === "string" ? payload.text : "";
  const result = await dialog.showSaveDialog(currentWin, {
    title,
    defaultPath: path.join(app.getPath("documents"), defaultName),
    filters: [{ name: "Fichier texte", extensions: ["txt"] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFile(result.filePath, text, "utf8");
  return { canceled: false, filePath: result.filePath };
};

const registerIpc = (win) => {
  const { ipcMain } = require("electron");
  currentWin = win;
  releaseTheme();
  releaseTheme = bindTheme(win, (payload) => send("theme-updated", payload));
  win.loadFile(require("path").join(__dirname, "../ui/index.html"));
  win.once("closed", () => {
    if (currentWin === win) currentWin = null;
    releaseTheme();
    releaseTheme = () => {};
  });
  if (registered) return;
  registered = true;
  ipcMain.handle("bootstrap", async () => ({ ...(await loadBootstrap(app)), theme: themeState(), java: detectJava() }));
  ipcMain.handle("choose-repo", async () => {
    const pick = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
    if (pick.canceled || !pick.filePaths[0]) return null;
    return keepRepo(await scanRepo(pick.filePaths[0]));
  });
  ipcMain.handle("open-repo-menu", (_, payload) => {
    const template = payload.repoPaths?.length
      ? payload.repoPaths.map((repoPath) => ({
          label: repoPath.split(/[/\\]/).pop(),
          type: "radio",
          checked: repoPath === payload.currentRepoPath,
          click: () => send("repo-picked", { repoPath })
        }))
      : [{ label: "Aucun repo memorise", enabled: false }];
    Menu.buildFromTemplate(template).popup({ window: currentWin });
    return { ok: true };
  });
  ipcMain.handle("refresh-repo", async (_, repoPath) => {
    return keepRepo(await scanRepo(repoPath));
  });
  ipcMain.handle("sync-repos", (_, payload) => soft(() => syncAppRepos(app, payload.repoPaths, payload.lastRepoPath)));
  ipcMain.handle("workspace-load", (_, repoPath) => loadWorkspaceState(app, repoPath));
  ipcMain.handle("workspace-save", (_, payload) => soft(() => saveWorkspaceState(app, payload.repoPath, payload.workspace)));
  ipcMain.handle("text-export", (_, payload) => soft(() => exportText(payload)));
  ipcMain.handle("jars-delete", (_, payload) => deleteJars(payload));
  ipcMain.handle("build-start", (_, payload) => startBuilds(payload, send));
  ipcMain.handle("build-cancel", () => cancelBuilds());
  ipcMain.handle("client-start", (_, payload) => startClients(payload, send));
  ipcMain.handle("client-cancel", () => cancelClients());
  ipcMain.handle("github-save", (_, payload) => saveGithubConfig(payload));
  ipcMain.handle("github-gitignore", (_, repoPath) => setupGitignore(repoPath));
  ipcMain.handle("github-refresh", (_, repoPath) => refreshGithub(repoPath));
  ipcMain.handle("github-test", (_, payload) => testGithub(payload));
  ipcMain.handle("github-receive", (_, payload) => receiveGithub(payload));
  ipcMain.handle("github-publish", (_, payload) => publishGithub(payload, send));
};

module.exports = { registerIpc };
