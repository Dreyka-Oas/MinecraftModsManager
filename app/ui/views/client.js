import { card, actionBtn } from "../components/cards.js";
import { consoleBox, blocksBox } from "../components/lists.js";
import { progressCard } from "../components/progress.js";
import { splitPane } from "../layout/split.js";

export const renderClient = (state) => {
  const top = splitPane("x", "clientTop", state.layout.clientTop, card("Console de test", consoleBox(state.client.logs, "Console vide.", true), actionBtn("Clear", "clear-client-logs")), card("Rapport de test", consoleBox(state.client.reports, "Aucun test lance."), actionBtn("Clear", "clear-client-reports")));
  const progress = progressCard(state.client.progress, [["Tests", `${state.client.progress.done}/${state.client.progress.total}`], ["Restants", `${state.client.progress.remaining}`], ["Actif", state.client.progress.active]]);
  const bottom = splitPane("x", "clientBottom", state.layout.clientBottom, card("Resultats de test", blocksBox(state.client.results[0] === "Aucun test lance." ? [] : state.client.results, "Aucun test lance."), actionBtn("Clear", "clear-client-results")), card("Progression", progress));
  return `<main class="tab-page pane-page">${splitPane("y", "clientMain", state.layout.clientMain, top, bottom)}</main>`;
};
