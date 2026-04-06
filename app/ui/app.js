import { getState, patchState } from "./state.js";
import { onClick, onChange, onInput } from "./controllers/actions.js";
import { applyEvent } from "./controllers/events.js";
import { bindLayout } from "./layout/resize.js";
import { refreshRepo } from "./controllers/repo.js";
import { createPainter } from "./render/paint.js";
import { captureWorkspace } from "./workspace/snapshot.js";

const root = document.querySelector("#app");
const painter = createPainter(root);
const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme.mode;
  document.documentElement.dataset.contrast = theme.highContrast ? "high" : "normal";
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.documentElement.style.setProperty("--chrome", theme.reducedTransparency ? ".98" : theme.mode === "dark" ? ".72" : ".78");
  document.documentElement.style.setProperty("--blur", theme.reducedTransparency ? "0px" : "24px");
};
let saveTick = 0;
let lastWorkspaceKey = "";
const saveWorkspaceNow = () => {
  const state = getState();
  if (!state.repo.valid) return;
  const workspace = captureWorkspace(state);
  const key = JSON.stringify({ repoPath: state.repo.repoPath, workspace });
  if (key === lastWorkspaceKey) return;
  lastWorkspaceKey = key;
  void window.workspaceApi.saveWorkspace({ repoPath: state.repo.repoPath, workspace });
};
const queueWorkspaceSave = () => {
  if (saveTick) return;
  saveTick = window.setTimeout(() => { saveTick = 0; saveWorkspaceNow(); }, 180);
};
const render = () => {
  const state = getState();
  applyTheme(state.theme);
  painter.render(state);
  queueWorkspaceSave();
};
const restoreRepo = async (repoPath) => {
  await refreshRepo(repoPath);
  render();
};
const refreshView = async (result) => {
  if (result === false) return;
  if (result && typeof result.then === "function") {
    render();
    try { await result; }
    catch (error) { patchState((state) => ({ ...state, repoNotice: error.message || "Action repo impossible." })); }
    render();
    return;
  }
  render();
};

document.addEventListener("click", (event) => { void refreshView(onClick(event)); });
document.addEventListener("change", (event) => { void refreshView(onChange(event)); });
document.addEventListener("input", (event) => { onInput(event); });
document.addEventListener("keydown", (event) => {
  const state = getState();
  const tag = document.activeElement?.tagName || "";
  const editable = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || document.activeElement?.isContentEditable;
  if (!editable && state.activeTab === "build" && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a" && state.build.jars.length) {
    event.preventDefault();
    patchState((current) => ({ ...current, build: { ...current.build, selectedJars: current.build.jars.map((jar) => jar.id) } }));
    render();
  }
});
window.workspaceApi.onEvent((payload) => {
  applyEvent(payload); render();
});
window.addEventListener("beforeunload", saveWorkspaceNow);
bindLayout();

const boot = async () => {
  render();
  const { lastRepoPath, repoPaths = [], theme, java } = await window.workspaceApi.bootstrap();
  patchState((state) => ({ ...state, repoHistory: repoPaths, theme: theme || state.theme, java: java || state.java }));
  render();
  const candidates = [...new Set([lastRepoPath, ...repoPaths].filter(Boolean))];
  for (const repoPath of candidates) {
    await restoreRepo(repoPath);
    if (getState().repo.valid) break;
  }
  render();
  if (!getState().repo.valid && getState().repoHistory.length > 0) {
    patchState((state) => ({ ...state, repoPicker: true }));
    render();
  }
};

boot().catch((error) => {
  patchState((state) => ({ ...state, repoNotice: error.message || "Chargement initial impossible.", repoPicker: state.repoHistory.length > 0 }));
  render();
});
