import { patchState } from "../state.js";

let bound = false;
let drag = null;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const point = (event, axis) => axis === "x" ? event.clientX : event.clientY;
const edge = (rect, axis) => axis === "x" ? rect.left : rect.top;
const size = (rect, axis) => axis === "x" ? rect.width : rect.height;

const paint = (split, ratio) => split.style.setProperty("--split", `${Math.round(ratio * 1000) / 10}%`);

const stop = () => {
  if (!drag) return;
  patchState((state) => ({ ...state, layout: { ...state.layout, [drag.key]: drag.ratio || state.layout[drag.key] } }));
  drag = null;
  document.body.classList.remove("resizing");
};

const move = (event) => {
  if (!drag) return;
  const rect = drag.split.getBoundingClientRect();
  drag.ratio = clamp((point(event, drag.axis) - edge(rect, drag.axis)) / size(rect, drag.axis), 0.18, 0.82);
  paint(drag.split, drag.ratio);
};

export const bindLayout = () => {
  if (bound) return;
  bound = true;
  document.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest("[data-split-handle]");
    if (!handle) return;
    drag = { key: handle.dataset.splitHandle, axis: handle.dataset.axis, split: handle.closest(".split") };
    document.body.classList.add("resizing");
    event.preventDefault();
  });
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
};
