import { card, actionBtn } from "../components/cards.js";
import { consoleBox, blocksBox, jarsBox } from "../components/lists.js";
import { progressCard } from "../components/progress.js";
import { splitPane } from "../layout/split.js";

const slot = (name) => `<div data-build-card="${name}"></div>`;
export const buildShell = (layout) => {
  const topRight = splitPane("x", "buildTopRight", layout.buildTopRight, slot("jars"), slot("report"));
  const top = splitPane("x", "buildTop", layout.buildTop, slot("console"), topRight);
  const bottom = splitPane("x", "buildBottom", layout.buildBottom, slot("errors"), slot("progress"));
  return `<main class="tab-page pane-page">${splitPane("y", "buildMain", layout.buildMain, top, bottom)}</main>`;
};

export const buildShellKey = (state) => JSON.stringify({ tab: state.activeTab, layout: { buildMain: state.layout.buildMain, buildTop: state.layout.buildTop, buildTopRight: state.layout.buildTopRight, buildBottom: state.layout.buildBottom } });
export const buildPanelKeys = (state) => ({
  console: JSON.stringify(state.build.logs),
  jars: JSON.stringify({ jars: state.build.jars, selected: state.build.selectedJars }),
  report: JSON.stringify(state.build.reports),
  errors: JSON.stringify(state.build.errors),
  progress: JSON.stringify(state.build.progress)
});

export const buildPanelHtml = (state, name) => {
  if (name === "console") return card("Console de build", consoleBox(state.build.logs, "Console vide.", true), actionBtn("Clear", "clear-build-logs"));
  if (name === "jars") {
    const actions = `${actionBtn("Tout selectionner", "select-all-jars", !state.build.jars.length)}${actionBtn("Supprimer", "delete-jars", !state.build.selectedJars.length)}`;
    return card("JAR detectes", jarsBox(state.build.jars, state.build.selectedJars), actions);
  }
  if (name === "report") return card("Rapport de build", consoleBox(state.build.reports, "Aucun build lance."), actionBtn("Clear", "clear-build-reports"));
  if (name === "errors") return card("Erreurs", blocksBox(state.build.errors[0] === "Aucune erreur." ? [] : state.build.errors, "Aucune erreur."), actionBtn("Clear", "clear-build-errors"));
  const rows = [["En cours", `${state.build.progress.done}/${state.build.progress.total}`], ["Restantes", `${state.build.progress.remaining}`]];
  return card("Progression", progressCard(state.build.progress, rows));
};
