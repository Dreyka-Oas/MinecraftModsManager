import { patchState } from "../state.js";
import { makeEmptyRepo } from "../state.js";

const trim = (items) => items.slice(-300);
const push = (list, item, empty) => trim(list[0] === empty ? [item] : [...list, item]);

export const applyEvent = ({ type, payload }) => {
  if (type === "build-reset") return patchState((s) => ({ ...s, build: { ...s.build, logs: [], reports: [], errors: ["Aucune erreur."], progress: { done: 0, total: payload.total, remaining: payload.total, parallel: 1, active: "aucun" } } }));
  if (type === "build-log") return patchState((s) => ({ ...s, build: { ...s.build, logs: push(s.build.logs, payload.line, "Console vide.") } }));
  if (type === "build-report") return patchState((s) => ({ ...s, build: { ...s.build, reports: trim([...s.build.reports, payload.line]) } }));
  if (type === "build-error") return patchState((s) => ({ ...s, build: { ...s.build, errors: push(s.build.errors, payload.block, "Aucune erreur.") } }));
  if (type === "build-repo") return patchState((s) => {
    const repo = payload?.repo?.valid ? payload.repo : makeEmptyRepo();
    return { ...s, repo, build: { ...s.build, jars: repo.jars || [], selectedJars: s.build.selectedJars.filter((id) => (repo.jars || []).some((jar) => jar.id === id)) } };
  });
  if (type === "build-progress") return patchState((s) => ({ ...s, build: { ...s.build, progress: payload } }));
  if (type === "build-finished") return patchState((s) => {
    const repo = payload?.repo?.valid ? payload.repo : makeEmptyRepo();
    return { ...s, repo, build: { ...s.build, jars: repo.jars || [], selectedJars: [], logs: [...s.build.logs, `[RUN] ${payload.status}`], progress: { ...s.build.progress, active: payload.active } }, busy: { ...s.busy, build: false, cancelling: false } };
  });
  if (type === "client-reset") return patchState((s) => ({ ...s, client: { ...s.client, logs: [], reports: [], results: ["Aucun test lance."], progress: { done: 0, total: payload.total, remaining: payload.total, active: "aucun" } } }));
  if (type === "client-log") return patchState((s) => ({ ...s, client: { ...s.client, logs: push(s.client.logs, payload.line, "Console vide.") } }));
  if (type === "client-report") return patchState((s) => ({ ...s, client: { ...s.client, reports: trim([...s.client.reports, payload.line]) } }));
  if (type === "client-result") return patchState((s) => ({ ...s, client: { ...s.client, results: push(s.client.results, payload.block, "Aucun test lance.") } }));
  if (type === "client-progress") return patchState((s) => ({ ...s, client: { ...s.client, progress: payload } }));
  if (type === "client-finished") return patchState((s) => ({ ...s, client: { ...s.client, logs: [...s.client.logs, `[RUN] ${payload.status}`], progress: { ...s.client.progress, active: payload.active } }, busy: { ...s.busy, client: false, cancelling: false } }));
  if (type === "theme-updated") return patchState((s) => ({ ...s, theme: payload }));
  if (type === "github-log") return patchState((s) => ({ ...s, github: { ...s.github, report: trim([...s.github.report, payload.line]) } }));
};
