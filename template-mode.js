(()=>{
  const KEY='festival_random_draw_template_mode';
  let mode=localStorage.getItem(KEY)||'wheel';
  const editing=new URLSearchParams(location.search).get('mode')==='edit';
  let scene=localStorage.getItem('festival_random_draw_scene')||'general';
  const STYLE_MAP={wheel:['🎡','大转盘','转盘扇区、指针及旋转动画。'],gift:['🎁','礼盒抽奖','点击礼盒开启并展示中奖结果。'],caishen:['🤑','迎财神','随机恭请财神并展示财神降临动画。'],flipcard:['🃏','翻卡抽奖','翻开卡片后展示随机奖励。'],turncard:['🎴','翻牌抽奖','选择并翻开牌面获得奖励。'],egg:['🥚','砸金蛋','点击砸开金蛋展示奖励。'],chest:['🧰','宝箱抽奖','开启宝箱获得随机奖励。'],redpacket:['🧧','红包抽奖','点击红包获得随机奖励。']};
  const SCENE_MAP={general:'通用活动',newbie:'新人专属',register:'注册活动',login:'登录活动',invite:'邀请活动'};
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const isPageConfig=()=>/页面配置|页面装修/.test($('.tab.on')?.textContent||'');

  const style=document.createElement('style');style.id='templateModeStyle';style.textContent=`
  .tpl-card{grid-column:1/-1;margin:0;padding:0;border:0;background:transparent}.tpl-title{font-size:14px;font-weight:600;margin-bottom:9px}.tpl-options{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.scene-options{display:flex;gap:10px;flex-wrap:wrap}.scene-chip{height:34px;padding:0 16px;border:1px solid #d0d5dd;border-radius:17px;background:#fff;color:#475467;cursor:pointer}.scene-chip.on{border-color:#2563eb;background:#edf4ff;color:#1d4ed8;font-weight:700}.tpl-hint{margin-top:8px;color:#667085;font-size:12px}.tpl-option{border:1px solid #d0d5dd;background:#fff;border-radius:8px;padding:12px 14px;cursor:pointer;display:flex;gap:14px;align-items:center}.tpl-option.on{border:2px solid #2563eb;background:#edf4ff;box-shadow:0 0 0 2px rgba(37,99,235,.08)}.tpl-option.on .tpl-name{color:#1d4ed8}.tpl-option.on .tpl-tag{background:#2563eb;color:#fff;border-color:#2563eb}.tpl-icon{width:42px;height:42px;border-radius:8px;display:grid;place-items:center;font-size:24px;background:#f2f4f7}.tpl-name{font-size:15px;font-weight:700}.tpl-desc{font-size:13px;color:#667085;margin-top:5px;line-height:1.6}.tpl-tag{margin-left:auto;color:#2563eb;font-size:12px;border:1px solid #b8d3ff;border-radius:999px;padding:4px 9px;white-space:nowrap}
  .gift-config{max-width:1380px;margin:0 auto}.gift-note{padding:14px 16px;background:#fff8e7;border:1px solid #f5d88a;border-radius:9px;color:#7a5420;margin-bottom:20px}.gift-group{border:1px solid #e4e7ec;border-radius:12px;background:#fff;margin-bottom:20px;overflow:hidden}.gift-group-h{padding:16px 20px;font-weight:700;background:#fafafa;border-bottom:1px solid #eaecf0}.gift-group-b{padding:22px}.gift-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px 40px}.gift-field label{display:block;font-weight:600;margin-bottom:8px}.gift-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gift-up{height:110px;border:1px dashed #b8c5d6;background:#f7f8fa;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#98a2b3;cursor:pointer}.gift-up.done{border-style:solid;border-color:#84adff;background:#f3f7ff;color:#2563eb}.gift-hint{font-size:12px;color:#98a2b3;margin-top:6px;line-height:1.5}@media(max-width:1000px){.tpl-options{grid-template-columns:repeat(2,1fr)}.gift-grid{grid-template-columns:1fr}.gift-pair{grid-template-columns:1fr}}
  `;if(!$('#templateModeStyle'))document.head.appendChild(style);

  function optionHtml(){
    const current=STYLE_MAP[mode]||STYLE_MAP.wheel;
    const sceneName=SCENE_MAP[scene]||SCENE_MAP.general;
    if(editing)return `<div class="tpl-card" id="templateSelector"><div class="tpl-title"><span class="req">*</span>活动场景</div><div class="scene-options"><span class="scene-chip on">${sceneName}</span></div><div class="tpl-title" style="margin-top:16px"><span class="req">*</span>抽奖样式</div><div class="tpl-options" style="grid-template-columns:1fr"><div class="tpl-option on" style="cursor:default"><div class="tpl-icon">${current[0]}</div><div><div class="tpl-name">${current[1]}</div><div class="tpl-desc">${current[2]}</div></div><span class="tpl-tag">当前使用 · 不可修改</span></div></div><div style="margin-top:10px;color:#667085;font-size:13px">编辑活动时不可切换活动场景和抽奖样式，避免参与条件及页面素材失效。</div></div>`;
    const scenes=Object.entries(SCENE_MAP).map(([id,name])=>`<button type="button" class="scene-chip ${scene===id?'on':''}" data-scene="${id}">${name}</button>`).join('');
    const styles=Object.entries(STYLE_MAP).map(([id,x])=>`<div class="tpl-option ${mode===id?'on':''}" data-tpl="${id}"><div class="tpl-icon">${x[0]}</div><div><div class="tpl-name">${x[1]}</div><div class="tpl-desc">${x[2]}</div></div><span class="tpl-tag">${mode===id?'✓ 已选择':'选择'}</span></div>`).join('');
    return `<div class="tpl-card" id="templateSelector"><div class="tpl-title"><span class="req">*</span>选择活动场景</div><div class="scene-options">${scenes}</div><div class="tpl-hint">活动场景决定默认参与条件和抽奖机会来源，可组合生成新人大转盘、注册大转盘、新人专属礼盒等活动。</div><div class="tpl-title" style="margin-top:17px"><span class="req">*</span>选择抽奖样式</div><div class="tpl-options">${styles}</div><div style="margin-top:10px;color:#667085;font-size:13px">抽奖样式仅改变前端交互和页面素材，不改变随机抽奖模板的后端逻辑。</div></div>`;
  }
  function uploadField(name,req=true,hint='JPG/PNG；APP/H5 与 Web 分开上传'){return `<div class="gift-field"><label>${req?'<span class="req">*</span>':''}${name}</label><div class="gift-pair"><div><div class="gift-up" data-upload>APP/H5 上传</div><div class="gift-hint">${hint}</div></div><div><div class="gift-up" data-upload>Web 上传</div><div class="gift-hint">${hint}</div></div></div></div>`}
  function giftDecorationHtml(){return `<div class="card"><div class="card-h">页面配置 · 礼盒抽奖</div><div class="card-b"><div class="gift-config">
    <div class="gift-note"><b>当前展示形式：礼盒抽奖。</b> 当前页面仅展示礼盒所需素材配置，不再展示大转盘底座、外圈、转盘、指针等转盘专属素材。</div>
    <div class="gift-group"><div class="gift-group-h">1. 公共页面素材</div><div class="gift-group-b"><div class="gift-grid">
      ${uploadField('活动内页顶部图')}${uploadField('活动背景图')}
    </div></div></div>
    <div class="gift-group"><div class="gift-group-h">2. 礼盒抽奖区域</div><div class="gift-group-b"><div class="gift-grid">
      ${uploadField('礼盒区域背景图')}${uploadField('未开启礼盒图')}${uploadField('开启礼盒动效图',true,'支持 GIF/PNG/JPG；点击开启礼盒后展示')}${uploadField('开启完成礼盒图',false)}${uploadField('开启礼盒按钮图')}${uploadField('不可开启按钮图',false)}
    </div></div></div>
    <div class="gift-group"><div class="gift-group-h">3. 中奖弹窗</div><div class="gift-group-b"><div class="gift-grid">
      ${uploadField('中奖弹窗背景图')}<div class="gift-field"><label>中奖内容来源</label><div style="height:44px;border:1px solid #d0d5dd;border-radius:7px;padding:0 12px;display:flex;align-items:center;background:#f9fafb;color:#475467">读取【奖品配置 → 中奖弹窗图片】</div><div class="gift-hint">会员命中哪个奖品，即展示对应奖品配置的中奖弹窗图片；兜底奖项同样适用。</div></div>
    </div></div></div>
  </div></div></div>`}

  let originalPageDecor=null;
  function installPageDecorOverride(){
    if(!originalPageDecor && typeof window.pageDecor==='function') originalPageDecor=window.pageDecor;
    if(originalPageDecor) window.pageDecor=function(){return mode==='gift'?giftDecorationHtml():originalPageDecor()};
  }
  function bindGiftUploads(){if(mode!=='gift')return;$$('[data-upload]').forEach(x=>{if(x.dataset.bound)return;x.dataset.bound='1';x.onclick=()=>{x.classList.add('done');x.textContent='✓ 已上传（原型）'}})}
  function updateHeader(){const sub=$('.sub');const style=STYLE_MAP[mode]||STYLE_MAP.wheel;if(sub)sub.textContent='随机抽奖模板 · '+(SCENE_MAP[scene]||SCENE_MAP.general)+' · 当前抽奖样式：'+style[1]}
  function forcePageConfig(){
    if(!isPageConfig()) return;
    const body=$('#body');if(!body)return;
    if(mode==='gift'){
      if(!body.querySelector('.gift-config')) body.innerHTML=giftDecorationHtml();
      bindGiftUploads();
    }else if(body.querySelector('.gift-config')){
      if(originalPageDecor) body.innerHTML=originalPageDecor();
      else if(typeof window.render==='function') window.render();
    }
  }
  function syncSelectorState(){
    $$('#templateSelector [data-tpl]').forEach(x=>{
      const selected=x.dataset.tpl===mode;
      x.classList.toggle('on',selected);
      const tag=x.querySelector('.tpl-tag');
      if(tag)tag.textContent=selected?'✓ 已选择':'选择';
    });
  }
  function bindSelector(){
    if(editing)return;
    $$('#templateSelector [data-tpl]').forEach(el=>el.onclick=()=>{
      mode=el.dataset.tpl;localStorage.setItem(KEY,mode);
      syncSelectorState();
      updateHeader();installPageDecorOverride();
      if(isPageConfig()) setTimeout(forcePageConfig,0);
    });
  }
  function patchBasic(){const body=$('#body');if(!body||$('#templateSelector'))return;const card=body.firstElementChild;if(!card)return;const formGrid=card.querySelector('.form-grid');if(!formGrid)return;formGrid.insertAdjacentHTML('afterbegin',optionHtml());bindSelector()}
  function patch(){installPageDecorOverride();updateHeader();const active=$('.tab.on')?.textContent||'';if(active.includes('基础信息'))patchBasic();if(isPageConfig())forcePageConfig()}

  document.addEventListener('click',e=>{
    const sceneOption=e.target.closest('#templateSelector [data-scene]');
    if(sceneOption&&!editing){
      e.preventDefault();e.stopPropagation();
      scene=sceneOption.dataset.scene;
      localStorage.setItem('festival_random_draw_scene',scene);
      $('#templateSelector [data-scene]').forEach(x=>x.classList.toggle('on',x.dataset.scene===scene));
      updateHeader();
      return;
    }
    const option=e.target.closest('#templateSelector .tpl-option[data-tpl]');
    if(option&&!editing){
      e.preventDefault();
      e.stopPropagation();
      mode=option.dataset.tpl;
      localStorage.setItem(KEY,mode);
      $$('#templateSelector [data-tpl]').forEach(x=>x.classList.toggle('on',x.dataset.tpl===mode));
      updateHeader();
      installPageDecorOverride();
      return;
    }
    if(e.target.closest('.tab'))setTimeout(patch,40);
  },true);
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
  setInterval(patch,300);
  setTimeout(patch,60);
})();