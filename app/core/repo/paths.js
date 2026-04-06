const path = require("path");

const APP_FILE = "config.json";
const REPO_DIR = ".workspace-center";

const appConfigPath = (app) => path.join(app.getPath("userData"), APP_FILE);
const fallbackAppConfigPath = (app) => app.isPackaged
  ? path.join(path.dirname(app.getPath("exe")), REPO_DIR, APP_FILE)
  : path.join(process.cwd(), REPO_DIR, APP_FILE);
const appConfigPaths = (app) => [...new Set([appConfigPath(app), fallbackAppConfigPath(app)])];
const repoConfigDir = (repoPath) => path.join(repoPath, "scripts", REPO_DIR);
const repoConfigPath = (repoPath) => path.join(repoConfigDir(repoPath), APP_FILE);
const isHidden = (name) => name.startsWith(".");

module.exports = { appConfigPath, appConfigPaths, repoConfigDir, repoConfigPath, isHidden };
