const emptyRepo = () => ({
  valid: false, repoPath: "", repoLabel: "Aucun repo", projectName: "Aucun projet",
  loadersCount: 0, versionsCount: 0, loaders: [], jars: [], githubConfig: { githubToken: "", githubRemote: "" }
});

const emptyBuild = () => ({
  logs: ["[RUN] Chargement de l'application."], reports: [], errors: ["Aucune erreur."], jars: [],
  selectedJars: [], progress: { done: 0, total: 0, remaining: 0, parallel: 1, active: "aucun" }
});

const emptyClient = () => ({
  logs: [], reports: [], results: ["Aucun test lance."], ram: 3,
  progress: { done: 0, total: 0, remaining: 0, active: "aucun" }
});

const defaultLayout = () => ({
  buildMain: 0.62, buildTop: 0.52, buildTopRight: 0.5, buildBottom: 0.42,
  clientMain: 0.5, clientTop: 0.5, clientBottom: 0.68,
  githubMain: 0.45, githubTop: 0.62
});

const normalize = (value, fallback) => (value && typeof value === "object" ? value : fallback());

let state = {
  repo: emptyRepo(), repoHistory: [], repoNotice: "", activeTab: "build", modal: null, repoPicker: false, javaPicker: false, repoPulse: false,
  busy: { build: false, client: false, github: "", cancelling: false },
  build: emptyBuild(), client: emptyClient(),
  github: { token: "", remote: "", localState: "Aucun repo charge", branches: [], report: [] },
  layout: defaultLayout(),
  java: { detected: "", home: "", required: "" },
  theme: { mode: "light", systemMode: "light", highContrast: false, reducedTransparency: false, accent: "#0a64ff" }
};

export const getState = () => state;
export const replaceState = (next) => { state = next; return state; };
export const patchState = (recipe) => {
  state = recipe(state);
  state = {
    ...state,
    repo: normalize(state.repo, emptyRepo),
    build: normalize(state.build, emptyBuild),
    client: normalize(state.client, emptyClient),
    github: normalize(state.github, () => ({ token: "", remote: "", localState: "Aucun repo charge", branches: [], report: [] })),
    layout: normalize(state.layout, defaultLayout),
    busy: normalize(state.busy, () => ({ build: false, client: false, github: "", cancelling: false })),
    repoHistory: Array.isArray(state.repoHistory) ? state.repoHistory : [],
    theme: normalize(state.theme, () => ({ mode: "light", systemMode: "light", highContrast: false, reducedTransparency: false, accent: "#0a64ff" }))
  };
  return state;
};
export const makeEmptyRepo = emptyRepo;
export const makeEmptyBuild = emptyBuild;
export const makeEmptyClient = emptyClient;
export const makeDefaultLayout = defaultLayout;
