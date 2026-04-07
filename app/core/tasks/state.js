let current = null;

const beginTask = (kind) => {
  if (current?.kind) throw new Error("Une operation est deja en cours.");
  current = { kind, cancelling: false, child: null };
};

const setChild = (child) => { if (current) current.child = child; };
const clearChild = () => { if (current) current.child = null; };
const isCancelling = () => Boolean(current?.cancelling);

const cancelTask = () => {
  if (!current) return { ok: false };
  current.cancelling = true;
  if (current.child && !current.child.killed) current.child.kill();
  return { ok: true };
};

const killCurrentChild = () => {
  if (current?.child && !current.child.killed) current.child.kill();
  return { ok: true };
};

const endTask = () => { current = null; };

module.exports = { beginTask, setChild, clearChild, isCancelling, cancelTask, killCurrentChild, endTask };
