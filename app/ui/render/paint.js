import { renderHeader } from "../views/header.js";
import { renderClient } from "../views/client.js";
import { renderGithub } from "../views/github.js";
import { buildShell, buildShellKey, buildPanelKeys, buildPanelHtml } from "./build.js";
import { modalShellKey, modalHtml, patchSelectionState } from "./modal.js";

const pageHtml = (state) => state.activeTab === "client" ? renderClient(state) : renderGithub(state);
const keepConsoleEnd = () => document.querySelectorAll('[data-autoscroll="end"]').forEach((node) => { node.scrollTop = node.scrollHeight; });
const pageKey = (state) => JSON.stringify(state.activeTab === "build"
  ? buildShellKey(state)
  : state.activeTab === "client"
    ? { tab: state.activeTab, client: state.client, layout: { clientMain: state.layout.clientMain, clientTop: state.layout.clientTop, clientBottom: state.layout.clientBottom } }
    : { tab: state.activeTab, github: state.github, layout: { githubMain: state.layout.githubMain, githubTop: state.layout.githubTop } });
const headerKey = (state) => JSON.stringify({ repo: state.repo, repoHistory: state.repoHistory.length, repoNotice: state.repoNotice, activeTab: state.activeTab, busy: state.busy, repoPulse: state.repoPulse });

export const createPainter = (root) => {
  const headerRoot = document.createElement("div");
  const pageRoot = document.createElement("div");
  headerRoot.className = "header-host";
  pageRoot.className = "page-host";
  const modalRoot = document.body.appendChild(Object.assign(document.createElement("div"), { id: "modal-root" }));
  root.replaceChildren(headerRoot, pageRoot);
  const keys = { header: "", page: "", modal: "", build: {} };
  const scroller = (node) => node?.querySelector('[data-autoscroll="end"],.console,.blocks,.jar-list,.branch-list,.tree,.repo-picker-list,.java-list') || node?.querySelector(".card-body");
  const patchBuildCard = (state, name, key) => {
    const node = pageRoot.querySelector(`[data-build-card="${name}"]`);
    if (!node) return;
    const prev = scroller(node);
    const scrollTop = prev?.scrollTop ?? 0;
    const scrollLeft = prev?.scrollLeft ?? 0;
    node.innerHTML = buildPanelHtml(state, name);
    const next = scroller(node);
    if (next && !next.hasAttribute("data-autoscroll")) {
      next.scrollTop = scrollTop;
      next.scrollLeft = scrollLeft;
    }
    keys.build[name] = key;
  };
  return {
    render(state) {
      const nextHeader = headerKey(state);
      const nextPage = pageKey(state);
      const nextModal = modalShellKey(state);
      if (nextHeader !== keys.header) {
        headerRoot.innerHTML = renderHeader(state);
        keys.header = nextHeader;
      }
      if (nextPage !== keys.page) {
        pageRoot.innerHTML = state.activeTab === "build" ? buildShell(state.layout) : pageHtml(state);
        keys.page = nextPage;
        keys.build = {};
      }
      if (state.activeTab === "build") {
        const nextBuild = buildPanelKeys(state);
        Object.entries(nextBuild).forEach(([name, key]) => {
          if (keys.build[name] === key) return;
          patchBuildCard(state, name, key);
        });
      }
      if (nextModal !== keys.modal) {
        modalRoot.innerHTML = modalHtml(state);
        keys.modal = nextModal;
      }
      else if (state.modal) patchSelectionState(modalRoot, state);
      keepConsoleEnd();
    }
  };
};
