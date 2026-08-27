(function(){
  if(window.__templateCenterActionsInstalled)return;
  window.__templateCenterActionsInstalled=true;

  const style=document.createElement('style');
  style.textContent=`
    .tc-preview-mask{position:fixed;inset:0;background:rgba(16,24,40,.58);z-index:500;display:none;align-items:center;justify-content:center}
    .tc-preview-box{width:min(1280px,94vw);height:min(850px,92vh);background:#fff;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 90px rgba(0,0,0,.28)}
    .tc-preview-head{height:64px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid #eaecf0;gap:12px}
    .tc-preview-title{font-size:18px;font-weight:700}.tc-preview-note{color:#667085;font-size:13px;margin-left:8px}
    .tc-preview-tools{margin-left:auto;display:flex;gap:8px}.tc-preview-tools button.on{color:#fff;background:#1677ff;border-color:#1677ff}
    .tc-preview-main{flex:1;min-height:0;background:#eef1f5;position:relative}.tc-preview-frame{width:100%;height:100%;border:0;background:#fff}
    .tc-gift-demo{height:100%;display:none;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 35%,#ef6252,#9f111c 58%,#4d0710);color:#fff;text-align:center;overflow:auto}
    .tc-gift-card{width:min(720px,88%);padding:38px;border:2px solid #ffd36a;border-radius:22px;background:linear-gradient(180deg,rgba(137,14,22,.92),rgba(80,5,12,.95));box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .tc-gift-title{font-size:38px;font-weight:900;color:#ffd86b;text-shadow:0 3px #8b1119}.tc-gift-sub{margin:10px 0 28px;color:#ffe8b0}
    .tc-gift{font-size:120px;cursor:pointer;display:inline-block;transition:.35s;filter:drop-shadow(0 14px 16px rgba(0,0,0,.35))}.tc-gift.open{transform:scale(1.14) rotate(-4deg)}
    .tc-gift-result{height:34px;font-size:20px;font-weight:700;color:#ffe779;margin-top:18px}.tc-gift-btn{margin-top:20px;border:0;border-radius:999px;padding:13px 38px;background:linear-gradient(#ffe886,#f3ac24);color:#8b1515;font-weight:800;cursor:pointer}
    .tc-unavailable{height:100%;display:none;align-items:center;justify-content:center;text-align:center;color:#667085}.tc-unavailable b{display:block;font-size:22px;color:#344054;margin-bottom:10px}
    .tc-use-tip{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:700;background:#ecfdf3;color:#027a48;border:1px solid #abefc6;padding:11px 18px;border-radius:7px;box-shadow:0 8px 24px rgba(0,0,0,.12)}
  `;
  document.head.appendChild(style);

  const mask=document.createElement('div');
  mask.className='tc-preview-mask';
  mask.innerHTML=`<div class="tc-preview-box">
    <div class="tc-preview-head"><span class="tc-preview-title" id="tcPreviewTitle">模板前端预览</span><span class="tc-preview-note">仅展示前端效果，不会创建活动</span>
      <div class="tc-preview-tools"><button class="btn" id="tcStyleWheel" style="display:none">大转盘</button><button class="btn" id="tcStyleGift" style="display:none">礼盒抽奖</button><button class="btn on" id="tcPc">PC预览</button><button class="btn" id="tcH5">H5预览</button><button class="btn" id="tcClose">关闭</button></div>
    </div>
    <div class="tc-preview-main">
      <iframe class="tc-preview-frame" id="tcFrame"></iframe>
      <div class="tc-gift-demo" id="tcGiftDemo"><div class="tc-gift-card"><div class="tc-gift-title">新人专属礼盒</div><div class="tc-gift-sub">点击礼盒，随机开启惊喜奖励</div><div class="tc-gift" id="tcGift">🎁</div><div class="tc-gift-result" id="tcGiftResult">剩余抽奖次数：1</div><button class="tc-gift-btn" id="tcGiftBtn">开启礼盒</button></div></div>
      <div class="tc-unavailable" id="tcUnavailable"><div><b id="tcUnavailableName"></b><span>该模板前端预览尚未配置</span></div></div>
    </div>
  </div>`;
  document.body.appendChild(mask);

  const frame=document.getElementById('tcFrame'),giftDemo=document.getElementById('tcGiftDemo'),unavailable=document.getElementById('tcUnavailable');
  let current='',previewMode='pc',giftOpened=false,randomPreview=false;
  function syncDevice(){
    document.getElementById('tcPc').classList.toggle('on',previewMode==='pc');
    document.getElementById('tcH5').classList.toggle('on',previewMode==='h5');
    document.getElementById('tcStyleWheel').classList.toggle('on',current==='大转盘');
    document.getElementById('tcStyleGift').classList.toggle('on',current==='礼盒抽奖');
    if(current==='大转盘'&&frame.contentDocument){
      const btn=frame.contentDocument.getElementById(previewMode==='pc'?'pcBtn':'h5Btn');
      if(btn)btn.click();
    }
    if(current==='礼盒抽奖'){
      const card=giftDemo.querySelector('.tc-gift-card');
      card.style.width=previewMode==='h5'?'390px':'min(720px,88%)';
      card.style.padding=previewMode==='h5'?'30px 18px':'38px';
    }
  }
  function showPreviewStyle(name){
    current=name;giftOpened=false;
    document.getElementById('tcPreviewTitle').textContent=(randomPreview?'随机抽奖模板 · ':'')+name+'前端预览';
    frame.style.display='none';giftDemo.style.display='none';unavailable.style.display='none';
    if(name==='大转盘'){
      frame.style.display='block';frame.src='frontend.html?t='+Date.now();frame.onload=()=>syncDevice();
    }else if(name==='礼盒抽奖'){
      giftDemo.style.display='flex';
      document.getElementById('tcGift').classList.remove('open');
      document.getElementById('tcGift').textContent='🎁';
      document.getElementById('tcGiftResult').textContent='剩余抽奖次数：1';
    }else{
      unavailable.style.display='flex';document.getElementById('tcUnavailableName').textContent=name;
    }
    syncDevice();
  }
  function openPreview(name){
    previewMode='pc';randomPreview=name==='随机抽奖模板';
    document.getElementById('tcStyleWheel').style.display=randomPreview?'inline-block':'none';
    document.getElementById('tcStyleGift').style.display=randomPreview?'inline-block':'none';
    mask.style.display='flex';
    showPreviewStyle(randomPreview?'大转盘':name);
  }
  document.getElementById('tcStyleWheel').onclick=()=>showPreviewStyle('大转盘');
  document.getElementById('tcStyleGift').onclick=()=>showPreviewStyle('礼盒抽奖');
  function openGift(){
    if(giftOpened){document.getElementById('tcGiftResult').textContent='暂无抽奖次数';return}
    giftOpened=true;const g=document.getElementById('tcGift');g.classList.add('open');g.textContent='🎊';
    document.getElementById('tcGiftResult').textContent='恭喜获得：现金券 15元';
  }
  document.getElementById('tcGiftBtn').onclick=openGift;
  document.getElementById('tcGift').onclick=openGift;
  document.getElementById('tcPc').onclick=()=>{previewMode='pc';syncDevice()};
  document.getElementById('tcH5').onclick=()=>{previewMode='h5';syncDevice()};
  document.getElementById('tcClose').onclick=()=>{mask.style.display='none';frame.src='about:blank'};
  mask.onclick=e=>{if(e.target===mask){mask.style.display='none';frame.src='about:blank'}};

  function useTemplate(name,mode){
    try{
      localStorage.setItem('festival_random_draw_template_mode',mode==='random'?'wheel':(mode||'wheel'));
      localStorage.setItem('festival_random_draw_template_name',name);
    }catch(e){}
    const tip=document.createElement('div');tip.className='tc-use-tip';tip.textContent='已选择“'+name+'”模板，正在进入新增活动配置';
    document.body.appendChild(tip);setTimeout(()=>tip.remove(),1800);
    setTimeout(()=>{
      const editor=document.getElementById('editor');
      const editorFrame=document.getElementById('editorFrame');
      if(editor&&editorFrame){
        editor.style.display='block';
        editorFrame.src='wheel-editor-v5.html?mode=new&template='+encodeURIComponent(mode==='random'?'wheel':(mode||'wheel'))+'&t='+Date.now();
      }else if(typeof window.openEditor==='function'){
        window.openEditor(false);
      }else{
        alert('新增活动页面加载失败，请刷新后台后重试');
      }
    },120);
  }

  document.addEventListener('click',function(e){
    const preview=e.target.closest('.tpl-preview');
    if(preview){e.preventDefault();e.stopImmediatePropagation();openPreview(preview.dataset.name);return}
    const use=e.target.closest('.tpl-use');
    if(use){e.preventDefault();e.stopImmediatePropagation();useTemplate(use.dataset.name,use.dataset.mode);return}
  },true);
})();