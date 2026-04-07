import { patchState, getState } from "../state.js";
import { chooseRepo, openRepoPicker, closeRepoPicker, removeRepoEntry, pickRepoEntry } from "./repo.js";
import { mainTask, closeModal, openJavaPicker, closeJavaPicker, setRam, setClearJars, setTarget, setLoader, toggleGroup, setJar, confirmModal, deleteJars, selectAllJars, clearBuildLogs, clearBuildReports, clearBuildErrors, clearClientLogs, clearClientReports, clearClientResults, clearGithubReport, exportBuildLogs, exportBuildReports, exportBuildErrors, exportClientLogs, exportClientReports, exportClientResults, exportGithubReport } from "./tasks.js";
import { githubAction, setGithubField } from "./github.js";

const repoAt = (target) => {
  const index = Number(target.getAttribute("data-repo-index"));
  return Number.isInteger(index) ? getState().repoHistory[index] || "" : "";
};

export const onClick = (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return false;
  const action = target.dataset.action;
  if (action === "choose-repo") return chooseRepo().then(() => true);
  if (action === "open-java-picker") return openJavaPicker() || true;
  if (action === "close-java-picker") return closeJavaPicker() || true;
  if (action === "open-repo-picker") return openRepoPicker() || true;
  if (action === "close-repo-picker") return closeRepoPicker() || true;
  if (action === "pick-repo-history") return Promise.resolve(pickRepoEntry(repoAt(target))).then(() => true);
  if (action === "remove-repo-history") return removeRepoEntry(repoAt(target)).then(() => true);
  if (action === "switch-tab") return patchState((state) => ({ ...state, activeTab: target.dataset.tab })) && true;
  if (action === "main-action") return (getState().activeTab === "github" ? githubAction("main-refresh") : mainTask()).then(() => true);
  if (action === "close-modal") return closeModal() || true;
  if (action === "confirm-modal") return confirmModal().then(() => true);
  if (action === "toggle-group") return toggleGroup(target.dataset.loader) || true;
  if (action === "clear-build-logs") return clearBuildLogs() || true;
  if (action === "clear-build-reports") return clearBuildReports() || true;
  if (action === "clear-build-errors") return clearBuildErrors() || true;
  if (action === "export-build-logs") return exportBuildLogs().then(() => true);
  if (action === "export-build-reports") return exportBuildReports().then(() => true);
  if (action === "export-build-errors") return exportBuildErrors().then(() => true);
  if (action === "clear-client-logs") return clearClientLogs() || true;
  if (action === "clear-client-reports") return clearClientReports() || true;
  if (action === "clear-client-results") return clearClientResults() || true;
  if (action === "export-client-logs") return exportClientLogs().then(() => true);
  if (action === "export-client-reports") return exportClientReports().then(() => true);
  if (action === "export-client-results") return exportClientResults().then(() => true);
  if (action === "clear-github-report") return clearGithubReport() || true;
  if (action === "export-github-report") return exportGithubReport().then(() => true);
  if (action === "select-all-jars") return selectAllJars() || true;
  if (action === "delete-jars") return deleteJars().then(() => true);
  if (action.startsWith("github-")) return githubAction(action).then(() => true);
  return false;
};

export const onChange = (event) => {
  const action = event.target.dataset.action;
  if (action === "set-ram") return setRam(event.target.value) || true;
  if (action === "set-clear-jars") return setClearJars(event.target.checked) || true;
  if (action === "toggle-target") return setTarget(event.target.dataset.id, event.target.checked) || true;
  if (action === "toggle-loader") return setLoader(event.target.dataset.loader, event.target.checked) || true;
  if (action === "toggle-jar") return setJar(event.target.dataset.id, event.target.checked) || true;
  return false;
};

export const onInput = (event) => {
  const action = event.target.dataset.action;
  if (action === "github-token") return setGithubField("token", event.target.value) || true;
  if (action === "github-remote") return setGithubField("remote", event.target.value) || true;
  return false;
};
