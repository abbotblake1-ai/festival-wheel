(function(){
  if(window.__activityManagementFlowInstalled)return;
  window.__activityManagementFlowInstalled=true;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  function hideDuplicateTemplateMenu(){
    $$('.side .nav.sub').forEach(n=>{
      if(n.textContent.trim()==='活动模板')n.style.display='none';
    });
  }

  function openTemplateCenter(){
    const nav=$('#navTemplateCenter');
    if(nav)nav.click();
  }

  function patchListAddButton(){
    const list=$('#list');if(!list)return;
    const btn=$$('.btn',list).find(b=>b.textContent.trim()==='＋ 新增'||b.textContent.trim()==='新增');
    if(!btn||btn.dataset.flowBound)return;
    btn.dataset.flowBound='1';btn.textContent='＋ 新增活动';
    btn.onclick=null;
    btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openTemplateCenter()},true);
  }

  function getActivities(){
    try{return JSON.parse(localStorage.getItem('festival_created_activities')||'[]')}catch(e){return[]}
  }
  function saveActivities(arr){
    try{localStorage.setItem('festival_created_activities',JSON.stringify(arr))}catch(e){}
  }
  function statusHtml(status){
    if(status==='草稿')return '<span class="status off" style="color:#667085;border-color:#d0d5dd;background:#f9fafb">草稿</span>';
    if(status==='待开始')return '<span class="status" style="color:#1677ff;border-color:#91caff;background:#e6f4ff">待开始</span>';
    return '<span class="status">开启中</span>';
  }
  function rowHtml(x){
    return `<tr data-created-id="${x.id}"><td>${x.id} (${x.templateId||'T01'})</td><td>${statusHtml(x.status)}</td><td>${x.template}</td><td><a href="javascript:void(0)" class="created-edit" style="color:#1677ff">${x.name}</a></td><td>${x.createdAt}</td><td>${x.status==='草稿'?'-':x.startAt||'待配置'}</td><td><div class="ops"><button class="btn link created-edit">编辑信息</button><button class="btn created-preview">预览</button><button class="btn danger created-delete">删除</button></div></td></tr>`;
  }
  function renderCreatedActivities(){
    const tbody=$('#list table.table tbody');if(!tbody)return;
    $$('tr[data-created-id]',tbody).forEach(x=>x.remove());
    getActivities().forEach(x=>tbody.insertAdjacentHTML('beforeend',rowHtml(x)));
    $$('tr[data-created-id]',tbody).forEach(row=>{
      const id=row.dataset.createdId;
      $$('.created-edit',row).forEach(b=>b.onclick=()=>{const x=getActivities().find(a=>a.id===id);if(x){localStorage.setItem('festival_random_draw_template_name',x.template);localStorage.setItem('festival_random_draw_template_mode',x.mode||'wheel');localStorage.setItem('festival_random_draw_activity_name',x.name)}if(typeof window.openEditor==='function')window.openEditor(true)});
      const p=$('.created-preview',row);if(p)p.onclick=()=>{const x=getActivities().find(a=>a.id===id);const nav=$('#navTemplateCenter');if(nav)nav.click();setTimeout(()=>{const btn=$$('.tpl-preview').find(b=>b.dataset.name===x?.template);if(btn)btn.click()},80)};
      const d=$('.created-delete',row);if(d)d.onclick=()=>{if(confirm('确认删除该活动吗？')){saveActivities(getActivities().filter(a=>a.id!==id));renderCreatedActivities()}};
    });
  }

  function returnToList(){
    const editor=$('#editor'),frame=$('#editorFrame');
    if(editor)editor.style.display='none';if(frame)frame.src='about:blank';
    if(typeof window.show==='function')window.show('list');
    const nav=$('#navList');if(nav)nav.classList.add('active');
    renderCreatedActivities();
  }

  window.addEventListener('message',e=>{
    const d=e.data;
    if(!d||typeof d!=='object')return;
    if(d.type==='activitySaved'){
      const arr=getActivities();
      const now=new Date();
      const stamp=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')+':00';
      const existing=d.editing?arr.find(x=>x.id===d.id||x.name===d.name):null;
      if(existing){Object.assign(existing,{name:d.name,template:d.template,mode:d.mode,status:d.status,createdAt:stamp})}
      else arr.unshift({id:String(Date.now()),templateId:d.mode==='gift'?'T02':'T01',name:d.name,template:d.template,mode:d.mode,status:d.status,createdAt:stamp,startAt:d.status==='待开始'?'待配置':'-'});
      saveActivities(arr);returnToList();
      setTimeout(()=>alert(d.status==='草稿'?'草稿保存成功，已返回运营活动列表':'活动发布成功，已返回运营活动列表'),50);
    }
    if(d.type==='returnTemplateCenter'){
      const editor=$('#editor'),frame=$('#editorFrame');
      if(editor)editor.style.display='none';if(frame)frame.src='about:blank';
      openTemplateCenter();
    }
  });

  const observer=new MutationObserver(()=>{hideDuplicateTemplateMenu();patchListAddButton();renderCreatedActivities()});
  observer.observe(document.body,{childList:true,subtree:true});
  hideDuplicateTemplateMenu();patchListAddButton();renderCreatedActivities();
})();