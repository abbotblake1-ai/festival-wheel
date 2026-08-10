(()=>{
  const ed=document;
  const TARGET=['投注赠送','充值赠送','每日登录','连续登录','累计登录','邀请好友','首次充值','注册赠送','后台赠送'];
  let running=false;
  function onChanceStep(){const t=ed.querySelector('#tabs .tab.on');return !!(t&&t.textContent.includes('获取抽奖机会'))}
  function currentNames(){return [...ed.querySelectorAll('.method .method-top b')].map(x=>x.textContent.trim())}
  function addMissing(){
    if(running||!onChanceStep())return;
    const add=ed.getElementById('addMethod');
    if(!add)return;
    const missing=TARGET.filter(x=>!currentNames().includes(x));
    if(!missing.length)return;
    running=true;
    const next=()=>{
      if(!onChanceStep()){running=false;return}
      const names=currentNames();
      const left=TARGET.filter(x=>!names.includes(x));
      if(!left.length){running=false;return}
      const btn=ed.getElementById('addMethod');
      if(!btn){running=false;return}
      btn.click();
      setTimeout(()=>{
        const modal=ed.getElementById('methodModal');
        if(!modal){running=false;return}
        const choice=[...modal.querySelectorAll('.method-choice:not(.used)')].find(x=>x.textContent.trim()===left[0]);
        if(!choice){modal.style.display='none';running=false;return}
        choice.click();
        setTimeout(next,60);
      },30);
    };
    next();
  }
  const obs=new MutationObserver(()=>setTimeout(addMissing,20));
  obs.observe(ed.body,{childList:true,subtree:true});
  ed.addEventListener('click',()=>setTimeout(addMissing,30),true);
  setTimeout(addMissing,80);
})();