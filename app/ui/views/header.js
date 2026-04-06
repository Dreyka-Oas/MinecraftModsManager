import { esc } from "../dom.js";

const repoLabel = (state) => state.repo.repoPath ? state.repo.repoPath.split(/[\\/]/).pop() : `Repos (${state.repoHistory.length})`;

const mainLabel = (state) => {
  if (state.activeTab === "build") return state.busy.build ? (state.busy.cancelling ? "Annulation..." : "Annuler") : "Lancer";
  if (state.activeTab === "client") return state.busy.client ? (state.busy.cancelling ? "Annulation..." : "Annuler test") : "Tester";
  if (!state.busy.github) return "Actualiser";
  return { refresh: "Actualisation...", test: "Test...", receive: "Reception...", publish: "Envoi...", save: "Enregistrement..." }[state.busy.github] || "Actualiser";
};

export const renderHeader = (state) => {
  const locked = state.busy.build || state.busy.client || Boolean(state.busy.github);
  const disabled = !state.repo.valid || Boolean(state.busy.github && state.activeTab === "github");
  const javaBtn = `<button class="btn secondary java-header" data-action="open-java-picker" ${!state.repo.valid ? "disabled" : ""}>Java</button>`;
  const notice = state.repoNotice ? `<div class="repo-feedback">${esc(state.repoNotice)}</div>` : "";
  return `
    <header class="topbar">
      <div class="project">
        <div class="project-top">
          <h1 class="${state.repoPulse ? "pulse" : ""}">${esc(state.repo.projectName)}</h1>
          <div class="badges"><span>Loaders: ${state.repo.loadersCount}</span><span>Versions: ${state.repo.versionsCount}</span><em>${esc(locked ? "Operation en cours..." : state.repo.valid ? "Repo charge" : "Aucun repo charge")}</em></div>
        </div>
        <div class="repo-row ${state.repoPulse ? "pulse" : ""}"><button class="repo-native-btn" data-action="open-repo-picker" ${locked ? "disabled" : ""}>${esc(repoLabel(state))}</button><code>${esc(state.repo.repoLabel)}</code></div>
        ${notice}
      </div>
      <nav class="tabs">
        ${["build", "client", "github"].map((tab) => `<button class="tab ${state.activeTab === tab ? "active" : ""}" data-action="switch-tab" data-tab="${tab}" ${locked ? "disabled" : ""}>${tab === "build" ? "Build" : tab === "client" ? "Client Test" : "GitHub"}</button>`).join("")}
      </nav>
      <div class="main-action"><div class="main-action-row"><button class="btn primary big" data-action="main-action" ${disabled ? "disabled" : ""}>${mainLabel(state)}</button></div>${javaBtn}</div>
    </header>
  `;
};
