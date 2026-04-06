import { getState, patchState } from "../state.js";

const trim = (items) => items.slice(-300);
const append = (lines) => patchState((state) => ({ ...state, github: { ...state.github, report: trim([...state.github.report, ...lines]) } }));
const merge = (result) => patchState((state) => ({ ...state, github: { ...state.github, localState: result.localState || state.github.localState, branches: result.branches || state.github.branches, report: result.report ? [...state.github.report, ...result.report] : state.github.report } }));

export const setGithubField = (field, value) => patchState((state) => ({ ...state, github: { ...state.github, [field]: value } }));

const call = async (name, fn) => {
  patchState((state) => ({ ...state, busy: { ...state.busy, github: name } }));
  try { const result = await fn(); if (result?.lines) append(result.lines); if (result?.branches || result?.localState) merge(result); }
  catch (error) { append([`[KO] ${error.message}`]); }
  patchState((state) => ({ ...state, busy: { ...state.busy, github: "" } }));
};

const payload = () => {
  const state = getState();
  return { repoPath: state.repo.repoPath, githubRemote: state.github.remote, githubToken: state.github.token };
};

export const githubAction = async (kind) => {
  if (kind === "github-save") return call("save", async () => ({ lines: ["[OK] Configuration GitHub enregistree."], ...(await window.workspaceApi.saveGithub(payload())) }));
  if (kind === "github-gitignore") return call("save", () => window.workspaceApi.setupGitignore(getState().repo.repoPath));
  if (kind === "github-test") return call("test", () => window.workspaceApi.testGithub(payload()));
  if (kind === "github-receive") return call("receive", () => window.workspaceApi.receiveGithub(payload()));
  if (kind === "github-publish") return call("publish", async () => {
    const result = await window.workspaceApi.publishGithub(payload());
    const refreshed = await window.workspaceApi.refreshGithub(getState().repo.repoPath);
    return { ...refreshed, lines: result.lines };
  });
  if (kind === "main-refresh") return call("refresh", () => window.workspaceApi.refreshGithub(getState().repo.repoPath));
};
