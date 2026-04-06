import { getState, patchState, makeEmptyBuild, makeEmptyClient, makeEmptyRepo } from "../state.js";
import { captureWorkspace, repoWorkspace } from "../workspace/snapshot.js";

const remember = (history, repoPath) => repoPath ? (history.includes(repoPath) ? history : [...history, repoPath]) : history;
const syncHistory = async (repoPaths, lastRepoPath = "") => window.workspaceApi.syncRepos({ repoPaths, lastRepoPath });
const repoNotice = (scan) => scan?.warning
  || (scan?.reason ? `Repo non ajoute. ${scan.reason}` : "Repo non ajoute. Selectionne la racine du projet.");
const pulseRepo = () => {
  patchState((state) => ({ ...state, repoPulse: true }));
  setTimeout(() => patchState((state) => ({ ...state, repoPulse: false })), 220);
};

const saveCurrentWorkspace = async () => {
  const state = getState();
  if (!state.repo.valid) return;
  await window.workspaceApi.saveWorkspace({ repoPath: state.repo.repoPath, workspace: captureWorkspace(state) });
};

const applyRepo = (scan, workspace) => patchState((state) => ({
  ...state,
  repo: scan?.valid ? scan : makeEmptyRepo(),
  repoHistory: scan?.valid ? remember(state.repoHistory, scan.repoPath) : state.repoHistory,
  repoNotice: scan?.warning || "",
  repoPicker: false,
  ...repoWorkspace(state, scan, workspace)
}));

const applyScan = async (scan) => {
  const workspace = scan?.valid ? await window.workspaceApi.loadWorkspace(scan.repoPath) : null;
  applyRepo(scan, workspace);
  pulseRepo();
  return scan;
};

export const pickRepoEntry = async (repoPath) => {
  const state = getState();
  if (!repoPath) return false;
  if (state.repo.valid && state.repo.repoPath === repoPath) {
    patchState((current) => ({ ...current, repoPicker: false, repoNotice: "" }));
    pulseRepo();
    return true;
  }
  return refreshRepo(repoPath);
};

export const refreshRepo = async (repoPath) => {
  await saveCurrentWorkspace();
  const scan = await window.workspaceApi.refreshRepo(repoPath);
  if (scan.valid) return applyScan(scan);
  else {
    const nextHistory = patchState((state) => ({
      ...state,
      repo: makeEmptyRepo(),
      repoHistory: state.repoHistory.filter((item) => item !== repoPath),
      repoNotice: repoNotice(scan),
      repoPicker: false,
      build: makeEmptyBuild(),
      client: makeEmptyClient(),
      github: { ...state.github, localState: "Aucun repo charge.", branches: [], report: [], token: "", remote: "" }
    })).repoHistory;
    await syncHistory(nextHistory, nextHistory[0] || "");
  }
  return scan;
};

export const chooseRepo = async () => {
  const keepPicker = getState().repoPicker;
  patchState((state) => ({ ...state, repoNotice: "" }));
  await saveCurrentWorkspace();
  const scan = await window.workspaceApi.chooseRepo();
  if (scan?.valid) return applyScan(scan);
  if (scan?.selectedPath) patchState((state) => ({ ...state, repoPicker: keepPicker, repoNotice: repoNotice(scan) }));
  return scan;
};

export const openRepoPicker = () => {
  const { repoHistory } = patchState((state) => ({ ...state, repoNotice: "" }));
  return repoHistory.length ? patchState((state) => ({ ...state, repoPicker: true })) : chooseRepo();
};
export const closeRepoPicker = () => patchState((state) => ({ ...state, repoPicker: false, repoNotice: "" }));
export const removeRepoEntry = async (repoPath) => {
  const next = patchState((state) => ({ ...state, repoHistory: state.repoHistory.filter((item) => item !== repoPath) })).repoHistory;
  const active = patchState((state) => state).repo.repoPath;
  if (active !== repoPath) return syncHistory(next, active);
  if (next[0]) return refreshRepo(next[0]).then(() => syncHistory(next, next[0]));
  patchState((state) => ({
    ...state, repo: makeEmptyRepo(), repoPicker: false, build: makeEmptyBuild(), client: makeEmptyClient(),
    github: { ...state.github, localState: "Aucun repo charge.", branches: [], report: [], token: "", remote: "" }
  }));
  return syncHistory([], "");
};
export const applyRepoData = applyRepo;
