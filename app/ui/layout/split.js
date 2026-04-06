const pct = (value) => `${Math.round(value * 1000) / 10}%`;

export const splitPane = (axis, key, ratio, first, second) => `
  <div class="split split-${axis}" data-split="${key}" style="--split:${pct(ratio)}">
    <div class="pane">${first}</div>
    <button class="split-handle ${axis}" data-split-handle="${key}" data-axis="${axis}" aria-label="Redimensionner"></button>
    <div class="pane">${second}</div>
  </div>
`;
