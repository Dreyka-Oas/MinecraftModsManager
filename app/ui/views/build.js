import { card, panel, actionBtn } from "../components/cards.js";
import { consoleBox, blocksBox, jarsBox } from "../components/lists.js";
import { progressCard } from "../components/progress.js";
import { splitPane } from "../layout/split.js";

export const renderBuild = (state) => {
  const jarActions = `${actionBtn("Tout selectionner", "select-all-jars", !state.build.jars.length)}${actionBtn("Supprimer", "delete-jars", !state.build.selectedJars.length)}`;
  const jars = card("JAR detectes", jarsBox(state.build.jars, state.build.selectedJars), jarActions);
  const report = panel("Rapport de build", consoleBox(state.build.reports, "Aucun build lance."), actionBtn("Clear", "clear-build-reports"));
  const topRight = splitPane("x", "buildTopRight", state.layout.buildTopRight, jars, report);
  const top = splitPane("x", "buildTop", state.layout.buildTop, panel("Console de build", consoleBox(state.build.logs, "Console vide.", true), actionBtn("Clear", "clear-build-logs")), topRight);
  const progress = progressCard(state.build.progress, [["En cours", `${state.build.progress.done}/${state.build.progress.total}`], ["Restantes", `${state.build.progress.remaining}`]]);
  const bottom = splitPane("x", "buildBottom", state.layout.buildBottom, panel("Erreurs", blocksBox(state.build.errors[0] === "Aucune erreur." ? [] : state.build.errors, "Aucune erreur."), actionBtn("Clear", "clear-build-errors")), card("Progression", progress));
  return `<main class="tab-page pane-page">${splitPane("y", "buildMain", state.layout.buildMain, top, bottom)}</main>`;
};
