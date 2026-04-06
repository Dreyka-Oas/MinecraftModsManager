const path = require("path");
const { beginTask, cancelTask, endTask, isCancelling } = require("./state");
const { runTask } = require("./common");
const { scanRepo } = require("../repo/scan");

const startBuilds = async ({ repoPath, targets = [] }, emit) => {
  beginTask("build");
  emit("build-reset", { total: targets.length });
  emit("build-log", { line: "[RUN] Lancement du lot de builds." });
  const errors = [];
  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    emit("build-progress", { done: index, total: targets.length, active: target.id, remaining: targets.length - index, parallel: 1 });
    emit("build-log", { line: `[RUN] ${target.id} | preparation` });
    const result = await runTask({ repoPath, targetPath: target.path, kind: "build", onLine: (line) => emit("build-log", { line: `${target.id} | ${line}` }) });
    if (result.cancelled) break;
    if (result.code === 0) {
      emit("build-report", { line: `[OK] ${target.id}`, kind: "ok" });
      emit("build-repo", { repo: await scanRepo(repoPath) });
    }
    else {
      errors.push({ id: target.id, code: result.code, detail: result.detail });
      emit("build-report", { line: `[KO] ${target.id} | exit ${result.code}`, kind: "ko" });
      emit("build-error", { block: `${target.id}\nExit: ${result.code}\n${result.detail}` });
    }
    emit("build-progress", { done: index + 1, total: targets.length, active: "en attente", remaining: targets.length - index - 1, parallel: 1 });
  }
  const repo = await scanRepo(repoPath);
  const status = isCancelling() ? "Annulation terminee" : "Termine";
  if (isCancelling()) emit("build-log", { line: "[WARN] Annulation du lot de builds." });
  emit("build-finished", { status, repo, errors, active: "aucun" });
  endTask();
  return { ok: true };
};

const cancelBuilds = async () => cancelTask();

module.exports = { startBuilds, cancelBuilds };
