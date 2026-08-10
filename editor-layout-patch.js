(()=>{
  const d=document;
  function patch(){
    const tabs=d.getElementById('tabs');
    if(tabs){
      const nodes=[...tabs.querySelectorAll('.tab')];
      const byName=name=>nodes.find(x=>x.textContent.includes(name));
      const order=[byName('基础信息'),byName('获取抽奖机会'),byName('奖品配置'),byName('页面装修')||byName('页面配置'),byName('活动规则'),byName('参与范围')].filter(Boolean);
      if(order.length){
        order.forEach((node,i)=>{
          const label=node.textContent.replace(/^\s*\d+\.\s*/,'').replace('页面装修','页面配置');
          node.textContent=`${i+1}. ${label}`;
          tabs.appendChild(node);
        });
      }
      [...tabs.querySelectorAll('.tab')].forEach(x=>{if(x.textContent.includes('页面装修'))x.textContent=x.textContent.replace('页面装修','页面配置')});
    }
    [...d.querySelectorAll('.card-h')].forEach(x=>{if(x.textContent.trim()==='页面装修')x.textContent='页面配置'});
  }
  patch();
  new MutationObserver(()=>setTimeout(patch,0)).observe(d.body,{childList:true,subtree:true});
})();