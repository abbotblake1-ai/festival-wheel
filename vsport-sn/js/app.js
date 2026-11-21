"use strict";

const PAGE_SIZE = 10;
const LABELS = {
  users: "用户管理",
  roles: "角色管理",
  menus: "菜单管理",
  depts: "部门管理",
  posts: "岗位管理",
  dicts: "字典管理",
  params: "参数设置",
  logs: "日志管理",
  mustread: "必读管理",
  sn: "SN号管理",
};

const snRows = [
  ["8000072353", "2026-02-23 14:49:32", "2026-02-24 15:36:33"],
  ["800072437", "2026-03-25 10:50:10", "2026-03-26 15:23:28"],
  ["800072396", "2026-04-01 14:54:45", "2026-04-01 14:58:48"],
  ["799996600", "2024-11-18 12:05:14", "2024-11-19 12:40:51"],
  ["799996599", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
  ["799996597", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
  ["799996596", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
  ["799996571", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
  ["799996570", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
  ["799996568", "2024-08-23 15:20:00", "2024-08-23 15:20:00"],
].map(([sn, createdAt, updatedAt], index) => ({
  id: "sn" + (index + 1),
  sn,
  status: "正常",
  createdAt,
  updatedAt,
  factor: "",
  otp: "",
}));

for (let i = 0; i < 35; i += 1) {
  snRows.push({
    id: "snx" + i,
    sn: String(799996567 - i),
    status: "正常",
    createdAt: "2024-08-23 15:20:00",
    updatedAt: "2024-08-23 15:20:00",
    factor: "",
    otp: "",
  });
}

let snFiltered = snRows.slice();
let snPage = 1;
let snSelection = new Set();
let pendingSnIds = [];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNow() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function showToast(message, type) {
  const el = document.getElementById("toast");
  const kind = type === "warning" ? "warning" : "success";
  el.className = "toast " + kind;
  el.innerHTML = `<span class="toast-icon">${kind === "warning" ? "!" : "✓"}</span><span>${esc(message)}</span>`;
  el.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { el.hidden = true; }, 2200);
}

function closeTop() {
  const masks = document.querySelectorAll("#modalRoot .mask");
  if (masks.length) masks[masks.length - 1].remove();
}

function radios(name, options, current) {
  return `<div class="radios">${options.map((option) => `
    <label class="radio"><input type="radio" name="${name}" value="${esc(option)}" ${option === current ? "checked" : ""} /><span class="dot"></span><span>${esc(option)}</span></label>`).join("")}</div>`;
}

function closeAllSelects() {
  document.querySelectorAll(".select.open").forEach((select) => {
    select.classList.remove("open");
    const menu = select.querySelector(".select-menu");
    if (menu) menu.hidden = true;
  });
}

function setSelectValue(select, value, label) {
  select.dataset.value = value;
  const text = select.querySelector(".select-label");
  text.textContent = label;
  text.classList.toggle("placeholder", select.dataset.emptyPlaceholder === "1" && value === "");
  select.querySelectorAll(".select-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.value === value);
  });
}

function toggleSelect(select) {
  const menu = select.querySelector(".select-menu");
  const willOpen = menu.hidden;
  closeAllSelects();
  if (!willOpen) return;
  menu.hidden = false;
  select.classList.add("open");
  const rect = select.querySelector(".select-trigger").getBoundingClientRect();
  const height = Math.min(menu.scrollHeight, 274);
  let top = rect.bottom + 4;
  if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 4);
  menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 248)) + "px";
  menu.style.top = top + "px";
  menu.style.width = Math.max(rect.width, 240) + "px";
}

function statusTag(status) {
  return `<span class="tag${status === "正常" ? "" : " off"}">${esc(status)}</span>`;
}

function pageSlice(list, page) {
  const start = (page - 1) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}

function renderPager(total, page) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buttons = [`<button type="button" data-action="sn-page" data-page-num="${page - 1}" ${page <= 1 ? "disabled" : ""}>上一页</button>`];
  for (let i = 1; i <= pages; i += 1) buttons.push(`<button type="button" class="${i === page ? "active" : ""}" data-action="sn-page" data-page-num="${i}">${i}</button>`);
  buttons.push(`<button type="button" data-action="sn-page" data-page-num="${page + 1}" ${page >= pages ? "disabled" : ""}>下一页</button>`);
  document.getElementById("snPager").innerHTML = `<span>共 ${total} 条</span><span>10条/页</span>${buttons.join("")}`;
}

function renderSn() {
  const rows = pageSlice(snFiltered, snPage);
  document.getElementById("snTbody").innerHTML = rows.map((row) => `<tr>
    <td class="center"><input type="checkbox" data-sn-id="${esc(row.id)}" ${snSelection.has(row.id) ? "checked" : ""} aria-label="选择 ${esc(row.sn)}" /></td>
    <td>${esc(row.sn)}</td>
    <td>${statusTag(row.status)}</td>
    <td>${esc(row.createdAt)}</td>
    <td>${esc(row.updatedAt)}</td>
    <td><button type="button" class="linkish" data-action="sn-edit" data-id="${esc(row.id)}">修改</button><button type="button" class="linkish danger" data-action="sn-delete" data-id="${esc(row.id)}">删除</button></td>
  </tr>`).join("") || '<tr><td class="empty" colspan="6">暂无数据</td></tr>';
  document.getElementById("snCheckAll").checked = rows.length > 0 && rows.every((row) => snSelection.has(row.id));
  renderPager(snFiltered.length, snPage);
}

function applySnFilters() {
  const query = document.getElementById("snQuery").value.trim();
  const status = document.getElementById("snStatus").dataset.value || "";
  snFiltered = snRows.filter((row) => (!query || row.sn.includes(query)) && (!status || row.status === status));
  snPage = 1;
  renderSn();
}

function resetSelect(id, placeholder) {
  setSelectValue(document.getElementById(id), "", placeholder);
}

function openMask(html) {
  document.getElementById("modalRoot").insertAdjacentHTML("beforeend", html);
}

function openSnAdd() {
  const body = `<div class="form-row"><label><span class="req">*</span>SN号</label><div class="field"><input id="snNumber" class="input" autocomplete="off" /></div></div>
    <div class="form-row"><label><span class="req">*</span>密码因子</label><div class="field"><input id="snFactor" class="input" autocomplete="off" /></div></div>
    <div class="form-row"><label><span class="req">*</span>动态密码</label><div class="field"><input id="snOtp" class="input" autocomplete="off" /></div></div>
    <div class="form-row"><label>状态</label><div class="field">${radios("snDraftStatus", ["正常", "停用"], "正常")}</div></div>`;
  openMask(`<div class="mask layer-sn"><div class="dialog narrow" role="dialog" aria-modal="true" aria-label="新增SN号">
    <div class="dialog-header"><h2>新增SN号</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body">${body}</div>
    <div class="dialog-footer"><button type="button" class="btn btn-primary" data-action="sn-confirm-add">确定</button><button type="button" class="btn" data-action="close-layer">取消</button></div>
  </div></div>`);
}

function openSnEdit(id) {
  const row = snRows.find((item) => item.id === id);
  if (!row) return;
  const body = `<div class="form-row"><label><span class="req">*</span>SN号</label><div class="field"><input id="snNumber" class="input" value="${esc(row.sn)}" autocomplete="off" /></div></div>
    <div class="form-row"><label><span class="req">*</span>动态密码</label><div class="field"><input id="snOtp" class="input" value="" autocomplete="off" /></div></div>
    <div class="form-row"><label>状态</label><div class="field">${radios("snDraftStatus", ["正常", "停用"], row.status)}</div></div>`;
  openMask(`<div class="mask layer-sn"><div class="dialog narrow" role="dialog" aria-modal="true" aria-label="修改SN号">
    <div class="dialog-header"><h2>修改SN号</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body">${body}</div>
    <div class="dialog-footer"><button type="button" class="btn btn-primary" data-action="sn-confirm-edit" data-id="${esc(row.id)}">确定</button><button type="button" class="btn" data-action="close-layer">取消</button></div>
  </div></div>`);
}

function askSnDelete(ids) {
  const rows = ids.map((id) => snRows.find((item) => item.id === id)).filter(Boolean);
  if (!rows.length) {
    showToast("请选择要删除的数据", "warning");
    return;
  }
  pendingSnIds = rows.map((row) => row.id);
  const text = rows.length === 1 ? `是否确认删除SN号为${rows[0].sn}的数据项？` : `是否确认删除选中的${rows.length}条SN号数据？`;
  openMask(`<div class="mask layer-confirm"><div class="dialog small confirm" role="alertdialog" aria-modal="true" aria-label="系统提示">
    <div class="dialog-header"><h2>系统提示</h2><button type="button" class="dialog-close" data-action="sn-cancel-delete" aria-label="关闭">×</button></div>
    <div class="dialog-body"><div class="confirm-body"><span class="warn-badge">!</span><p>${esc(text)}</p></div></div>
    <div class="dialog-footer"><button type="button" class="btn" data-action="sn-cancel-delete">取消</button><button type="button" class="btn btn-primary" data-action="sn-confirm-delete">确定</button></div>
  </div></div>`);
}

function confirmSnAdd() {
  const sn = document.getElementById("snNumber").value.trim();
  const factor = document.getElementById("snFactor").value.trim();
  const otp = document.getElementById("snOtp").value.trim();
  const status = document.querySelector('input[name="snDraftStatus"]:checked');
  if (!sn || !factor || !otp || !status) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  if (snRows.some((row) => row.sn === sn)) {
    showToast("该SN号已存在", "warning");
    return;
  }
  snRows.unshift({ id: "sn" + Date.now(), sn, status: status.value, createdAt: formatNow(), updatedAt: formatNow(), factor, otp });
  closeTop();
  applySnFilters();
  showToast("新增成功", "success");
}

function confirmSnEdit(id) {
  const row = snRows.find((item) => item.id === id);
  const sn = document.getElementById("snNumber").value.trim();
  const otp = document.getElementById("snOtp").value.trim();
  const status = document.querySelector('input[name="snDraftStatus"]:checked');
  if (!row || !sn || !status) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  if (snRows.some((item) => item.sn === sn && item.id !== id)) {
    showToast("该SN号已存在", "warning");
    return;
  }
  row.sn = sn;
  row.status = status.value;
  if (otp) row.otp = otp;
  row.updatedAt = formatNow();
  closeTop();
  applySnFilters();
  showToast("保存成功", "success");
}

function confirmSnDelete() {
  const ids = new Set(pendingSnIds);
  for (let i = snRows.length - 1; i >= 0; i -= 1) {
    if (ids.has(snRows[i].id)) snRows.splice(i, 1);
  }
  ids.forEach((id) => snSelection.delete(id));
  pendingSnIds = [];
  closeTop();
  applySnFilters();
  showToast("删除成功", "success");
}

function showMenu(page) {
  const real = page === "sn";
  document.getElementById("view-sn").hidden = !real;
  document.getElementById("view-placeholder").hidden = real;
  document.querySelectorAll(".submenu-item").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
  const title = LABELS[page] || "系统管理";
  document.getElementById("pageTitle").textContent = title;
  document.title = title + " - VSport Admin";
  document.getElementById("crumb").innerHTML = `系统管理 / <b>${esc(title)}</b>`;
  if (!real) document.getElementById("placeholderTitle").textContent = title;
}

document.addEventListener("click", (event) => {
  const snBox = event.target.closest("[data-sn-id]");
  if (snBox) {
    if (snBox.checked) snSelection.add(snBox.dataset.snId);
    else snSelection.delete(snBox.dataset.snId);
    renderSn();
    return;
  }
  const trigger = event.target.closest(".select-trigger");
  if (trigger) {
    event.preventDefault();
    toggleSelect(trigger.closest(".select"));
    return;
  }
  const option = event.target.closest(".select-option");
  if (option) {
    setSelectValue(option.closest(".select"), option.dataset.value, option.textContent.trim());
    closeAllSelects();
    return;
  }
  if (!event.target.closest(".select")) closeAllSelects();
  if (event.target.classList.contains("mask")) {
    closeTop();
    return;
  }
  const pageEl = event.target.closest("[data-page]");
  if (pageEl && LABELS[pageEl.dataset.page]) showMenu(pageEl.dataset.page);
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === "toggle-system") {
    const group = document.getElementById("systemGroup");
    group.classList.toggle("open");
    actionEl.setAttribute("aria-expanded", group.classList.contains("open") ? "true" : "false");
  } else if (action === "sn-search") applySnFilters();
  else if (action === "sn-reset") {
    document.getElementById("snQuery").value = "";
    resetSelect("snStatus", "状态");
    applySnFilters();
  } else if (action === "sn-add") openSnAdd();
  else if (action === "sn-edit") openSnEdit(actionEl.dataset.id);
  else if (action === "sn-delete") askSnDelete([actionEl.dataset.id]);
  else if (action === "sn-delete-selected") askSnDelete([...snSelection]);
  else if (action === "sn-cancel-delete") {
    pendingSnIds = [];
    closeTop();
  } else if (action === "sn-confirm-delete") confirmSnDelete();
  else if (action === "sn-confirm-add") confirmSnAdd();
  else if (action === "sn-confirm-edit") confirmSnEdit(actionEl.dataset.id);
  else if (action === "sn-page") {
    const pages = Math.max(1, Math.ceil(snFiltered.length / PAGE_SIZE));
    const next = Number(actionEl.dataset.pageNum);
    if (next >= 1 && next <= pages) {
      snPage = next;
      renderSn();
    }
  } else if (action === "close-layer") closeTop();
});

document.getElementById("snCheckAll").addEventListener("change", (event) => {
  pageSlice(snFiltered, snPage).forEach((row) => {
    if (event.target.checked) snSelection.add(row.id);
    else snSelection.delete(row.id);
  });
  renderSn();
});

renderSn();
showMenu("sn");
