const { saveGithubConfig, readRepoConfig } = require("../repo/config");
const { authRemote } = require("./auth");
const { runGit, tryGit, expectedBranches, currentState, localBranches, remoteBranches, branchFiles } = require("./git");
const { DOCS, folderSource } = require("./ignore");

const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const scope = (local, remote) => (local && remote ? "local+remote" : local ? "local" : remote ? "remote" : "absente");

const expectedFiles = async (repoPath, branch) => branch === "main" ? DOCS : (await folderSource(repoPath, branch)).map((f) => f.relative.replace(/\\/g, "/"));

const lineFor = async (repoPath, branch, locals, remotes) => {
  const local = locals.has(branch), remote = remotes.has(branch), ref = local ? branch : remote ? `origin/${branch}` : "";
  if (!ref) return { name: branch, scope: "absente", detail: "branche absente", level: "ko" };
  const actual = await branchFiles(repoPath, ref), expected = await expectedFiles(repoPath, branch);
  const ok = same(actual, expected);
  return { name: branch, scope: scope(local, remote), detail: ok ? (branch === "main" ? "docs racine conformes" : "contenu du dossier conforme") : `attendu: contenu racine du dossier ${branch}`, level: ok ? "ok" : "warn" };
};

const refreshGithub = async (repoPath) => {
  const config = await readRepoConfig(repoPath);
  const remote = authRemote(config.githubRemote, config.githubToken);
  if (remote) await tryGit(["fetch", remote, "--prune", "+refs/heads/*:refs/remotes/origin/*"], repoPath, "");
  const expected = await expectedBranches(repoPath), locals = await localBranches(repoPath), remotes = await remoteBranches(repoPath);
  const branches = [];
  for (const branch of expected) branches.push(await lineFor(repoPath, branch, locals, remotes));
  return { localState: await currentState(repoPath), branches, report: [`[RUN] Actualisation GitHub terminee le ${new Date().toLocaleString()}`] };
};

const testGithub = async ({ repoPath, githubRemote, githubToken }) => {
  await saveGithubConfig({ repoPath, githubRemote, githubToken });
  const remote = authRemote(githubRemote, githubToken);
  await runGit(["ls-remote", "--heads", remote], repoPath);
  return { ok: true, lines: ["[OK] Connexion GitHub valide."] };
};

const receiveGithub = async ({ repoPath, githubRemote, githubToken }) => {
  await saveGithubConfig({ repoPath, githubRemote, githubToken });
  const remote = authRemote(githubRemote, githubToken);
  const logs = ["[RUN] Reception des refs distantes."];
  await runGit(["fetch", remote, "--prune", "+refs/heads/*:refs/remotes/origin/*"], repoPath);
  const expected = await expectedBranches(repoPath), locals = await localBranches(repoPath), remotes = await remoteBranches(repoPath);
  for (const branch of expected) if (!locals.has(branch) && remotes.has(branch)) {
    await runGit(["branch", "--track", branch, `origin/${branch}`], repoPath);
    logs.push(`[OK] Branche locale creee: ${branch}`);
  }
  const state = await refreshGithub(repoPath);
  return { ...state, report: [...logs, "[OK] Reception terminee."] };
};

module.exports = { refreshGithub, testGithub, receiveGithub };
