const authRemote = (remote = "", token = "") => {
  if (!token || !remote.startsWith("https://")) return remote;
  if (remote.includes("@")) return remote;
  return remote.replace("https://", `https://${encodeURIComponent(token)}@`);
};

module.exports = { authRemote };
