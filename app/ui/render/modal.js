import { selectionModal, repoPickerModal, javaPickerModal } from "../components/modal.js";
import { selectableLoaders } from "../controllers/tasks.js";

const loaderIds = (loader) => loader.versions.map((version) => `${loader.name}/${version.name || version}`);

export const modalShellKey = (state) => JSON.stringify({
  modal: state.modal ? { kind: state.modal.kind, expanded: state.modal.expanded, selectable: selectableLoaders(state).map((loader) => ({ name: loader.name, ids: loaderIds(loader) })) } : null,
  repoPicker: state.repoPicker,
  repoNotice: state.repoNotice,
  javaPicker: state.javaPicker,
  java: state.java,
  javaReq: state.repo.javaRequirements,
  repoHistory: state.repoHistory,
  activeRepo: state.repo.repoPath
});

export const modalHtml = (state) => `${selectionModal(state, selectableLoaders(state))}${repoPickerModal(state)}${javaPickerModal(state)}`;

export const patchSelectionState = (root, state) => {
  if (!state.modal) return;
  root.querySelectorAll('[data-action="toggle-target"]').forEach((node) => { node.checked = state.modal.selected.includes(node.dataset.id); });
  root.querySelectorAll('[data-action="toggle-loader"]').forEach((node) => {
    const ids = selectableLoaders(state).find((loader) => loader.name === node.dataset.loader)?.versions.map((version) => `${node.dataset.loader}/${version.name || version}`) || [];
    node.checked = ids.length > 0 && ids.every((id) => state.modal.selected.includes(id));
  });
  const clear = root.querySelector('[data-action="set-clear-jars"]');
  if (clear) clear.checked = Boolean(state.modal.clearJars);
  const ram = root.querySelector('[data-action="set-ram"]');
  if (ram) ram.value = String(state.modal.ram);
};
