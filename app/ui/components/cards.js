import { esc } from "../dom.js";

export const card = (title, body, actions = "") => `
  <section class="card">
    <div class="card-head">
      <h3>${esc(title)}</h3>
      <div class="card-actions">${actions}</div>
    </div>
    <div class="card-body">${body}</div>
  </section>
`;

export const actionBtn = (label, action, disabled = false, kind = "secondary") =>
  `<button class="btn ${kind}" data-action="${action}" ${disabled ? "disabled" : ""}>${esc(label)}</button>`;

export const actionGroup = (...items) => items.filter(Boolean).join("");

export const panel = (title, body, actions = "") => `
  <section class="card">
    <div class="card-head">
      <h3>${esc(title)}</h3>
    </div>
    ${actions ? `<div class="card-strip">${actions}</div>` : ""}
    <div class="card-body">${body}</div>
  </section>
`;
