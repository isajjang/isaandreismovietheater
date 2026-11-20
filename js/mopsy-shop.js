/* Mopsy's approved full illustrations are the shop. Only live information and
   accessible controls are overlaid; the scene is never cropped or split. */
(function(){
  'use strict';
  const BASE={width:1672,height:941};
  const SCENES=Object.freeze([
    {id:'blue',name:'Moonlight Idol',file:'assets/shops/mopsy-1.webp',bubble:[154,27,374,193]},
    {id:'pink',name:'Lavender Popstar',file:'assets/shops/mopsy-2.webp',bubble:[155,25,372,212]},
    {id:'green',name:'Emerald Witch',file:'assets/shops/mopsy-3.webp',bubble:[154,18,372,211]},
    {id:'coral',name:'Sakura Encore',file:'assets/shops/mopsy-4.webp',bubble:[155,26,371,193]},
    {id:'aqua',name:'Seaside Serenade',file:'assets/shops/mopsy-5.webp',bubble:[155,26,372,177]}
  ]);
  const PRODUCTS=Object.freeze([
    {id:'elixir',name:'Healing Elixir',price:18,description:'Restore 20 HP. Use from your inventory.',short:'Restore 20 HP.\nUse from your\ninventory.',inspect:'A little sip, a little sparkle. Twenty HP! I call that an encore.',icon:'assets/items/healing-elixir.png'},
    {id:'focus',name:'Focus Draught',price:25,description:'Prepare +1 Mana for the opening turn of your next battle. Does not stack.',short:'+1 opening Mana\nnext battle.\nDoes not stack.',inspect:'For that opening move! One extra Mana, then you handle the dramatic pose.',icon:'assets/items/focus-draught.png'},
    {id:'reroll',name:'Card Reroll',price:35,description:'Choose a new spell, then replace one card. Review both effects before confirming.',short:'Choose a spell.\nReplace 1 card.\nPreview both.',inspect:'One card out, one card in. A makeover with actual consequences, darling.',icon:'assets/items/card-reroll.png'},
    {id:'card',name:'Card Pack',price:35,description:'Choose one new spell to add to your deck. Your deck can grow beyond 15 cards.',short:'Choose 1 spell\nto ADD to your\ndeck.',inspect:'A new spell for the collection! Please do not eat the shiny wrapper.',icon:'assets/items/card-pack.png'},
    {id:'relic',name:'Mystery Relic',price:65,description:'Reveal one unowned lunar relic. Stronger relics are rarer.',short:'Reveal 1 lunar\nrelic. Stronger\nones are rarer.',inspect:'A mystery relic! Named after a real moon; priced by a very real hamster.',icon:'assets/items/mystery-relic.png'},
    {id:'satchel',name:'Supply Satchel',price:25,description:'Open for one random consumable. A Lunar Catalyst is a rare find.',short:'1 random supply.\nRare chance of a\nLunar Catalyst.',inspect:'What is in the bag? Supplies! What kind? That is the suspicious part.',icon:'assets/items/supply-satchel.png'}
  ]);
  const GEOMETRY=Object.freeze({
    panels:[[536,278,348,230],[900,278,348,230],[1264,278,368,230],[536,520,348,238],[900,520,348,238],[1264,520,368,238]],
    names:[[700,291,165,62],[1068,291,163,62],[1442,291,169,62],[706,533,160,61],[1072,533,160,61],[1448,531,176,65]],
    descriptions:[[702,365,164,70],[1071,365,164,70],[1442,365,174,70],[707,606,159,77],[1072,606,162,77],[1450,606,168,77]],
    prices:[[639,450,74,35],[1002,450,76,35],[1367,450,76,35],[639,698,74,35],[1002,698,76,35],[1367,698,76,35]],
    buttons:[[743,442,128,52],[1104,442,129,52],[1477,442,139,52],[743,688,128,54],[1104,688,129,54],[1477,688,139,54]],
    balance:[1468,35,150,61],leave:[751,783,466,94]
  });
  const LINES=Object.freeze({
    enter:[
      'Ohoho! A customer!\nMopsy HamHam is on duty.\nRare goods, shiny deals,\nand absolutely no\nresponsible budgeting! ♡',
      'Welcome, cutie!\nThe spotlight is on you.\nYour Moon Coins are\nabout to make their\nbig debut! ♡',
      'Step right up!\nMy prices are fixed.\nMy morals? Flexible.\nWhat are we buying\ntoday, superstar? ♡',
      'Mopsy HamHam here!\nCute outfit? Check.\nQuestionable bargains?\nDouble check.\nLet’s shop! ♡'
    ],
    bought:['SOLD! Another successful performance. Encore! ♡','Into your inventory it goes! My commission is your happiness. Mostly.','A spectacular purchase! Your Moon Coins and I are very close now.'],
    poor:['Oh, honey. That is a lovely amount of imaginary money. Bring more Moon Coins!','The sparkle is free. The merchandise needs Moon Coins, superstar.','Your wallet missed rehearsal! Come back with a few more Moon Coins.'],
    sold:['Sold out, cutie! That little treasure already went home with you.','Empty shelf, full heart. Check your inventory!'],
    leave:['Bye, superstar! Stay alive. Repeat customers are my favorite kind! ♡','Go dazzle a monster! Preferably from a safe distance. ♡','Thanks for shopping! Tell your friends I am charming and financially mysterious. ♡']
  });
  let overlay=null,stage=null,toolbar=null,dialogue=null,balance=null,session=null,previousFocus=null;
  let closing=false,interaction=0;
  const choose=items=>items[Math.floor(Math.random()*items.length)];
  function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  function place(el,rect){el.style.left=(rect[0]/BASE.width*100)+'%';el.style.top=(rect[1]/BASE.height*100)+'%';el.style.width=(rect[2]/BASE.width*100)+'%';el.style.height=(rect[3]/BASE.height*100)+'%';return el;}
  function money(){return session?.demo?session.demo.coins:(window.MDMopsyBridge?.getCoins()||0);}
  function say(text){if(!dialogue)return;dialogue.textContent=text;dialogue.dataset.interaction=String(++interaction);}
  function ensureUI(){
    if(overlay)return;
    overlay=element('section','md-mopsy-overlay');overlay.id='mdMopsyShop';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Mopsy HamHam’s Pink Moon Emporium');overlay.tabIndex=-1;
    toolbar=element('nav','md-mopsy-toolbar');toolbar.setAttribute('aria-label','Shop controls');
    const canvas=element('div','md-mopsy-canvas');
    stage=element('div','md-mopsy-stage');canvas.appendChild(stage);
    overlay.append(toolbar,canvas);document.body.appendChild(overlay);
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{
      overlay.style.setProperty('--mopsy-toolbar-height',Math.ceil(toolbar.getBoundingClientRect().height)+'px');
    }).observe(toolbar);
    overlay.addEventListener('keydown',event=>{
      if(document.getElementById('mdInventoryOverlay')?.hidden===false||document.body.classList.contains('md-rewards-open'))return;
      if(event.key==='Escape'){event.preventDefault();leave();return;}
      if(event.key!=='Tab')return;
      const all=[...overlay.querySelectorAll('button:not(:disabled),select')].filter(e=>e.getClientRects().length);
      const first=all[0],last=all[all.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===overlay)){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    });
  }
  function control(label,action,cls=''){
    const b=element('button','md-mopsy-control '+cls,label);b.type='button';b.addEventListener('click',action);return b;
  }
  function rebuildToolbar(){
    toolbar.replaceChildren();toolbar.appendChild(element('span','md-mopsy-mode',session.demo?'Mopsy Shop Test · Demo inventory':'Mopsy HamHam · Moon Coins'));
    if(session.demo){
      const select=element('select','md-mopsy-scene-select');select.setAttribute('aria-label','Preview shop scene');
      SCENES.forEach((s,i)=>{const option=element('option','',(i+1)+'. '+s.name);option.value=String(i);select.appendChild(option);});
      select.value=String(session.scene);select.addEventListener('change',()=>{session.scene=Number(select.value);renderScene();});toolbar.appendChild(select);
      toolbar.append(control('Random Scene',()=>{session.scene=Math.floor(Math.random()*SCENES.length);rebuildToolbar();renderScene();}),control('450 Coins',()=>{session.demo.coins=450;refresh();say('Demo purse refilled! Even my accounting is imaginary in here.');}),control('0 Coins',()=>{session.demo.coins=0;refresh();say('Demo wallet: empty! Try a Buy button to hear my response.');}),control('Restock',()=>{session.stock={};refresh();say('Test shelves restocked! The real dungeon is unchanged.');}));
    }
    toolbar.append(control('Inventory',()=>{
      if(!window.MDInventory){say('The inventory could not load. Please check that all game folders were uploaded.');return;}
      window.MDInventory.open({testSession:session.demo||undefined,onClose:()=>{refresh();}});
    },'md-mopsy-inventory-button'));
    if(session.demo)toolbar.append(control('Back to Test Menu',()=>close(true),'md-mopsy-test-exit'));
  }
  function renderScene(){
    if(!session)return;
    const scene=SCENES[session.scene];stage.dataset.scene=scene.id;stage.replaceChildren();
    const art=element('img','md-mopsy-full-scene');art.src=scene.file;art.alt=scene.name+' — full illustrated Mopsy shop';art.width=BASE.width;art.height=BASE.height;art.draggable=false;
    stage.appendChild(art);
    dialogue=place(element('div','md-mopsy-dialogue'),scene.bubble);dialogue.setAttribute('role','status');dialogue.setAttribute('aria-live','polite');stage.appendChild(dialogue);
    balance=place(element('div','md-mopsy-balance'),GEOMETRY.balance);balance.setAttribute('aria-live','polite');stage.appendChild(balance);
    PRODUCTS.forEach((p,i)=>{
      const name=place(element('div','md-mopsy-product-name',p.name),GEOMETRY.names[i]);name.setAttribute('aria-hidden','true');
      const desc=place(element('div','md-mopsy-product-description',p.short),GEOMETRY.descriptions[i]);desc.setAttribute('aria-hidden','true');
      const price=place(element('div','md-mopsy-price',String(p.price)),GEOMETRY.prices[i]);price.setAttribute('aria-hidden','true');
      const inspect=place(element('button','md-mopsy-inspect'),GEOMETRY.panels[i]);inspect.type='button';inspect.setAttribute('aria-label','Inspect '+p.name+'. '+p.description+' Price: '+p.price+' Moon Coins.');inspect.title=p.name+' — '+p.description;
      inspect.addEventListener('click',()=>say(p.inspect));inspect.addEventListener('focus',()=>say(p.inspect));
      const buy=place(element('button','md-mopsy-buy'),GEOMETRY.buttons[i]);buy.type='button';buy.dataset.item=p.id;buy.setAttribute('aria-label','Buy '+p.name+' for '+p.price+' Moon Coins');buy.title='Buy '+p.name+' · '+p.price+' Moon Coins';buy.appendChild(element('span','md-mopsy-buy-label','Buy'));
      buy.addEventListener('click',()=>purchase(p.id));
      buy.addEventListener('focus',()=>{if(!closing)say(p.inspect);});
      stage.append(inspect,name,desc,price,buy);
    });
    const leaveButton=place(element('button','md-mopsy-leave'),GEOMETRY.leave);leaveButton.type='button';leaveButton.setAttribute('aria-label','Leave shop');leaveButton.title='Leave Shop';leaveButton.appendChild(element('span','md-mopsy-leave-label','Leave Shop'));leaveButton.addEventListener('click',leave);stage.appendChild(leaveButton);
    refresh();say(choose(LINES.enter));
  }
  function refresh(){
    if(!session||!balance)return;
    const value=money();balance.replaceChildren(element('strong','',String(value)),element('small','','Moon Coins'));balance.setAttribute('aria-label',value+' Moon Coins');
    stage.querySelectorAll('.md-mopsy-buy').forEach(button=>{
      const sold=!!session.stock[button.dataset.item];
      button.dataset.sold=String(sold);button.dataset.affordable=String(value>=PRODUCTS.find(p=>p.id===button.dataset.item).price);button.disabled=closing;
      button.querySelector('.md-mopsy-buy-label').textContent=sold?'Sold':'Buy';button.setAttribute('aria-disabled',String(sold||closing));
    });
  }
  function purchase(id){
    if(!session||closing||session.purchasing)return{ok:false,error:'Shop unavailable.'};
    const p=PRODUCTS.find(x=>x.id===id);if(!p)return{ok:false,error:'Unknown item.'};
    if(session.stock[id]){say(choose(LINES.sold));return{ok:false,error:'Sold out.'};}
    if(money()<p.price){say(choose(LINES.poor));return{ok:false,error:'Not enough Moon Coins.'};}
    if(!window.MDInventory){say('My inventory ledger is missing! Please reload after uploading all game files.');return{ok:false,error:'Inventory unavailable.'};}
    session.purchasing=true;let charged=false;
    const inventoryOwner=session.demo||window.MDMopsyBridge?.getState?.();
    const inventoryKey=session.demo?'inventory':'mopsyInventory';
    const priorQuantity=Number(inventoryOwner?.[inventoryKey]?.[id])||0;
    try{
      if(session.demo){session.demo.coins-=p.price;charged=true;}
      else charged=!!window.MDMopsyBridge?.spend(p.price);
      if(!charged){say(choose(LINES.poor));return{ok:false,error:'Not enough Moon Coins.'};}
      const added=window.MDInventory.addItem(id,1,{testSession:session.demo||undefined});
      if(added===false||added?.ok===false)throw new Error('Inventory could not accept the item.');
      session.stock[id]=true;refresh();say(choose(LINES.bought)+'\n'+p.name+' is in your inventory.');
      return{ok:true,id,coins:money()};
    }catch(error){
      const bag=inventoryOwner?.[inventoryKey];
      if(bag){if(priorQuantity>0)bag[id]=priorQuantity;else delete bag[id];}
      if(charged){if(session.demo)session.demo.coins+=p.price;else window.MDMopsyBridge?.refund(p.price);}
      refresh();say('That sale did not go through. Your Moon Coins are safe; try again.');console.error('Mopsy purchase failed',error);return{ok:false,error:'Purchase failed.'};
    }finally{if(session)session.purchasing=false;}
  }
  function leave(){
    if(!session)return;
    if(closing){close();return;}
    closing=true;say(choose(LINES.leave));refresh();
    const b=stage.querySelector('.md-mopsy-leave');b.dataset.departing='true';b.querySelector('span').textContent=session.demo?'Back to Tests':'Return to Map';b.setAttribute('aria-label',session.demo?'Return to test menu':'Return to map');
    // Keep her goodbye on screen until the player presses the visible exit.
  }
  function close(toMenu=false){
    if(!session)return;
    const old=session;session=null;closing=false;overlay.hidden=true;document.body.classList.remove('md-mopsy-open');
    window.MDInventory?.setTestSession?.(null);
    if(window.MoonlightSoundtrack?.leaveShop)window.MoonlightSoundtrack.leaveShop();else window.MoonlightSoundtrack?.setMode(old.previousMode||'main');
    if(old.demo){
      if(toMenu||old.fromTestMenu)document.getElementById('moonTestMenu')?.classList.remove('hidden');
    }else old.onLeave?.();
    previousFocus?.isConnected&&previousFocus.focus({preventScroll:true});
    window.dispatchEvent(new CustomEvent('mopsy:closed',{detail:{test:!!old.demo}}));
  }
  function open(options={}){
    ensureUI();if(session)return;
    const node=options.node||null, demo=options.testSession||null;
    if(node&&!node.mopsyVisit)node.mopsyVisit={scene:Math.floor(Math.random()*SCENES.length),stock:{}};
    const visit=node?.mopsyVisit;
    previousFocus=document.activeElement;
    session={node,demo,scene:options.scene??visit?.scene??Math.floor(Math.random()*SCENES.length),stock:visit?.stock||{},onLeave:options.onLeave,previousMode:window.MoonlightSoundtrack?.getMode()||'main',fromTestMenu:!!options.fromTestMenu,purchasing:false};
    session.scene=Math.max(0,Math.min(4,Number(session.scene)||0));
    closing=false;overlay.hidden=false;document.body.classList.add('md-mopsy-open');overlay.dataset.test=String(!!demo);
    window.MDInventory?.setTestSession?.(demo);
    rebuildToolbar();renderScene();
    if(window.MoonlightSoundtrack?.enterShop)window.MoonlightSoundtrack.enterShop();else window.MoonlightSoundtrack?.setMode('shop');
    requestAnimationFrame(()=>overlay.focus({preventScroll:true}));
    window.dispatchEvent(new CustomEvent('mopsy:opened',{detail:{test:!!demo,scene:session.scene}}));
  }
  function openTest(scene=2){
    if(session)return;
    if(window.MDMopsyBridge?.canOpenShopTest&&!window.MDMopsyBridge.canOpenShopTest()){
      const panel=document.getElementById('moonTestPanel');
      let notice=document.getElementById('mdMopsyTestWait');
      if(!notice&&panel){notice=element('p','','Finish the current battle action or reward selection, then open the shop preview.');notice.id='mdMopsyTestWait';panel.appendChild(notice);}
      if(notice)notice.textContent='Finish the current battle action or reward selection, then open the shop preview.';
      return;
    }
    document.getElementById('moonTestMenu')?.classList.add('hidden');
    const demo={coins:450,hp:25,maxHP:45,corruption:35,queuedMana:0,relics:[],inventory:{elixir:2,focus:1,reroll:1,card:1,incense:1,catalyst:1,satchel:1,relic:1}};
    open({testSession:demo,scene,fromTestMenu:true});
  }
  function installTestButtons(){
    const panel=document.getElementById('moonTestPanel');
    if(panel&&!document.getElementById('mdMopsyTestEntry')){
      const section=element('section','md-mopsy-test-section');section.id='mdMopsyTestEntry';
      section.append(element('h3','','Mopsy’s Shop & Inventory'),element('p','','Preview all five full shop scenes, try purchases, and inspect the illustrated inventory. Demo Moon Coins and items stay separate from your run.'));
      section.append(control('Open Mopsy Shop Test',()=>openTest()));panel.appendChild(section);
    }
    const launch=document.getElementById('moonLaunch');
    if(launch&&!document.getElementById('mdMopsyLaunchTest')){
      const button=control('Mopsy Shop Test',()=>openTest());button.id='mdMopsyLaunchTest';launch.appendChild(button);
    }
    if(window.MoonTestArena)window.MoonTestArena.previewShop=openTest;
  }
  window.MDMopsyShop={open,openTest,close,refresh,purchase,isOpen:()=>!!session,isTest:()=>!!session?.demo,getState:()=>session?{test:!!session.demo,scene:session.scene,coins:money(),stock:{...session.stock},leaving:closing}:null,scenes:SCENES,products:PRODUCTS,geometry:GEOMETRY};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installTestButtons,{once:true});else installTestButtons();
})();
