const { app } = require("electron");
const { createWindow } = require("./window");
const { registerIpc } = require("./ipc");
const { cancelBuilds } = require("../core/tasks/build");
const { cancelClients } = require("../core/tasks/client");

let mainWindow = null;

app.setAppUserModelId("com.codex.projectworkspacecenter");

const boot = async () => {
  mainWindow = createWindow();
  registerIpc(mainWindow);
  mainWindow.on("closed", () => { mainWindow = null; });
};

app.whenReady().then(boot);
app.on("before-quit", () => {
  void cancelBuilds();
  void cancelClients();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (!require("electron").BrowserWindow.getAllWindows().length) boot();
});
