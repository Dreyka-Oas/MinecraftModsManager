const { nativeTheme, systemPreferences } = require("electron");

const toHex = (rgba = "0a64ffff") => `#${String(rgba).replace("#", "").slice(0, 6)}`;

const accent = () => {
  try { return toHex(systemPreferences.getAccentColor()); }
  catch { return nativeTheme.shouldUseDarkColors ? "#60a5fa" : "#0a64ff"; }
};

const themeState = () => ({
  mode: nativeTheme.shouldUseDarkColors ? "dark" : "light",
  systemMode: nativeTheme.shouldUseDarkColorsForSystemIntegratedUI ? "dark" : "light",
  highContrast: nativeTheme.shouldUseHighContrastColors || nativeTheme.inForcedColorsMode,
  reducedTransparency: nativeTheme.prefersReducedTransparency,
  accent: accent()
});

const applyWindowTheme = (win) => {
  if (process.platform !== "win32" || !win?.setBackgroundMaterial) return;
  try { win.setBackgroundMaterial(themeState().reducedTransparency ? "none" : "mica"); } catch {}
};

const bindTheme = (win, emit) => {
  const push = () => { applyWindowTheme(win); emit(themeState()); };
  nativeTheme.on("updated", push);
  if (process.platform === "win32") systemPreferences.on("accent-color-changed", push);
  return () => {
    nativeTheme.off("updated", push);
    if (process.platform === "win32") systemPreferences.off("accent-color-changed", push);
  };
};

module.exports = { themeState, applyWindowTheme, bindTheme };
