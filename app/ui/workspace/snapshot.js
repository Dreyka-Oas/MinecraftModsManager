import { makeEmptyBuild, makeEmptyClient } from "../state.js";

const pick = (saved = {}, fields = []) => Object.fromEntries(fields.map((key) => [key, saved[key]]).filter(([, value]) => value !== undefined));
const safeSaved = (saved) => (saved && typeof saved === "object" ? saved : {});

export const captureWorkspace = (state) => ({
  build: {
    logs: state.build.logs,
    reports: state.build.reports,
    errors: state.build.errors,
    selectedJars: state.build.selectedJars,
    progress: state.build.progress
  },
  client: {
    logs: state.client.logs,
    reports: state.client.reports,
    results: state.client.results,
    ram: state.client.ram,
    progress: state.client.progress
  },
  github: {
    localState: state.github.localState,
    branches: state.github.branches,
    report: state.github.report
  }
});

export const repoWorkspace = (state, scan, saved = {}) => {
  const store = safeSaved(saved);
  const jars = scan?.jars || [];
  const build = pick(store.build, ["logs", "reports", "errors", "selectedJars", "progress"]);
  const client = pick(store.client, ["logs", "reports", "results", "ram", "progress"]);
  const github = pick(store.github, ["localState", "branches", "report"]);
  return {
    build: { ...makeEmptyBuild(), ...build, jars, selectedJars: (build.selectedJars || []).filter((id) => jars.some((jar) => jar.id === id)) },
    client: { ...makeEmptyClient(), ...client },
    github: {
      token: scan?.githubConfig?.githubToken || "",
      remote: scan?.githubConfig?.githubRemote || "",
      localState: github.localState || (scan?.valid ? "Chargement GitHub non effectue." : "Aucun repo charge."),
      branches: github.branches || [],
      report: github.report?.length ? github.report : scan?.valid ? ["[RUN] Repo charge."] : []
    }
  };
};
