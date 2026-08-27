(function(){
  if(window.__participantScopeInstalled)return;
  window.__participantScopeInstalled=true;

  const style=document.createElement('style');
  style.id='participantScopeStyle';
  style.textContent=`
    .scope-wrap{max-width:1380px;margin:0 auto}.scope-section{border:1px solid #e4e7ec;border-radius:10px;margin-bottom:20px;overflow:hidden;background:#fff}
    .scope-section-h{padding:16px 20px;background:#f8f9fb;border-bottom:1px solid #eaecf0;font-size:16px;font-weight:700}
    .scope-section-b{padding:22px 26px}.scope-line{display:grid;grid-template-columns:150px 1fr;gap:18px;align-items:start;margin-bottom:18px}
    .scope-line:last-child{margin-bottom:0}.scope-label{font-weight:600;padding-top:10px}.scope-radios{display:flex;gap:34px;min-height:42px;align-items:center;flex-wrap:wrap}
    .scope-radios label,.scope-checks label{display:flex;gap:7px;align-items:center;cursor:pointer}.scope-radios input,.scope-checks input{width:16px;height:16px}
    .agent-box{margin-left:168px;margin-top:-6px}.agent-input-row{display:flex;gap:12px;align-items:flex-end}.agent-area{width:min(760px,100%);height:112px;border:1px solid #d0d5dd;border-radius:7px;padding:11px 12px;resize:vertical}
    .agent-summary{display:flex;align-items:center;gap:12px;margin-top:9px;color:#667085}.scope-red{color:#f04438;margin-top:7px;font-size:13px}
    .scope-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px 50px}.scope-item label.scope-item-title{display:block;font-weight:600;margin-bottom:10px}
    .scope-checks{display:flex;gap:18px;flex-wrap:wrap;min-height:42px;align-items:center}.inline-number{width:110px!important;margin:0 7px}
    .scope-tip{padding:12px 14px;background:#f8faff;border:1px solid #dbe7ff;border-radius:7px;color:#475467;margin-bottom:20px}
    @media(max-width:900px){.scope-line{grid-template-columns:1fr}.agent-box{margin-left:0}.scope-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const state=window._participationState||(window._participationState={
    agentMode:'all',agents:'',vip:Array.from({length:12},(_,i)=>i),
    registerMode:'none',registerDays:7,rechargeMode:'none',rechargeAmount:100,
    activeMode:'none',terminal:['PC','H5','APP']
  });

  window.setAgentMode=function(v){state.agentMode=v;render()};
  window.updateAgents=function(v){
    let parts=v.split(/[,，\n]/).map(x=>x.trim()).filter(Boolean).slice(0,10);
    state.agents=parts.join(',');
    const c=document.getElementById('agentCount');if(c)c.textContent=parts.length;
  };
  window.dedupeAgents=function(){
    let parts=state.agents.split(/[,，\n]/).map(x=>x.trim()).filter(Boolean);
    parts=[...new Set(parts)].slice(0,10);state.agents=parts.join(',');
    const a=document.getElementById('agentAccounts');if(a)a.value=state.agents;
    const c=document.getElementById('agentCount');if(c)c.textContent=parts.length;
  };
  window.toggleScopeVip=function(i,checked){state.vip=checked?[...new Set([...state.vip,i])]:state.vip.filter(x=>x!==i)};
  window.toggleAllScopeVip=function(checked){state.vip=checked?Array.from({length:12},(_,i)=>i):[];render()};
  window.setScopeValue=function(k,v){state[k]=v};
  window.toggleScopeTerminal=function(v,checked){state.terminal=checked?[...new Set([...state.terminal,v])]:state.terminal.filter(x=>x!==v)};
  window.toggleAllScopeTerminal=function(checked){state.terminal=checked?['PC','H5','APP']:[];render()};

  window.scope=function(){
    const agentBox=state.agentMode==='all'?'':`
      <div class="agent-box">
        <div class="agent-input-row">
          <textarea id="agentAccounts" class="agent-area" maxlength="300" oninput="updateAgents(this.value)" placeholder="请输入代理账号，多个代理账号用英文逗号分隔，最多10个代理账号">${state.agents}</textarea>
          <button class="btn primary" onclick="dedupeAgents()">去重</button>
        </div>
        <div class="agent-summary">共计：<b id="agentCount">${state.agents?state.agents.split(',').filter(Boolean).length:0}</b> 个代理账号（包含所填代理账号及其全部下级会员）</div>
        <div class="scope-red">${state.agentMode==='exclude'?'所填代理账号及其全部下级会员不可参与活动。':'仅所填代理账号及其全部下级会员可参与活动。'}</div>
      </div>`;
    const vipChecks=Array.from({length:12},(_,i)=>`<label><input type="checkbox" ${state.vip.includes(i)?'checked':''} onchange="toggleScopeVip(${i},this.checked)">VIP${i}</label>`).join('');
    const terminals=['PC','H5','APP'].map(x=>`<label><input type="checkbox" ${state.terminal.includes(x)?'checked':''} onchange="toggleScopeTerminal('${x}',this.checked)">${x}</label>`).join('');
    return `<div class="card"><div class="card-h">参与范围</div><div class="card-b">
      <div class="scope-wrap">
        <div class="scope-tip"><b>配置说明：</b>参与范围用于限制可参加本活动的会员；会员需同时满足代理线、VIP等级、注册、充值及活跃条件。</div>
        <div class="scope-section">
          <div class="scope-section-h">代理线设置</div>
          <div class="scope-section-b">
            <div class="scope-line"><div class="scope-label"><span class="req">*</span>代理线设置</div><div class="scope-radios">
              <label><input type="radio" name="agentMode" value="all" ${state.agentMode==='all'?'checked':''} onchange="setAgentMode('all')">全部参与</label>
              <label><input type="radio" name="agentMode" value="exclude" ${state.agentMode==='exclude'?'checked':''} onchange="setAgentMode('exclude')">排除指定</label>
              <label><input type="radio" name="agentMode" value="include" ${state.agentMode==='include'?'checked':''} onchange="setAgentMode('include')">指定参与</label>
            </div></div>
            ${agentBox}
          </div>
        </div>
        <div class="scope-section">
          <div class="scope-section-h">会员条件</div>
          <div class="scope-section-b">
            <div class="scope-grid">
              <div class="scope-item"><label class="scope-item-title"><span class="req">*</span>VIP等级</label><div class="scope-checks"><label><input type="checkbox" ${state.vip.length===12?'checked':''} onchange="toggleAllScopeVip(this.checked)">全部</label>${vipChecks}</div></div>
              <div class="scope-item"><label class="scope-item-title"><span class="req">*</span>参与终端</label><div class="scope-checks"><label><input type="checkbox" ${state.terminal.length===3?'checked':''} onchange="toggleAllScopeTerminal(this.checked)">全部</label>${terminals}</div></div>
              <div class="scope-item"><label class="scope-item-title">注册时长</label><div class="scope-radios"><label><input type="radio" name="registerMode" ${state.registerMode==='none'?'checked':''} onchange="setScopeValue('registerMode','none')">不限制</label><label><input type="radio" name="registerMode" ${state.registerMode==='days'?'checked':''} onchange="setScopeValue('registerMode','days')">注册满 <input class="input inline-number" type="number" min="1" value="${state.registerDays}" onchange="setScopeValue('registerDays',this.value)"> 天</label></div></div>
              <div class="scope-item"><label class="scope-item-title">充值条件</label><div class="scope-radios"><label><input type="radio" name="rechargeMode" ${state.rechargeMode==='none'?'checked':''} onchange="setScopeValue('rechargeMode','none')">不限制</label><label><input type="radio" name="rechargeMode" ${state.rechargeMode==='record'?'checked':''} onchange="setScopeValue('rechargeMode','record')">有充值记录</label><label><input type="radio" name="rechargeMode" ${state.rechargeMode==='amount'?'checked':''} onchange="setScopeValue('rechargeMode','amount')">累计充值满 <input class="input inline-number" type="number" min="1" value="${state.rechargeAmount}" onchange="setScopeValue('rechargeAmount',this.value)"> 元</label></div></div>
              <div class="scope-item"><label class="scope-item-title">活跃条件</label><div class="scope-radios"><label><input type="radio" name="activeMode" ${state.activeMode==='none'?'checked':''} onchange="setScopeValue('activeMode','none')">不限制</label><label><input type="radio" name="activeMode" ${state.activeMode==='login7'?'checked':''} onchange="setScopeValue('activeMode','login7')">近7天有登录</label><label><input type="radio" name="activeMode" ${state.activeMode==='bet7'?'checked':''} onchange="setScopeValue('activeMode','bet7')">近7天有投注</label></div></div>
            </div>
          </div>
        </div>
      </div>
    </div></div>`;
  };

  if(typeof render==='function')render();
})();