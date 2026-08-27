(()=>{
  const KEY='festival_random_draw_template_mode';
  let mode=localStorage.getItem(KEY)||'wheel';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const style=document.createElement('style');
  style.id='templateModeStyle';
  style.textContent=`
    .tpl-card{max-width:1380px;margin:0 auto 22px;padding:20px;border:1px solid #dbe7ff;background:#f8faff;border-radius:12px}
    .tpl-title{font-size:17px;font-weight:700;margin-bottom:14px}.tpl-options{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .tpl-option{border:2px solid #d0d5dd;background:#fff;border-radius:12px;padding:18px;cursor:pointer;transition:.18s;display:flex;gap:14px;align-items:center}
    .tpl-option:hover{border-color:#84adff}.tpl-option.on{border-color:#2563eb;background:#f4f7ff;box-shadow:0 0 0 3px rgba(37,99,235,.06)}
    .tpl-icon{width:54px;height:54px;border-radius:12px;display:grid;place-items:center;font-size:30px;background:#f2f4f7}.tpl-option.on .tpl-icon{background:#e8efff}
    .tpl-name{font-size:17px;font-weight:700}.tpl-desc{font-size:13px;color:#667085;margin-top:5px;line-height:1.6}.tpl-tag{margin-left:auto;color:#2563eb;font-size:12px;border:1px solid #b8d3ff;border-radius:999px;padding:4px 9px;white-space:nowrap}
    .gift-config{max-width:1380px;margin:0 auto}.gift-note{padding:14px 16px;background:#fff8e7;border:1px solid #f5d88a;border-radius:9px;color:#7a5420;margin-bottom:20px}
    .gift-group{border:1px solid #e4e7ec;border-radius:12px;background:#fff;margin-bottom:20px;overflow:hidden}.gift-group-h{padding:16px 20px;font-weight:700;background:#fafafa;border-bottom:1px solid #eaecf0}.gift-group-b{padding:22px}
    .gift-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px 40px}.gift-field label{display:block;font-weight:600;margin-bottom:8px}.gift-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gift-up{height:110px;border:1px dashed #b8c5d6;background:#f7f8fa;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#98a2b3;cursor:pointer}.gift-up.done{border-style:solid;border-color:#84adff;background:#f3f7ff;color:#2563eb}.gift-hint{font-size:12px;color:#98a2b3;margin-top:6px;line-height:1.5}
    @media(max-width:1000px){.tpl-options,.gift-grid{grid-template-columns:1fr}.gift-pair{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function optionHtml(){
    return `<div class="tpl-card" id="templateSelector"><div class="tpl-title"><span class="req">*</span>抽奖展示形式</div><div class="tpl-options">
      <div class="tpl-option ${mode==='wheel'?'on':''}" data-tpl="wheel"><div class="tpl-icon">🎡</div><div><div class="tpl-name">大转盘</div><div class="tpl-desc">使用转盘扇区、指针与旋转动画展示中奖结果。</div></div><span class="tpl-tag">展示层</span></div>
      <div class="tpl-option ${mode==='gift'?'on':''}" data-tpl="gift"><div class="tpl-icon">🎁</div><div><div class="tpl-name">礼盒抽奖</div><div class="tpl-desc">使用礼盒开启动画展示中奖结果；奖品、权重、资格、库存及发奖逻辑与大转盘共用。</div></div><span class="tpl-tag">新增</span></div>
    </div><div style="margin-top:12px;color:#667085;font-size:13px">说明：本字段仅决定前端抽奖表现形式，不改变奖品权重、可中奖VIP、账号限制、数量限制、单人中奖上限、兜底奖项及福利发放规则。</div></div>`;
  }

  function bindSelector(){
    $$('#templateSelector [data-tpl]').forEach(el=>el.onclick=()=>{
      mode=el.dataset.tpl;localStorage.setItem(KEY,mode);
      $$('#templateSelector [data-tpl]').forEach(x=>x.classList.toggle('on',x.dataset.tpl===mode));
      updateHeader();
      const active=$('.tab.on')?.textContent||'';
      if(active.includes('页面装修')) renderDecoration();
    });
  }

  function updateHeader(){
    const sub=$('.sub');
    if(sub) sub.textContent=mode==='gift'?'随机抽奖模板 · 礼盒抽奖':'随机抽奖模板 · 大转盘';
  }

  function patchBasic(){
    const body=$('#body'); if(!body||$('#templateSelector')) return;
    const card=body.firstElementChild; if(!card) return;
    card.insertAdjacentHTML('beforebegin',optionHtml());
    bindSelector(); updateHeader();
  }

  function uploadField(name,req=true,hint='jpg、png，建议单张≤1MB；APP/H5 与 Web 分开上传'){return `<div class="gift-field"><label>${req?'<span class="req">*</span>':''}${name}</label><div class="gift-pair"><div><div class="gift-up" data-upload>APP/H5 上传</div><div class="gift-hint">${hint}</div></div><div><div class="gift-up" data-upload>Web 上传</div><div class="gift-hint">${hint}</div></div></div></div>`}

  function giftDecorationHtml(){
    return `<div class="card"><div class="card-h">页面装修 · 礼盒抽奖</div><div class="card-b"><div class="gift-config">
      <div class="gift-note"><b>模板复用说明：</b>礼盒抽奖仅替换前端抽奖表现层。会员点击【开启礼盒】后，仍使用现有随机抽奖后端逻辑：锁定抽奖次数 → 筛选可中奖奖品 → 按权重随机 → 限量奖品库存控制 → 返回中奖结果 → 发放福利。</div>
      <div class="gift-group"><div class="gift-group-h">公共页面素材</div><div class="gift-group-b"><div class="gift-grid">
        ${uploadField('活动详情页顶部图')}${uploadField('活动背景图')}${uploadField('活动内容图',false)}${uploadField('活动规则图',false)}
      </div></div></div>
      <div class="gift-group"><div class="gift-group-h">礼盒抽奖区域素材</div><div class="gift-group-b"><div class="gift-grid">
        ${uploadField('礼盒抽奖区域背景图')}${uploadField('未开启礼盒图')}${uploadField('开启礼盒动效图',true,'支持 GIF/PNG/JPG；用于点击开启后的动画展示')}${uploadField('开启完成礼盒图',false)}${uploadField('开启礼盒按钮图')}${uploadField('不可开启按钮图',false)}
      </div></div></div>
      <div class="gift-group"><div class="gift-group-h">中奖弹窗</div><div class="gift-group-b"><div class="gift-grid">
        ${uploadField('中奖弹窗背景图')}
        <div class="gift-field"><label>中奖内容来源</label><div style="height:44px;border:1px solid #d0d5dd;border-radius:7px;padding:0 12px;display:flex;align-items:center;background:#f9fafb;color:#475467">读取【奖品配置 → 中奖弹窗图片】</div><div class="gift-hint">命中哪个奖品，展示该奖品配置的中奖弹窗图片；兜底奖项同样读取其配置图片。</div></div>
      </div></div></div>
    </div></div></div>`;
  }

  function renderDecoration(){
    const body=$('#body'); if(!body) return;
    if(mode==='gift'){
      body.innerHTML=giftDecorationHtml();
      $$('[data-upload]',body).forEach(x=>x.onclick=()=>{x.classList.add('done');x.textContent='✓ 已上传（原型）'});
    }else{
      // Let original renderer restore wheel decoration by re-clicking current tab after marking a temporary guard.
      if(body.dataset.tplGift==='1') location.reload();
    }
    body.dataset.tplGift=mode==='gift'?'1':'0';
  }

  function patch(){
    const active=$('.tab.on')?.textContent||'';
    updateHeader();
    if(active.includes('基础信息')) patchBasic();
    if(active.includes('页面装修') && mode==='gift' && !$('#body .gift-config')) renderDecoration();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.tab')) setTimeout(patch,30);
  },true);
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
  setTimeout(patch,80);
})();