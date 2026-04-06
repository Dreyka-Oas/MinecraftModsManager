export const esc = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export const tone = (text = "") => {
  if (text.startsWith("[OK]")) return "ok";
  if (text.startsWith("[WARN]")) return "warn";
  if (text.startsWith("[KO]")) return "ko";
  if (text.startsWith("[RUN]")) return "run";
  return "";
};

export const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
export const disabled = (value) => (value ? "disabled" : "");
