import { esc } from "../dom.js";
import { card, actionBtn } from "../components/cards.js";
import { consoleBox } from "../components/lists.js";
import { splitPane } from "../layout/split.js";

const branches = (items) => `<div class="branch-list">${items.length ? items.map((item) => `<div class="branch-row ${item.level}"><strong>${esc(item.name)}</strong><span>${esc(item.scope)}</span><small>${esc(item.detail)}</small></div>`).join("") : `<div class="empty">Aucun repo charge.</div>`}</div>`;

const form = (state, disabled) => `
  <div class="form">
    <label class="field"><span>Token de connexion</span><input type="password" value="${esc(state.github.token)}" data-action="github-token" ${disabled ? "disabled" : ""} /></label>
    <label class="field"><span>Remote GitHub</span><input type="text" value="${esc(state.github.remote)}" data-action="github-remote" ${disabled ? "disabled" : ""} /></label>
    <div class="state-line">${esc(state.github.localState)}</div>
    <div class="button-row">${actionBtn("Enregistrer", "github-save", disabled)}${actionBtn("Setup .gitignore", "github-gitignore", disabled)}${actionBtn("Tester connexion", "github-test", disabled)}${actionBtn("Recevoir", "github-receive", disabled)}${actionBtn("Envoyer", "github-publish", disabled)}</div>
  </div>
`;

export const renderGithub = (state) => {
  const top = splitPane("x", "githubTop", state.layout.githubTop, card("Connexion GitHub", form(state, Boolean(state.busy.github))), card("Branches attendues", branches(state.github.branches)));
  return `<main class="tab-page pane-page">${splitPane("y", "githubMain", state.layout.githubMain, top, card("Rapport GitHub", consoleBox(state.github.report, "Aucun repo charge."), actionBtn("Clear", "clear-github-report")))}</main>`;
};
