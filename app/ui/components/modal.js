import { esc } from "../dom.js";
import { treeBox } from "./tree.js";

export const selectionModal = (state, selectable) => {
  if (!state.modal) return "";
  const build = state.modal.kind === "build";
  const title = build ? "Selection des builds" : "Selection des clients";
  const help = build ? "Selectionne les loaders et versions a compiler." : "Selectionne les clients a tester. Ils seront lances un par un.";
  const action = build ? "Lancer" : "Tester";
  const clean = build ? `<label class="field modal-check"><input type="checkbox" data-action="set-clear-jars" ${state.modal.clearJars ? "checked" : ""} /><span>Vider les JAR deja builds pour les versions cochees</span></label>` : "";
  return `
    <div class="modal-backdrop">
      <div class="modal">
        <h2>${title}</h2>
        <p>${help}</p>
        <div class="tree">${treeBox(selectable, state.modal.selected, state.modal.expanded)}</div>
        ${clean}
        ${build ? "" : `<label class="field"><span>RAM max (Go)</span><select data-action="set-ram">${Array.from({ length: 64 }, (_, i) => i + 1).map((value) => `<option value="${value}" ${value === state.modal.ram ? "selected" : ""}>${value}</option>`).join("")}</select></label>`}
        <div class="modal-actions">
          <button class="btn secondary" data-action="close-modal">Annuler</button>
          <button class="btn primary" data-action="confirm-modal">${esc(action)}</button>
        </div>
      </div>
    </div>
  `;
};

export const repoPickerModal = (state) => !state.repoPicker ? "" : `
  <div class="modal-backdrop">
    <div class="modal repo-picker-modal">
      <div class="modal-head">
        <div class="modal-title"><h2>Projets</h2><span class="modal-badge">${state.repoHistory.length}</span></div>
        <div class="modal-tools"><button type="button" class="btn secondary" data-action="choose-repo">Ajouter</button><button type="button" class="btn secondary" data-action="close-repo-picker">Fermer</button></div>
      </div>
      <p>Selectionne un projet memorise ou retire-le de la liste.</p>
      ${state.repoNotice ? `<div class="repo-feedback repo-feedback-modal">${esc(state.repoNotice)}</div>` : ""}
      <div class="repo-picker-list">${state.repoHistory.length ? state.repoHistory.map((repoPath, index) => `
        <section class="repo-entry ${state.repo.repoPath === repoPath ? "active" : ""}">
          <div class="repo-entry-meta repo-entry-click" data-action="pick-repo-history" data-repo-index="${index}">
            <div class="repo-entry-head"><strong>${esc(repoPath.split(/[\\/]/).pop())}</strong>${state.repo.repoPath === repoPath ? "<em>Actif</em>" : ""}</div>
            <small>${esc(repoPath)}</small>
          </div>
          <div class="repo-entry-actions">
            <button type="button" class="btn secondary" data-action="pick-repo-history" data-repo-index="${index}">Ouvrir</button>
            <button type="button" class="btn danger" data-action="remove-repo-history" data-repo-index="${index}">Supprimer</button>
          </div>
        </section>`).join("") : `<div class="empty">Aucun repo memorise.</div>`}</div>
    </div>
  </div>
`;

export const javaPickerModal = (state) => !state.javaPicker ? "" : `
  <div class="modal-backdrop">
    <div class="modal java-picker-modal">
      <div class="modal-head">
        <div class="modal-title"><h2>Java</h2><span class="modal-badge">${state.java.detected || "?"}</span></div>
        <button class="btn secondary modal-close" data-action="close-java-picker">Fermer</button>
      </div>
      <p>Version detectee, chemin installe et versions requises par le projet.</p>
      <div class="java-grid">
        <div class="java-card"><span>Detectee</span><strong>${esc(String(state.java.detected || "Inconnue"))}</strong></div>
        <div class="java-card"><span>Installee</span><strong>${esc(state.java.home || "Aucune info")}</strong></div>
        <div class="java-card"><span>Requise</span><strong>${esc([...new Set((state.repo.javaRequirements || []).map((item) => item.java).filter(Boolean))].sort((a, b) => a - b).join(" / ") || "Inconnue")}</strong></div>
      </div>
      <div class="java-list">${(state.repo.javaRequirements || []).length ? state.repo.javaRequirements.map((item) => `<div class="java-row"><strong>${esc(item.id)}</strong><span>Java ${esc(String(item.java || "?" ))}</span></div>`).join("") : `<div class="empty">Aucune version Java detectee.</div>`}</div>
    </div>
  </div>
`;
