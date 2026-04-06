import { esc } from "../dom.js";

const checked = (all, selected) => all.every((item) => selected.includes(item.id));

export const treeBox = (loaders, selected, expanded = {}) => loaders.map((loader) => {
  const items = loader.versions.map((version) => ({ id: `${loader.name}/${version.name || version}`, label: version.name || version, java: version.java || null }));
  const open = expanded[loader.name] === true;
  return `
    <section class="tree-group">
      <div class="tree-head">
        <button class="tree-toggle" data-action="toggle-group" data-loader="${esc(loader.name)}" aria-label="${open ? "Deplier" : "Reduire"}">${open ? "▾" : "▸"}</button>
        <label><input type="checkbox" data-action="toggle-loader" data-loader="${esc(loader.name)}" ${checked(items, selected) ? "checked" : ""} />${esc(loader.name)}</label>
      </div>
      <div class="tree-items ${open ? "" : "hidden"}">
        ${items.map((item) => `<label class="tree-item"><input type="checkbox" data-action="toggle-target" data-id="${esc(item.id)}" ${selected.includes(item.id) ? "checked" : ""} /><span>${esc(item.label)}${item.java ? ` <small>Java ${esc(String(item.java))}</small>` : ""}</span></label>`).join("")}
      </div>
    </section>`;
}).join("");
