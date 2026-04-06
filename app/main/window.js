const { BrowserWindow } = require("electron");
const path = require("path");
const { applyWindowTheme } = require("./theme");

const createWindow = () => {
  const win = new BrowserWindow({
    title: "Project Workspace Center",
    icon: path.join(__dirname, "..", "assets", "icon.ico"),
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: "#f3f3f3",
    autoHideMenuBar: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  applyWindowTheme(win);
  win.maximize();
  return win;
};

module.exports = { createWindow };
