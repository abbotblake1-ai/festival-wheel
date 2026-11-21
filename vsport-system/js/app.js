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
  shield: "",
  shieldSn: "",
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
  const shield = editing ? row.shield : "";
  const shieldSn = editing ? row.shieldSn : "";
  return `<div class="form-row"><label><span class="req">*</span>用户名称</label><div class="field">${name}</div></div>
    ${password}
    <div class="form-row"><label><span class="req">*</span>角色</label><div class="field">${choiceSelect("draftRole", editing ? row.role : "", ROLES, "请选择")}</div></div>
    <div class="form-row"><label><span class="req">*</span>归属部门</label><div class="field">${choiceSelect("draftDept", editing ? row.dept : "", DEPTS, "请选择归属部门")}</div></div>
    <div class="form-row"><label><span class="req">*</span>物理盾类型</label><div class="field">${radios("userShield", ["海月盾", "Token令牌"], shield)}</div></div>
    <div class="form-row"><label><span class="req">*</span>物理盾SN号</label><div class="field"><input id="userShieldSn" class="input" value="${esc(shieldSn)}" autocomplete="off" /></div></div>
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
  openMask(`<div class="mask layer-bind"><div class="dialog bind" role="dialog" aria-modal="true" aria-label="绑定动态口令">
    <div class="dialog-header"><h2>绑定动态口令</h2><button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button></div>
    <div class="dialog-body">
      <div class="form-row"><label><span class="req">*</span>物理盾类型</label><div class="field">${radios("bindShield", ["海月盾", "Token令牌"], "")}</div></div>
      <div class="form-row"><label><span class="req">*</span>物理盾SN号</label><div class="field"><input id="bindSn" class="input" placeholder="请输入" value="${esc(row.sn)}" autocomplete="off" /></div></div>
    </div>
    <div class="dialog-footer"><button type="button" class="btn" data-action="close-layer">取消</button><button type="button" class="btn btn-primary" data-action="user-confirm-bind" data-id="${esc(row.id)}">确认</button></div>
  </div></div>`);
}

function userShieldFields() {
  const picked = document.querySelector('input[name="userShield"]:checked');
  const shieldSn = document.getElementById("userShieldSn").value.trim();
  return { shield: picked ? picked.value : "", shieldSn };
}

function confirmUserAdd() {
  const name = document.getElementById("userName").value.trim();
  const password = document.getElementById("userPassword").value;
  const nameOk = name.length >= 6 && name.length <= 20;
  const passwordOk = password.length >= 12 && password.length <= 20;
  document.getElementById("userNameError").hidden = nameOk;
  document.getElementById("userPasswordError").hidden = passwordOk;
  if (!nameOk || !passwordOk) return;
  const { shield, shieldSn } = userShieldFields();
  const role = readChoice("draftRole");
  const dept = readChoice("draftDept");
  const post = readChoice("draftPost");
  const perm = readChoice("draftPerm");
  const validity = document.querySelector('input[name="draftValidity"]:checked');
  if (!shield || !shieldSn || !role || !dept || !post || !perm || !validity) {
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
    sn: "",
    shield,
    shieldSn,
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
  const { shield, shieldSn } = userShieldFields();
  if (!row || !shield || !shieldSn || !role || !dept || !post || !perm || !validity) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  row.role = role;
  row.dept = dept;
  row.post = post;
  row.perm = perm;
  row.validity = validity.value;
  row.shield = shield;
  row.shieldSn = shieldSn;
  closeTop();
  applyUserFilters();
  showToast("保存成功", "success");
}

function confirmBind(id) {
  const row = userRows.find((item) => item.id === id);
  const picked = document.querySelector('input[name="bindShield"]:checked');
  const sn = document.getElementById("bindSn").value.trim();
  if (!row || !picked || !sn) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  row.shield = picked.value;
  row.sn = sn;
  closeTop();
  showToast("绑定成功", "success");
}


const tokenSns = ["8659623013352", "8659623966970", "8659623026166"];
let tokenSlot = 0;
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
].map(([sn, createdAt, updatedAt], index) => {
  const shield = index % 2 === 1 && tokenSlot < tokenSns.length ? "Token令牌" : "海月盾";
  return {
    id: "sn" + (index + 1),
    sn: shield === "Token令牌" ? tokenSns[tokenSlot++] : sn,
    shield,
    status: "正常",
    createdAt,
    updatedAt,
    factor: "",
    otp: "",
  };
});

for (let i = 0; i < 35; i += 1) {
  snRows.push({
    id: "snx" + i,
    sn: String(799996567 - i),
    shield: "海月盾",
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
    <td>${esc(row.shield || "海月盾")}</td>
    <td>${statusTag(row.status)}</td>
    <td>${esc(row.createdAt)}</td>
    <td>${esc(row.updatedAt)}</td>
    <td><button type="button" class="linkish" data-action="sn-edit" data-id="${esc(row.id)}">修改</button><button type="button" class="linkish danger" data-action="sn-delete" data-id="${esc(row.id)}">删除</button></td>
  </tr>`).join("") || '<tr><td class="empty" colspan="7">暂无数据</td></tr>';
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

function shieldValue() {
  const picked = document.querySelector('input[name="snShield"]:checked');
  return picked ? picked.value : "";
}

function shieldField(current) {
  return `<div class="form-row"><label><span class="req">*</span>物理盾类型</label><div class="field">${radios("snShield", ["海月盾", "Token令牌"], current || "")}</div></div>`;
}

function openSnAdd() {
  const body = `${shieldField("")}
    <div class="form-row"><label><span class="req">*</span>物理盾SN号</label><div class="field"><input id="snNumber" class="input" autocomplete="off" /></div></div>
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
  const body = `${shieldField(row.shield)}
    <div class="form-row"><label><span class="req">*</span>物理盾SN号</label><div class="field"><input id="snNumber" class="input" value="${esc(row.sn)}" autocomplete="off" /></div></div>
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
  const shield = shieldValue();
  if (!shield || !sn || !factor || !otp || !status) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  if (snRows.some((row) => row.sn === sn)) {
    showToast("该SN号已存在", "warning");
    return;
  }
  snRows.unshift({ id: "sn" + Date.now(), sn, shield, status: status.value, createdAt: formatNow(), updatedAt: formatNow(), factor, otp });
  closeTop();
  applySnFilters();
  showToast("新增成功", "success");
}

function confirmSnEdit(id) {
  const row = snRows.find((item) => item.id === id);
  const sn = document.getElementById("snNumber").value.trim();
  const otp = document.getElementById("snOtp").value.trim();
  const status = document.querySelector('input[name="snDraftStatus"]:checked');
  const shield = shieldValue();
  if (!row || !shield || !sn || !status) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  if (snRows.some((item) => item.sn === sn && item.id !== id)) {
    showToast("该SN号已存在", "warning");
    return;
  }
  row.sn = sn;
  row.shield = shield;
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
  if (!LABELS[page]) page = "users";
  const usersOn = page === "users";
  const snOn = page === "sn";
  document.getElementById("view-users").hidden = !usersOn;
  document.getElementById("view-sn").hidden = !snOn;
  document.getElementById("view-placeholder").hidden = usersOn || snOn;
  document.querySelectorAll(".submenu-item").forEach((el) => el.classList.toggle("active", el.dataset.page === page));
  const title = LABELS[page];
  document.getElementById("pageTitle").textContent = title;
  document.title = title + " - VSport Admin";
  document.getElementById("crumb").innerHTML = `系统管理 / <b>${esc(title)}</b>`;
  if (!usersOn && !snOn) document.getElementById("placeholderTitle").textContent = title;
  const next = "#/" + page;
  if (location.hash !== next) history.replaceState(null, "", next);
}

document.addEventListener("click", (event) => {
  const snBox = event.target.closest("[data-sn-id]");
  if (snBox) {
    if (snBox.checked) snSelection.add(snBox.dataset.snId);
    else snSelection.delete(snBox.dataset.snId);
    renderSn();
    return;
  }
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

document.getElementById("userCheckAll").addEventListener("change", (event) => {
  pageSlice(userFiltered, userPage).forEach((row) => {
    if (event.target.checked) userSelection.add(row.id);
    else userSelection.delete(row.id);
  });
  renderUsers();
});

document.getElementById("snCheckAll").addEventListener("change", (event) => {
  pageSlice(snFiltered, snPage).forEach((row) => {
    if (event.target.checked) snSelection.add(row.id);
    else snSelection.delete(row.id);
  });
  renderSn();
});

window.addEventListener("hashchange", () => {
  const page = location.hash.replace(/^#\//, "");
  if (LABELS[page]) showMenu(page);
});

renderUsers();
renderSn();
showMenu(LABELS[location.hash.replace(/^#\//, "")] ? location.hash.replace(/^#\//, "") : "users");
