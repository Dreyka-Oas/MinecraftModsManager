import { esc, pct } from "../dom.js";

export const progressCard = (value, rows) => `
  <div class="progress-wrap">
    <div class="bar"><span style="width:${pct(value.done, value.total)}%"></span><strong>${pct(value.done, value.total)}%</strong></div>
    <div class="stats">
      ${rows.map(([label, text]) => `<div><span>${esc(label)}</span><strong>${esc(text)}</strong></div>`).join("")}
    </div>
  </div>
`;
