(()=>{
  const d=document;
  let rows=[
    {account:'138****8888',prize:'88元现金券',status:'启用'},
    {account:'vip***1024',prize:'30元流水券',status:'启用'},
    {account:'186****6666',prize:'50元存送券',status:'启用'}
  ];
  let editing=-1;

  function onPageConfig(){
    const t=d.querySelector('#tabs .tab.on');
    return !!(t&&t.textContent.includes('页面配置'));
  }

  function ensureStyle(){
    if(d.getElementById('winnerDisplayStyle'))return;
    const s=d.createElement('style');
    s.id='winnerDisplayStyle';
    s.textContent=`
      .wd-card{max-width:1380px;margin:22px auto 0;border:1px solid #e4e7ec;border-radius:10px;background:#fff;overflow:hidden}
      .wd-h{padding:18px 22px;border-bottom:1px solid #eaecf0;font-size:17px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
      .wd-b{padding:24px}.wd-tip{padding:12px 14px;background:#f8faff;border:1px solid #dbe7ff;border-radius:8px;color:#475467;margin-bottom:18px}
      .wd-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 28px;margin-bottom:20px}.wd-field label{display:block;font-weight:600;margin-bottom:8px}.wd-input,.wd-select{width:100%;height:42px;border:1px solid #d0d5dd;border-radius:7px;padding:0 12px;background:#fff}
      .wd-table{width:100%;border-collapse:collapse}.wd-table th,.wd-table td{padding:12px;border-bottom:1px solid #eee;text-align:left}.wd-table th{background:#fafafa;color:#667085}.wd-ops{display:flex;gap:8px}
      .wd-modal{position:fixed;inset:0;background:rgba(16,24,40,.45);z-index:220;display:none;align-items:center;justify-content:center}.wd-box{width:620px;background:#fff;border-radius:10px;overflow:hidden}.wd-mh{padding:18px 22px;border-bottom:1px solid #eee;font-size:18px;font-weight:700;display:flex;justify-content:space-between}.wd-mb{padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:18px}.wd-mf{padding:16px 22px;border-top:1px solid #eee;display:flex;justify-content:flex-end;gap:10px}
      @media(max-width:900px){.wd-grid,.wd-mb{grid-template-columns:1fr}}
    `;
    d.head.appendChild(s);
  }

  function ensureModal(){
    if(d.getElementById('winnerDisplayModal'))return;
    const m=d.createElement('div');
    m.id='winnerDisplayModal';m.className='wd-modal';
    m.innerHTML=`<div class="wd-box"><div class="wd-mh"><span id="wdModalTitle">新增展示名单</span><span id="wdClose" style="cursor:pointer">×</span></div><div class="wd-mb"><div class="wd-field"><label><span class="req">*</span>会员账号</label><input id="wdAccount" class="wd-input" placeholder="请输入展示账号"></div><div class="wd-field"><label><span class="req">*</span>奖品名称</label><input id="wdPrize" class="wd-input" placeholder="请输入奖品名称"></div><div class="wd-field"><label>状态</label><select id="wdStatus" class="wd-select"><option>启用</option><option>停用</option></select></div></div><div class="wd-mf"><button class="btn" id="wdCancel">取消</button><button class="btn primary" id="wdSave">保存</button></div></div>`;
    d.body.appendChild(m);
    const close=()=>m.style.display='none';
    d.getElementById('wdClose').onclick=d.getElementById('wdCancel').onclick=close;
    d.getElementById('wdSave').onclick=()=>{
      const account=d.getElementById('wdAccount').value.trim();
      const prize=d.getElementById('wdPrize').value.trim();
      const status=d.getElementById('wdStatus').value;
      if(!account)return alert('请输入会员账号');
      if(!prize)return alert('请输入奖品名称');
      const obj={account,prize,status};
      if(editing>=0)rows[editing]=obj;else rows.push(obj);
      close();renderTable();
    };
  }

  function openModal(i=-1){
    ensureModal();editing=i;
    const x=i>=0?rows[i]:null;
    d.getElementById('wdModalTitle').textContent=i>=0?'编辑展示名单':'新增展示名单';
    d.getElementById('wdAccount').value=x?.account||'';
    d.getElementById('wdPrize').value=x?.prize||'';
    d.getElementById('wdStatus').value=x?.status||'启用';
    d.getElementById('winnerDisplayModal').style.display='flex';
  }

  function renderTable(){
    const body=d.getElementById('wdBody');if(!body)return;
    body.innerHTML=rows.length?rows.map((x,i)=>`<tr><td>${i+1}</td><td>${x.account}</td><td>${x.prize}</td><td>${x.status}</td><td><div class="wd-ops"><button class="btn wd-edit" data-i="${i}">编辑</button><button class="btn danger wd-del" data-i="${i}">删除</button></div></td></tr>`).join(''):`<tr><td colspan="5" style="text-align:center;color:#98a2b3;padding:28px">暂无展示名单</td></tr>`;
    body.querySelectorAll('.wd-edit').forEach(b=>b.onclick=()=>openModal(+b.dataset.i));
    body.querySelectorAll('.wd-del').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(confirm('确认删除该展示名单吗？')){rows.splice(i,1);renderTable()}});
  }

  function mount(){
    if(!onPageConfig())return;
    ensureStyle();ensureModal();
    const body=d.getElementById('body');if(!body||d.getElementById('winnerDisplayCard'))return;
    const card=d.createElement('div');
    card.id='winnerDisplayCard';card.className='wd-card';
    card.innerHTML=`<div class="wd-h"><span>中奖展示名单</span><button class="btn primary" id="wdAdd">＋ 新增展示名单</button></div><div class="wd-b"><div class="wd-tip"><b>配置说明：</b>前端中奖名单优先展示真实中奖数据；真实中奖记录不足时，可使用本配置补足。展示名单仅用于前端展示，不发奖、不扣库存、不进入真实中奖统计。</div><div class="wd-grid"><div class="wd-field"><label><span class="req">*</span>是否展示中奖名单</label><select class="wd-select"><option>展示</option><option>不展示</option></select></div><div class="wd-field"><label><span class="req">*</span>数据模式</label><select class="wd-select"><option>真实中奖 + 展示名单补足</option><option>仅真实中奖</option></select></div><div class="wd-field"><label><span class="req">*</span>前端展示条数</label><input class="wd-input" type="number" min="1" value="10"></div><div class="wd-field"><label>展示规则</label><input class="wd-input" value="真实数据优先，不足数量由展示名单补足" disabled></div></div><table class="wd-table"><thead><tr><th>序号</th><th>会员账号</th><th>奖品名称</th><th>状态</th><th>操作</th></tr></thead><tbody id="wdBody"></tbody></table></div>`;
    body.appendChild(card);
    d.getElementById('wdAdd').onclick=()=>openModal();
    renderTable();
  }

  d.addEventListener('click',()=>setTimeout(mount,30),true);
  new MutationObserver(()=>setTimeout(mount,30)).observe(d.body,{childList:true,subtree:false});
  setInterval(mount,500);
})();