(()=>{
  const host=document;
  const mainFrame=host.getElementById('main');
  if(!mainFrame)return;
  const enhance=()=>{
    try{
      const d=mainFrame.contentDocument,w=mainFrame.contentWindow;
      if(!d||d.getElementById('manualGiftStyle'))return;
      const style=d.createElement('style');
      style.id='manualGiftStyle';
      style.textContent=`
        .gift-btn{color:#722ed1;border-color:#d3adf7}.gift-modal{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:260}.gift-box{width:820px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.18)}.gift-h{padding:20px 24px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:700}.gift-b{padding:24px}.gift-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 24px}.gift-field label{display:block;font-weight:600;margin-bottom:8px}.gift-req{color:#f04438;margin-right:4px}.gift-input,.gift-select{width:100%;height:40px;border:1px solid #d1d5db;border-radius:6px;padding:0 10px;background:#fff}.gift-textarea{width:100%;height:76px;border:1px solid #d1d5db;border-radius:6px;padding:10px;resize:none}.gift-full{grid-column:1/-1}.gift-tip{margin-bottom:18px;padding:12px 14px;background:#f6f9ff;border:1px solid #d8e6ff;border-radius:6px;color:#475467}.gift-record-title{margin:24px 0 10px;font-weight:700}.gift-table{width:100%;border-collapse:collapse;font-size:13px}.gift-table th,.gift-table td{padding:10px;border-bottom:1px solid #eee;text-align:left}.gift-table th{background:#fafafa;color:#667085}.gift-empty{text-align:center;color:#98a2b3;padding:24px}.gift-f{padding:16px 24px;border-top:1px solid #eee;text-align:right}.gift-f .btn{margin-left:8px}`;
      d.head.appendChild(style);
      const rows=[...d.querySelectorAll('#list tbody tr')];
      rows.forEach(row=>{
        const ops=row.querySelector('.ops');
        if(!ops||ops.querySelector('.gift-btn'))return;
        const name=row.cells?.[3]?.textContent.trim()||'大转盘活动';
        const btn=d.createElement('button');
        btn.className='btn gift-btn';
        btn.textContent='赠送抽奖次数';
        btn.onclick=()=>openGift(name);
        ops.insertBefore(btn,ops.querySelector('.danger:last-child'));
      });
      let records=[];
      const modal=d.createElement('div');
      modal.id='giftModal';modal.className='gift-modal';
      modal.innerHTML=`<div class="gift-box"><div class="gift-h"><span>赠送抽奖次数</span><span id="giftClose" style="cursor:pointer">×</span></div><div class="gift-b"><div class="gift-tip">用于客诉补偿、活动异常补发、指定会员额外赠送等人工场景；不属于自动获取抽奖机会规则。</div><div class="gift-grid"><div class="gift-field"><label>活动名称</label><input id="giftActivity" class="gift-input" readonly></div><div class="gift-field"><label><span class="gift-req">*</span>会员账号</label><input id="giftMember" class="gift-input" placeholder="请输入会员账号"></div><div class="gift-field"><label><span class="gift-req">*</span>赠送次数</label><input id="giftCount" class="gift-input" type="number" min="1" placeholder="请输入赠送次数"></div><div class="gift-field"><label><span class="gift-req">*</span>赠送原因</label><select id="giftReason" class="gift-select"><option value="">请选择</option><option>客诉补偿</option><option>活动异常补发</option><option>VIP额外赠送</option><option>测试账号</option><option>其他</option></select></div><div class="gift-field gift-full"><label>备注</label><textarea id="giftRemark" class="gift-textarea" placeholder="请输入备注，非必填"></textarea></div></div><div class="gift-record-title">本活动赠送记录</div><div id="giftRecord"></div></div><div class="gift-f"><button class="btn" id="giftCancel">取消</button><button class="btn primary" id="giftConfirm">确认赠送</button></div></div>`;
      d.body.appendChild(modal);
      const renderRecords=()=>{
        const box=d.getElementById('giftRecord');
        if(!records.length){box.innerHTML='<div class="gift-empty">暂无人工赠送记录</div>';return}
        box.innerHTML='<table class="gift-table"><thead><tr><th>会员账号</th><th>赠送次数</th><th>赠送原因</th><th>操作人</th><th>操作时间</th></tr></thead><tbody>'+records.map(r=>`<tr><td>${r.member}</td><td>${r.count}次</td><td>${r.reason}</td><td>Admin</td><td>${r.time}</td></tr>`).join('')+'</tbody></table>';
      };
      function openGift(name){d.getElementById('giftActivity').value=name;d.getElementById('giftMember').value='';d.getElementById('giftCount').value='';d.getElementById('giftReason').value='';d.getElementById('giftRemark').value='';renderRecords();modal.style.display='flex'}
      d.getElementById('giftClose').onclick=d.getElementById('giftCancel').onclick=()=>modal.style.display='none';
      d.getElementById('giftConfirm').onclick=()=>{
        const member=d.getElementById('giftMember').value.trim(),count=d.getElementById('giftCount').value,reason=d.getElementById('giftReason').value;
        if(!member){w.alert('请输入会员账号');return}
        if(!count||Number(count)<=0){w.alert('请输入正确的赠送次数');return}
        if(!reason){w.alert('请选择赠送原因');return}
        const now=new Date(),pad=n=>String(n).padStart(2,'0');
        const time=`${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        records.unshift({member,count,reason,time});renderRecords();w.alert('赠送成功');d.getElementById('giftMember').value='';d.getElementById('giftCount').value='';d.getElementById('giftReason').value='';d.getElementById('giftRemark').value='';
      };
    }catch(e){console.error(e)}
  };
  if(mainFrame.contentDocument?.readyState==='complete')setTimeout(enhance,30);
  mainFrame.addEventListener('load',()=>setTimeout(enhance,30));
})();