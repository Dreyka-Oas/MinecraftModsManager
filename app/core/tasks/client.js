const { beginTask, cancelTask, killCurrentChild, endTask, isCancelling } = require("./state");
const { runTask } = require("./common");

const startClients = async ({ repoPath, targets = [], ram = 3, killAfter = 0 }, emit) => {
  beginTask("client");
  emit("client-reset", { total: targets.length, ram });
  emit("client-log", { line: "[RUN] Lancement des tests clients." });
  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    emit("client-progress", { done: index, total: targets.length, active: target.id, remaining: targets.length - index });
    const killLabel = killAfter > 0 ? ` | kill force apres ${killAfter}s` : " | fermeture attendue";
    emit("client-report", { line: `[RUN] ${target.id}${killLabel}`, kind: "run" });
    let killTimer = null;
    if (killAfter > 0) {
      killTimer = setTimeout(() => {
        emit("client-log", { line: `${target.id} | [RUN] Timer ecoule (${killAfter}s) — kill force du client.` });
        killCurrentChild();
      }, killAfter * 1000);
    }
    const result = await runTask({ repoPath, targetPath: target.path, kind: "client", ram, onLine: (line) => emit("client-log", { line: `${target.id} | ${line}` }) });
    if (killTimer) clearTimeout(killTimer);
    if (result.cancelled) {
      emit("client-result", { block: `[WARN] ${target.id}\nTest annule.` });
      break;
    }
    if (result.code === 0) {
      emit("client-report", { line: `[OK] ${target.id}`, kind: "ok" });
      emit("client-result", { block: `[OK] ${target.id}\nClient ferme proprement.` });
    } else {
      emit("client-report", { line: `[KO] ${target.id} | exit ${result.code}`, kind: "ko" });
      emit("client-result", { block: `[KO] ${target.id}\nClient termine avec une erreur.` });
    }
    emit("client-progress", { done: index + 1, total: targets.length, active: "en attente", remaining: targets.length - index - 1 });
  }
  const status = isCancelling() ? "Tests annules" : "Tests clients termines";
  if (isCancelling()) emit("client-log", { line: "[WARN] Annulation des tests clients." });
  emit("client-finished", { status, active: "aucun" });
  endTask();
  return { ok: true };
};

const cancelClients = async () => cancelTask();

module.exports = { startClients, cancelClients };
