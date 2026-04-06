const { execFile } = require("child_process");
const { listDirs } = require("../repo/files");
const { isHidden } = require("../repo/paths");

const runGit = (args, cwd) =>
  new Promise((resolve, reject) => {
    execFile("git", args, { cwd, maxBuffer: 1024 * 1024 * 12 }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr.trim() || stdout.trim() || error.message));
      else resolve(stdout.trim());
    });
  });

const tryGit = async (args, cwd, fallback = "") => {
  try { return await runGit(args, cwd); }
  catch { return fallback; }
};

const expectedBranches = async (repoPath) => {
  const names = (await listDirs(repoPath)).filter((name) => name !== "scripts" && !isHidden(name));
  return ["main", ...names];
};

const currentState = async (repoPath) => {
  const branch = await tryGit(["branch", "--show-current"], repoPath, "");
  const dirty = Boolean(await tryGit(["status", "--porcelain"], repoPath, ""));
  return branch ? `Branche: ${branch} | ${dirty ? "modifications locales" : "propre"}` : "Depot Git non initialise";
};

const localBranches = async (repoPath) =>
  new Set((await tryGit(["branch", "--format=%(refname:short)"], repoPath, "")).split(/\r?\n/).filter(Boolean));

const remoteBranches = async (repoPath) =>
  new Set((await tryGit(["for-each-ref", "refs/remotes/origin", "--format=%(refname:short)"], repoPath, "")).split(/\r?\n/).map((n) => n.replace(/^origin\//, "")).filter(Boolean));

const branchFiles = async (repoPath, ref) =>
  (await tryGit(["ls-tree", "-r", "--name-only", ref], repoPath, "")).split(/\r?\n/).filter(Boolean);

module.exports = { runGit, tryGit, expectedBranches, currentState, localBranches, remoteBranches, branchFiles };
