(()=>{
  const ed=document;
  const DEFAULTS=['投注赠送','连续登录'];
  let initialized=false;

  function onChanceStep(){
    const t=ed.querySelector('#tabs .tab.on');
    return !!(t&&t.textContent.includes('获取抽奖机会'));
  }

  function methodCards(){
    return [...ed.querySelectorAll('.method')];
  }

  function currentNames(){
    return methodCards().map(x=>x.querySelector('.method-top b')?.textContent.trim()).filter(Boolean);
  }

  function removeManualFromModal(){
    const modal=ed.getElementById('methodModal');
    if(!modal)return;
    [...modal.querySelectorAll('.method-choice')]
      .filter(x=>x.textContent.trim()==='后台赠送')
      .forEach(x=>x.remove());
  }

  function silentRemoveExtras(){
    const extras=methodCards().filter(card=>{
      const name=card.querySelector('.method-top b')?.textContent.trim();
      return name&&!DEFAULTS.includes(name);
    });
    if(!extras.length)return;

    const win=ed.defaultView;
    const oldConfirm=win.confirm;
    win.confirm=()=>true;
    try{
      extras.forEach(card=>{
        const btn=card.querySelector('[data-rm]');
        if(btn)btn.click();
      });
    }finally{
      setTimeout(()=>{win.confirm=oldConfirm},0);
    }
  }

  function addContinuousIfMissing(done){
    if(currentNames().includes('连续登录')){done&&done();return;}
    const add=ed.getElementById('addMethod');
    if(!add){done&&done();return;}
    add.click();
    setTimeout(()=>{
      removeManualFromModal();
      const modal=ed.getElementById('methodModal');
      const choice=modal&&[...modal.querySelectorAll('.method-choice')]
        .find(x=>x.textContent.trim()==='连续登录'&&!x.classList.contains('used'));
      if(choice)choice.click();
      else if(modal)modal.style.display='none';
      setTimeout(()=>done&&done(),40);
    },40);
  }

  function normalizeDefaults(){
    if(initialized||!onChanceStep())return;
    initialized=true;
    silentRemoveExtras();
    setTimeout(()=>addContinuousIfMissing(()=>setTimeout(silentRemoveExtras,30)),60);
  }

  ed.addEventListener('click',e=>{
    if(e.target?.id==='addMethod'||e.target?.closest?.('#addMethod')){
      setTimeout(removeManualFromModal,30);
    }
    setTimeout(normalizeDefaults,20);
  },true);

  const obs=new MutationObserver(()=>{
    if(!initialized)setTimeout(normalizeDefaults,20);
    setTimeout(removeManualFromModal,20);
  });
  obs.observe(ed.body,{childList:true,subtree:true});

  setTimeout(normalizeDefaults,100);
})();