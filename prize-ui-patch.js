(()=>{
  const ed=document;
  const q=s=>ed.querySelector(s);
  const sectorOptions=[6,8,9,10,12];

  function prizeName(){
    return (q('#pcPrizeName')?.value||'').trim();
  }

  function patchSectorCount(){
    const sel=q('#pcSectorCount');
    if(!sel||sel.dataset.patchedSectorOptions==='1') return;
    const current=Number(sel.value)||8;
    sel.innerHTML=sectorOptions.map(n=>`<option value="${n}" ${n===current?'selected':''}>${n}个扇区</option>`).join('');
    if(!sectorOptions.includes(current)) sel.value='8';
    sel.dataset.patchedSectorOptions='1';
  }

  function patchPrizeModal(){
    const modal=q('#pcEditModal');
    if(!modal) return;

    // 所有奖品都不再展示“奖品展示图”，保留DOM避免旧保存逻辑报错。
    const upload=q('#pcUpload');
    const uploadField=upload?.closest('.pc-field');
    if(uploadField) uploadField.style.display='none';

    const name=prizeName();
    const isCash=name.includes('现金券');

    const stat=q('#pcStatDays');
    const statField=stat?.closest('.pc-field');
    if(statField){
      statField.style.display=isCash?'none':'block';
      if(isCash) stat.value='0';
    }

    const valid=q('#pcValid');
    const periodSection=valid?.closest('.pc-sec');
    const title=periodSection?.querySelector('.pc-sec-title');
    if(title) title.textContent=isCash?'有效期':'统计与有效期';
  }

  function patch(){
    patchSectorCount();
    patchPrizeModal();
  }

  ed.addEventListener('click',()=>setTimeout(patch,20),true);
  ed.addEventListener('change',()=>setTimeout(patch,20),true);
  new MutationObserver(()=>setTimeout(patch,0)).observe(ed.body,{childList:true,subtree:true});
  setInterval(patch,300);
  setTimeout(patch,60);
})();