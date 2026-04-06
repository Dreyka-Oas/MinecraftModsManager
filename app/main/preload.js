const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);

contextBridge.exposeInMainWorld("workspaceApi", {
  bootstrap: () => invoke("bootstrap"),
  chooseRepo: () => invoke("choose-repo"),
  openRepoMenu: (payload) => invoke("open-repo-menu", payload),
  refreshRepo: (repoPath) => invoke("refresh-repo", repoPath),
  syncRepos: (payload) => invoke("sync-repos", payload),
  loadWorkspace: (repoPath) => invoke("workspace-load", repoPath),
  saveWorkspace: (payload) => invoke("workspace-save", payload),
  saveGithub: (payload) => invoke("github-save", payload),
  setupGitignore: (repoPath) => invoke("github-gitignore", repoPath),
  refreshGithub: (repoPath) => invoke("github-refresh", repoPath),
  testGithub: (payload) => invoke("github-test", payload),
  receiveGithub: (payload) => invoke("github-receive", payload),
  publishGithub: (payload) => invoke("github-publish", payload),
  startBuilds: (payload) => invoke("build-start", payload),
  cancelBuilds: () => invoke("build-cancel"),
  startClients: (payload) => invoke("client-start", payload),
  cancelClients: () => invoke("client-cancel"),
  deleteJars: (payload) => invoke("jars-delete", payload),
  onEvent: (handler) => ipcRenderer.on("workspace:event", (_, data) => handler(data))
});
