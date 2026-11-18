"use strict";

const VENUE_TYPES = ["体育", "真人", "棋牌", "彩票", "电子", "电竞"];
const APPS = ["BTY"];
const HORSE_URL = "https://test-horse-api.example.com";
const GENERIC_URL = "https://test-api.example.com";
const MERCHANT_OPTIONS = [
  "ceshi bianji",
  "javenauto13358206",
  "javenauto3519301",
  "javenauto718558870",
  "javenauto9299935",
  "测试商户",
  "VTY-UAT接单测试商户",
];
const TITLES = {
  home: "首页",
  venues: "游戏场馆列表",
  merchants: "商户管理",
  finance: "财务管理",
  system: "系统管理",
};

const CHEVRON = '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

function merchant(id, name, updatedAt, url, blankOrder) {
  return {
    id,
    name,
    updatedAt,
    blankOrder: blankOrder || 0,
    urls: { testApi: url },
    keys: { merchantId: "sample" },
  };
}

function venue(partial) {
  const item = Object.assign({
    app: "BTY",
    status: "启用",
    creator: "admin",
    remark: "-",
    urlNames: ["testApi"],
    opsKeyNames: ["merchantId"],
    thirdPartyKeyNames: [],
    sampleUrls: { testApi: GENERIC_URL },
    merchants: [],
  }, partial);
  if (!item.opsKeyNames.length) item.opsKeyNames = ["merchantId"];
  if (!item.thirdPartyKeyNames) item.thirdPartyKeyNames = [];
  item.keyNames = item.opsKeyNames.concat(item.thirdPartyKeyNames);
  return item;
}

const venues = [
  venue({
    id: "v1",
    name: "测试场馆Horse01",
    type: "电子",
    code: "TEST_HORSE_01",
    remark: "测试数据-可删除",
    updatedAt: "2026-11-18 14:38:06",
    opsKeyNames: ["merchantId", "customKey"],
    thirdPartyKeyNames: ["thirdPartyKey"],
    sampleUrls: { testApi: HORSE_URL },
    merchants: [
      merchant("m1", "ceshi bianji", "", HORSE_URL, 3),
      merchant("m2", "javenauto13358206", "", HORSE_URL, 1),
      merchant("m3", "javenauto3519301", "2026-11-10 12:40:51", HORSE_URL, 0),
      merchant("m4", "javenauto718558870", "2026-11-18 14:38:24", HORSE_URL, 0),
      merchant("m5", "javenauto9299935", "2026-11-18 14:33:37", HORSE_URL, 0),
      merchant("m6", "测试商户", "", HORSE_URL, 2),
    ],
  }),
  venue({
    id: "v2",
    name: "javenauto1774330077",
    type: "体育",
    code: "1774330077",
    remark: "2",
    updatedAt: "2026-11-18 10:12:32",
  }),
  venue({
    id: "v3",
    name: "沙巴体育-BTY",
    type: "体育",
    code: "81",
    updatedAt: "2026-11-06 13:13:05",
    merchants: [merchant("m7", "VTY-UAT接单测试商户", "", GENERIC_URL, 0)],
  }),
  venue({
    id: "v4",
    name: "IM体育-BTY",
    type: "体育",
    code: "31",
    updatedAt: "2026-11-06 13:13:05",
  }),
  venue({
    id: "v5",
    name: "IM电竞-BTY",
    type: "电竞",
    code: "43",
    updatedAt: "2026-11-06 13:13:05",
  }),
  venue({
    id: "v6",
    name: "VR彩票-BTY",
    type: "彩票",
    code: "41",
    updatedAt: "2026-11-06 13:13:05",
  }),
  venue({
    id: "v7",
    name: "WS斗鸡-BTY",
    type: "真人",
    code: "87",
    updatedAt: "2026-11-06 13:13:05",
  }),
  venue({
    id: "v8",
    name: "PT真人-BTY",
    type: "真人",
    code: "174",
    updatedAt: "2026-11-06 13:13:05",
  }),
  venue({
    id: "v9",
    name: "javenauto1774330263",
    type: "体育",
    code: "1774330263",
    creator: "horsezjut01",
    remark: "1",
    updatedAt: "2026-08-25 19:16:53",
    merchants: [
      merchant("m8", "ceshi bianji", "", GENERIC_URL, 1),
      merchant("m9", "javenauto3519301", "", GENERIC_URL, 2),
      merchant("m10", "javenauto718558870", "", GENERIC_URL, 3),
    ],
  }),
];

let filtered = venues.slice();
let configVenueId = null;
let pendingDeleteId = null;
let calendarInput = null;
let calendarYear = 2026;
let calendarMonth = 10;

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getVenue(id) {
  return venues.find((item) => item.id === id) || null;
}

function formatNow() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseDate(text, endOfDay) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  const normalized = raw.replace("T", " ").replace(/\//g, "-");
  let match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})[ ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] || 0)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function sortedMerchants(venue) {
  return venue.merchants.slice().sort((a, b) => {
    if (a.updatedAt && b.updatedAt) {
      if (a.updatedAt === b.updatedAt) return 0;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    }
    if (a.updatedAt) return -1;
    if (b.updatedAt) return 1;
    return (a.blankOrder || 0) - (b.blankOrder || 0);
  });
}

function showToast(message, type) {
  const el = document.getElementById("toast");
  const kind = type === "warning" ? "warning" : "success";
  const icon = kind === "warning" ? "!" : "✓";
  el.className = "toast " + kind;
  el.innerHTML = `<span class="toast-icon">${icon}</span><span>${esc(message)}</span>`;
  el.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.hidden = true;
  }, 2200);
}

function renderTable() {
  const tbody = document.getElementById("venueTbody");
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td class="empty" colspan="10">暂无数据</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map((item, index) => {
    const tags = item.merchants.map((row) => `<span class="tag">${esc(row.name)}</span>`).join("");
    return `<tr>
      <td class="center">${index + 1}</td>
      <td>${esc(item.name)}</td>
      <td>${esc(item.app)}</td>
      <td>${esc(item.type)}</td>
      <td>${esc(item.code)}</td>
      <td class="merchants">${tags}</td>
      <td>${esc(item.creator)}</td>
      <td>${esc(item.remark)}</td>
      <td class="time">${esc(item.updatedAt)}</td>
      <td class="ops">
        <button type="button" class="link-btn" data-action="config" data-id="${esc(item.id)}">配置</button>
        <button type="button" class="link-btn" data-action="edit-venue" data-id="${esc(item.id)}">编辑</button>
      </td>
    </tr>`;
  }).join("");
}

function applyFilters() {
  const name = document.getElementById("qName").value.trim().toLowerCase();
  const type = document.getElementById("qType").dataset.value || "";
  const merchantName = document.getElementById("qMerchant").dataset.value || "";
  const startText = document.getElementById("qStart").value;
  const endText = document.getElementById("qEnd").value;
  const start = parseDate(startText, false);
  const end = parseDate(endText, true);
  if (startText.trim() && !start) {
    showToast("开始时间格式不正确", "warning");
    return;
  }
  if (endText.trim() && !end) {
    showToast("结束时间格式不正确", "warning");
    return;
  }
  if (start && end && start > end) {
    showToast("开始时间不能晚于结束时间", "warning");
    return;
  }
  filtered = venues.filter((item) => {
    if (name && !item.name.toLowerCase().includes(name)) return false;
    if (type && item.type !== type) return false;
    if (merchantName && !item.merchants.some((row) => row.name === merchantName)) return false;
    if (start || end) {
      const updated = parseDate(item.updatedAt, false);
      if (!updated) return false;
      if (start && updated < start) return false;
      if (end && updated > end) return false;
    }
    return true;
  });
  renderTable();
}

function resetFilters() {
  document.getElementById("qName").value = "";
  document.getElementById("qStart").value = "";
  document.getElementById("qEnd").value = "";
  setSelectValue(document.getElementById("qType"), "", "全部");
  setSelectValue(document.getElementById("qMerchant"), "", "请选择");
  applyFilters();
}

function setSelectValue(select, value, label) {
  select.dataset.value = value;
  const text = select.querySelector(".select-label");
  text.textContent = label;
  const emptyPlaceholder = select.dataset.emptyPlaceholder === "1" && value === "";
  text.classList.toggle("placeholder", emptyPlaceholder);
  select.querySelectorAll(".select-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.value === value);
  });
}

function fillMerchantFilter() {
  const menu = document.getElementById("qMerchantMenu");
  const options = [""].concat(MERCHANT_OPTIONS);
  menu.innerHTML = options.map((name) => {
    const label = name || "请选择";
    return `<button type="button" class="select-option${name ? "" : " selected"}" data-value="${esc(name)}">${esc(label)}</button>`;
  }).join("");
}

function closeAllSelects() {
  document.querySelectorAll(".select.open").forEach((select) => {
    select.classList.remove("open");
    const menu = select.querySelector(".select-menu");
    if (menu) menu.hidden = true;
  });
}

function toggleSelect(select) {
  const menu = select.querySelector(".select-menu");
  const willOpen = menu.hidden;
  closeAllSelects();
  closeCalendar();
  if (!willOpen) return;
  menu.hidden = false;
  select.classList.add("open");
  const trigger = select.querySelector(".select-trigger");
  const rect = trigger.getBoundingClientRect();
  const height = Math.min(menu.scrollHeight, 274);
  let top = rect.bottom + 4;
  if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 4);
  menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 248)) + "px";
  menu.style.top = top + "px";
  menu.style.width = Math.max(rect.width, 240) + "px";
}

function chooseOption(option) {
  const select = option.closest(".select");
  setSelectValue(select, option.dataset.value, option.textContent.trim());
  closeAllSelects();
}

function closeCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.hidden = true;
  calendarInput = null;
}

function openCalendar(input) {
  closeAllSelects();
  calendarInput = input;
  const parsed = parseDate(input.value, false);
  const base = parsed || new Date(2026, 10, 1);
  renderCalendar(base.getFullYear(), base.getMonth());
  const calendar = document.getElementById("calendar");
  calendar.hidden = false;
  const rect = input.getBoundingClientRect();
  const left = Math.min(rect.left, window.innerWidth - 296);
  let top = rect.bottom + 6;
  if (top + 320 > window.innerHeight) top = Math.max(8, rect.top - 326);
  calendar.style.left = Math.max(8, left) + "px";
  calendar.style.top = top + "px";
}

function renderCalendar(year, month) {
  calendarYear = year;
  calendarMonth = month;
  const selected = calendarInput ? parseDate(calendarInput.value, false) : null;
  const first = new Date(year, month, 1);
  const startWeek = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeek; i += 1) {
    const day = prevDays - startWeek + i + 1;
    cells.push(`<button type="button" class="cal-day out" data-cal="day" data-y="${month === 0 ? year - 1 : year}" data-m="${month === 0 ? 12 : month}" data-d="${day}">${day}</button>`);
  }
  for (let day = 1; day <= days; day += 1) {
    const on = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    cells.push(`<button type="button" class="cal-day${on ? " on" : ""}" data-cal="day" data-y="${year}" data-m="${month + 1}" data-d="${day}">${day}</button>`);
  }
  const tail = (startWeek + days) % 7 === 0 ? 0 : 7 - ((startWeek + days) % 7);
  for (let day = 1; day <= tail; day += 1) {
    cells.push(`<button type="button" class="cal-day out" data-cal="day" data-y="${month === 11 ? year + 1 : year}" data-m="${month === 11 ? 1 : month + 2}" data-d="${day}">${day}</button>`);
  }
  const weeks = ["日", "一", "二", "三", "四", "五", "六"].map((item) => `<span class="wk">${item}</span>`).join("");
  document.getElementById("calendar").innerHTML = `
    <div class="cal-head">
      <button type="button" data-cal="prev" aria-label="上个月">‹</button>
      <strong>${year}年 ${month + 1}月</strong>
      <button type="button" data-cal="next" aria-label="下个月">›</button>
    </div>
    <div class="cal-grid">${weeks}${cells.join("")}</div>`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function selectHtml(id, value, options, placeholder) {
  const label = value || placeholder;
  const emptyPlaceholder = !value;
  const buttons = [`<button type="button" class="select-option${value ? "" : " selected"}" data-value="">${esc(placeholder)}</button>`]
    .concat(options.map((option) => `<button type="button" class="select-option${option === value ? " selected" : ""}" data-value="${esc(option)}">${esc(option)}</button>`));
  return `<div class="select" ${id ? `id="${id}"` : ""} data-value="${esc(value)}" data-empty-placeholder="1">
    <button type="button" class="select-trigger">
      <span class="select-label${emptyPlaceholder ? " placeholder" : ""}">${esc(label)}</span>
      ${CHEVRON}
    </button>
    <div class="select-menu" hidden>${buttons.join("")}</div>
  </div>`;
}

function radios(name, options, current) {
  return `<div class="radios">${options.map((option) => `
    <label class="radio">
      <input type="radio" name="${name}" value="${esc(option)}" ${option === current ? "checked" : ""} />
      <span class="dot"></span>
      <span>${esc(option)}</span>
    </label>`).join("")}</div>`;
}

function dialogShell(className, layer, title, body, footerAction, footerLabel) {
  return `<div class="mask layer-${layer}" data-layer="${layer}">
    <div class="dialog ${className}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="dialog-header">
        <h2>${esc(title)}</h2>
        <button type="button" class="dialog-close" data-action="close-layer" aria-label="关闭">×</button>
      </div>
      <div class="dialog-body">${body}</div>
      <div class="dialog-footer">
        <button type="button" class="btn" data-action="close-layer">取消</button>
        <button type="button" class="btn btn-primary" data-action="${footerAction}">${esc(footerLabel)}</button>
      </div>
    </div>
  </div>`;
}

function configRows(venue) {
  const rows = sortedMerchants(venue);
  if (!rows.length) return '<tr><td class="empty" colspan="4">暂无已配置商户</td></tr>';
  return rows.map((row, index) => `<tr>
    <td class="center">${index + 1}</td>
    <td><span class="tag">${esc(row.name)}</span></td>
    <td>${esc(row.updatedAt || "")}</td>
    <td class="ops">
      <button type="button" class="btn-mini success" data-action="edit-merchant" data-id="${esc(row.id)}">编辑</button>
      <button type="button" class="btn-mini danger" data-action="delete-merchant" data-id="${esc(row.id)}">删除</button>
    </td>
  </tr>`).join("");
}

function refreshConfigTable() {
  const tbody = document.getElementById("configTbody");
  const venue = getVenue(configVenueId);
  if (!tbody || !venue) return;
  tbody.innerHTML = configRows(venue);
}

function openConfig(id) {
  const venue = getVenue(id);
  if (!venue) return;
  configVenueId = id;
  const urlRows = venue.urlNames.map((name) => `<div class="kv-row">
    <label>${esc(name)}:</label>
    <input class="input new-url" data-name="${esc(name)}" value="${esc(venue.sampleUrls[name] || "")}" autocomplete="off" disabled />
  </div>`).join("");
  const keyRows = venue.keyNames.map((name) => `<div class="kv-row">
    <label>${esc(name)}:</label>
    <input class="input new-key" data-name="${esc(name)}" placeholder="请输入 Key 值" autocomplete="off" />
  </div>`).join("");
  const body = `
    <h3 class="section-title">已配置商户</h3>
    <div class="table-wrap">
      <table class="grid">
        <thead>
          <tr>
            <th class="center" style="width:72px">序号</th>
            <th>商户平台</th>
            <th style="width:180px">更新时间</th>
            <th style="width:150px">操作</th>
          </tr>
        </thead>
        <tbody id="configTbody">${configRows(venue)}</tbody>
      </table>
    </div>
    <h3 class="section-title" style="margin-top:18px">新增配置商户</h3>
    <div class="kv-row">
      <label>商户平台:</label>
      ${selectHtml("newMerchantSelect", "", MERCHANT_OPTIONS, "请选择")}
    </div>
    <p class="context-line">
      <span>场馆游戏: ${esc(venue.name)}</span>
      <span>场馆类型: ${esc(venue.type)}</span>
      <span>场馆编码: ${esc(venue.code)}</span>
    </p>
    <h3 class="section-title">URL配置</h3>
    <div class="kv-block">${urlRows}</div>
    <h3 class="section-title">Key配置</h3>
    <div class="kv-block">${keyRows}</div>`;
  document.getElementById("modalRoot").insertAdjacentHTML("beforeend", dialogShell("config", "config", "配置商户", body, "confirm-config", "确认"));
}

function openEditMerchant(id) {
  const venue = getVenue(configVenueId);
  if (!venue) return;
  const row = venue.merchants.find((item) => item.id === id);
  if (!row) return;
  const urlRows = venue.urlNames.map((name) => `<div class="kv-row">
    <label>${esc(name)}:</label>
    <input class="input edit-url" data-name="${esc(name)}" value="${esc(row.urls[name] || "")}" autocomplete="off" disabled />
  </div>`).join("");
  const keyRows = venue.keyNames.map((name) => {
    const masked = row.keys[name] ? "******" : "";
    return `<div class="kv-row">
      <label>${esc(name)}:</label>
      <input class="input edit-key" data-name="${esc(name)}" data-id="${esc(row.id)}" value="${masked}" placeholder="请输入 Key 值" autocomplete="off" />
    </div>`;
  }).join("");
  const body = `
    <div class="kv-row">
      <label>商户平台:</label>
      <input class="input" readonly value="${esc(row.name)}" />
    </div>
    <h3 class="section-title">URL配置</h3>
    <div class="kv-block">${urlRows}</div>
    <h3 class="section-title">Key配置</h3>
    <div class="kv-block">${keyRows}</div>`;
  const html = dialogShell("merchant", "edit", "修改商户", body, "confirm-edit-merchant", "确认");
  document.getElementById("modalRoot").insertAdjacentHTML("beforeend", html.replace("data-action=\"confirm-edit-merchant\"", `data-action="confirm-edit-merchant" data-id="${esc(row.id)}"`));
}

function opsKeyRow(name, isFirst) {
  const field = name
    ? `<input class="key-name-input" data-group="ops" readonly value="${esc(name)}" />`
    : '<input class="key-name-input" data-group="ops" placeholder="请输入 Key 名称" autocomplete="off" />';
  const action = isFirst
    ? '<button type="button" class="text-link" data-action="add-key">添加</button>'
    : '<button type="button" class="text-link danger" data-action="delete-ops-key">删除</button>';
  return `<div class="key-name-row" data-group="ops">${field}${action}</div>`;
}

function thirdKeyRow(name) {
  return `<div class="key-name-row" data-group="third">
    <input class="key-name-input" data-group="third" readonly value="${esc(name)}" />
    <span class="key-system">由系统维护</span>
  </div>`;
}

function keyConfigCard(item) {
  const opsRows = (item.opsKeyNames.length ? item.opsKeyNames : [""])
    .map((name, index) => opsKeyRow(name, index === 0))
    .join("");
  const thirdRows = item.thirdPartyKeyNames.map((name) => thirdKeyRow(name)).join("");
  return `<section class="key-config-card">
    <h3 class="key-config-title">Key配置名称</h3>
    <div class="key-group" data-group="ops">
      <div class="key-group-head">
        <span>运营自定义配置</span>
        <span class="pill pill-edit">可编辑</span>
      </div>
      <div id="opsKeyList">${opsRows}</div>
    </div>
    <div class="key-divider"></div>
    <div class="key-group" data-group="third">
      <div class="key-group-head">
        <span>三方系统配置</span>
        <span class="pill pill-readonly">只读</span>
      </div>
      <div id="thirdKeyList">${thirdRows}</div>
      <p class="key-caption">三方配置由技术统一维护，运营无需操作。</p>
    </div>
  </section>`;
}

function openEditVenue(id) {
  const item = getVenue(id);
  if (!item) return;
  const urlRows = item.urlNames.map((name, index) => `<div class="form-row">
    <label>${index === 0 ? "URL配置名称:" : ""}</label>
    <div class="field"><input class="input" value="${esc(name)}" disabled /></div>
  </div>`).join("");
  const body = `
    <div class="form-row">
      <label><span class="req">*</span>场馆游戏:</label>
      <div class="field"><input class="input" readonly value="${esc(item.name)}" /></div>
    </div>
    <div class="form-row">
      <label><span class="req">*</span>场馆类型:</label>
      <div class="field">${radios("draftType", VENUE_TYPES, item.type)}</div>
    </div>
    <div class="form-row">
      <label><span class="req">*</span>所属应用:</label>
      <div class="field">${selectHtml("draftApp", item.app, APPS, "请选择")}</div>
    </div>
    <div class="form-row">
      <label><span class="req">*</span>状态:</label>
      <div class="field">${radios("draftStatus", ["启用", "禁用"], item.status)}</div>
    </div>
    <div class="form-row">
      <label><span class="req">*</span>场馆编码:</label>
      <div class="field"><input class="input" readonly value="${esc(item.code)}" /></div>
    </div>
    ${urlRows}
    ${keyConfigCard(item)}
    <div class="form-row top">
      <label>备注:</label>
      <div class="field"><textarea class="input" id="draftRemark">${esc(item.remark)}</textarea></div>
    </div>`;
  const html = dialogShell("", "venue", "修改场馆", body, "confirm-edit-venue", "确认");
  document.getElementById("modalRoot").insertAdjacentHTML("beforeend", html.replace("data-action=\"confirm-edit-venue\"", `data-action="confirm-edit-venue" data-id="${esc(item.id)}"`));
}

function openDeleteConfirm(id) {
  pendingDeleteId = id;
  const body = `<div class="confirm-body"><span class="warn-badge">!</span><p>确定删除该商户配置吗？删除后仅从当前场馆移除。</p></div>`;
  document.getElementById("modalRoot").insertAdjacentHTML(
    "beforeend",
    `<div class="mask layer-confirm" data-layer="confirm">
      <div class="dialog confirm" role="alertdialog" aria-modal="true" aria-label="提示">
        <div class="dialog-header">
          <h2>提示</h2>
          <button type="button" class="dialog-close" data-action="cancel-delete" aria-label="关闭">×</button>
        </div>
        <div class="dialog-body">${body}</div>
        <div class="dialog-footer">
          <button type="button" class="btn" data-action="cancel-delete">取消</button>
          <button type="button" class="btn btn-primary" data-action="confirm-delete">确定</button>
        </div>
      </div>
    </div>`
  );
}

function closeTop() {
  const masks = document.querySelectorAll("#modalRoot .mask");
  if (!masks.length) return;
  const top = masks[masks.length - 1];
  if (top.dataset.layer === "confirm") pendingDeleteId = null;
  if (top.dataset.layer === "config") configVenueId = null;
  top.remove();
}

function confirmConfig() {
  const venue = getVenue(configVenueId);
  const select = document.getElementById("newMerchantSelect");
  if (!venue || !select) return;
  const name = select.dataset.value || "";
  if (!name) {
    showToast("请选择商户平台", "warning");
    return;
  }
  if (venue.merchants.some((row) => row.name === name)) {
    showToast("该商户已配置", "warning");
    return;
  }
  const urls = {};
  document.querySelectorAll(".mask.layer-config .new-url").forEach((input) => {
    urls[input.dataset.name] = input.value.trim();
  });
  const keys = {};
  document.querySelectorAll(".mask.layer-config .new-key").forEach((input) => {
    const value = input.value.trim();
    if (value) keys[input.dataset.name] = value;
  });
  const now = formatNow();
  venue.merchants.push({
    id: "m" + Date.now(),
    name,
    updatedAt: now,
    blankOrder: 0,
    urls,
    keys,
  });
  venue.updatedAt = now;
  closeTop();
  applyFilters();
  showToast("保存成功", "success");
}

function confirmEditMerchant(id) {
  const venue = getVenue(configVenueId);
  if (!venue) return;
  const row = venue.merchants.find((item) => item.id === id);
  const layer = document.querySelector(".mask.layer-edit");
  if (!row || !layer) return;
  layer.querySelectorAll(".edit-url").forEach((input) => {
    row.urls[input.dataset.name] = input.value.trim();
  });
  layer.querySelectorAll(".edit-key").forEach((input) => {
    const shown = input.value.trim();
    if (shown === "******") return;
    if (shown) row.keys[input.dataset.name] = shown;
    else delete row.keys[input.dataset.name];
  });
  const now = formatNow();
  row.updatedAt = now;
  venue.updatedAt = now;
  closeTop();
  refreshConfigTable();
  applyFilters();
  showToast("保存成功", "success");
}

function confirmDelete() {
  const venue = getVenue(configVenueId);
  if (!venue || !pendingDeleteId) return;
  venue.merchants = venue.merchants.filter((row) => row.id !== pendingDeleteId);
  venue.updatedAt = formatNow();
  pendingDeleteId = null;
  closeTop();
  refreshConfigTable();
  applyFilters();
  showToast("删除成功", "success");
}

function addKeyRow() {
  const list = document.getElementById("opsKeyList");
  if (!list) return;
  const row = document.createElement("div");
  row.className = "key-name-row";
  row.dataset.group = "ops";
  row.innerHTML = `<input class="key-name-input" data-group="ops" placeholder="请输入 Key 名称" autocomplete="off" />
    <button type="button" class="text-link danger" data-action="delete-ops-key">删除</button>`;
  list.appendChild(row);
  row.querySelector("input").focus();
}

function deleteOpsKey(el) {
  const row = el.closest(".key-name-row");
  if (!row || row.dataset.group !== "ops") return;
  row.remove();
}

function confirmEditVenue(id) {
  const item = getVenue(id);
  const layer = document.querySelector(".mask.layer-venue");
  if (!item || !layer) return;
  const type = layer.querySelector('input[name="draftType"]:checked');
  const status = layer.querySelector('input[name="draftStatus"]:checked');
  const app = document.getElementById("draftApp");
  if (!type || !status || !app || !app.dataset.value) {
    showToast("请完整填写必填项", "warning");
    return;
  }
  const names = [];
  layer.querySelectorAll('.key-name-input[data-group="ops"]').forEach((input) => {
    const value = input.value.trim();
    if (value && !names.includes(value)) names.push(value);
  });
  if (!names.length) {
    showToast("请至少保留一个运营 Key 配置名称", "warning");
    return;
  }
  if (names.some((name) => item.thirdPartyKeyNames.includes(name))) {
    showToast("运营配置不能使用三方系统的 Key 名称", "warning");
    return;
  }
  item.type = type.value;
  item.app = app.dataset.value;
  item.status = status.value;
  item.remark = document.getElementById("draftRemark").value;
  item.opsKeyNames = names;
  item.keyNames = item.opsKeyNames.concat(item.thirdPartyKeyNames);
  item.updatedAt = formatNow();
  closeTop();
  applyFilters();
  showToast("保存成功", "success");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function exportCsv() {
  const headers = ["序号", "场馆游戏", "所属应用", "场馆类型", "场馆编码", "商户平台", "更新创建人", "备注", "最后操作时间"];
  const lines = [headers.join(",")];
  filtered.forEach((item, index) => {
    const merchants = item.merchants.map((row) => row.name).join("、");
    const cells = [index + 1, item.name, item.app, item.type, item.code, merchants, item.creator, item.remark, item.updatedAt];
    lines.push(cells.map(csvEscape).join(","));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "游戏场馆列表.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function showPage(page) {
  if (!TITLES[page]) return;
  document.querySelectorAll(".view").forEach((view) => {
    view.hidden = view.id !== "view-" + page;
  });
  document.getElementById("pageTitle").textContent = TITLES[page];
  document.title = TITLES[page] + " - VSport Admin";
  document.querySelectorAll(".menu-item, .submenu-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });
}

function onAction(el) {
  const action = el.dataset.action;
  if (action === "search") applyFilters();
  else if (action === "reset") resetFilters();
  else if (action === "export") exportCsv();
  else if (action === "clear-cache") showToast("清空缓存成功", "success");
  else if (action === "collapse") document.getElementById("layout").classList.toggle("collapsed");
  else if (action === "toggle-game") {
    const group = document.getElementById("gameGroup");
    const collapsed = document.getElementById("layout").classList.contains("collapsed");
    if (collapsed) {
      showPage("venues");
      return;
    }
    group.classList.toggle("open");
    el.setAttribute("aria-expanded", group.classList.contains("open") ? "true" : "false");
  } else if (action === "config") openConfig(el.dataset.id);
  else if (action === "edit-venue") openEditVenue(el.dataset.id);
  else if (action === "edit-merchant") openEditMerchant(el.dataset.id);
  else if (action === "delete-merchant") openDeleteConfirm(el.dataset.id);
  else if (action === "cancel-delete") {
    pendingDeleteId = null;
    closeTop();
  } else if (action === "confirm-delete") confirmDelete();
  else if (action === "close-layer") closeTop();
  else if (action === "confirm-config") confirmConfig();
  else if (action === "confirm-edit-merchant") confirmEditMerchant(el.dataset.id);
  else if (action === "confirm-edit-venue") confirmEditVenue(el.dataset.id);
  else if (action === "add-key") addKeyRow();
  else if (action === "delete-ops-key") deleteOpsKey(el);
}

document.addEventListener("click", (event) => {
  const cal = event.target.closest("[data-cal]");
  if (cal && calendarInput) {
    event.stopPropagation();
    if (cal.dataset.cal === "prev") {
      const month = calendarMonth - 1;
      renderCalendar(month < 0 ? calendarYear - 1 : calendarYear, (month + 12) % 12);
    } else if (cal.dataset.cal === "next") {
      const month = calendarMonth + 1;
      renderCalendar(month > 11 ? calendarYear + 1 : calendarYear, month % 12);
    } else if (cal.dataset.cal === "day") {
      calendarInput.value = `${cal.dataset.y}-${pad2(cal.dataset.m)}-${pad2(cal.dataset.d)}`;
      closeCalendar();
    }
    return;
  }

  if (event.target.id === "calendar") return;

  const dateWrap = event.target.closest(".daterange");
  if (dateWrap) {
    const dateInput = event.target.closest(".date-input") || dateWrap.querySelector(".date-input");
    if (dateInput) openCalendar(dateInput);
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
    chooseOption(option);
    return;
  }

  if (!event.target.closest(".select")) closeAllSelects();
  if (!event.target.closest(".calendar") && !event.target.closest(".date-input")) closeCalendar();

  if (event.target.classList.contains("mask")) {
    closeTop();
    return;
  }
  const actionEl = event.target.closest("[data-action]");
  if (actionEl) onAction(actionEl);
  const pageEl = event.target.closest("[data-page]");
  if (pageEl && pageEl.dataset.page) showPage(pageEl.dataset.page);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCalendar();
    closeAllSelects();
    if (document.querySelector("#modalRoot .mask")) closeTop();
  }
  if (event.key === "Enter" && event.target.id === "qName") applyFilters();
});

document.addEventListener("scroll", () => {
  closeAllSelects();
  closeCalendar();
}, true);

fillMerchantFilter();
renderTable();
showPage("venues");
