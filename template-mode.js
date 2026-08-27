(()=>{
  const KEY='festival_random_draw_template_mode';
  let mode=localStorage.getItem(KEY)||'wheel';
  const editing=new URLSearchParams(location.search).get('mode')==='edit';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const isPageConfig=()=>/页面配置|页面装修/.test($('.tab.on')?.textContent||'');

  const style=document.createElement('style');style.id='templateModeStyle';style.textContent=`
  .tpl-card{max-width:1380px;margin:0 auto 22px;padding:20px;border:1px solid #dbe7ff;background:#f8faff;border-radius:12px}.tpl-title{font-size:17px;font-weight:700;margin-bottom:14px}.tpl-options{display:grid;grid-template-columns:1fr 1fr;gap:16px}.tpl-option{border:2px solid #d0d5dd;background:#fff;border-radius:12px;padding:18px;cursor:pointer;display:flex;gap:14px;align-items:center}.tpl-option.on{border-color:#2563eb;background:#f4f7ff}.tpl-icon{width:54px;height:54px;border-radius:12px;display:grid;place-items:center;font-size:30px;background:#f2f4f7}.tpl-name{font-size:17px;font-weight:700}.tpl-desc{font-size:13px;color:#667085;margin-top:5px;line-height:1.6}.tpl-tag{margin-left:auto;color:#2563eb;font-size:12px;border:1px solid #b8d3ff;border-radius:999px;padding:4px 9px;white-space:nowrap}
  .gift-config{max-width:1380px;margin:0 auto}.gift-note{padding:14px 16px;background:#fff8e7;border:1px solid #f5d88a;border-radius:9px;color:#7a5420;margin-bottom:20px}.gift-group{border:1px solid #e4e7ec;border-radius:12px;background:#fff;margin-bottom:20px;overflow:hidden}.gift-group-h{padding:16px 20px;font-weight:700;background:#fafafa;border-bottom:1px solid #eaecf0}.gift-group-b{padding:22px}.gift-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px 40px}.gift-field label{display:block;font-weight:600;margin-bottom:8px}.gift-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gift-up{height:110px;border:1px dashed #b8c5d6;background:#f7f8fa;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#98a2b3;cursor:pointer}.gift-up.done{border-style:solid;border-color:#84adff;background:#f3f7ff;color:#2563eb}.gift-hint{font-size:12px;color:#98a2b3;margin-top:6px;line-height:1.5}@media(max-width:1000px){.tpl-options,.gift-grid{grid-template-columns:1fr}.gift-pair{grid-template-columns:1fr}}
  `;if(!$('#templateModeStyle'))document.head.appendChild(style);

  function optionHtml(){
    const current=mode==='gift'?{icon:'🎁',name:'礼盒抽奖',desc:'礼盒开启动效；与随机抽奖模板共用奖品、概率、库存和发奖逻辑。'}:{icon:'🎡',name:'大转盘',desc:'转盘扇区、指针及旋转动画。'};
    if(editing)return `<div class="tpl-card" id="templateSelector"><div class="tpl-title"><span class="req">*</span>抽奖展示形式</div><div class="tpl-options" style="grid-template-columns:1fr"><div class="tpl-option on" style="cursor:default"><div class="tpl-icon">${current.icon}</div><div><div class="tpl-name">${current.name}</div><div class="tpl-desc">${current.desc}</div></div><span class="tpl-tag">当前使用 · 不可修改</span></div></div><div style="margin-top:12px;color:#667085;font-size:13px">编辑活动时不可切换展示形式，避免已上传的页面素材与交互配置失效。</div></div>`;
    return `<div class="tpl-card" id="templateSelector"><div class="tpl-title"><span class="req">*</span>选择抽奖展示形式</div><div class="tpl-options"><div class="tpl-option ${mode==='wheel'?'on':''}" data-tpl="wheel"><div class="tpl-icon">🎡</div><div><div class="tpl-name">大转盘</div><div class="tpl-desc">转盘扇区、指针及旋转动画。</div></div><span class="tpl-tag">展示形式</span></div><div class="tpl-option ${mode==='gift'?'on':''}" data-tpl="gift"><div class="tpl-icon">🎁</div><div><div class="tpl-name">礼盒抽奖</div><div class="tpl-desc">礼盒开启动效；奖品、权重、库存、资格和发奖逻辑与大转盘共用。</div></div><span class="tpl-tag">展示形式</span></div></div><div style="margin-top:12px;color:#667085;font-size:13px">仅选择本次活动的前端抽奖表现形式，不改变随机抽奖模板的后端逻辑。</div></div>`;
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
  function updateHeader(){const sub=$('.sub');if(sub)sub.textContent=mode==='gift'?'随机抽奖模板 · 礼盒抽奖':'随机抽奖模板 · 大转盘'}
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
  function bindSelector(){
    if(editing)return;
    $('#templateSelector [data-tpl]').forEach(el=>el.onclick=()=>{
      mode=el.dataset.tpl;localStorage.setItem(KEY,mode);
      $$('#templateSelector [data-tpl]').forEach(x=>x.classList.toggle('on',x.dataset.tpl===mode));
      updateHeader();installPageDecorOverride();
      if(isPageConfig()) setTimeout(forcePageConfig,0);
    });
  }
  function patchBasic(){const body=$('#body');if(!body||$('#templateSelector'))return;const card=body.firstElementChild;if(!card)return;card.insertAdjacentHTML('beforebegin',optionHtml());bindSelector()}
  function patch(){installPageDecorOverride();updateHeader();const active=$('.tab.on')?.textContent||'';if(active.includes('基础信息'))patchBasic();if(isPageConfig())forcePageConfig()}

  document.addEventListener('click',e=>{if(e.target.closest('.tab'))setTimeout(patch,40)},true);
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
  setInterval(patch,300);
  setTimeout(patch,60);
})();