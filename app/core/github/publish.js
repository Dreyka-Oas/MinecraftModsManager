const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { saveGithubConfig, readRepoConfig } = require("../repo/config");
const { authRemote } = require("./auth");
const { runGit, tryGit, expectedBranches } = require("./git");
const { folderSource, mainSource, gitignoreContent } = require("./ignore");

const syncFiles = async (base, items) => {
  for (const item of items) {
    const target = path.join(base, item.relative);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(item.source, target);
  }
};

const prepareBranch = async (repoPath, branch) => branch === "main" ? mainSource(repoPath) : folderSource(repoPath, branch);

const publishBranch = async (repoPath, remote, branch) => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), `pwc-${branch}-`));
  try {
    await runGit(["init", "-b", branch], temp);
    await runGit(["config", "user.name", "Project Workspace Center"], temp);
    await runGit(["config", "user.email", "workspace.center@example.local"], temp);
    await runGit(["remote", "add", "origin", remote], temp);
    if (await tryGit(["ls-remote", "--heads", remote, branch], temp, "")) await runGit(["fetch", "origin", branch], temp);
    if (await tryGit(["rev-parse", "FETCH_HEAD"], temp, "")) await runGit(["checkout", "-B", branch, "FETCH_HEAD"], temp);
    for (const entry of await fs.readdir(temp)) if (entry !== ".git") await fs.rm(path.join(temp, entry), { recursive: true, force: true });
    await syncFiles(temp, await prepareBranch(repoPath, branch));
    await runGit(["add", "-A"], temp);
    if (!await tryGit(["status", "--porcelain"], temp, "")) return false;
    await runGit(["commit", "-m", `Publish ${branch}`], temp);
    await runGit(["push", "--force-with-lease", "origin", `HEAD:${branch}`], temp);
    return true;
  } finally { await fs.rm(temp, { recursive: true, force: true }); }
};

const setupGitignore = async (repoPath) => {
  await fs.writeFile(path.join(repoPath, ".gitignore"), gitignoreContent(), "utf8");
  return { ok: true, lines: ["[OK] .gitignore regenere."] };
};

const publishGithub = async ({ repoPath, githubRemote, githubToken }, emit) => {
  await saveGithubConfig({ repoPath, githubRemote, githubToken });
  const remote = authRemote(githubRemote, githubToken), branches = await expectedBranches(repoPath);
  emit("github-log", { line: "[RUN] Publication GitHub demarree." });
  for (const branch of branches) {
    emit("github-log", { line: `[RUN] Preparation de ${branch}` });
    const changed = await publishBranch(repoPath, remote, branch);
    emit("github-log", { line: changed ? `[OK] ${branch} publiee.` : `[WARN] ${branch} | aucune modification.` });
  }
  return { ok: true, lines: ["[OK] Envoi termine."] };
};

module.exports = { publishGithub, setupGitignore };
