"use strict";

const PAGE_SIZE = 10;
const ROLES = ["超级管理员", "CTYSuper", "一般管理员"];
const DEPTS = ["CSports"];
const POSTS = ["主管级管理员", "管理员", "运营"];
const PERMS = ["主管级管理员", "一般管理员", "管理员"];
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

const userRows = [
  ["2026-11-20 15:44:44", "apiautotest37561", "超级管理员", "主管级管理员", "主管级管理员"],
  ["2026-11-20 14:06:11", "amelia", "CTYSuper", "管理员", "管理员"],
  ["2026-11-20 13:48:11", "Alfred", "CTYSuper", "管理员", "管理员"],
  ["2026-11-20 13:27:44", "stevin", "CTYSuper", "运营", "管理员"],
  ["2026-11-20 10:53:50", "apiautotest1053", "超级管理员", "主管级管理员", "主管级管理员"],
  ["2026-11-20 05:44:33", "apiautotest0544", "超级管理员", "主管级管理员", "主管级管理员"],
  ["2026-11-19 15:45:11", "apiautotest1545", "超级管理员", "主管级管理员", "主管级管理员"],
  ["2026-11-19 15:44:43", "apiautotest1544", "超级管理员", "主管级管理员", "主管级管理员"],
  ["2026-11-19 11:18:20", "apiautotest1118", "超级管理员", "主管级管理员", "主管级管理员"],
].map(([createdAt, name, role, post, perm], index) => ({
  id: "u" + (index + 1),
  createdAt,
  name,
  role,
  dept: "CSports",
  post,
  perm,
  validity: "永久",
  status: "正常",
  sn: "",
  password: "",
}));

let userFiltered = userRows.slice();
let userPage = 1;
let userSelection = new Set();

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

function choiceSelect(id, value, options, placeholder) {
  const current = value || "";
  const label = current || placeholder;
  const buttons = [`<button type="button" class="select-option${current ? "" : " selected"}" data-value="">${esc(placeholder)}</button>`]
    .concat(options.map((option) => `<button type="button" class="select-option${option === current ? " selected" : ""}" data-value="${esc(option)}">${esc(option)}</button>`));
  return `<div class="select" id="${id}" data-value="${esc(current)}" data-empty-placeholder="1">
    <button type="button" class="select-trigger"><span class="select-label${current ? "" : " placeholder"}">${esc(label)}</span><svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <div class="select-menu" hidden>${buttons.join("")}</div>
  </div>`;
}

function statusTag(status) {
  return `<span class="tag${status === "正常" ? "" : " off"}">${esc(status)}</span>`;
}

function pageSlice(list, page) {
  return list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

function renderUsers() {
  const rows = pageSlice(userFiltered, userPage);
  document.getElementById("userTbody").innerHTML = rows.map((row) => `<tr>
    <td class="center"><input type="checkbox" data-user-id="${esc(row.id)}" ${userSelection.has(row.id) ? "checked" : ""} aria-label="选择 ${esc(row.name)}" /></td>
    <td>${esc(row.createdAt)}</td>
    <td>${esc(row.name)}</td>
    <td>${esc(row.role)}</td>
    <td>${esc(row.dept)}</td>
    <td>${esc(row.post)}</td>
    <td>${statusTag(row.status)}</td>
    <td><div class="ops">
      <button type="button" class="op-btn op-orange" data-action="user-stop" data-id="${esc(row.id)}">离职/停用</button>
      <button type="button" class="op-btn op-blue" data-action="user-edit" data-id="${esc(row.id)}">编辑</button>
      <button type="button" class="op-btn op-green" data-action="user-reset-password" data-id="${esc(row.id)}">重置密码</button>
      <button type="button" class="op-btn op-blue" data-action="user-verify" data-id="${esc(row.id)}">验证</button>
      <button type="button" class="op-btn op-green" data-action="user-reset-google" data-id="${esc(row.id)}">重置谷歌验证</button>
      <button type="button" class="op-btn op-blue" data-action="user-bind" data-id="${esc(row.id)}">绑定动态口令</button>
    </div></td>
  </tr>`).join("") || '<tr><td class="empty" colspan="8">暂无数据</td></tr>';
  document.getElementById("userCheckAll").checked = rows.length > 0 && rows.every((row) => userSelection.has(row.id));
  const pages = Math.max(1, Math.ceil(userFiltered.length / PAGE_SIZE));
  const buttons = [`<button type="button" data-action="user-page" data-page-num="${userPage - 1}" ${userPage <= 1 ? "disabled" : ""}>上一页</button>`];
  for (let i = 1; i <= pages; i += 1) buttons.push(`<button type="button" class="${i === userPage ? "active" : ""}" data-action="user-page" data-page-num="${i}">${i}</button>`);
  buttons.push(`<button type="button" data-action="user-page" data-page-num="${userPage + 1}" ${userPage >= pages ? "disabled" : ""}>下一页</button>`);
  document.getElementById("userPager").innerHTML = `<span>共 ${userFiltered.length} 条</span><span>10条/页</span>${buttons.join("")}`;
}

function applyUserFilters() {
  const query = document.getElementById("userQuery").value.trim().toLowerCase();
  const type = document.getElementById("userType").dataset.value || "";
  const role = document.getElementById("userRole").dataset.value || "";
  const post = document.getElementById("userPost").dataset.value || "";
  const start = document.getElementById("userStart").value.trim();
  const end = document.getElementById("userEnd").value.trim();
  userFiltered = userRows.filter((row) => {
    if (query && !row.name.toLowerCase().includes(query)) return false;
    if (type && row.validity !== type) return false;
    if (role && row.role !== role) return false;
    if (post && row.post !== post) return false;
    const day = row.createdAt.slice(0, 10);
    if (start && day < start) return false;
    if (end && day > end) return false;
    return true;
  });
  userPage = 1;
  renderUsers();
}

function resetSelect(id, placeholder) {
  setSelectValue(document.getElementById(id), "", placeholder);
}

function openMask(html) {
  document.getElementById("modalRoot").insertAdjacentHTML("beforeend", html);
}

function readChoice(id) {
  const el = document.getElementById(id);
  return el ? el.dataset.value || "" : "";
}

function userForm(row) {
  const editing = Boolean(row);
  const name = editing
    ? `<input class="input" value="${esc(row.name)}" readonly />`
    : `<input id="userName" class="input" autocomplete="off" /><p class="field-error" id="userNameError" hidden>用户名称长度必须介于 6 和 20 之间</p>`;
  const password = editing ? "" : `<div class="form-row"><label><span class="req">*</span>用户密码</label><div class="field"><div class="pass-wrap"><input id="userPassword" class="input" type="password" autocomplete="new-password" /><button type="button" class="pass-toggle" data-action="toggle-password" aria-label="显示密码">显示</button></div><p class="field-error" id="userPasswordError" hidden>用户密码长度必须介于 12 和 20 之间</p></div></div>`;
  return `<div class="form-row"><label><span class="req">*</span>用户名称</label><div class="field">${name}</div></div>
    ${password}
    <div class="form-row"><label><span class="req">*</span>角色</label><div class="field">${choiceSelect("draftRole", editing ? row.role : "", ROLES, "请选择")}</div></div>
    <div class="form-row"><label><span class="req">*</span>归属部门</label><div class="field">${choiceSelect("draftDept", editing ? row.dept : "", DEPTS, "请选择归属部门")}</div></div>
    <div class="form-row"><label>动态密码卡SN号</label><div class="field"><input id="draftUserSn" class="input" placeholder="请输入" value="${esc(editing ? row.sn : "")}" autocomplete="off" /></div></div>
    <div class="form-row"><label><span class="req">*</span>岗位</label><div class="field">${choiceSelect("draftPost", editing ? row.post : "", POSTS, "请选择")}</div></div>
    <div class="form-row"><label><span class="req">*</span>账号有效期</label><div class="field">${radios("draftValidity", ["永久", "临时"], editing ? row.validity : "永久")}</div></div>
    <div class="form-row"><label><span class="req">*</span>账号权限</label><div class="field">${choiceSelect("draftPerm", editing ? row.perm : "一般管理员", PERMS, "请选择")}</div></div>`;
}

function openUserAdd() {
  openMask(`<div class="mask layer-user"><div class="dialog narrow" role="dialog" aria-modal="true" aria-label="添加用户">
    <div class="dialog-header"><h2>添加用户</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body">${userForm(null)}</div>
    <div class="dialog-footer"><button type="button" class="btn btn-primary" data-action="user-confirm-add">确定</button><button type="button" class="btn" data-action="close-layer">取消</button></div>
  </div></div>`);
}

function openUserEdit(id) {
  const row = userRows.find((item) => item.id === id);
  if (!row) return;
  openMask(`<div class="mask layer-user"><div class="dialog narrow" role="dialog" aria-modal="true" aria-label="修改用户">
    <div class="dialog-header"><h2>修改用户</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body">${userForm(row)}</div>
    <div class="dialog-footer"><button type="button" class="btn btn-primary" data-action="user-confirm-edit" data-id="${esc(row.id)}">确定</button><button type="button" class="btn" data-action="close-layer">取消</button></div>
  </div></div>`);
}

function openBind(id) {
  const row = userRows.find((item) => item.id === id);
  if (!row) return;
  openMask(`<div class="mask layer-bind"><div class="dialog small" role="dialog" aria-modal="true" aria-label="绑定动态口令">
    <div class="dialog-header"><h2>绑定动态口令</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body"><div class="form-row"><label><span class="req">*</span>动态密码卡SN号</label><div class="field"><input id="bindSn" class="input" placeholder="请输入" value="${esc(row.sn)}" autocomplete="off" /></div></div></div>
    <div class="dialog-footer"><button type="button" class="btn" data-action="close-layer">取消</button><button type="button" class="btn btn-primary" data-action="user-confirm-bind" data-id="${esc(row.id)}">确认</button></div>
  </div></div>`);
}

function confirmUserAdd() {
  const name = document.getElementById("userName").value.trim();
  const password = document.getElementById("userPassword").value;
  const nameOk = name.length >= 6 && name.length <= 20;
  const passwordOk = password.length >= 12 && password.length <= 20;
  document.getElementById("userNameError").hidden = nameOk;
  document.getElementById("userPasswordError").hidden = passwordOk;
  if (!nameOk || !passwordOk) return;
  const role = readChoice("draftRole");
  const dept = readChoice("draftDept");
  const post = readChoice("draftPost");
  const perm = readChoice("draftPerm");
  const validity = document.querySelector('input[name="draftValidity"]:checked');
  if (!role || !dept || !post || !perm || !validity) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  if (userRows.some((row) => row.name === name)) {
    showToast("用户名称已存在", "warning");
    return;
  }
  userRows.unshift({
    id: "u" + Date.now(),
    createdAt: formatNow(),
    name,
    role,
    dept,
    post,
    perm,
    validity: validity.value,
    status: "正常",
    sn: document.getElementById("draftUserSn").value.trim(),
    password,
  });
  closeTop();
  applyUserFilters();
  showToast("新增成功", "success");
}

function confirmUserEdit(id) {
  const row = userRows.find((item) => item.id === id);
  const role = readChoice("draftRole");
  const dept = readChoice("draftDept");
  const post = readChoice("draftPost");
  const perm = readChoice("draftPerm");
  const validity = document.querySelector('input[name="draftValidity"]:checked');
  if (!row || !role || !dept || !post || !perm || !validity) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  row.role = role;
  row.dept = dept;
  row.post = post;
  row.perm = perm;
  row.validity = validity.value;
  row.sn = document.getElementById("draftUserSn").value.trim();
  closeTop();
  applyUserFilters();
  showToast("保存成功", "success");
}

function confirmBind(id) {
  const row = userRows.find((item) => item.id === id);
  const sn = document.getElementById("bindSn").value.trim();
  if (!row || !sn) {
    showToast("请输入动态密码卡SN号", "warning");
    return;
  }
  row.sn = sn;
  closeTop();
  showToast("绑定成功", "success");
}

function showMenu(page) {
  const real = page === "users";
  document.getElementById("view-users").hidden = !real;
  document.getElementById("view-placeholder").hidden = real;
  document.querySelectorAll(".submenu-item").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
  const title = LABELS[page] || "系统管理";
  document.getElementById("pageTitle").textContent = title;
  document.title = title + " - VSport Admin";
  document.getElementById("crumb").innerHTML = `系统管理 / <b>${esc(title)}</b>`;
  if (!real) document.getElementById("placeholderTitle").textContent = title;
}

document.addEventListener("click", (event) => {
  const userBox = event.target.closest("[data-user-id]");
  if (userBox) {
    if (userBox.checked) userSelection.add(userBox.dataset.userId);
    else userSelection.delete(userBox.dataset.userId);
    renderUsers();
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
  } else if (action === "user-search") applyUserFilters();
  else if (action === "user-reset") {
    document.getElementById("userQuery").value = "";
    document.getElementById("userStart").value = "";
    document.getElementById("userEnd").value = "";
    resetSelect("userType", "请选择");
    resetSelect("userRole", "请选择");
    resetSelect("userPost", "请选择");
    applyUserFilters();
  } else if (action === "user-add") openUserAdd();
  else if (action === "user-edit" || action === "user-edit-selected") {
    const id = action === "user-edit" ? actionEl.dataset.id : [...userSelection][0];
    if (action === "user-edit-selected" && userSelection.size !== 1) {
      showToast("请选择一条用户数据", "warning");
      return;
    }
    openUserEdit(id);
  } else if (action === "user-confirm-add") confirmUserAdd();
  else if (action === "user-confirm-edit") confirmUserEdit(actionEl.dataset.id);
  else if (action === "user-bind") openBind(actionEl.dataset.id);
  else if (action === "user-confirm-bind") confirmBind(actionEl.dataset.id);
  else if (action === "user-stop") {
    const row = userRows.find((item) => item.id === actionEl.dataset.id);
    if (!row) return;
    row.status = row.status === "正常" ? "停用" : "正常";
    renderUsers();
    showToast(row.status === "停用" ? "已停用" : "已恢复", "success");
  } else if (action === "user-reset-password") showToast("重置密码成功", "success");
  else if (action === "user-verify") showToast("验证成功", "success");
  else if (action === "user-reset-google") showToast("重置谷歌验证成功", "success");
  else if (action === "toggle-password") {
    const input = document.getElementById("userPassword");
    if (input) input.type = input.type === "password" ? "text" : "password";
  } else if (action === "user-page") {
    const pages = Math.max(1, Math.ceil(userFiltered.length / PAGE_SIZE));
    const next = Number(actionEl.dataset.pageNum);
    if (next >= 1 && next <= pages) {
      userPage = next;
      renderUsers();
    }
  } else if (action === "close-layer") closeTop();
});

document.getElementById("userCheckAll").addEventListener("change", (event) => {
  pageSlice(userFiltered, userPage).forEach((row) => {
    if (event.target.checked) userSelection.add(row.id);
    else userSelection.delete(row.id);
  });
  renderUsers();
});

renderUsers();
showMenu("users");
