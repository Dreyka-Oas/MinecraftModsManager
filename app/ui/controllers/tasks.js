import { patchState, getState } from "../state.js";

const SUPPORTED = ["fabric", "forge", "neoforge"];
export const selectableLoaders = (state) => state.repo.loaders.filter((loader) => SUPPORTED.includes(loader.name));
const targetFromId = (repoPath, id) => ({ id, loader: id.split("/")[0], version: id.split("/")[1], path: `${repoPath}\\${id.replace("/", "\\")}` });
const expandedMap = (state) => Object.fromEntries(selectableLoaders(state).map((loader) => [loader.name, false]));
const versionIds = (state, loader) => (selectableLoaders(state).find((item) => item.name === loader)?.versions || []).map((version) => `${loader}/${version.name || version}`);
const applyChecked = (items, selected, checked) => checked ? [...new Set([...selected, ...items])] : selected.filter((id) => !items.includes(id));
const jarsForTargets = (state, ids) => state.build.jars.filter((jar) => ids.includes(jar.targetId)).map((jar) => jar.id);

export const openModal = (kind) => patchState((state) => ({ ...state, modal: { kind, selected: [], expanded: expandedMap(state), ram: state.client.ram || 3, clearJars: false } }));
export const closeModal = () => patchState((state) => ({ ...state, modal: null }));
export const openJavaPicker = () => patchState((state) => ({ ...state, javaPicker: true }));
export const closeJavaPicker = () => patchState((state) => ({ ...state, javaPicker: false }));
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
  patchState((s) => ({ ...s, modal: null, client: { ...s.client, ram: s.modal.ram }, busy: { ...s.busy, client: true, cancelling: false } }));
  return window.workspaceApi.startClients({ repoPath: state.repo.repoPath, targets, ram: state.modal.ram });
};
