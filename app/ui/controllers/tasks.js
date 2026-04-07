import { patchState, getState } from "../state.js";

const SUPPORTED = ["fabric", "forge", "neoforge"];
export const selectableLoaders = (state) => state.repo.loaders.filter((loader) => SUPPORTED.includes(loader.name));
const targetFromId = (repoPath, id) => ({ id, loader: id.split("/")[0], version: id.split("/")[1], path: `${repoPath}\\${id.replace("/", "\\")}` });
const expandedMap = (state) => Object.fromEntries(selectableLoaders(state).map((loader) => [loader.name, false]));
const versionIds = (state, loader) => (selectableLoaders(state).find((item) => item.name === loader)?.versions || []).map((version) => `${loader}/${version.name || version}`);
const applyChecked = (items, selected, checked) => checked ? [...new Set([...selected, ...items])] : selected.filter((id) => !items.includes(id));
const jarsForTargets = (state, ids) => state.build.jars.filter((jar) => ids.includes(jar.targetId)).map((jar) => jar.id);
const joinBlocks = (items, empty) => {
  const lines = Array.isArray(items) ? items : [];
  if (!lines.length) return empty;
  return lines.join("\n\n--------------------\n\n");
};
const exportText = async ({ title, defaultName, text, success }) => {
  const result = await window.workspaceApi.exportText({ title, defaultName, text });
  if (result?.canceled) return result;
  if (!result?.ok && result?.error) throw new Error(result.error);
  if (result?.filePath) {
    patchState((state) => ({ ...state, repoNotice: `${success} ${result.filePath}` }));
  }
  return result;
};

export const openModal = (kind) => patchState((state) => ({ ...state, modal: { kind, selected: [], expanded: expandedMap(state), ram: state.client.ram || 3, clearJars: false, killAfterEnabled: false, killAfterDelay: state.client.killAfterDelay || 60 } }));
export const closeModal = () => patchState((state) => ({ ...state, modal: null }));
export const openJavaPicker = () => patchState((state) => ({ ...state, javaPicker: true }));
export const closeJavaPicker = () => patchState((state) => ({ ...state, javaPicker: false }));
export const setKillAfterEnabled = (checked) => patchState((state) => ({ ...state, modal: { ...state.modal, killAfterEnabled: checked } }));
export const setKillAfterDelay = (val) => patchState((state) => ({ ...state, modal: { ...state.modal, killAfterDelay: Math.max(1, Number(val) || 60) } }));
export const setRam = (ram) => patchState((state) => ({ ...state, modal: { ...state.modal, ram: Number(ram) } }));
export const setClearJars = (checked) => patchState((state) => ({ ...state, modal: { ...state.modal, clearJars: checked } }));
export const toggleGroup = (loader) => patchState((state) => ({
  ...state,
  modal: { ...state.modal, expanded: { ...state.modal.expanded, [loader]: !state.modal.expanded?.[loader] } }
}));

export const setTarget = (id, checked) => patchState((state) => ({
  ...state,
  modal: { ...state.modal, selected: applyChecked([id], state.modal.selected, checked) }
}));

export const setLoader = (loader, checked) => patchState((state) => ({
  ...state,
  modal: { ...state.modal, selected: applyChecked(versionIds(state, loader), state.modal.selected, checked) }
}));

export const setJar = (id, checked) => patchState((state) => ({
  ...state,
  build: { ...state.build, selectedJars: applyChecked([id], state.build.selectedJars, checked) }
}));

export const clearBuildLogs = () => patchState((state) => ({ ...state, build: { ...state.build, logs: ["[RUN] Console vide."] } }));
export const clearBuildReports = () => patchState((state) => ({ ...state, build: { ...state.build, reports: [] } }));
export const clearBuildErrors = () => patchState((state) => ({ ...state, build: { ...state.build, errors: ["Aucune erreur."] } }));
export const clearClientLogs = () => patchState((state) => ({ ...state, client: { ...state.client, logs: [] } }));
export const clearClientReports = () => patchState((state) => ({ ...state, client: { ...state.client, reports: [] } }));
export const clearClientResults = () => patchState((state) => ({ ...state, client: { ...state.client, results: ["Aucun test lance."] } }));
export const clearGithubReport = () => patchState((state) => ({ ...state, github: { ...state.github, report: [] } }));
export const exportBuildLogs = () => exportText({
  title: "Extraire la console de build",
  defaultName: "build-console.txt",
  text: (getState().build.logs || []).join("\n"),
  success: "Console de build enregistree :"
});
export const exportBuildReports = () => exportText({
  title: "Extraire le rapport de build",
  defaultName: "build-report.txt",
  text: (getState().build.reports || []).join("\n"),
  success: "Rapport de build enregistre :"
});
export const exportBuildErrors = () => exportText({
  title: "Extraire les erreurs de build",
  defaultName: "build-errors.txt",
  text: joinBlocks(getState().build.errors?.[0] === "Aucune erreur." ? [] : getState().build.errors, "Aucune erreur."),
  success: "Erreurs de build enregistrees :"
});
export const exportClientLogs = () => exportText({
  title: "Extraire la console de test",
  defaultName: "client-console.txt",
  text: (getState().client.logs || []).join("\n"),
  success: "Console de test enregistree :"
});
export const exportClientReports = () => exportText({
  title: "Extraire le rapport de test",
  defaultName: "client-report.txt",
  text: (getState().client.reports || []).join("\n"),
  success: "Rapport de test enregistre :"
});
export const exportClientResults = () => exportText({
  title: "Extraire les resultats de test",
  defaultName: "client-results.txt",
  text: joinBlocks(getState().client.results?.[0] === "Aucun test lance." ? [] : getState().client.results, "Aucun test lance."),
  success: "Resultats de test enregistres :"
});
export const exportGithubReport = () => exportText({
  title: "Extraire le rapport GitHub",
  defaultName: "github-report.txt",
  text: (getState().github.report || []).join("\n"),
  success: "Rapport GitHub enregistre :"
});

export const selectAllJars = () => patchState((state) => ({
  ...state,
  build: { ...state.build, selectedJars: state.build.jars.map((jar) => jar.id) }
}));

export const deleteJars = async () => {
  const state = getState();
  const scan = await window.workspaceApi.deleteJars({ repoPath: state.repo.repoPath, paths: state.build.selectedJars });
  patchState((current) => ({ ...current, repo: scan, build: { ...current.build, jars: scan.jars, selectedJars: [] } }));
};

export const mainTask = async () => {
  const state = getState();
  if (state.activeTab === "build") return state.busy.build ? window.workspaceApi.cancelBuilds().then(() => patchState((s) => ({ ...s, busy: { ...s.busy, cancelling: true } }))) : openModal("build");
  if (state.activeTab === "client") return state.busy.client ? window.workspaceApi.cancelClients().then(() => patchState((s) => ({ ...s, busy: { ...s.busy, cancelling: true } }))) : openModal("client");
  return false;
};

export const confirmModal = async () => {
  const state = getState(), ids = state.modal?.selected || [];
  if (!ids.length) return closeModal();
  const targets = ids.map((id) => targetFromId(state.repo.repoPath, id));
  if (state.modal.kind === "build") {
    const staleJars = state.modal.clearJars ? jarsForTargets(state, ids) : [];
    if (staleJars.length) {
      const scan = await window.workspaceApi.deleteJars({ repoPath: state.repo.repoPath, paths: staleJars });
      patchState((s) => ({ ...s, repo: scan, build: { ...s.build, jars: scan.jars, selectedJars: s.build.selectedJars.filter((jar) => !staleJars.includes(jar)) } }));
    }
    patchState((s) => ({ ...s, modal: null, busy: { ...s.busy, build: true, cancelling: false } }));
    return window.workspaceApi.startBuilds({ repoPath: state.repo.repoPath, targets });
  }
  patchState((s) => ({ ...s, modal: null, client: { ...s.client, ram: s.modal.ram, killAfterDelay: s.modal.killAfterDelay }, busy: { ...s.busy, client: true, cancelling: false } }));
  const killAfter = state.modal.killAfterEnabled ? (state.modal.killAfterDelay || 60) : 0;
  return window.workspaceApi.startClients({ repoPath: state.repo.repoPath, targets, ram: state.modal.ram, killAfter });
};
