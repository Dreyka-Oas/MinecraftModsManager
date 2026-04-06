const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { setChild, clearChild, isCancelling } = require("./state");

const splitLines = (stream, handler) => {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop();
    parts.filter(Boolean).forEach(handler);
  });
  stream.on("end", () => buffer && handler(buffer));
};

const findWrapper = (repoPath, targetPath) => {
  let current = targetPath;
  while (current.startsWith(repoPath)) {
    for (const name of ["gradlew.bat", "gradlew"]) {
      const file = path.join(current, name);
      if (fs.existsSync(file)) return file;
    }
    if (current === repoPath) break;
    current = path.dirname(current);
  }
  return "";
};

const requiredJava = (targetPath) => {
  try {
    const text = fs.readFileSync(path.join(targetPath, "build.gradle"), "utf8");
    const match = text.match(/JavaLanguageVersion\.of\((\d+)\)|targetJavaVersion\s*=\s*(\d+)|options\.release\.set\((\d+)\)/);
    return Number(match?.[1] || match?.[2] || match?.[3] || 21);
  } catch { return 21; }
};
const javaHome = (version) => {
  const hits = [
    `C:\\Users\\perso\\scoop\\apps\\graalvm-oracle-${version}jdk\\current`,
    `C:\\Users\\perso\\scoop\\apps\\graalvm-oracle-jdk\\current`,
    `C:\\Program Files\\Java\\jdk-${version}`,
    `C:\\Program Files\\Eclipse Adoptium\\jdk-${version}`,
    `C:\\Program Files\\Microsoft\\jdk-${version}`
  ];
  return hits.find((item) => fs.existsSync(item)) || "";
};
const cleanEnv = (targetPath, forcedJava = 0) => {
  const env = { ...process.env };
  if (env.JAVA_HOME && !fs.existsSync(env.JAVA_HOME)) delete env.JAVA_HOME;
  const home = javaHome(forcedJava || requiredJava(targetPath));
  if (home) {
    env.JAVA_HOME = home;
    env.PATH = `${path.join(home, "bin")};${env.PATH || ""}`;
  }
  return env;
};
const taskCommand = ({ repoPath, targetPath, kind }) => {
  const wrapper = findWrapper(repoPath, targetPath);
  const task = kind === "build" ? "build" : "runClient";
  if (wrapper && process.platform === "win32") {
    return { command: wrapper, args: [task, "--project-dir", targetPath], cwd: path.dirname(wrapper), env: {}, shell: true, label: `${wrapper} ${task} --project-dir ${targetPath}` };
  }
  if (wrapper) return { command: wrapper, args: [task, "--project-dir", targetPath], cwd: path.dirname(wrapper), env: {}, shell: false, label: `${wrapper} ${task} --project-dir ${targetPath}` };
  if (process.platform === "win32") {
    return { command: "gradle", args: [task, "--project-dir", targetPath], cwd: targetPath, env: {}, shell: true, label: `gradle ${task} --project-dir ${targetPath}` };
  }
  return { command: "gradle", args: [task, "--project-dir", targetPath], cwd: targetPath, env: {}, shell: false, label: `gradle ${task} --project-dir ${targetPath}` };
};

const runTask = ({ repoPath, targetPath, kind, ram = 3, onLine }) =>
  new Promise((resolve) => {
    const recent = [];
    let needsJava = 0;
    const task = taskCommand({ repoPath, targetPath, kind, ram });
    const env = kind === "client" ? { JAVA_TOOL_OPTIONS: `-Xmx${ram}G ${process.env.JAVA_TOOL_OPTIONS || ""}`.trim() } : {};
    const keep = (line, error) => { const retry = line.match(/requires at least JVM runtime version (\d+)/i); if (retry?.[1]) needsJava = Number(retry[1]); recent.push(line); if (recent.length > 8) recent.shift(); onLine(line, error); };
    const launch = (forcedJava = 0) => {
      if (forcedJava) onLine(`[RUN] Relance automatique avec Java ${forcedJava}`, false);
      else onLine(`[RUN] ${task.label}`, false);
      const child = spawn(task.command, task.args, { cwd: task.cwd, env: { ...cleanEnv(targetPath, forcedJava), ...task.env, ...env }, shell: task.shell });
      setChild(child);
      splitLines(child.stdout, (line) => keep(line, false));
      splitLines(child.stderr, (line) => keep(line, true));
      child.on("error", (error) => keep(error.message, true));
      child.on("close", (code, signal) => {
        clearChild();
        const detail = recent.join("\n") || "Aucun detail.";
        if (!forcedJava && !isCancelling() && needsJava && javaHome(needsJava)) return launch(needsJava);
        resolve({ code: code ?? 1, cancelled: isCancelling() || signal === "SIGTERM", detail });
      });
    };
    launch();
  });

module.exports = { runTask };
