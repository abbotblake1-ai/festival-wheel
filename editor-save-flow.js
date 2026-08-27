(function(){
  if(window.__editorSaveFlowInstalled)return;
  window.__editorSaveFlowInstalled=true;

  const params=new URLSearchParams(location.search);
  const editing=params.get('mode')==='edit';
  let dirty=false;
  let activityName=localStorage.getItem('festival_random_draw_activity_name')||'';
  const template=localStorage.getItem('festival_random_draw_template_name')||(localStorage.getItem('festival_random_draw_template_mode')==='gift'?'礼盒抽奖':'大转盘');
  const mode=localStorage.getItem('festival_random_draw_template_mode')||'wheel';

  function defaultName(){return template==='礼盒抽奖'?'新人专属礼盒':'国庆豪礼大转盘'}
  if(!activityName)activityName=editing?defaultName():'';

  function patchHeader(){
    const title=document.getElementById('pageTitle');
    if(title)title.textContent=(editing?'编辑：':'新增活动｜使用模板：')+(editing?(activityName||defaultName()):template);
    const sub=document.querySelector('.top .sub');
    const currentMode=localStorage.getItem('festival_random_draw_template_mode')||mode;
    const styles={wheel:'大转盘',gift:'礼盒抽奖',caishen:'迎财神',flipcard:'翻卡抽奖',turncard:'翻牌抽奖',egg:'砸金蛋',chest:'宝箱抽奖',redpacket:'红包抽奖'};
    if(sub)sub.textContent='随机抽奖模板 · 当前抽奖样式：'+(styles[currentMode]||'大转盘');
  }

  function bindActivityName(){
    const fields=[...document.querySelectorAll('#body .field')];
    const field=fields.find(f=>(f.querySelector('label')?.textContent||'').includes('活动名称'));
    const input=field&&field.querySelector('input');
    if(!input||input.dataset.saveFlowBound)return;
    input.dataset.saveFlowBound='1';
    if(activityName)input.value=activityName;
    input.addEventListener('input',()=>{activityName=input.value.trim();dirty=true;try{localStorage.setItem('festival_random_draw_activity_name',activityName)}catch(e){}});
  }

  function postSave(status){
    if(!activityName){
      const fields=[...document.querySelectorAll('#body .field')];
      const input=fields.find(f=>(f.querySelector('label')?.textContent||'').includes('活动名称'))?.querySelector('input');
      activityName=(input?.value||'').trim();
    }
    if(!activityName){alert('请先在“基础信息”中填写活动名称');return}
    parent.postMessage({type:'activitySaved',status,name:activityName,template,mode,editing},'*');
    dirty=false;
  }

  document.addEventListener('input',()=>dirty=true,true);
  document.addEventListener('change',()=>dirty=true,true);
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    const text=btn.textContent.trim();
    if(text==='保存草稿'){
      e.preventDefault();e.stopImmediatePropagation();postSave('草稿');
    }else if(text==='发布活动'){
      e.preventDefault();e.stopImmediatePropagation();postSave('待开始');
    }else if(text==='← 返回'||text==='返回'){
      e.preventDefault();e.stopImmediatePropagation();
      if(dirty&&!confirm('当前配置尚未保存，确认返回活动模板中心吗？'))return;
      parent.postMessage({type:'returnTemplateCenter'},'*');
    }
  },true);

  const patch=()=>{patchHeader();bindActivityName()};
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
  setInterval(patch,350);patch();
})();