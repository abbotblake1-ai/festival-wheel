(()=>{
  const patch=()=>{
    try{
      // 活动类型筛选补充礼盒抽奖
      const selects=[...document.querySelectorAll('select')];
      const typeSelect=selects.find(s=>[...s.options].some(o=>o.textContent.trim()==='大转盘'));
      if(typeSelect && ![...typeSelect.options].some(o=>o.textContent.trim()==='礼盒抽奖')){
        const op=document.createElement('option');op.textContent='礼盒抽奖';op.value='礼盒抽奖';typeSelect.appendChild(op);
      }

      const tbody=document.querySelector('#list table tbody');
      if(!tbody) return;

      // 保证大转盘行只保留一个“赠送抽奖次数”按钮
      [...tbody.querySelectorAll('tr')].forEach(tr=>{
        const giftBtns=[...tr.querySelectorAll('button')].filter(b=>b.textContent.trim()==='赠送抽奖次数');
        giftBtns.slice(1).forEach(b=>b.remove());
      });

      // 礼盒抽奖活动记录
      let giftRow=[...tbody.querySelectorAll('tr')].find(tr=>/礼盒抽奖/.test(tr.textContent));
      if(!giftRow){
        giftRow=document.createElement('tr');
        giftRow.dataset.activityType='gift';
        giftRow.innerHTML=`
          <td>202610010001005 (5)</td>
          <td><span class="status">开启中</span></td>
          <td>礼盒抽奖</td>
          <td><a href="javascript:void(0)" class="gift-edit-link" style="color:#1677ff">礼盒抽奖</a></td>
          <td>2026-09-28 11:00:00</td>
          <td>2026-10-01 00:00:00</td>
          <td><div class="ops"><button class="btn danger">禁用</button><button class="btn link gift-edit-btn">编辑信息</button><button class="btn gift-manual" style="color:#722ed1;border-color:#d3adf7">赠送抽奖次数</button><button class="btn danger">删除</button></div></td>`;
        tbody.appendChild(giftRow);
      }else{
        const cells=giftRow.querySelectorAll('td');
        if(cells[2]) cells[2].textContent='礼盒抽奖';
        if(cells[3]){
          const a=cells[3].querySelector('a');
          if(a) a.textContent='礼盒抽奖'; else cells[3].textContent='礼盒抽奖';
        }
      }

      // 礼盒行只保留一个赠送按钮
      const giftBtns=[...giftRow.querySelectorAll('button')].filter(b=>b.textContent.trim()==='赠送抽奖次数');
      giftBtns.slice(1).forEach(b=>b.remove());

      const openGift=()=>{
        try{localStorage.setItem('festival_random_draw_template_mode','gift')}catch(e){}
        if(typeof window.openEditor==='function') window.openEditor(true);
      };
      giftRow.querySelector('.gift-edit-link')?.addEventListener('click',openGift);
      giftRow.querySelector('.gift-edit-btn')?.addEventListener('click',openGift);
    }catch(e){console.error(e)}
  };
  patch();
  new MutationObserver(()=>setTimeout(patch,0)).observe(document.body,{childList:true,subtree:true});
  setInterval(patch,800);
})();