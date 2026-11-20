
(function(){
'use strict';
const NS='http://www.w3.org/2000/svg';
const map=document.createElement('div');map.id='rogueMap';map.innerHTML=`<div class="map-frame" role="dialog" aria-modal="true" aria-label="Moonlight Duel dungeon map"><div class="map-head"><h2>☾ THE LUNAR PATH ☽</h2><p id="mapSubtitle">Choose your next fate</p></div><div id="mapScroll" class="map-scroll"><div class="map-scroll-inner"><svg id="mapSvg" viewBox="0 0 1000 1940" preserveAspectRatio="xMidYMid meet" aria-label="Random branching dungeon route"></svg></div></div><div class="map-economy lunar-graphic-wrap" id="mapEconomy">
<div class="lunar-graphic">
<img class="lunar-graphic-art" alt="Moon Coins and Lunar Corruption ornate crimson eclipse gauge" src="assets/base/0ac2b5ae3f19c5b193657dcd.webp"/>
<div class="lunar-coin-live"><b id="lunarCoins">20</b></div>
<div class="lunar-corruption-live"><b id="corruptNumber">0</b><span> / 100</span></div>
<div class="lunar-gauge-live"><div id="corruptFill"></div></div>
</div></div><div class="map-legend">✦ Skirmish &nbsp; ☾ Mini-boss &nbsp; ◈ Chest &nbsp; ✧ Merchant &nbsp; ☠ Final Boss</div><img id="merchantArt" src="assets/base/ee9987bc7cdd85541279ec4b.webp" hidden><div class="map-event" id="mapEvent"><div class="map-event-card"><img id="mapEventArt" class="map-event-art" alt="Illustrated event scene" hidden><div class="map-event-copy"><h3 id="mapEventTitle"></h3><p id="mapEventText"></p><div id="mapEventChoices"></div></div></div></div></div>`;document.body.appendChild(map);
const svg=map.querySelector('#mapSvg'), eventBox=map.querySelector('#mapEvent');const persistentHud=document.createElement('div');persistentHud.id='lunarRunHud';persistentHud.innerHTML=`<div class="lunar-graphic battle-lunar-graphic"><img class="lunar-graphic-art" alt="Moon Coins and Lunar Corruption" src="assets/base/0ac2b5ae3f19c5b193657dcd.webp"><div class="lunar-coin-live"><b class="hud-coins">0</b></div><div class="lunar-corruption-live"><b class="hud-corruption">0</b><span> / 100</span></div><div class="lunar-gauge-live"><div class="hud-bar-fill"></div></div></div>`;
const battleHeader=document.querySelector('.game > header.hud');
const battleFloor=battleHeader&&battleHeader.querySelector('.floor');
if(battleHeader&&battleFloor)battleHeader.insertBefore(persistentHud,battleFloor);else document.body.appendChild(persistentHud);
let rows=[],current=null,finished=false,activeNode=null,originalStart=start,originalFinish=finish,runHP=0,coins=0,corruption=0,bonusManaBattles=0,familiarBattles=0,runRelics=[];
const random=(a)=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
function el(tag,attrs,parent=svg){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.appendChild(e);return e;}
const MAP_ASSET_ICONS={"star": "assets/base/46f91bb4d250a2c84149c265.png", "moon": "assets/base/259ae16a2673b472369eea52.png", "chest": "assets/base/345ced6842617e4f5409c3aa.png", "skull": "assets/base/e14c71daa912107b6f227ecf.png"};
function makeMap(){rows=[];current=null;finished=false;
// Each run has eight skirmishes, two mini-bosses, six chests, two merchants, and the final boss.
// Encounter order and the Star enemy allocation both change with each new run.
const middle=['star','chest','star','merchant','star','chest','moon','star','chest','star','merchant','chest','moon','star','chest','star','chest'];
// Shuffle within three chapters to preserve a fair difficulty curve.
const chapters=[middle.slice(0,6),middle.slice(6,12),middle.slice(12)];
const route=['star',...chapters.flatMap(a=>shuffle(a)),'skull'];
route.forEach((type,r)=>{const count=r===0||r===route.length-1?1:2+(r%3===0?1:0);
const xs=count===1?[500]:count===2?[360,640]:[250,500,750];
const nodes=xs.map((x,c)=>({id:r+'-'+c,row:r,x,y:1810-r*92,type,enemyKind:type==='star'?(['kitsune','wolfpack','weeping','moth'][Math.floor(Math.random()*4)]):null,parents:[],children:[],done:false}));rows.push(nodes)});
for(let r=0;r<rows.length-1;r++){for(const n of rows[r]){let targets=rows[r+1].slice().sort((a,b)=>Math.abs(a.x-n.x)-Math.abs(b.x-n.x));for(const t of targets.slice(0,r===0?2:Math.random()<.55?2:1)){if(!n.children.includes(t.id))n.children.push(t.id);if(!t.parents.includes(n.id))t.parents.push(n.id)}}for(const t of rows[r+1])if(!t.parents.length){const n=rows[r].slice().sort((a,b)=>Math.abs(a.x-t.x)-Math.abs(b.x-t.x))[0];n.children.push(t.id);t.parents.push(n.id)}}
renderMap();const sc=map.querySelector('#mapScroll');sc.scrollTop=sc.scrollHeight-sc.clientHeight;
}
function available(n){return !n.done&&!finished&&(current===null?n.row===0:n.parents.includes(current));}
// One transparent atlas; SVG viewports isolate each complete emblem without
// repeating the bitmap or including any neighboring artwork.
const MAP_ICON_ATLAS = "assets/base/9af31491baed9316bfbb0077.webp";
const MAP_ICON_REGIONS = {
  star: [93, 82, 390, 390],
  chest: [573, 82, 390, 390],
  merchant: [1054, 82, 390, 390],
  moon: [308, 525, 390, 390],
  skull: [798, 509, 414, 414]
};

function mapIcon(type, x, y, parent) {
  const size = type === 'skull' ? 108 : 64;
  const art = el('svg', {
    x: x - size / 2, y: y - size / 2, width: size, height: size,
    viewBox: MAP_ICON_REGIONS[type].join(' '),
    preserveAspectRatio: 'xMidYMid meet', overflow: 'hidden',
    class: 'asset-icon', 'aria-hidden': 'true', focusable: 'false'
  }, parent);
  el('use', { href: '#moonlight-map-icon-atlas' }, art);
}

function renderMap() {
  svg.replaceChildren();
  const defs = el('defs', {});
  el('image', {
    id: 'moonlight-map-icon-atlas', width: 1536, height: 1024,
    href: MAP_ICON_ATLAS, preserveAspectRatio: 'xMidYMid meet'
  }, defs);

  for (const row of rows) for (const n of row) for (const id of n.children) {
    const next = rows.flat().find(x => x.id === id);
    el('path', {
      d: 'M ' + n.x + ' ' + n.y + ' Q ' + ((n.x + next.x) / 2 + ((n.row % 2) ? 48 : -48)) + ' ' + ((n.y + next.y) / 2) + ' ' + next.x + ' ' + next.y,
      class: 'map-line map-trail' + (n.done ? ' visited' : '')
    });
  }

  for (const row of rows) for (const n of row) {
    const enabled = available(n);
    const label = n.type === 'star' ? 'Skirmish' : n.type === 'moon' ? 'Mini boss' : n.type === 'chest' ? 'Mystery chest' : n.type === 'merchant' ? 'Moon merchant' : 'Final boss';
    const g = el('g', {
      class: 'map-node ' + (n.done ? 'done' : enabled ? 'available' : 'locked') + (n.type === 'merchant' ? ' merchant-node' : '') + (n.type === 'skull' ? ' boss-node' : ''),
      role: 'button', tabindex: enabled ? '0' : '-1',
      'aria-label': label + (enabled ? ', available' : n.done ? ', completed' : ', locked'),
      'aria-disabled': String(!enabled)
    });
    // Explicit invisible targets keep transparent artwork easy to tap.
    if (n.type === 'skull') {
      el('ellipse', { cx: n.x, cy: n.y, rx: 56, ry: 56, fill: 'transparent', 'pointer-events': 'all', class: 'map-hit-target' }, g);
    } else {
      el('circle', { cx: n.x, cy: n.y, r: 36, fill: 'transparent', 'pointer-events': 'all', class: 'map-hit-target' }, g);
      el('circle', { cx: n.x, cy: n.y, r: 35, class: 'asset-halo', 'pointer-events': 'none' }, g);
    }
    mapIcon(n.type, n.x, n.y, g);
    if (enabled) {
      g.addEventListener('click', () => select(n));
      g.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n); }
      });
    }
  }
  map.querySelector('#mapSubtitle').textContent = finished ? 'The lunar path is conquered' : current === null ? 'Choose your first encounter' : 'Choose a connected destination · HP ' + state.hp + '/' + state.maxHP;
}

function refreshRelicInventory(){
 const count=document.getElementById('relicCount'),grid=document.getElementById('relicGrid');if(count)count.textContent=runRelics.filter(n=>LUNAR_LOOT.some(r=>r.name===n)).length;
 if(!grid)return;grid.replaceChildren();const collected=LUNAR_LOOT.filter(r=>runRelics.includes(r.name));
 for(const r of collected){const b=document.createElement('button');b.type='button';b.className='relic-charm';b.textContent=({'Io Ember':'🔥','Callisto Shield':'🛡','Europa Pearl':'◉','Enceladus Tear':'❄',"Rhea's Veil":'✧','Triton Fang':'🦷','Titan Heart':'♥','Miranda Mirror':'◇','Ganymede Crown':'♛','Charon Oath':'☽'})[r.name]||'✦';b.title=r.name+' — '+r.effect;b.addEventListener('click',()=>{document.getElementById('relicDetail').textContent=r.name+' · '+r.rarity+' · '+r.effect});grid.appendChild(b)}
 if(!collected.length)grid.textContent='No relics collected yet.';
}
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('relicPouch')?.addEventListener('click',()=>{const panel=document.getElementById('relicInventory');panel.hidden=!panel.hidden;refreshRelicInventory()});document.getElementById('relicClose')?.addEventListener('click',()=>document.getElementById('relicInventory').hidden=true)});
function updateEconomy(){refreshRelicInventory();const a=map.querySelector('#lunarCoins'),b=map.querySelector('#corruptNumber'),c=map.querySelector('#corruptFill');if(a)a.textContent=coins;if(b)b.textContent=corruption;if(c){c.style.width=corruption+'%';c.dataset.danger=corruption>=75?'critical':corruption>=50?'high':'low'}const hud=document.getElementById('lunarRunHud');if(hud){hud.querySelector('.hud-coins').textContent=coins;hud.querySelector('.hud-corruption').textContent=corruption;hud.querySelector('.hud-bar-fill').style.width=corruption+'%';hud.dataset.danger=corruption>=75?'critical':corruption>=50?'high':corruption>=25?'rising':'low';map.querySelector('.lunar-graphic').dataset.danger=hud.dataset.danger;}}
function addCoins(n){coins=Math.max(0,coins+n);updateEconomy()}
function addCorruption(n){corruption=Math.max(0,Math.min(100,corruption+n));if(corruption===100){state.hp=Math.max(0,state.hp-30);corruption=50;popup('☾ LUNAR CATASTROPHE','The moon fractures! You lose 30 HP! Your corruption falls to 50. The eclipse demands its price.',[{label:'Continue',action:()=>{eventBox.classList.remove('open');if(state.hp<=0){eventBox.classList.remove('open');map.classList.remove('visible');originalFinish(false);return;}if(activeNode&&activeNode.type==='chest')complete(activeNode);show()}}]);}updateEconomy()}
function offerEvent(n){const finishEvent=()=>{complete(n);eventBox.classList.remove('open');show()};const spend=(n)=>{if(coins<n)return false;addCoins(-n);return true};const events=[
{title:'The Moonlit Mirror',art:'assets/base/f088704b9201acc6f76cd77a.webp',desc:'Your reflection smiles before you do. What will you surrender for power?',choices:[{label:'Embrace Reflection · +1 mana for 2 battles · +25 corruption',ok:()=>{bonusManaBattles=2;addCorruption(25)}},{label:'Shatter Mirror · Gain a lunar relic',ok:()=>{runRelics.push('Mirror Shard');state.mapStrength=(state.mapStrength||0)+1}},{label:'Walk Away · Purify 10 corruption',ok:()=>addCorruption(-10)}]},
{title:'The Wandering Witch',art:'assets/base/ee9987bc7cdd85541279ec4b.webp',desc:'An enigmatic merchant offers dangerous bargains under a violet lantern.',choices:[{label:'Healing Draught · 30 coins · Heal 20 HP',cost:30,ok:()=>state.hp=Math.min(state.maxHP,state.hp+20)},{label:'Moon Relic · 60 coins · +1 permanent Strength',cost:60,ok:()=>{runRelics.push('Witch’s Charm');state.mapStrength=(state.mapStrength||0)+1}},{label:'Steal Forbidden Magic · +30 corruption · +2 Strength',ok:()=>{state.mapStrength=(state.mapStrength||0)+2;addCorruption(30)}}]},
{title:'The Forgotten Altar',art:'assets/base/4a6fe7c67b70ee017f63ba23.webp',desc:'A silent celestial altar asks for a sacrifice.',choices:[{label:'Offer Blood · Lose 15 HP · +5 maximum HP',disabled:()=>state.hp<=15,ok:()=>{state.hp-=15;state.maxHP+=5}},{label:'Offer Coins · 40 coins · Purify 30 corruption',cost:40,ok:()=>addCorruption(-30)},{label:'Refuse the Altar · +10 corruption',ok:()=>addCorruption(10)}]},
{title:'The Sleeping Familiar',art:'assets/base/a29a1cc4de12af95c0fc82bf.webp',desc:'A tiny lunar spirit sleeps beside a cracked crystal.',choices:[{label:'Awaken Familiar · Deal 3 bonus damage for 3 battles',ok:()=>{familiarBattles=3}},{label:'Absorb Magic · +40 coins · +20 corruption',ok:()=>{addCoins(40);addCorruption(20)}},{label:'Protect It · Heal 12 HP',ok:()=>{state.hp=Math.min(state.maxHP,state.hp+12)}}]},
{title:'The Celestial Tarot',art:'assets/base/416170cf124037924ab1e271.webp',desc:'Three shimmering cards hang in the air, awaiting your choice.',choices:[{label:'The Star · Gain 25 moon coins',ok:()=>addCoins(25)},{label:'The Moon · +1 Strength · +20 corruption',ok:()=>{state.mapStrength=(state.mapStrength||0)+1;addCorruption(20)}},{label:'The Eclipse · Gain 60 coins, lose 12 HP',ok:()=>{addCoins(60);state.hp=Math.max(1,state.hp-12)}}]}
];const e=random(events);e.choices=[...e.choices,{label:'Drink from the Moonwell · 25 coins · +8 maximum HP and heal 8',cost:25,ok:()=>{state.maxHP+=8;state.hp=Math.min(state.maxHP,state.hp+8)}}];popup('✧ '+e.title,e.desc,e.choices.map(c=>({label:c.label+((c.cost&&coins<c.cost)?' (need '+c.cost+' coins)':''),action:()=>{if(c.disabled&&c.disabled())return;if(c.cost&&!spend(c.cost))return;c.ok();if(!eventBox.classList.contains('open'))return;if(corruption===50&&map.querySelector('#mapEventTitle').textContent.includes('CATASTROPHE'))return;finishEvent()}})),e.art);}
function show(){updateEconomy();renderMap();map.classList.add('visible');const sc=map.querySelector('#mapScroll');const row=current===null?0:rows.flat().find(n=>n.id===current)?.row||0;const y=1810-row*92;sc.scrollTop=Math.max(0,(y/1940)*sc.scrollHeight-sc.clientHeight*.66);}function hide(){map.classList.remove('visible');eventBox.classList.remove('open')}
function popup(title,text,options,art){const portrait=map.querySelector('#mapEventArt');portrait.hidden=!art;if(art)portrait.src=art;map.querySelector('#mapEventTitle').textContent=title;map.querySelector('#mapEventText').textContent=text;const choices=map.querySelector('#mapEventChoices');choices.replaceChildren();options.forEach(o=>{const b=document.createElement('button');b.textContent=o.label;b.addEventListener('click',o.action);choices.appendChild(b)});eventBox.classList.add('open')}
function complete(n){n.done=true;current=n.id;activeNode=null;renderMap();}
function offerMerchant(n){const done=()=>{complete(n);eventBox.classList.remove('open');show()};
const menu=[{label:'Moonwell Tonic · 25 coins · +8 maximum HP and heal 8',price:25,apply:()=>{state.maxHP+=8;state.hp=Math.min(state.maxHP,state.hp+8)}},
{label:'Restorative Elixir · 18 coins · Heal 20 HP',price:18,apply:()=>{state.hp=Math.min(state.maxHP,state.hp+20)}},
{label:'Purifying Incense · 25 coins · Remove 25 corruption',price:25,apply:()=>addCorruption(-25)},
{label:'Lunar Catalyst · 45 coins · Evolve a card',price:45,catalyst:true},
{label:'Lunar Charm · 50 coins · +1 permanent Strength',price:50,apply:()=>{state.mapStrength=(state.mapStrength||0)+1;runRelics.push('Lunar Charm')}}];
const art=map.querySelector('#merchantArt')?.src;
popup('✧ The Astral Merchant','An enigmatic traveler offers healing and permanent upgrades. Choose your purchase, or leave without spending.',[...menu.map(o=>({label:o.label+(coins<o.price?' · Not enough coins':''),action:()=>{if(coins<o.price)return;if(o.catalyst){evolveReward(done,()=>{mdCloseRewards();offerMerchant(n)},{source:'merchant',cost:o.price});return;}addCoins(-o.price);o.apply();done()}})),{label:'Leave the shop',action:done}],art);
}

const LUNAR_LOOT=[
{name:'Io Ember',moon:'Io · Jupiter',rarity:'Common',weight:55,effect:'Start battles with 4 Block.',apply:()=>{}},
{name:'Callisto Shield',moon:'Callisto · Jupiter',rarity:'Common',weight:45,effect:'Start battles with 6 Block.',apply:()=>{}},
{name:'Europa Pearl',moon:'Europa · Jupiter',rarity:'Rare',weight:40,effect:'Heal 5 HP after victory.',apply:()=>{}},
{name:'Enceladus Tear',moon:'Enceladus · Saturn',rarity:'Rare',weight:35,effect:'Heal 3 HP at battle start.',apply:()=>{}},
{name:"Rhea's Veil",moon:'Rhea · Saturn',rarity:'Rare',weight:25,effect:'Gain 5 Block at the start of mini-boss encounters.',apply:()=>{}},
{name:'Triton Fang',moon:'Triton · Neptune',rarity:'Epic',weight:50,effect:'Start battles with +1 Strength.',apply:()=>{}},
{name:'Titan Heart',moon:'Titan · Saturn',rarity:'Epic',weight:30,effect:'Gain 6 permanent maximum HP and heal 6.',apply:()=>{state.maxHP+=6;state.hp=Math.min(state.maxHP,state.hp+6)}},
{name:'Miranda Mirror',moon:'Miranda · Uranus',rarity:'Epic',weight:20,effect:'Draw 1 extra opening card.',apply:()=>{}},
{name:'Ganymede Crown',moon:'Ganymede · Jupiter',rarity:'Legendary',weight:70,effect:'Start battles with +1 mana.',apply:()=>{}},
{name:'Charon Oath',moon:'Charon · Pluto',rarity:'Legendary',weight:30,effect:'Survive one lethal hit per run.',apply:()=>{}}
];
let charonSpent=false,lootClaimed=0;
const RARITY_COLOR={Common:'#c4c4d0',Rare:'#70baff',Epic:'#d18aff',Legendary:'#ffda80'};
function lunarRelicRoll(minRare=false){
 const available=LUNAR_LOOT.filter(x=>!runRelics.includes(x.name));if(!available.length)return null;
 const r=Math.random()*100;let rarity=minRare?(r<66?'Rare':r<93?'Epic':'Legendary'):(r<55?'Common':r<85?'Rare':r<97?'Epic':'Legendary');
 const pool=available.filter(x=>x.rarity===rarity);if(!pool.length)return null;
 const sum=pool.reduce((n,x)=>n+x.weight,0);let roll=Math.random()*sum;
 for(const item of pool){roll-=item.weight;if(roll<=0)return item}return pool.at(-1);
}
function grantLunarRelic(relic){
 if(!relic){addCoins(30);return}
 runRelics.push(relic.name);relic.apply();
 popup('✦ '+relic.name,relic.moon+' · '+relic.rarity+' Lunar Relic\n'+relic.effect,[{label:'Claim relic',action:()=>{eventBox.classList.remove('open');show()}}]);
}
function hasLunarRelic(name){return runRelics.includes(name)}
function lunarStartBattle(){
 if(hasLunarRelic('Io Ember'))state.block+=4;
 if(hasLunarRelic('Callisto Shield'))state.block+=6;
 if(hasLunarRelic('Enceladus Tear'))state.hp=Math.min(state.maxHP,state.hp+3);
 if(hasLunarRelic('Triton Fang'))state.strength+=1;
 if(hasLunarRelic('Ganymede Crown'))state.energy+=1;
 if(hasLunarRelic('Miranda Mirror'))draw(1);if(hasLunarRelic("Rhea's Veil")&&state.enemyType==='seraphine')state.block+=5;
}
function lunarVictory(){
 if(hasLunarRelic('Europa Pearl'))state.hp=Math.min(state.maxHP,state.hp+5);
}
// Exclusive run-only spell loot. Not part of any starting Grimoire.
const LOOT_SPELLS={
 loot_fang:{name:'Moonlit Fang',cost:1,type:'Attack',desc:'Deal 10 damage. Gain 3 Block.',art:'slash',rarity:'Common',play:()=>{attack(10);block(3)}},
 loot_comet:{name:'Comet Needle',cost:1,type:'Attack',desc:'Deal 9 damage. Draw 1 card.',art:'bolt',rarity:'Common',play:()=>{attack(9);draw(1)}},
 loot_tide:{name:'Starfall Guard',cost:1,type:'Skill',desc:'Gain 12 Block.',art:'shield',rarity:'Common',play:()=>block(12)},
 loot_blood:{name:'Blood Moon Ritual',cost:2,type:'Attack',desc:'Deal 14 damage. Heal 6 HP.',art:'star',rarity:'Rare',play:()=>{attack(14);heal(6)}},
 loot_chains:{name:'Astral Shackles',cost:2,type:'Attack',desc:'Deal 11 damage. Apply 2 Weak for 2 turns.',art:'bolt',rarity:'Rare',play:()=>{attack(11);state.enemyWeak+=2}},
 loot_rupture:{name:'Celestial Rupture',cost:3,type:'Attack',desc:'Deal 35 damage. Apply 1 Weak to the enemy.',art:'star',rarity:'Epic',play:()=>{attack(35);state.enemyWeak+=1}},
 loot_sanctuary:{name:'Titan Sanctuary',cost:3,type:'Skill',desc:'Gain 18 Block and heal 6 HP.',art:'veil',rarity:'Epic',play:()=>{block(18);heal(6)}},
 loot_requiem:{name:'Eclipse Requiem',cost:3,type:'Attack',desc:'Deal 18 damage and gain 6 Block.',art:'moon',rarity:'Legendary',play:()=>{attack(18);block(6)}},
 loot_cataclysm:{name:'Astral Cataclysm',cost:3,type:'Attack',desc:'Deal 14 damage; +5 if the enemy has a debuff.',art:'star',rarity:'Legendary',play:()=>attack(14+(state.enemyPoison>0||state.enemyWeak>0?5:0))},
 loot_chronos:{name:'Chronos Eclipse',cost:2,type:'Skill',desc:'Gain 7 Block. Draw 1 card.',art:'veil',rarity:'Legendary',play:()=>{block(7);draw(1)}},
 loot_covenant:{name:'Forbidden Covenant',cost:1,type:'Attack',desc:'Deal 40 damage. Lose 8 HP and gain 10 Corruption.',art:'star',rarity:'Cursed',play:()=>{attack(40);state.hp=Math.max(0,state.hp-8);addCorruption(10);if(state.hp<=0)finish(false)}}
};
Object.assign(CARDS,LOOT_SPELLS);
function lootSpellChoices(minRare=false){
 const ids=Object.keys(LOOT_SPELLS).filter(id=>LOOT_SPELLS[id].rarity!=='Cursed');
 const legendary=Math.random()<.005;
 const choices=[];
 if(legendary)choices.push(random(ids.filter(id=>LOOT_SPELLS[id].rarity==='Legendary')));
 while(choices.length<3){const r=Math.random();const rarity=minRare?(r<.65?'Rare':'Epic'):(r<.6?'Common':r<.9?'Rare':'Epic');const pool=ids.filter(id=>LOOT_SPELLS[id].rarity===rarity&&!choices.includes(id));if(pool.length)choices.push(random(pool));}
 return choices;
}
function cardIsHealing(id){
 const c=CARDS[id];
 return !!c&&(/heal \d|heal [0-9]|regenerat|restore.*hp/i.test(c.desc)||id==='lotus');
}
function validLootReplacement(newId,oldId){return null}
/* Universal victory rewards. Lives inside the dungeon engine closure. */
let mdRewardUI = null;
let mdRewardSession = null;
let mdPreviousFocus = null;
let mdRunGeneration = 0;

function mdElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function mdButton(label, action, variant = 'primary', hook) {
  const button = MDRewardArt.button(label, { variant, onClick: action });
  if (hook) {
    button.dataset.action = hook;
    button.classList.add('md-reward-' + hook);
  }
  return button;
}

function mdEnsureUI() {
  if (mdRewardUI) return mdRewardUI;
  const overlay = mdElement('div');
  overlay.id = 'mdRewardOverlay';
  overlay.hidden = true;
  const dialog = mdElement('section', 'md-reward-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'mdRewardTitle');
  dialog.tabIndex = -1;
  const header = mdElement('header', 'md-reward-header');
  header.appendChild(MDRewardArt.crest());
  const eyebrow = mdElement('div', 'md-reward-eyebrow');
  const title = mdElement('h2', 'md-reward-title');
  title.id = 'mdRewardTitle';
  const subtitle = mdElement('p', 'md-reward-subtitle');
  const receipt = mdElement('div', 'md-reward-coins');
  header.append(eyebrow, title, subtitle, receipt);
  const body = mdElement('main', 'md-reward-body');
  body.tabIndex = 0;
  body.setAttribute('aria-label', 'Reward choices and spell information');
  const footer = mdElement('footer', 'md-reward-footer');
  const status = mdElement('p', 'md-reward-status');
  status.setAttribute('role', 'status');
  const actions = mdElement('div', 'md-reward-actions');
  footer.append(status, actions);
  dialog.append(header, body, footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  mdRewardUI = { overlay, dialog, header, eyebrow, title, subtitle, receipt, body, footer, status, actions };
  overlay.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || document.getElementById('inspectBackdrop')?.classList.contains('open')) return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled), select, [tabindex="0"]')]
      .filter(node => node.getClientRects().length);
    if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  return mdRewardUI;
}

function mdShowPage(stage, title, subtitle, session, eyebrow) {
  const ui = mdEnsureUI();
  if (ui.overlay.hidden) mdPreviousFocus = document.activeElement;
  ui.overlay.hidden = false;
  ui.overlay.dataset.stage = stage;
  ui.title.textContent = title;
  ui.subtitle.textContent = subtitle || '';
  ui.eyebrow.textContent = eyebrow || (session?.node?.type === 'moon' ? 'Moon miniboss defeated' : session?.node?.type === 'skull' ? 'Final boss defeated' : session?.node ? 'Star encounter cleared' : 'Moonlight Duel');
  ui.body.replaceChildren();
  ui.actions.replaceChildren();
  ui.status.textContent = '';
  ui.body.scrollTop = 0;
  ui.receipt.replaceChildren();
  const amount = session?.coinReward || 0;
  ui.receipt.hidden = !amount;
  if (amount) {
    ui.receipt.append(mdElement('strong', '', '+' + amount + ' Moon Coins'), mdElement('small', '', '✓ Collected'));
  }
  document.body.classList.add('md-rewards-open');
  eventBox.classList.remove('open');
  document.getElementById('resultOverlay').classList.add('hidden');
  requestAnimationFrame(() => { if (!ui.overlay.hidden) ui.dialog.focus({ preventScroll: true }); });
  return ui;
}

function mdCloseRewards() {
  if (mdRewardUI) mdRewardUI.overlay.hidden = true;
  document.body.classList.remove('md-rewards-open');
  document.getElementById('inspectBackdrop')?.classList.remove('open');
  document.getElementById('inspectBackdrop')?.setAttribute('aria-hidden', 'true');
  if (mdPreviousFocus?.isConnected) mdPreviousFocus.focus({ preventScroll: true });
}

function mdNotice(text, warning = false) {
  return mdElement('p', 'md-reward-notice' + (warning ? ' warning' : ''), text);
}

function mdApplyLootRarity(element, rarity) {
  const tone = String(rarity || 'none').trim().toLowerCase();
  element.dataset.rarity = tone;
  element.classList.toggle('md-rarity-glow', tone === 'rare' || tone === 'legendary');
  return element;
}

function mdOfferRarity(offer) {
  if (offer?.cardId) return cardPresentation(offer.cardId).rarity;
  return offer?.relic?.rarity || offer?.rarity;
}

function mdBadge(text, rarity) {
  const badge = mdElement('div', 'md-reward-badge');
  const tone = String(rarity || text || 'common').toLowerCase();
  badge.dataset.rarity = /legendary|common|cursed|rare|epic|standard/.test(tone) ? tone.match(/legendary|common|cursed|rare|epic|standard/)[0] : 'none';
  badge.append(MDRewardArt.badgeSkin(tone), mdElement('span', '', text));
  return badge;
}

function mdSpellArtwork(id, card) {
  const presentation = card || cardPresentation(id);
  return createCardArtwork(id, {card: presentation});
}

function mdOfferArtwork(offer) {
  if (offer.cardId) return mdSpellArtwork(offer.cardId);
  if (offer.relic) return MDRewardArt.relic(offer.relic.name);
  if (offer.id === 'bloodstone') {
    const image = mdElement('img'); image.src = CARD_ART.lotus; image.alt = ''; return image;
  }
  if (offer.id === 'cursed') return mdSpellArtwork('entropy');
  return MDRewardArt.sprite(offer.art || 'spell');
}

function mdCreateChoice(offer, onSelect, onInspect) {
  const card = mdElement('article', 'md-reward-card');
  mdApplyLootRarity(card, mdOfferRarity(offer));
  card.dataset.rewardId = offer.id;
  card.setAttribute('role', 'radio');
  card.setAttribute('aria-checked', 'false');
  card.setAttribute('aria-label', offer.title + '. ' + offer.description);
  card.tabIndex = offer.disabled ? -1 : 0;
  if (offer.disabled) { card.setAttribute('aria-disabled', 'true'); card.classList.add('is-unavailable'); }
  card.append(MDRewardArt.panelSkin(false), MDRewardArt.panelSkin(true));
  card.appendChild(mdBadge(offer.badge || 'Reward', offer.rarity || offer.badgeTone));
  card.appendChild(mdElement('h3', 'md-reward-card-title', offer.title));
  if (offer.meta) card.appendChild(mdElement('div', 'md-spell-meta', offer.meta));
  const artwork = mdElement('div', 'md-reward-art');
  artwork.appendChild(mdOfferArtwork(offer));
  card.appendChild(artwork);
  card.appendChild(mdElement('p', 'md-reward-description', offer.description));
  if (offer.note) card.appendChild(mdElement('p', 'md-reward-note', offer.note));
  if (onInspect) {
    const inspect = MDRewardArt.iconButton('info', 'Inspect ' + offer.title, event => { event.stopPropagation(); onInspect(); });
    artwork.appendChild(inspect);
  }
  const button = mdButton(offer.disabled ? 'Unavailable' : 'Select', event => { event.stopPropagation(); if (!offer.disabled) onSelect(card); });
  button.disabled = !!offer.disabled;
  button.dataset.action = 'select';
  card.appendChild(button);
  card.addEventListener('click', event => { if (!offer.disabled && !event.target.closest('button')) onSelect(card); });
  card.addEventListener('keydown', event => {
    if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); if (!offer.disabled) onSelect(card);
    }
  });
  return card;
}

function mdSelectChoice(grid, selected) {
  grid.querySelectorAll('.md-reward-card').forEach(card => {
    const chosen = card === selected;
    card.classList.toggle('is-selected', chosen);
    card.setAttribute('aria-checked', String(chosen));
    const label = card.querySelector('[data-action="select"] .md-button-label');
    if (label && card.getAttribute('aria-disabled') !== 'true') label.textContent = chosen ? '✓ Selected' : 'Select';
  });
}

function mdGrid(count) {
  const grid = mdElement('div', 'md-reward-grid');
  grid.dataset.count = String(count);
  grid.setAttribute('role', 'radiogroup');
  grid.setAttribute('aria-label', 'Choose one reward');
  return grid;
}

function mdSpellPanel(presentation, label, after) {
  const panel = mdElement('section', 'md-spell-panel' + (after ? ' after' : ''));
  mdApplyLootRarity(panel, presentation.rarity);
  panel.appendChild(mdElement('p', 'md-spell-label', label));
  panel.appendChild(mdElement('h3', '', presentation.name));
  panel.appendChild(mdElement('div', 'md-spell-meta', presentation.cost + ' Mana · ' + presentation.type + ' · ' + presentation.rarity));
  panel.appendChild(mdElement('div', 'md-spell-meta md-stage-label', presentation.stageLabel));
  const art = mdElement('div', 'md-reward-art');
  art.appendChild(mdSpellArtwork(presentation.id, presentation));
  panel.appendChild(art);
  panel.appendChild(mdElement('p', 'md-spell-effect', presentation.effect));
  if (presentation.damageNote) panel.appendChild(mdElement('p', 'md-reward-note', presentation.damageNote));
  const details = mdElement('details', 'md-spell-rules');
  details.appendChild(mdElement('summary', '', 'How this spell works'));
  presentation.rules.forEach(rule => details.appendChild(mdElement('p', '', rule)));
  panel.appendChild(details);
  return panel;
}

function mdComparison(before, after, afterLabel, changes) {
  const section = mdElement('div', 'md-comparison');
  const grid = mdElement('div', 'md-compare-grid');
  grid.append(mdSpellPanel(before, 'Current card', false), mdSpellPanel(after, afterLabel, true));
  section.appendChild(grid);
  const summary = mdElement('div', 'md-spell-changes');
  summary.appendChild(mdElement('strong', '', 'What changes'));
  const list = mdElement('ul');
  changes.forEach(change => list.appendChild(mdElement('li', '', change)));
  summary.appendChild(list);
  section.appendChild(summary);
  return section;
}

function mdRevealComparison(comparison, ui) {
  if (innerWidth > 1000 && innerHeight > 650) return;
  requestAnimationFrame(() => {
    if (!comparison.isConnected || ui.overlay.hidden) return;
    ui.body.scrollTop += comparison.getBoundingClientRect().top - ui.body.getBoundingClientRect().top - 8;
  });
}

function mdInspectOffer(offer, back, session) {
  const ui = mdShowPage('details', offer.title, offer.badge || 'Reward details', session);
  if (offer.cardId) ui.body.appendChild(mdSpellPanel(cardPresentation(offer.cardId), 'Spell details', false));
  else {
    const card = mdElement('section', 'md-reward-detail');
    mdApplyLootRarity(card, mdOfferRarity(offer));
    const art = mdElement('div', 'md-reward-art'); art.appendChild(mdOfferArtwork(offer));
    card.append(art, mdNotice(offer.description));
    if (offer.note) card.appendChild(mdNotice(offer.note));
    if (offer.id === 'cursed') card.appendChild(mdNotice('At 100 Corruption, lose 30 HP and reset Corruption to 50. This can be lethal.', true));
    ui.body.appendChild(card);
  }
  ui.actions.appendChild(mdButton('Back to rewards', back, 'secondary', 'back'));
}

function mdMakeSession(node, done, options = {}) {
  return { node: node || null, done, claimed: false, finished: false, coinReward: node?.coinReward || 0, generation: mdRunGeneration, ...options };
}

function mdSessionCurrent(session) {
  return session && session.generation === mdRunGeneration && !session.finished;
}

function mdClaim(session, mutation) {
  if (!mdSessionCurrent(session) || session.claimed) return false;
  const snapshot = {
    state: { ...state, deck: [...state.deck], hand: [...state.hand], discard: [...state.discard], wolves: state.wolves?.slice() || state.wolves },
    coins, corruption, runRelics: [...runRelics], cardIds: new Set(Object.keys(CARDS))
  };
  session.claimed = true;
  const claimButton = mdRewardUI?.actions.querySelector('[data-action="claim"]');
  if (claimButton) claimButton.disabled = true;
  let result;
  try {
    result = mutation();
  } catch (error) {
    // Restore the whole claim before permitting another attempt.
    for (const key of Object.keys(state)) if (!(key in snapshot.state)) delete state[key];
    Object.assign(state, snapshot.state);
    coins = snapshot.coins; corruption = snapshot.corruption; runRelics = snapshot.runRelics;
    for (const id of Object.keys(CARDS)) if (!snapshot.cardIds.has(id)) delete CARDS[id];
    session.claimed = false;
    if (claimButton) claimButton.disabled = false;
    eventBox.classList.remove('open');
    mdRewardUI.status.textContent = 'The reward could not be confirmed. Please try again.';
    console.error('Reward confirmation failed', error);
    return false;
  }
  if (result?.ok === false) {
    session.claimed = false;
    if (claimButton) claimButton.disabled = false;
    mdRewardUI.status.textContent = result.error || 'Review this reward again.';
    return false;
  }
  if (state.hp <= 0) {
    session.finished = true;
    mdCloseRewards(); eventBox.classList.remove('open'); map.classList.remove('visible');
    originalFinish(false);
    return false;
  }
  session.receipt = result || { title: 'Reward claimed', description: 'Your journey grows stronger.' };
  // The grant is committed. A presentation failure must never unlock it.
  try {
    updateEconomy(); eventBox.classList.remove('open'); mdShowClaimed(session);
  } catch (error) {
    console.error('Reward receipt display failed', error);
    mdRewardUI.status.textContent = '✓ Reward confirmed. Continue your journey.';
    mdRewardUI.actions.replaceChildren(mdButton('Continue Journey', () => mdContinue(session), 'primary', 'continue'));
  }
  return true;
}

function mdContinue(session) {
  if (!mdSessionCurrent(session) || !session.claimed) return;
  session.finished = true;
  mdCloseRewards();
  mdRewardSession = null;
  session.done();
}

function mdShowClaimed(session) {
  const receipt = session.receipt;
  const ui = mdShowPage('claimed', receipt.title || 'Reward claimed', receipt.description || 'Your reward is ready.', session);
  if (receipt.before && receipt.after) {
    ui.body.appendChild(mdComparison(receipt.before, receipt.after, 'Confirmed card', receipt.changes || ['One card copy changed.']));
  } else if (receipt.cardId) {
    ui.body.appendChild(mdSpellPanel(cardPresentation(receipt.cardId), 'Added to your deck', true));
  } else {
    const content = mdElement('section', 'md-reward-detail');
    mdApplyLootRarity(content, mdOfferRarity(receipt.offer));
    const artwork = mdElement('div', 'md-reward-art');
    artwork.appendChild(mdOfferArtwork(receipt.offer || { art: 'relic' }));
    content.append(artwork, mdNotice(receipt.detail || receipt.description || 'Reward collected.'));
    ui.body.appendChild(content);
  }
  ui.status.textContent = '✓ Reward confirmed';
  ui.actions.appendChild(mdButton('Continue Journey', () => mdContinue(session), 'primary', 'continue'));
}

function mdLootOffers(node) {
  if (node.rewardOffers) return node.rewardOffers;
  const rare = node.type === 'moon';
  const newCards = lootSpellChoices(rare);
  if (Math.random() < .025) newCards[2] = 'loot_covenant';
  const relic = lunarRelicRoll(rare);
  const healAmount = rare ? 15 : 8;
  if (node.catalystOffer === undefined) node.catalystOffer = rare || Math.random() < .10;
  if (node.cursedLoot === undefined) node.cursedLoot = Math.random() < .035;
  const offers = [
    { id: 'transmutation', title: 'Spell Transmutation', badge: 'Replace a spell', badgeTone: 'spell', art: 'spell', description: 'Choose one new spell, then replace one card in your deck.', note: 'Compare both spells before confirming.', cards: newCards, claimLabel: 'Choose a spell' },
    { id: 'discovery', title: 'Spell Discovery', badge: 'Add a spell', badgeTone: 'spell', art: 'discovery', description: 'Choose one new spell to add to your deck.', note: 'Your deck may grow beyond 15 cards.', cards: newCards, claimLabel: 'Choose a spell' }
  ];
  if (node.catalystOffer) offers.push({ id: 'catalyst', title: 'Lunar Catalyst', badge: 'Spell Evolution', badgeTone: 'upgrade', art: 'catalyst', description: 'Advance one eligible spell by one stage.', note: 'Preview its current and upgraded effects.', claimLabel: 'Choose a card' });
  offers.push(relic
    ? { id: 'relic', title: relic.name, badge: relic.rarity + ' relic', rarity: relic.rarity, relic, description: relic.effect, note: relic.moon, claimLabel: 'Claim relic' }
    : { id: 'relic', title: 'Moon Coin Cache', badge: 'Currency', rarity: 'common', art: 'coin', description: 'Gain 30 additional Moon Coins.', claimLabel: 'Claim coins' });
  offers.push({ id: 'bloodstone', title: 'Bloodstone', badge: 'Recovery', rarity: 'common', description: 'Restore up to ' + healAmount + ' HP.', note: 'Healing cannot exceed your maximum HP.', healAmount, claimLabel: 'Claim Bloodstone' });
  if (node.cursedLoot) offers.push({ id: 'cursed', title: 'Crimson Grimoire', badge: 'Cursed loot', rarity: 'cursed', description: 'Gain +2 permanent Strength for this run and 25 Corruption.', note: 'Reaching 100 Corruption costs 30 HP.', claimLabel: 'Accept cursed loot' });
  node.rewardOffers = offers;
  return offers;
}

function openLoot(node) {
  if (node.done) return;
  show();
  const session = node.rewardSession || (node.rewardSession = mdMakeSession(node, () => {
    eventBox.classList.remove('open'); complete(node); busy = false; runHP = state.hp; show();
  }));
  mdRewardSession = session;
  if (session.claimed) { mdShowClaimed(session); return; }
  const offers = mdLootOffers(node);
  const ui = mdShowPage('rewards', 'Victory Spoils', 'Choose one reward to continue your journey.', session);
  const grid = mdGrid(offers.length);
  ui.body.appendChild(grid);
  const claim = mdButton('Choose a reward', () => {
    const selected = offers.find(offer => offer.id === session.selection);
    if (!selected || session.claimed) return;
    if (selected.id === 'transmutation' || selected.id === 'discovery') {
      mdSpellChoices(session, selected); return;
    }
    if (selected.id === 'catalyst') { evolveReward(session.done, () => openLoot(node), { session }); return; }
    mdClaim(session, () => {
      if (selected.id === 'relic') {
        if (selected.relic) { runRelics.push(selected.relic.name); selected.relic.apply(); }
        else addCoins(30);
        return { title: selected.title + ' claimed', description: selected.description, offer: selected, detail: selected.description };
      }
      if (selected.id === 'bloodstone') {
        const before = state.hp;
        state.hp = Math.min(state.maxHP, state.hp + selected.healAmount);
        return { title: 'Bloodstone claimed', description: 'Restored ' + (state.hp - before) + ' HP.', detail: 'Health: ' + before + ' → ' + state.hp + ' / ' + state.maxHP, offer: selected };
      }
      const oldCorruption = corruption;
      state.mapStrength = (state.mapStrength || 0) + 2;
      addCorruption(25);
      return { title: 'Crimson Grimoire claimed', description: '+2 permanent Strength for this run.', detail: oldCorruption + 25 >= 100 ? 'Lunar Catastrophe: lost 30 HP. Corruption reset to 50.' : 'Corruption: ' + oldCorruption + ' → ' + corruption, offer: selected };
    });
  }, 'primary', 'claim');
  claim.disabled = true;
  offers.forEach(offer => {
    const display = offer.id === 'catalyst' && !listRunCardCopies().some(copy => copy.eligible)
      ? { ...offer, disabled: true, note: 'No eligible attack cards can evolve.' } : offer;
    const card = mdCreateChoice(display, selected => {
      session.selection = offer.id;
      mdSelectChoice(grid, selected);
      claim.disabled = false;
      claim.querySelector('.md-button-label').textContent = offer.claimLabel;
      ui.status.textContent = offer.title + ' selected';
    }, () => mdInspectOffer(display, () => openLoot(node), session));
    grid.appendChild(card);
    if (session.selection === offer.id && !display.disabled) {
      mdSelectChoice(grid, card); claim.disabled = false;
      claim.querySelector('.md-button-label').textContent = offer.claimLabel;
      ui.status.textContent = offer.title + ' selected';
    }
  });
  ui.actions.append(mdButton('Skip Reward', () => {
    if (!mdSessionCurrent(session) || session.claimed) return;
    session.claimed = true; session.receipt = { title: 'Reward skipped', description: 'Continue along the lunar path.' }; mdContinue(session);
  }, 'secondary', 'skip'), claim);
}

function mdSpellChoices(session, offer) {
  const addition = offer.id === 'discovery';
  const ui = mdShowPage('spell-offer', addition ? 'Spell Discovery' : 'Spell Transmutation', addition ? 'Choose one spell to add. No existing card is removed.' : 'Choose a new spell, then compare it with the card it will replace.', session);
  const grid = mdGrid(offer.cards.length);
  ui.body.appendChild(grid);
  let selectedId = session.newSpellId && offer.cards.includes(session.newSpellId) ? session.newSpellId : null;
  const confirm = mdButton(addition ? 'Add to Deck' : 'Choose a card to replace', () => {
    if (!selectedId || session.claimed) return;
    if (!addition) {
      replaceCardReward(selectedId, session.done, () => mdSpellChoices(session, offer), session); return;
    }
    mdClaim(session, () => {
      state.deck.push(selectedId);
      return { title: 'Spell added', description: CARDS[selectedId].name + ' joins your deck.', cardId: selectedId };
    });
  }, 'primary', 'claim');
  confirm.disabled = !selectedId;
  offer.cards.forEach(id => {
    const cardInfo = cardPresentation(id);
    const cardOffer = { id, cardId: id, title: cardInfo.name, description: cardInfo.effect, badge: cardInfo.rarity + ' spell', rarity: cardInfo.rarity, meta: cardInfo.cost + ' Mana · ' + cardInfo.type, note: cardInfo.damageNote };
    const card = mdCreateChoice(cardOffer, element => {
      selectedId = id; session.newSpellId = id;
      mdSelectChoice(grid, element); confirm.disabled = false;
      ui.status.textContent = cardInfo.name + ' selected';
    }, () => mdInspectOffer(cardOffer, () => mdSpellChoices(session, offer), session));
    grid.appendChild(card);
    if (selectedId === id) { mdSelectChoice(grid, card); ui.status.textContent = cardInfo.name + ' selected'; }
  });
  ui.actions.append(mdButton('Back to rewards', () => openLoot(session.node), 'secondary', 'back'), confirm);
}

function mdCopyPicker(copies, onChoose, useEligibility) {
  const picker = mdElement('div', 'md-card-picker');
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Choose a card copy');
  copies.forEach(copy => {
    const info = copy.presentation;
    const button = mdButton(info.name, () => {
      picker.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      onChoose(copy);
    }, 'secondary');
    mdApplyLootRarity(button, info.rarity);
    button.dataset.cardId = copy.id;
    button.dataset.cardCopy = copy.pileName + ':' + copy.index;
    button.setAttribute('aria-pressed', 'false');
    button.title = info.effect + '\n' + (useEligibility && !copy.eligible ? copy.reason : info.stageLabel);
    const meta = mdElement('small', 'md-picker-meta', info.cost + ' Mana · ' + info.stageLabel + ' · Copy ' + copy.copyNumber);
    button.querySelector('.md-button-label').appendChild(meta);
    if (useEligibility && !copy.eligible) {
      button.disabled = true;
      button.querySelector('.md-button-label').appendChild(mdElement('small', 'md-picker-reason', copy.reason));
    }
    picker.appendChild(button);
  });
  return picker;
}

function replaceCardReward(newId, finishReward, back, existingSession) {
  const session = existingSession || mdMakeSession(null, finishReward);
  mdRewardSession = session;
  const goBack = back || (() => { mdCloseRewards(); show(); });
  const copies = listRunCardCopies();
  const incoming = cardPresentation(newId);
  const ui = mdShowPage('replacement', 'Review Transmutation', 'Choose exactly one card copy to replace. Review both effects before confirming.', session);
  const layout = mdElement('div', 'md-upgrade-layout');
  const comparison = mdElement('div', 'md-upgrade-preview');
  comparison.appendChild(mdNotice('Select a card from your deck to compare it with ' + incoming.name + '.'));
  let selectedCopy = null;
  const confirm = mdButton('Confirm Transmutation', () => {
    if (!selectedCopy) return;
    mdClaim(session, () => {
      const error = validLootReplacement(newId, selectedCopy.id);
      if (error) return { ok: false, error };
      const result = replaceRunCardCopy(selectedCopy, newId);
      if (!result.ok) return result;
      return { title: 'Spell transmuted', description: result.before.name + ' → ' + result.after.name, before: result.before, after: result.after, changes: ['Replaced exactly one selected copy.', 'Deck size stays the same.'] };
    });
  }, 'primary', 'claim');
  confirm.disabled = true;
  const picker = mdCopyPicker(copies, copy => {
    selectedCopy = copy;
    comparison.replaceChildren(mdComparison(copy.presentation, incoming, 'After transmutation', [
      'Mana cost: ' + copy.presentation.cost + ' → ' + incoming.cost + '.',
      'Replace one copy of ' + copy.presentation.name + ' with ' + incoming.name + '.',
      'Deck size stays the same; the new spell uses the full effect shown above.'
    ]));
    confirm.disabled = !!validLootReplacement(newId, copy.id);
    ui.status.textContent = copy.presentation.name + ' → ' + incoming.name;
    mdRevealComparison(comparison, ui);
  }, false);
  layout.append(picker, comparison); ui.body.appendChild(layout);
  if (!copies.length) comparison.replaceChildren(mdNotice('There are no cards available to replace. Return to rewards and choose another option.'));
  ui.actions.append(mdButton('Back', goBack, 'secondary', 'back'), confirm);
}

function evolveReward(done, back, options = {}) {
  const session = options.session || mdMakeSession(null, done, { source: options.source, cost: options.cost || 0 });
  mdRewardSession = session;
  const goBack = back || (() => { mdCloseRewards(); eventBox.classList.add('open'); });
  const copies = listRunCardCopies();
  const eligible = copies.filter(copy => copy.eligible);
  const ui = mdShowPage('evolution', 'Spell Evolution', 'Choose one card copy. Compare its current and next-stage effects before confirming.', session, options.source === 'merchant' ? 'Lunar Catalyst · 45 Moon Coins' : 'Lunar Catalyst');
  ui.body.appendChild(mdNotice(eligible.length ? 'A Lunar Catalyst advances one Attack card by one stage: Base → Awakened → Ascended. Previewing a card does not consume the reward.' : 'No cards can evolve right now. Skills, Powers and Summons have no supported evolution yet; Ascended cards are already at the final stage. Return without spending the catalyst.'));
  const layout = mdElement('div', 'md-upgrade-layout');
  const comparison = mdElement('div', 'md-upgrade-preview');
  comparison.appendChild(mdNotice('Select an eligible card to see its exact upgraded effect.'));
  let selectedCopy = null, candidate = null;
  const confirm = mdButton(options.cost ? 'Evolve · ' + options.cost + ' Coins' : 'Confirm Evolution', () => {
    if (!selectedCopy || !candidate?.ok) return;
    mdClaim(session, () => {
      if (options.cost && coins < options.cost) return { ok: false, error: 'You no longer have enough Moon Coins.' };
      const result = commitEvolution(selectedCopy, candidate);
      if (!result.ok) return result;
      if (options.cost) addCoins(-options.cost);
      return { title: 'Spell evolved', description: result.after.name, before: result.before, after: result.after, changes: candidate.changes };
    });
  }, 'primary', 'claim');
  confirm.disabled = true;
  const picker = mdCopyPicker(copies, copy => {
    selectedCopy = copy; candidate = makeEvolutionCandidate(copy.id);
    if (!candidate.ok) { comparison.replaceChildren(mdNotice(candidate.reason)); confirm.disabled = true; return; }
    comparison.replaceChildren(mdComparison(candidate.before, candidate.after, 'After evolution', candidate.changes));
    confirm.disabled = false;
    ui.status.textContent = candidate.before.stageLabel + ' → ' + candidate.after.stageLabel;
    mdRevealComparison(comparison, ui);
  }, true);
  layout.append(picker, comparison); ui.body.appendChild(layout);
  ui.actions.append(mdButton(options.source === 'merchant' ? 'Back to merchant' : 'Back', goBack, 'secondary', 'back'), confirm);
}

function mdShowVictory(node, testMode = false) {
  const session = mdMakeSession(node, () => {});
  mdRewardSession = session;
  const ui = mdShowPage('victory', node?.type === 'skull' && !testMode ? 'Lunar Path Conquered' : 'Victory', testMode ? 'Test encounter cleared. Your saved decks are unchanged.' : 'The Shadow Archmage has fallen. The moonlit ruins are yours.', session, testMode ? 'Test Arena' : 'Final boss defeated');
  const content = mdElement('section', 'md-victory-summary');
  const art = mdElement('div', 'md-reward-art'); art.appendChild(MDRewardArt.sprite('relic'));
  content.append(art, mdElement('h3', '', testMode ? 'Encounter complete' : 'The final card is yours'));
  const stats = mdElement('div', 'md-victory-stats');
  stats.append(mdNotice('Health remaining: ' + state.hp + ' / ' + state.maxHP), mdNotice('Deck: ' + (state.deck.length + state.hand.length + state.discard.length) + ' cards'));
  if (!testMode) stats.append(mdNotice('Lunar relics collected: ' + runRelics.filter(name => LUNAR_LOOT.some(relic => relic.name === name)).length));
  content.appendChild(stats); ui.body.appendChild(content);
  if (testMode) {
    ui.actions.appendChild(mdButton('Back to Test Menu', () => { mdCloseRewards(); document.getElementById('moonTestMenu').classList.remove('hidden'); document.getElementById('moonTestExit').hidden = true; }, 'primary', 'continue'));
  } else {
    ui.actions.append(mdButton('View Journey', () => { mdCloseRewards(); show(); }, 'secondary', 'continue'), mdButton('New Journey', () => { mdCloseRewards(); hide(); document.getElementById('startOverlay').classList.remove('hidden'); }, 'primary', 'new-run'));
  }
}

window.MoonlightRewards = {
  getState() {
    return { stage: mdRewardUI?.overlay.hidden ? null : mdRewardUI?.overlay.dataset.stage || null, selected: mdRewardSession?.selection || null, claimed: !!mdRewardSession?.claimed, coinReward: mdRewardSession?.coinReward || 0, offers: mdRewardSession?.node?.rewardOffers?.map(offer => ({ id: offer.id, title: offer.title, cards: offer.cards?.slice(), relic: offer.relic?.name })) || [] };
  }
};


function select(n){if(!available(n))return;activeNode=n;if(n.type==='merchant'){offerMerchant(n);return}if(n.type==='chest'){if(Math.random()<.15){popup('✧ LUNAR CATALYST','A luminous catalyst waits inside the chest. Evolve one card by one stage.',[{label:'Evolve a card',action:()=>evolveReward(()=>{eventBox.classList.remove('open');complete(n);show()})},{label:'Leave it',action:()=>{eventBox.classList.remove('open');complete(n);show()}}]);}else offerEvent(n);return}
runHP=state.hp;hide();beginFight(n)}
function beginFight(n){mdCloseRewards();mdRewardSession=null;victoryPending=false;const firstKitsune=n.type==='star'&&n.enemyKind==='kitsune';const wolfPack=n.type==='star'&&n.enemyKind==='wolfpack';const weeping=n.type==='star'&&n.enemyKind==='weeping';const moth=n.type==='star'&&n.enemyKind==='moth';const seraphine=n.type==='moon';// Scale from permanent maximum HP, not current HP or temporary healing.
const permanentHP=Math.max(45,state.maxHP||45);
const playerGrowthPercent=(permanentHP-45)/45;
const enemyMultiplier=1+playerGrowthPercent*0.8;
const baseHP=seraphine?110:wolfPack?120:weeping?70:moth?65:firstKitsune?80:n.type==='star'?random([65,75,85]):n.type==='moon'?random([130,145]):250;
const wolfHP=Math.max(1,Math.round(40*enemyMultiplier));
const hp=wolfPack?wolfHP*3:Math.max(1,Math.round(baseHP*enemyMultiplier));
state.enemyType=seraphine?'seraphine':wolfPack?'wolfpack':weeping?'weeping':moth?'moth':firstKitsune?'kitsune':'archmage';state.playerVulnerableTurns=0;state.petalLamentDone=false;state.wolves=wolfPack?[wolfHP,wolfHP,wolfHP]:null;state.wolfMaxHP=wolfHP;state.wolfTarget=0;state.bleedTurns=0;state.bleedDamage=0;state.bindTurns=0;state.enemyDodge=0;
state.enemyMax=hp;state.enemyHP=hp;state.hp=runHP;state.enemyBlock=0;state.block=0;state.energy=3+(bonusManaBattles>0?1:0);state.strength=state.mapStrength||0;state.ward=false;state.summon=0;state.turn=1;state.enemyPoison=0;state.enemyWeak=0;state.playerWeak=0;state.packPower=0;state.combo=0;state.instability=0;state.surgeBonus=0;state.rangerFocus=0;state.bossPhase=1;state.bossPower=0;state.bossCharge=0;state.bossAction=0;state.intentIndex=0;state.lunarPhase=0;state.lunarProgress=0;state.lunarLast='';state.lunarMana=0;state.lunarPlayerStrength=0;state.lunarBossStrength=0;state.lunarStrengthTurns=0;state.deck=rand([...state.deck,...state.hand,...state.discard]);state.hand=[];state.discard=[];draw(6);lunarStartBattle();busy=false;render();log(n.type==='skull'?'FINAL BOSS · SHADOW ARCHMAGE':n.type==='moon'?'MOON MINI-BOSS · LADY SERAPHINE · THE BLOOD COUNTESS':(wolfPack?'STAR ENCOUNTER · THORNBOUND WOLF PACK · THREE PREDATORS':weeping?'STAR ENCOUNTER · WEEPING PETAL · THE FORSAKEN BLOSSOM':moth?'STAR ENCOUNTER · ECLIPSE MOTH · LUNAR HORROR':firstKitsune?'STAR ENCOUNTER · AMETHYST KITSUNE · TRICKSTER':'SKIRMISH · MOONLIT SHADE'));}
start=function(h){mdRunGeneration++;victoryPending=false;mdCloseRewards();mdRewardSession=null;originalStart(h);state.mapStrength=0;coins=20;corruption=0;bonusManaBattles=0;familiarBattles=0;runRelics=[];charonSpent=false;lootClaimed=0;makeMap();updateEconomy();show()};
let victoryPending=false;
finish=function(win){
 if(state&&state.hp<=0)win=false;
 if(victoryPending)return;
 victoryPending=true;
 const generation=mdRunGeneration;
 if(!win){mdCloseRewards();originalFinish(false);return;}
 busy=true;render();
 if(!activeNode){setTimeout(()=>{if(generation===mdRunGeneration)mdShowVictory(null,true)},650);return;}
 const n=activeNode;
 lunarVictory();runHP=state.hp;
 const reward=n.type==='star'?random([14,18,22]):n.type==='moon'?random([35,45]):100;
 n.coinReward=reward;addCoins(reward);
 if(bonusManaBattles>0)bonusManaBattles--;
 if(familiarBattles>0)familiarBattles--;
 setTimeout(()=>{
   if(generation!==mdRunGeneration||n.done)return;
   if(n.type==='skull'){complete(n);finished=true;renderMap();mdShowVictory(n,false)}
   else{busy=false;openLoot(n)}
 },650);
};
window.MoonTestArena={
 previewRewards(count=4){
   count=Math.max(4,Math.min(6,Number(count)||4));
   mdRunGeneration++;mdCloseRewards();mdRewardSession=null;
   originalStart('isa');
   runHP=state.hp;coins=38;corruption=0;runRelics=[];
   const node={id:'reward-preview-'+count,row:0,type:count>=5?'moon':'star',enemyKind:'kitsune',done:false,parents:[],children:[],coinReward:18,catalystOffer:count>=5,cursedLoot:count>=6};
   activeNode=null;
   node.rewardSession=mdMakeSession(node,()=>{
     hide();document.getElementById('moonTestMenu').classList.remove('hidden');
     document.getElementById('moonTestExit').hidden=true;
   });
   document.getElementById('moonLaunch')?.classList.add('hidden');
   document.getElementById('moonTestMenu')?.classList.add('hidden');
   document.getElementById('moonTestExit').hidden=false;
   openLoot(node);
 },
 launch(kind,character){
   mdRunGeneration++;mdCloseRewards();mdRewardSession=null;
   const type=kind==='seraphine'?'moon':kind==='archmage'?'skull':'star';
   const node={id:'test-'+kind,row:0,type,enemyKind:kind,done:false,parents:[],children:[]};
   activeNode=null; // Test battles never award coins or advance the dungeon.
   originalStart(character==='rei'?'rei':'isa');
   runHP=state.hp;
   hide();
   beginFight(node);
   document.getElementById('moonLaunch')?.classList.add('hidden');
   document.getElementById('moonDeckModal')?.classList.add('hidden');
   document.getElementById('moonTestMenu')?.classList.add('hidden');
   document.getElementById('moonTestExit').hidden=false;
 },
 home(){location.reload()}
};
const restart=document.getElementById('restartBtn'),again=document.getElementById('again');[restart,again].forEach(b=>b?.addEventListener('click',()=>{mdRunGeneration++;mdCloseRewards();hide()}));

/* Insert inside rng-map-engine's closure. Keeps Mopsy on the real run economy. */
(function installMopsyBridge(){
  'use strict';
  let activeItemOperation = null;
  const relicArtwork=Object.freeze({
    'Io Ember':'assets/relics/io-ember.png',
    'Europa Pearl':'assets/relics/europa-pearl.png',
    'Callisto Shield':'assets/relics/callisto-shield.png',
    'Enceladus Tear':'assets/relics/enceladus-tear.png',
    'Titan Heart':'assets/relics/titan-heart.png',
    'Triton Fang':'assets/relics/triton-fang.png',
    'Ganymede Crown':'assets/relics/ganymede-crown.png',
    'Miranda Mirror':'assets/relics/miranda-mirror.png',
    'Charon Oath':'assets/relics/charon-oath.png',
    "Rhea's Veil":'assets/relics/rheas-veil.png'
  });
  const relicView=r=>({name:r.name,moon:r.moon,rarity:r.rarity,effect:r.effect,art:relicArtwork[r.name]||'assets/items/mystery-relic.png'});
  function currentRun(){return !!state && state.hp > 0;}
  function update(){
    if(state){runHP=state.hp;render();}
    updateEconomy();
    window.MDInventory?.refresh?.();
    window.dispatchEvent(new CustomEvent('moonlight:economy-change'));
  }
  function canUseItems(){
    if(!currentRun())return false;
    if(mdRewardUI && !mdRewardUI.overlay.hidden)return false;
    if(map.classList.contains('visible'))return true;
    return !busy && state.enemyHP>0 && !document.getElementById('resultOverlay')?.classList.contains('open');
  }
  function relicsFor(names){
    return (names||[]).map(name=>{
      const r=LUNAR_LOOT.find(item=>item.name===name);
      return r?relicView(r):{name,moon:'Lunar charm',rarity:'Common',effect:'+1 permanent Strength for this run.',art:'assets/items/mystery-relic.png'};
    });
  }
  function chooseRelic(names){
    const bucketWeights={Common:55,Rare:30,Epic:12,Legendary:3};
    const totals={};LUNAR_LOOT.forEach(r=>totals[r.rarity]=(totals[r.rarity]||0)+r.weight);
    const available=LUNAR_LOOT.filter(r=>!names.includes(r.name));
    if(!available.length)return null;
    const weight=r=>bucketWeights[r.rarity]*r.weight/totals[r.rarity];
    let value=Math.random()*available.reduce((sum,r)=>sum+weight(r),0);
    for(const r of available){value-=weight(r);if(value<=0)return r;}
    return available[available.length-1];
  }
  function demoState(session){
    if(!session.deck)session.deck=Object.keys(CARDS).filter(id=>!id.startsWith('evolved_')&&CARDS[id].type==='Attack').slice(0,10);
    session.hand=session.hand||[];session.discard=session.discard||[];
    return session;
  }
  function beginOperation(done,cancel,options){
    if(activeItemOperation&&(activeItemOperation.generation!==mdRunGeneration||(!activeItemOperation.test&&activeItemOperation.run!==state))){
      activeItemOperation.closed=true;activeItemOperation=null;
    }
    if(activeItemOperation)return null;
    const test=options?.testSession||null;
    if(!test&&!canUseItems())return null;
    const run=test?demoState(test):state;
    const session=mdMakeSession(null,()=>{});
    const op={run,test,session,done,cancel,closed:false,generation:mdRunGeneration};
    activeItemOperation=op;
    return op;
  }
  function operationCurrent(op){
    return activeItemOperation===op&&!op.closed&&(op.test||op.run===state&&op.generation===mdRunGeneration);
  }
  function finishOperation(op,result,cancelled=false){
    if(!operationCurrent(op))return;
    op.closed=true;op.session.finished=true;activeItemOperation=null;
    mdCloseRewards();mdRewardSession=null;
    if(!op.test)update();
    const callback=cancelled?op.cancel:op.done;
    if(callback)callback(result);
  }
  function chooseEvolution(done,cancel,options={}){
    const op=beginOperation(done,cancel,options);if(!op)return false;
    const copies=listRunCardCopies(op.run);
    const ui=mdShowPage('evolution','Spell Evolution','Review this card now and after evolution. The catalyst is used only when you confirm.',op.session,op.test?'Mopsy Shop Test · Demo catalyst':'Inventory · Lunar Catalyst');
    const layout=mdElement('div','md-upgrade-layout');
    const preview=mdElement('div','md-upgrade-preview');
    preview.appendChild(mdNotice('Choose an Attack card to compare its current and upgraded effects.'));
    let chosen=null,candidate=null;
    const confirm=mdButton('Confirm Evolution',()=>{
      if(!operationCurrent(op)||!chosen||!candidate?.ok)return;
      let result;
      if(op.test){
        const key=chosen.pileName+':'+chosen.index;
        op.test.demoEvolutions=op.test.demoEvolutions||{};
        op.test.demoEvolutions[key]=(op.test.demoEvolutions[key]||1)+1;
        result={ok:true,before:candidate.before,after:candidate.after,demo:true};
      }else result=commitEvolution(chosen,candidate,op.run);
      if(!result.ok){ui.status.textContent=result.error;return;}
      confirm.disabled=true;finishOperation(op,result);
    },'primary','claim');confirm.disabled=true;
    layout.append(mdCopyPicker(copies,copy=>{
      chosen=copy;candidate=makeEvolutionCandidate(copy.id);
      if(op.test&&candidate.ok){
        const key=copy.pileName+':'+copy.index;
        const stage=op.test.demoEvolutions?.[key]||1;
        if(stage>=3)candidate={ok:false,reason:'This demo card is already Ascended.'};
        else{
          const base=CARDS[copy.id];
          const beforeCard={...base,evolutionStage:stage,evolutionDamageBonus:2*(stage-1),evolutionBaseId:copy.id,name:base.name+(stage===2?' · Awakened':'')};
          const afterCard={...beforeCard,evolutionStage:stage+1,evolutionDamageBonus:2*stage,name:base.name+(stage===1?' · Awakened':' · Ascended')};
          candidate.before=cardPresentation(copy.id,beforeCard);candidate.after=cardPresentation(copy.id,afterCard);
        }
      }
      if(!candidate.ok){preview.replaceChildren(mdNotice(candidate.reason));confirm.disabled=true;return;}
      preview.replaceChildren(mdComparison(candidate.before,candidate.after,'After evolution',candidate.changes));
      confirm.disabled=false;ui.status.textContent='Only this card copy will evolve.';mdRevealComparison(preview,ui);
    },true),preview);ui.body.appendChild(layout);
    if(!copies.some(c=>c.eligible))ui.body.prepend(mdNotice('No eligible Attack cards. Close this screen to keep your catalyst.'));
    ui.actions.append(mdButton('Cancel · Keep Catalyst',()=>finishOperation(op,null,true),'secondary','back'),confirm);
    return true;
  }
  function chooseCard(done,cancel,options={}){
    const op=beginOperation(done,cancel,options);if(!op)return false;
    const choices=lootSpellChoices(false);let selectedId=null;
    function showChoices(){
      const ui=mdShowPage('spell-offer',options.replace?'Card Reroll':'Card Pack',options.replace?'Choose a spell, then compare it with one card to replace.':'Choose one spell to add to this run’s deck.',op.session,op.test?'Mopsy Shop Test · Demo item':'Inventory · '+(options.replace?'Card Reroll':'Card Pack'));
      const grid=mdGrid(choices.length);
      const confirm=mdButton(options.replace?'Choose a Card to Replace':'Add to Deck',()=>{
        if(!operationCurrent(op)||!selectedId)return;
        if(options.replace){showReplacement();return;}
        op.run.deck.push(selectedId);confirm.disabled=true;
        finishOperation(op,{ok:true,id:selectedId,after:cardPresentation(selectedId),demo:!!op.test});
      },'primary','claim');confirm.disabled=!selectedId;
      choices.forEach(id=>{
        const card=cardPresentation(id);
        const choice=mdCreateChoice({id,cardId:id,title:card.name,description:card.effect,badge:card.rarity+' spell',rarity:card.rarity,meta:card.cost+' Mana · '+card.type,note:card.damageNote},node=>{
          selectedId=id;mdSelectChoice(grid,node);confirm.disabled=false;ui.status.textContent=card.name+' selected';
        },()=>{window.openInspect?.(id);});
        grid.appendChild(choice);if(id===selectedId)mdSelectChoice(grid,choice);
      });ui.body.appendChild(grid);
      ui.actions.append(mdButton('Cancel · Keep Item',()=>finishOperation(op,null,true),'secondary','back'),confirm);
    }
    function showReplacement(){
      const ui=mdShowPage('transmutation','Card Reroll','Compare the original spell with its replacement. Only one copy changes; your deck stays the same size.',op.session,op.test?'Mopsy Shop Test · Demo item':'Inventory · Card Reroll');
      const layout=mdElement('div','md-upgrade-layout'),preview=mdElement('div','md-upgrade-preview');
      preview.appendChild(mdNotice('Select the card copy you want to replace.'));
      let selectedCopy=null;
      const confirm=mdButton('Confirm Replacement',()=>{
        if(!operationCurrent(op)||!selectedCopy)return;
        const result=replaceRunCardCopy(selectedCopy,selectedId,op.run);
        if(!result.ok){ui.status.textContent=result.error;return;}
        confirm.disabled=true;finishOperation(op,{...result,demo:!!op.test});
      },'primary','claim');confirm.disabled=true;
      layout.append(mdCopyPicker(listRunCardCopies(op.run),copy=>{
        selectedCopy=copy;preview.replaceChildren(mdComparison(copy.presentation,cardPresentation(selectedId),'After replacement',['Replace one copy.','Deck size stays the same.','The complete effects of both cards are shown above.']));
        confirm.disabled=false;mdRevealComparison(preview,ui);
      },false),preview);ui.body.appendChild(layout);
      ui.actions.append(mdButton('Back to Spells',showChoices,'secondary','back'),mdButton('Cancel · Keep Item',()=>finishOperation(op,null,true),'secondary','back'),confirm);
    }
    showChoices();return true;
  }
  window.MDMopsyBridge={
    getState:()=>state,
    getCoins:()=>coins,
    getCorruption:()=>corruption,
    getQueuedMana:()=>state?.mopsyOpeningMana||0,
    canOpenShopTest:()=>!activeItemOperation&&(!mdRewardUI||mdRewardUI.overlay.hidden)&&(!busy||map.classList.contains('visible')||!state||state.hp<=0||!document.getElementById('moonLaunch')?.classList.contains('hidden')),
    getRelics:()=>relicsFor(runRelics),
    getRelicCatalog:()=>LUNAR_LOOT.map(relicView),
    isRunActive:currentRun,canUseItems,update,
    spend(cost){cost=Number(cost);if(!currentRun()||!Number.isFinite(cost)||cost<0||coins<cost)return false;addCoins(-cost);return true;},
    refund(amount){if(Number.isFinite(amount)&&amount>0)addCoins(amount);},
    heal(amount){if(!canUseItems())return{ok:false,error:'Wait until your turn or return to the map.'};if(state.hp>=state.maxHP)return{ok:false,error:'Your health is already full.'};const before=state.hp;state.hp=Math.min(state.maxHP,state.hp+Math.max(0,amount));update();return{ok:true,amount:state.hp-before};},
    removeCorruption(amount){if(!canUseItems())return{ok:false,error:'Wait until your turn or return to the map.'};if(corruption<=0)return{ok:false,error:'You have no Lunar Corruption to remove.'};const before=corruption;addCorruption(-Math.max(0,amount));update();return{ok:true,amount:before-corruption};},
    queueOpeningMana(){if(!canUseItems())return{ok:false,error:'Wait until your turn or return to the map.'};if(state.mopsyOpeningMana)return{ok:false,error:'A Focus Draught is already prepared for the next battle.'};state.mopsyOpeningMana=1;update();return{ok:true};},
    grantRandomRelic(options={}){
      const demo=options.testSession;
      if(!demo&&!canUseItems())return{ok:false,error:'Wait until your turn or return to the map.'};
      const names=demo?(demo.relics||[]).map(r=>typeof r==='string'?r:r.name):runRelics;
      const relic=chooseRelic(names);if(!relic)return{ok:false,error:'All ten lunar relics are already collected.'};
      if(demo){demo.relics=demo.relics||[];demo.relics.push(relicView(relic));if(relic.name==='Titan Heart'){demo.maxHP+=6;demo.hp=Math.min(demo.maxHP,demo.hp+6);}}
      else{runRelics.push(relic.name);relic.apply();update();}
      return{ok:true,relic:relicView(relic)};
    },
    beginEvolution:chooseEvolution,
    beginCardChoice:chooseCard
  };
  const originalBeginFight=beginFight;
  beginFight=function(node){originalBeginFight(node);if(state?.mopsyOpeningMana){state.energy+=1;state.mopsyOpeningMana=0;render();}};
  const priorRunStart=start;
  start=function(character){
    if(activeItemOperation){activeItemOperation.closed=true;activeItemOperation=null;}
    priorRunStart(character);
    window.dispatchEvent(new CustomEvent('moonlight:run-change'));
  };
  offerMerchant=function(node){
    if(!window.MDMopsyShop){popup('Mopsy’s Shop','The shop could not load. Reload the page after checking the game files.',[{label:'Return to Map',action:()=>{eventBox.classList.remove('open');show();}}]);return;}
    eventBox.classList.remove('open');
    window.MDMopsyShop.open({node,onLeave:()=>{complete(node);show();}});
  };
})();

})();
