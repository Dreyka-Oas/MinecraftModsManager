import { esc, tone } from "../dom.js";

const renderLines = (items, empty) => items.length ? items.map((line) => `<div class="line ${tone(line)}">${esc(line)}</div>`).join("") : `<div class="empty">${esc(empty)}</div>`;

export const consoleBox = (items, empty, sticky = false) => `<div class="console"${sticky ? ` data-autoscroll="end"` : ""}>${renderLines(items, empty)}</div>`;

export const blocksBox = (items, empty) =>
  `<div class="blocks">${items.length ? items.map((line) => `<pre class="block">${esc(line)}</pre>`).join("") : `<div class="empty">${esc(empty)}</div>`}</div>`;

export const jarsBox = (items, selected) => `
  <div class="jar-list">
    ${items.length ? items.map((jar) => `
      <label class="jar-row">
        <input type="checkbox" data-action="toggle-jar" data-id="${esc(jar.id)}" ${selected.includes(jar.id) ? "checked" : ""} />
        <span><strong>${esc(jar.name)}</strong><small>${esc(jar.targetId)}</small></span>
      </label>`).join("") : `<div class="empty">Aucun JAR detecte.</div>`}
  </div>`;
