(()=>{
  const d=document;
  const desired=['基础信息','参与范围','获取抽奖机会','奖品配置','页面配置','活动规则'];

  function normalizeName(text){
    return (text||'')
      .replace(/^\s*\d+\.\s*/,'')
      .replace('页面装修','页面配置')
      .trim();
  }

  function patch(){
    const tabs=d.getElementById('tabs');
    if(tabs){
      const nodes=[...tabs.querySelectorAll('.tab')];
      const map=new Map(nodes.map(node=>[normalizeName(node.textContent),node]));
      const order=desired.map(name=>map.get(name)).filter(Boolean);

      const current=nodes.map(node=>normalizeName(node.textContent));
      const target=order.map(node=>normalizeName(node.textContent));
      const needsReorder=current.length!==target.length || current.some((name,i)=>name!==target[i]);

      if(needsReorder){
        order.forEach(node=>tabs.appendChild(node));
      }

      [...tabs.querySelectorAll('.tab')].forEach((node,i)=>{
        const label=normalizeName(node.textContent);
        const expected=`${i+1}. ${label}`;
        if(node.textContent.trim()!==expected) node.textContent=expected;
      });
    }

    [...d.querySelectorAll('.card-h')].forEach(node=>{
      if(node.textContent.trim()==='页面装修') node.textContent='页面配置';
    });
  }

  let queued=false;
  const schedulePatch=()=>{
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      patch();
    });
  };

  patch();
  new MutationObserver(schedulePatch).observe(d.body,{childList:true,subtree:true});
})();