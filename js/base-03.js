
const ART={isa:'assets/base/66ce3cb81459bea551020cd6.webp',rei:'assets/base/5e7a1dbdcb4293af02dc958b.webp'};
ART.isa='assets/base/272d99279be921882cc0d67a.webp';
const ICONS={
slash:'<path d="M10 92 Q55 5 125 12 Q65 35 40 98" fill="#ed7bff" stroke="#fff0ff" stroke-width="4"/><path d="M15 100 Q75 30 135 18" fill="none" stroke="#ffbfff" stroke-width="3"/>',
lotus:'<path d="M70 103 Q12 65 70 18 Q128 65 70 103Z" fill="#ff82d6" stroke="#ffe3ff" stroke-width="3"/><path d="M70 103 Q-5 75 22 40 Q76 55 70 103Z M70 103 Q145 75 118 40 Q64 55 70 103Z" fill="#ad46ff" stroke="#ffbaff" stroke-width="3"/><circle cx="70" cy="82" r="13" fill="#ffe58d"/>',
wolf:'<circle cx="100" cy="38" r="28" fill="#c59cff"/><path d="M18 105 L35 65 45 78 57 62 75 96 89 105Z" fill="#160d32" stroke="#e9bcff" stroke-width="3"/><path d="M22 60 L30 34 39 54 52 44 62 65 52 82 31 82Z" fill="#281243" stroke="#e9bcff" stroke-width="3"/>',
moon:'<circle cx="72" cy="54" r="42" fill="#f9d9ff"/><circle cx="92" cy="40" r="37" fill="#3b1666"/><circle cx="36" cy="90" r="6" fill="#ffc56e"/><circle cx="106" cy="98" r="5" fill="#ffc56e"/>',
veil:'<path d="M5 86 Q32 22 115 18 Q66 35 52 60 Q105 35 132 60 Q78 63 48 101" fill="none" stroke="#f88aff" stroke-width="12"/><path d="M12 86 Q45 25 123 18" fill="none" stroke="#fff0ff" stroke-width="3"/>',
bolt:'<path d="M72 10 L38 70 68 67 50 115 115 48 80 51 98 10Z" fill="#f2a3ff" stroke="#fff" stroke-width="3"/>',
shield:'<path d="M70 8 L119 26 109 80 70 114 31 80 21 26Z" fill="#6739bf" stroke="#ffe4ac" stroke-width="5"/><path d="M70 26 V90 M40 55 H100" stroke="#efbbff" stroke-width="5"/>',
star:'<path d="M70 8 L83 47 126 52 93 78 104 116 70 94 36 116 47 78 14 52 57 47Z" fill="#ff9be5" stroke="#ffe4a6" stroke-width="4"/>'
};
const CARD_ART={'slash': 'assets/base/b5f131603491dda2eb9ab38e.webp', 'lotus': 'assets/base/9fd5dad3c52a293969d7bd81.webp', 'wolf': 'assets/base/024f9b773372117811d49948.webp', 'moon': 'assets/base/03233b43cbdc5a084d6a9a92.webp', 'veil': 'assets/base/d5e9dee6fa5b47f5059049e7.webp'};
const CARDS={
slash:{name:'Moon Slash',cost:1,type:'Attack',desc:'Deal 12 damage.',art:'slash',play:()=>attack(12)},
lotus:{name:'Lunar Bloom',cost:2,type:'Skill',desc:'Gain 8 Block. Heal 4 HP.',art:'lotus',play:()=>{block(8);heal(4)}},
wolf:{name:'Spirit Pack',cost:3,type:'Summon',desc:'Summon Athena for 3 turns. Deals 8 damage each turn.',art:'wolf',play:()=>{state.summon=3;log('Athena joins the duel! 🐾')}},
moon:{name:'Waxing Crescent',cost:2,type:'Power',desc:'Gain 2 Strength. Draw 1 card.',art:'moon',play:()=>{state.strength+=2;draw(1);log('Moonlight strengthens your spells!')}},
veil:{name:'Moonveil',cost:1,type:'Skill',desc:'Gain 7 Block. Reduce the next attack by 50%.',art:'veil',play:()=>{block(7);state.ward=true}},
bolt:{name:'Arcane Bolt',cost:1,type:'Attack',desc:'Deal 8 damage. Draw 1 card.',art:'bolt',play:()=>{attack(8);draw(1)}},
shield:{name:'Starlit Guard',cost:1,type:'Skill',desc:'Gain 9 Block.',art:'shield',play:()=>block(9)},
star:{name:'Celestial Nova',cost:2,type:'Attack',desc:'Deal 17 damage.',art:'star',play:()=>attack(17)}
};

Object.assign(CARD_ART,{'slash':'assets/base/77c4e9418f65f5666c605bd1.webp','lotus':'assets/base/9b02d6c21c105ad8d249892b.webp','wolf':'assets/base/047f425e5196a54829d4561a.webp','moon':'assets/base/9de00f9ca81e1708e8b2bd5d.webp','veil':'assets/base/4becbfe369b9dfdb6973fbb1.webp'});

/* Authoritative standard Grimoire data: approved balance values, one definition per spell.
 * Replace the existing DECKS / C / standard-card assignment region before artSvg().
 * Starting lists are 15 cards, at most 2 copies and at most 2 healing cards.
 * Run loot is deliberately not capped by those starting-deck restrictions.
 */
const DECKS = {
  "poison": {
    "title": "Venom Grimoire",
    "icon": "☠",
    "tag": "Poison · attrition",
    "desc": "Stack venom, weaken the Archmage, and outlast it with antidotes and shields.",
    "cards": [
      "venomfang",
      "venomfang",
      "toxicmist",
      "toxicmist",
      "catalyst",
      "catalyst",
      "nightshade",
      "nightshade",
      "antidote",
      "antidote",
      "viperward",
      "viperward",
      "sting",
      "sting",
      "venomdraw"
    ]
  },
  "water": {
    "title": "Tidal Grimoire",
    "icon": "🌊",
    "tag": "Water · control",
    "desc": "Build flowing barriers, heal through damage, and unleash rising tidal force.",
    "cards": [
      "splash",
      "splash",
      "torrent",
      "torrent",
      "tidalguard",
      "tidalguard",
      "rainmend",
      "rainmend",
      "undertow",
      "undertow",
      "deepcurrent",
      "deepcurrent",
      "aquamirror",
      "aquamirror",
      "ebbflow"
    ]
  },
  "chaos": {
    "title": "Chaos Grimoire",
    "icon": "✦",
    "tag": "Chaos · risk / reward",
    "desc": "High-variance spells, explosive surges, and risky healing for daring players.",
    "cards": [
      "chaosbolt",
      "chaosbolt",
      "wildspark",
      "wildspark",
      "fracture",
      "fracture",
      "entropy",
      "chaosward",
      "chaosward",
      "fateheal",
      "fateheal",
      "voidrift",
      "voidrift",
      "roulette",
      "roulette"
    ]
  },
  "beast": {
    "title": "Beastmaster Grimoire",
    "icon": "🐾",
    "tag": "Beasts · summons",
    "desc": "Summon Athena, strengthen companion attacks, and defend until the pack overwhelms.",
    "cards": [
      "claw",
      "claw",
      "howl",
      "howl",
      "summonwolf",
      "summonwolf",
      "packguard",
      "packguard",
      "beastheal",
      "beastheal",
      "alpha",
      "alpha",
      "hunt",
      "hunt",
      "packtactics"
    ]
  },
  "melee": {
    "title": "Blade Grimoire",
    "icon": "⚔",
    "tag": "Melee · combos",
    "desc": "COMBO: Quick Cut adds 1 stack (+2 damage to later Quick Cuts). Heavy Blade spends all stacks for +4 damage each. Stacks reset at the start of your next turn. Build and spend combos in the same turn.",
    "cards": [
      "quickcut",
      "quickcut",
      "heavyblade",
      "heavyblade",
      "parry",
      "parry",
      "riposte",
      "riposte",
      "battleheal",
      "battleheal",
      "battlecry",
      "battlecry",
      "execute",
      "execute",
      "crescentfeint"
    ]
  },
  "ranger": {
    "title": "Ranger Grimoire",
    "icon": "🏹",
    "tag": "Ranger · precision",
    "desc": "Piercing arrows, marked targets, evasive guards, and healing herbs.",
    "cards": [
      "arrow",
      "arrow",
      "pierce",
      "pierce",
      "mark",
      "mark",
      "dodge",
      "dodge",
      "herbs",
      "herbs",
      "volley",
      "volley",
      "focusshot",
      "focusshot",
      "hunters_patience"
    ]
  }
};
let chosenDeck = 'poison';
const C = (name,cost,type,desc,art,play,grimoire) => ({name,cost,type,desc,art,play,grimoire});
Object.assign(CARDS, {
  venomfang: C("Venom Fang", 1, "Attack", "Deal 6 damage. Apply 1 Poison.", "poison", ()=>{attack(6);poison(1)}, "poison"),
  toxicmist: C("Toxic Mist", 2, "Skill", "Apply 2 Poison. Gain 5 Block.", "poison", ()=>{poison(2);block(5)}, "poison"),
  catalyst: C("Venom Bloom", 2, "Skill", "Apply 1 Poison. Then, if the enemy has 4 or more Poison, deal 5 damage.", "poison", ()=>{poison(1);if(state.enemyPoison>=4)attack(5)}, "poison"),
  nightshade: C("Nightshade", 1, "Skill", "Apply 1 Poison and 1 Weak.", "poison", ()=>{poison(1);weakEnemy(1)}, "poison"),
  antidote: C("Antidote", 1, "Skill", "Heal 7. Remove 1 Weak.", "heal", ()=>{heal(7);state.playerWeak=Math.max(0,state.playerWeak-1)}, "poison"),
  viperward: C("Viper Ward", 1, "Skill", "Gain 11 Block.", "guard", ()=>block(11), "poison"),
  sting: C("Viper Strike", 1, "Attack", "Deal 8 damage, or 12 if the enemy has 4 or more Poison.", "poison", ()=>attack(8+(state.enemyPoison>=4?4:0)), "poison"),
  venomdraw: C("Venom Insight", 0, "Skill", "Draw 1. Gain 2 Block.", "draw", ()=>{draw(1);block(2)}, "poison"),
  splash: C("Water Lance", 1, "Attack", "Deal 11 damage.", "water", ()=>attack(11), "water"),
  torrent: C("Torrent", 2, "Attack", "Deal 19 damage. Gain 5 Block.", "water", ()=>{attack(19);block(5)}, "water"),
  tidalguard: C("Tidal Barrier", 1, "Skill", "Gain 12 Block.", "water", ()=>block(12), "water"),
  rainmend: C("Healing Rain", 1, "Skill", "Heal 7. Gain 4 Block.", "heal", ()=>{heal(7);block(4)}, "water"),
  undertow: C("Undertow", 1, "Attack", "Deal 7 damage. Apply 1 Weak.", "water", ()=>{attack(7);weakEnemy(1)}, "water"),
  monsoon: C("Monsoon", 2, "Power", "Gain 2 Strength. Heal 3.", "water", ()=>{state.strength+=2;heal(3)}, "water"),
  deepcurrent: C("Deep Current", 1, "Skill", "Draw 2 cards.", "draw", ()=>draw(2), "water"),
  aquamirror: C("Aqua Mirror", 1, "Skill", "Gain 8 Block. Gain Ward, halving all attacks during the next enemy turn.", "water", ()=>{block(8);state.ward=true}, "water"),
  chaosbolt: C("Chaos Bolt", 1, "Attack", "Deal 6–12 random damage.", "chaos", ()=>attack(6+Math.floor(Math.random()*7)), "chaos"),
  wildspark: C("Wild Spark", 0, "Attack", "Deal 3 damage. Lose 2 HP.", "chaos", ()=>{attack(3);state.hp=Math.max(0,state.hp-2)}, "chaos"),
  fracture: C("Reality Fracture", 2, "Attack", "Deal 16 damage. Apply 1 Weak.", "chaos", ()=>{attack(16);weakEnemy(1)}, "chaos"),
  entropy: C("Entropy Engine", 2, "Power", "Gain 1 Strength. Lose 4 HP.", "chaos", ()=>{state.strength++;state.hp=Math.max(0,state.hp-4)}, "chaos"),
  chaosward: C("Void Shelter", 1, "Skill", "Gain 10 Block.", "guard", ()=>block(10), "chaos"),
  fateheal: C("Fateweave", 1, "Skill", "Heal 5–8 HP.", "heal", ()=>heal(5+Math.floor(Math.random()*4)), "chaos"),
  voidrift: C("Void Rift", 2, "Attack", "Deal 13 damage. Draw 1 card.", "chaos", ()=>{attack(13);draw(1)}, "chaos"),
  roulette: C("Arcane Roulette", 1, "Skill", "Draw 1. 50% chance to gain 1 mana.", "draw", ()=>{draw(1);if(Math.random()<.5)state.energy++}, "chaos"),
  claw: C("Spirit Claw", 1, "Attack", "Deal 10 damage.", "beast", ()=>attack(10), "beast"),
  howl: C("Pack Howl", 1, "Power", "Your companion gains 3 Pack Power for this battle, adding 3 damage to each of her attacks.", "beast", ()=>{state.packPower+=3;log('The pack grows stronger!')}, "beast"),
  summonwolf: C("Call Athena", 2, "Summon", "Summon Athena for 3 enemy turns. Each turn, she attacks for 7 base damage plus Pack Power and Strength. Summoning again refreshes her duration.", "beast", ()=>{state.summon=Math.max(state.summon,3);log('Athena joins the hunt!')}, "beast"),
  packguard: C("Pack Guard", 1, "Skill", "Gain 12 Block.", "beast", ()=>block(12), "beast"),
  beastheal: C("Wild Renewal", 1, "Skill", "Heal 8 HP.", "heal", ()=>heal(8), "beast"),
  alpha: C("Alpha Strike", 2, "Attack", "Deal 16 damage. If Athena is active, she immediately attacks for 7 damage plus Pack Power.", "beast", ()=>{attack(16);if(state.summon)attack(7+state.packPower)}, "beast"),
  hunt: C("Hunting Instinct", 1, "Attack", "Deal 8 damage. Apply 1 Weak.", "beast", ()=>{attack(8);weakEnemy(1)}, "beast"),
  spiritbond: C("Spirit Bond", 1, "Skill", "Heal 6. Draw 1.", "beast", ()=>{heal(6);draw(1)}, "beast"),
  quickcut: C("Quick Cut", 1, "Attack", "Deal 11 damage, plus 2 per existing Combo. Gain 1 Combo.", "melee", ()=>{attack(11+state.combo*2);state.combo++}, "melee"),
  heavyblade: C("Heavy Blade", 2, "Attack", "Deal 19 damage, plus 4 per Combo. Consume all Combo.", "melee", ()=>{attack(19+state.combo*4);state.combo=0}, "melee"),
  parry: C("Parry", 1, "Skill", "Gain 12 Block.", "guard", ()=>block(12), "melee"),
  riposte: C("Riposte", 1, "Attack", "Deal 9 damage. Gain 7 Block.", "melee", ()=>{attack(9);block(7)}, "melee"),
  battleheal: C("Second Wind", 1, "Skill", "Heal 8 HP.", "heal", ()=>heal(8), "melee"),
  battlecry: C("Battle Cry", 1, "Power", "Gain 2 Strength. Draw 1.", "melee", ()=>{state.strength+=2;draw(1)}, "melee"),
  execute: C("Execution", 2, "Attack", "Deal 24 damage, or 32 if the enemy has Weak.", "melee", ()=>attack(24+(state.enemyWeak?8:0)), "melee"),
  arrow: C("Moon Arrow", 1, "Attack", "Deal 11 damage.", "ranger", ()=>attack(11), "ranger"),
  pierce: C("Piercing Shot", 2, "Attack", "Deal 19 damage. Ignore enemy Block.", "ranger", ()=>attack(19,true), "ranger"),
  mark: C("Hunter’s Mark", 1, "Skill", "Apply 1 Weak. Draw 1.", "ranger", ()=>{weakEnemy(1);draw(1)}, "ranger"),
  dodge: C("Shadowstep", 1, "Skill", "Gain 12 Block.", "ranger", ()=>block(12), "ranger"),
  herbs: C("Moon Herbs", 1, "Skill", "Heal 8 HP.", "heal", ()=>heal(8), "ranger"),
  volley: C("Arrow Volley", 2, "Attack", "Deal 9 damage twice (18 total before battle modifiers).", "ranger", ()=>{attack(9);attack(9)}, "ranger"),
  focusshot: C("Focused Shot", 1, "Attack", "Deal 12 damage. Draw 1 card.", "ranger", ()=>{attack(12);draw(1)}, "ranger"),
  ebbflow: C("Ebb and Flow", 1, "Skill", "Gain 5 Block. If you already had Block, draw 1 card.", "shield", ()=>{const had=state.block>0;block(5);if(had)draw(1)}, "water"),
  packtactics: C("Pack Tactics", 1, "Skill", "Gain 5 Block. If a companion is active, deal 5 damage.", "wolf", ()=>{block(5);if(state.summon>0)attack(5)}, "beast"),
  crescentfeint: C("Crescent Feint", 1, "Attack", "Deal 6 damage. Gain 1 Combo.", "slash", ()=>{attack(6);state.combo++}, "melee"),
  hunters_patience: C("Hunter's Patience", 1, "Skill", "Gain 6 Block. Your next Ranger Attack card gains +3 damage on one hit.", "shield", ()=>{block(6);state.rangerFocus=(state.rangerFocus||0)+3}, "ranger")
});

// Card identity survives evolution and deck mixing. A looted standard card keeps
// its school too; unique loot is schoolless unless its definition declares one.
function cardGrimoire(id, card = CARDS[id]) {
  if (!card) return null;
  const baseId = typeof cardBaseId === 'function'
    ? cardBaseId(id, card) : (card.evolutionBaseId || id);
  return card.grimoire || CARDS[baseId]?.grimoire || null;
}

function runHasGrimoire(school, runState = state) {
  const ids = runState
    ? [...(runState.deck || []), ...(runState.hand || []), ...(runState.discard || [])]
    : (DECKS[chosenDeck]?.cards || []);
  return ids.some(id => cardGrimoire(id) === school);
}

function hasChaosMechanic() {
  return !!state && ((state.instability || 0) > 0 || (state.surgeBonus || 0) > 0 || runHasGrimoire('chaos'));
}

let moonPlayingCardId = null;
function resolveCardCast(id) {
  const card = CARDS[id];
  if (!card || !state) return;
  if (cardGrimoire(id, card) === 'chaos') {
    state.instability = Math.min(5, (state.instability || 0) + 1);
  }
  const previousCardId = moonPlayingCardId;
  moonPlayingCardId = id;
  try { card.play(); }
  finally { moonPlayingCardId = previousCardId; }
}

function consumeRangerFocusBonus() {
  const card = CARDS[moonPlayingCardId];
  if (!state || !state.rangerFocus || !card || card.type !== 'Attack' || cardGrimoire(moonPlayingCardId, card) !== 'ranger') return 0;
  const bonus = state.rangerFocus;
  state.rangerFocus = 0;
  return bonus;
}


function artSvg(kind){
 const motifs={
 poison:'<path d="M70 16 Q112 37 87 76 Q65 103 40 77 Q20 50 70 16Z" fill="#65c55c" stroke="#d6ff96" stroke-width="4"/><path d="M45 52 Q78 26 90 59 Q80 86 57 77Z" fill="#172b1d"/>',
 water:'<path d="M70 10 C48 47 18 67 42 94 C60 117 105 105 108 78 C111 55 81 31 70 10Z" fill="#42a8f9" stroke="#c9f8ff" stroke-width="4"/><path d="M49 83 Q65 54 93 69" fill="none" stroke="#f4ffff" stroke-width="7"/>',
 chaos:'<path d="M70 9 L85 48 128 56 91 78 102 117 70 96 35 117 46 78 11 56 54 48Z" fill="#ff60d3" stroke="#ffe79d" stroke-width="4"/><circle cx="70" cy="65" r="18" fill="#3c0c6a"/>',
 beast:'<circle cx="40" cy="46" r="12" fill="#d3a2ff"/><circle cx="67" cy="32" r="12" fill="#d3a2ff"/><circle cx="95" cy="45" r="12" fill="#d3a2ff"/><path d="M37 85 Q30 66 53 60 Q70 44 87 61 Q110 79 95 97 Q76 106 67 94 Q49 106 37 85" fill="#d3a2ff"/>',
 melee:'<path d="M66 10 L84 27 76 78 112 111 97 122 65 85 32 121 17 108 53 76 49 28Z" fill="#e9a45d" stroke="#fff0b6" stroke-width="4"/>',
 ranger:'<path d="M42 17 Q111 58 42 113" stroke="#ffdf95" stroke-width="8" fill="none"/><path d="M42 17 L42 113" stroke="#d9b5ff" stroke-width="3"/><path d="M12 65 L123 65 M109 53 L123 65 109 77" stroke="#d9f6ff" stroke-width="5" fill="none"/>',
 heal:'<path d="M70 104 Q9 67 30 33 Q52 12 70 40 Q88 12 110 33 Q131 67 70 104Z" fill="#ff8aca" stroke="#ffe6fb" stroke-width="4"/>',
 guard:'<path d="M70 9 L116 27 105 83 70 113 35 83 24 27Z" fill="#6a56bf" stroke="#ffe4a4" stroke-width="5"/>',
 draw:'<path d="M27 22 H98 V103 H27Z M40 12 H111 V92" stroke="#d5b5ff" stroke-width="6" fill="#41237d"/>'
 };
 return '<svg viewBox="0 0 140 125" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#773ac4"/><stop offset="1" stop-color="#120c36"/></radialGradient></defs><rect width="140" height="125" fill="url(#g)"/><circle cx="70" cy="62" r="54" stroke="#a974e9" stroke-dasharray="3 8" fill="none"/>'+ (motifs[kind]||motifs.chaos) +'<circle cx="119" cy="18" r="3" fill="#fff"/><circle cx="19" cy="96" r="2" fill="#fff"/></svg>';
}
function weakEnemy(n){state.enemyWeak+=n;log('Archmage gains '+n+' Weak!')}
function poison(n){state.enemyPoison+=n;log('Applied '+n+' Poison!')}
function selfDamage(n){state.hp=Math.max(1,state.hp-n);floatDamage(n,'player')}
function tickPoison(){if(!state||state.enemyHP<=0)return;if(state.enemyPoison>0){const d=state.enemyPoison;if(isWolfPack())wolfHit(d);else state.enemyHP=Math.max(0,state.enemyHP-d);if(isWeepingPetal()&&state.enemyHP<=0)petalLament();state.enemyPoison=Math.max(0,state.enemyPoison-2);floatDamage(d,'enemy');log('Poison deals '+d+' damage!')}}
function applyIncoming(raw){let incoming=Math.ceil(raw*(1+.4*state.playerWeak)*(state.playerVulnerableTurns>0?1.5:1));if(state.ward)incoming=Math.ceil(incoming/2);const absorbed=Math.min(state.block,incoming);state.block-=absorbed;const dmg=incoming-absorbed;state.hp=Math.max(0,state.hp-dmg);if(state.hp===0&&typeof hasLunarRelic==='function'&&hasLunarRelic('Charon Oath')&&!charonSpent){charonSpent=true;state.hp=1;log('☾ CHARON OATH! You survive the lethal blow.')}floatDamage(dmg,'player');impact('player');log('Enemy deals '+dmg+' damage!');return dmg}
function setupDeckPicker(){
 const box=document.getElementById('deckOptions');if(!box)return;
 box.replaceChildren();
 Object.entries(DECKS).forEach(([id,d])=>{
  const b=document.createElement('button');b.className='deck-option'+(id===chosenDeck?' selected':'');
  b.textContent=d.icon+' '+d.title;
  const small=document.createElement('small');small.textContent=d.tag;b.appendChild(small);
  b.onclick=()=>{chosenDeck=id;setupDeckPicker()};
  box.appendChild(b);
 });
 document.getElementById('deckDescription').textContent=DECKS[chosenDeck]?.desc||'Choose a grimoire';
}
const CUSTOM_STORAGE='moonlight_duel_custom_decks_v1';
function loadCustomDecks(){
 let data={};try{data=JSON.parse(localStorage.getItem(CUSTOM_STORAGE)||'{}')||{}}catch(e){}
 for(const k of Object.keys(DECKS))if(k.startsWith('custom_'))delete DECKS[k];
 for(const [id,d] of Object.entries(data)){
  if(!id.startsWith('custom_')||!d||!Array.isArray(d.cards)||d.cards.length!==15)continue;
  if(d.cards.some(c=>!CARDS[c]))continue;
  DECKS[id]={title:d.title||'Custom Deck',icon:'✦',tag:'Custom · '+(d.grimoires||[]).join(' + '),desc:'A custom 15-card deck.',cards:d.cards.slice()};
 }
 return data;
}
function saveCustomDeck(name,grimoires,cards,editingId){
 const stored=loadCustomDecks();
 const id=editingId&&stored[editingId]?editingId:'custom_'+Date.now();
 if(!stored[id]&&Object.keys(stored).length>=5)throw Error('Maximum 5 saved custom decks.');
 stored[id]={title:name.trim().slice(0,32),grimoires,cards};
 localStorage.setItem(CUSTOM_STORAGE,JSON.stringify(stored));
 loadCustomDecks();setupDeckPicker();chosenDeck=id;setupDeckPicker();
 return id;
}
function removeCustomDeck(id){
 const stored=loadCustomDecks();delete stored[id];localStorage.setItem(CUSTOM_STORAGE,JSON.stringify(stored));
 if(chosenDeck===id)chosenDeck='poison';loadCustomDecks();setupDeckPicker();
}
window.MoonDeckEditor={
 grimoires:()=>Object.fromEntries(Object.entries(DECKS).filter(([id])=>!id.startsWith('custom_')).map(([id,d])=>[id,{title:d.title,icon:d.icon,cardIds:[...new Set(d.cards)]}])),
 cards:()=>Object.fromEntries(Object.entries(CARDS).map(([id,c])=>[id,{name:c.name,cost:c.cost,type:c.type,desc:cardText(id,c),art:c.art}])),
 saved:()=>loadCustomDecks(),
 save:saveCustomDeck,remove:removeCustomDeck,
 openSelection:()=>{document.getElementById('startOverlay').classList.remove('hidden')},
 select:(id)=>{if(DECKS[id]){chosenDeck=id;setupDeckPicker()}}
};
loadCustomDecks();
let state=null,busy=false,hero='isa';
const $=id=>document.getElementById(id);
setupDeckPicker();
const rand=a=>a.sort(()=>Math.random()-.5);
function log(s){$('combatlog').textContent=s;clearTimeout(log.t);log.t=setTimeout(()=>$('combatlog').textContent='',2100)}
function floatDamage(n,target,good=false){let d=document.createElement('div');d.className='damage';d.textContent=(good?'+':'−')+n;d.style.left=target==='enemy'?'73%':'23%';d.style.top='45%';d.style.color=good?'#99ffca':'#ffe1a3';$('arena').appendChild(d);setTimeout(()=>d.remove(),900)}
function impact(target){let el=$(target==='enemy'?'enemyActor':'playerActor');el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');setTimeout(()=>el.classList.remove('shake'),380)}
function projectile(){let d=document.createElement('div');d.className='spell';$('arena').appendChild(d);setTimeout(()=>d.remove(),650)}
function attack(n,pierce=false){if(isKitsune()&&state.enemyDodge>0){state.enemyDodge--;log('✦ ILLUSION! Amethyst Kitsune dodged the attack!');const a=$('enemyActor');a.classList.remove('dodge-flash');void a.offsetWidth;a.classList.add('dodge-flash');return;} let extra=(state.surgeBonus||0);state.surgeBonus=0;extra+=consumeRangerFocusBonus();let dmg=Math.max(0,Math.ceil((n+extra+state.strength)*(1+.4*state.enemyWeak)));let absorbed=pierce?0:Math.min(state.enemyBlock,dmg);state.enemyBlock-=absorbed;dmg-=absorbed;if(isWolfPack())dmg=wolfHit(dmg);else state.enemyHP=Math.max(0,state.enemyHP-dmg);if(isWeepingPetal()&&state.enemyHP<=0)petalLament();bossPhaseUpdate();projectile();setTimeout(()=>impact('enemy'),300);floatDamage(dmg,'enemy');log('Hit for '+dmg+' damage'+(state.enemyWeak?' (Weak ×'+(1+.4*state.enemyWeak).toFixed(1)+')':'')+'!')}
function block(n){state.block+=n;log('A shimmering shield absorbs '+n+' damage.')}
function heal(n){let amt=Math.min(n,state.maxHP-state.hp);state.hp+=amt;if(amt)floatDamage(amt,'player',true)}
function draw(n){for(let i=0;i<n;i++){if(!state.deck.length){if(!state.discard.length)break;state.deck=rand(state.discard.splice(0));}state.hand.push(state.deck.pop())}}
function start(h){hero=h;state={hp:45,maxHP:45,enemyHP:250,enemyMax:250,block:0,enemyBlock:0,energy:3,strength:0,ward:false,summon:0,turn:1,deck:rand([...DECKS[chosenDeck].cards]),discard:[],hand:[],intentIndex:0,enemyPoison:0,enemyWeak:0,playerWeak:0,packPower:0,combo:0,bossPhase:1,bossPower:0,bossCharge:0,bossAction:0,lunarPhase:0,lunarProgress:0,lunarLast:"",lunarMana:0,lunarPlayerStrength:0,lunarBossStrength:0,lunarStrengthTurns:0};$('heroSprite').src=ART[h];$('heroName').textContent=h==='isa'?'Isa':'Rei';$('heroTitle').textContent=h==='isa'?'The Mooncaller':'The Eternal Archmage';$('hudPortrait').src=h==='isa'?HUD_ISA_PORTRAIT:HUD_REI_PORTRAIT;$('hudPortrait').alt=h==='isa'?'Isa portrait':'Rei portrait';$('playerLabel').textContent=(h==='isa'?'ISA':'REI')+' · '+DECKS[chosenDeck].title.toUpperCase();$('startOverlay').classList.add('hidden');$('resultOverlay').classList.add('hidden');busy=false;draw(6);render();log('The '+DECKS[chosenDeck].title+' awakens!')}
const MECHANIC_RULES={
 Attack:'Attack: deals damage. Enemy Block absorbs damage first unless the card says Ignore Block.',
 Skill:'Skill: a one-time effect when played.',
 Power:'Power: grants an effect for the rest of this battle unless specified.',
 Summon:'Summon: a companion attacks automatically at the start of each enemy turn while active.',
 Block:'Block: absorbs incoming damage. Your remaining Block resets at the start of your next turn.',
 Heal:'Heal: restores HP up to your maximum HP; excess healing is lost.',
 Weak:'Weak: each stack makes its target take 40% more damage from attacks (1 = ×1.4, 2 = ×1.8, 3 = ×2.2). Both heroes and enemies can be Weak. Weak decreases by 1 at the start of each new player turn.',
 Poison:'Poison: damages the enemy at the start of each enemy turn for its current stack count, then loses 1 stack. Poison bypasses Block.',
 Ward:'Ward: halves damage from every attack during the next enemy turn, rounded up, before Block absorbs it. Ward expires after that enemy turn.',
 Strength:'Strength: adds damage to each hit you deal; lasts for the battle.',
 Combo:'Combo: Quick Cut adds 1 stack and deals +2 damage per stack you already have. Heavy Blade adds +4 damage per stack, then consumes all stacks. Combo resets at the start of your next turn.',
 Draw:'Draw: add the stated number of cards from your deck to your hand; reshuffle your discard pile when the deck runs out. You must discard down to 7 cards before ending your turn.',
 Energy:'Energy: the number in the top-left is what the card costs to play. You regain 3 Energy at the start of each turn.',
 Companion:'Companion: Athena attacks at the start of enemy turns for 7 base damage plus Pack Power and Strength, for up to 3 turns. Summoning again refreshes duration.',
 Pierce:'Ignore Block: this attack deals damage directly to HP.',
 SelfDamage:'Self-damage: reduces your own HP and does not consume Block.',
};
function cardRules(id,c){const keys=['Energy',c.type];const desc=c.desc.toLowerCase();if(desc.includes('block'))keys.push('Block');if(desc.includes('heal'))keys.push('Heal');if(desc.includes('weak'))keys.push('Weak');if(desc.includes('poison'))keys.push('Poison');if(desc.includes('ward'))keys.push('Ward');if(desc.includes('strength'))keys.push('Strength');if(desc.includes('draw'))keys.push('Draw');if(desc.includes('energy'))keys.push('Energy');if(desc.includes('ignore block'))keys.push('Pierce');if(desc.includes('take 2 damage')||desc.includes('take 4 damage'))keys.push('SelfDamage');if(id==='quickcut'||id==='heavyblade')keys.push('Combo');if(['summonwolf','alpha','howl','wolf'].includes(id))keys.push('Companion');return [...new Set(keys)].map(k=>MECHANIC_RULES[k]).filter(Boolean).join('\n\n')}
function cardText(id,c){return c.desc;}
/* Canonical card information and confirmed, per-copy Spell Evolution.
 * Install in the main game script, before the map/reward IIFE.
 * Preview functions never play a card, roll RNG, or change the player's deck.
 */
const MOON_EVOLUTION_STAGES = ['','Stage I · Base','Stage II · Awakened','Stage III · Ascended'];
let moonEvolutionSequence = 0;

function cardBaseId(id, card = CARDS[id]) {
  if (!card) return id;
  if (card.evolutionBaseId && CARDS[card.evolutionBaseId]) return card.evolutionBaseId;
  // Compatibility with a card made by the earlier evolution implementation.
  if (card.evolutionStage > 1) {
    const originalName = card.name.replace(/\s*[✧✦]/gu, '').replace(/\s*·\s*(Awakened|Ascended)$/u, '').trim();
    const original = Object.keys(CARDS).find(key => !CARDS[key].evolutionStage && CARDS[key].name === originalName);
    if (original) return original;
  }
  return id;
}

function cardEvolutionStage(card) {
  return Math.max(1, Math.min(3, Number(card?.evolutionStage) || 1));
}

function cardEvolutionBonus(card) {
  if (!card || card.type !== 'Attack') return 0;
  return typeof card.evolutionDamageBonus === 'number'
    ? card.evolutionDamageBonus
    : 2 * (cardEvolutionStage(card) - 1);
}

function accurateCardEffect(id, card = CARDS[id]) {
  if (!card) return 'This spell is unavailable.';
  const baseId = cardBaseId(id, card);
  const bonus = cardEvolutionBonus(card);
  // These values match the actual play functions after the balance pass.
  // Write complete resulting effects, including conditional and multiple hits.
  const effects = {
    slash: () => `Deal ${12 + bonus} damage.`,
    bolt: () => `Deal ${8 + bonus} damage. Draw 1 card.`,
    star: () => `Deal ${17 + bonus} damage.`,
    venomfang: () => `Deal ${6 + bonus} damage. Apply 1 Poison.`,
    sting: () => `Deal ${8 + bonus} damage, or ${12 + bonus} if the enemy has 4 or more Poison.`,
    splash: () => `Deal ${11 + bonus} damage.`,
    torrent: () => `Deal ${19 + bonus} damage. Gain 5 Block.`,
    undertow: () => `Deal ${7 + bonus} damage. Apply 1 Weak.`,
    chaosbolt: () => `Deal ${6 + bonus}–${12 + bonus} random damage.`,
    wildspark: () => `Deal ${3 + bonus} damage. Lose 2 HP.`,
    fracture: () => `Deal ${16 + bonus} damage. Apply 1 Weak.`,
    voidrift: () => `Deal ${13 + bonus} damage. Draw 1 card.`,
    claw: () => `Deal ${10 + bonus} damage.`,
    alpha: () => `Deal ${16 + bonus} damage. If Athena is active, she immediately attacks for ${7 + bonus} damage plus Pack Power.`,
    hunt: () => `Deal ${8 + bonus} damage. Apply 1 Weak.`,
    quickcut: () => `Deal ${11 + bonus} damage, plus 2 per existing Combo. Gain 1 Combo.`,
    heavyblade: () => `Deal ${19 + bonus} damage, plus 4 per Combo. Consume all Combo.`,
    riposte: () => `Deal ${9 + bonus} damage. Gain 7 Block.`,
    execute: () => `Deal ${24 + bonus} damage, or ${32 + bonus} if the enemy has Weak.`,
    arrow: () => `Deal ${11 + bonus} damage.`,
    pierce: () => `Deal ${19 + bonus} damage. Ignore enemy Block.`,
    volley: () => `Deal ${9 + bonus} damage twice (${2 * (9 + bonus)} total before battle modifiers).`,
    focusshot: () => `Deal ${12 + bonus} damage. Draw 1 card.`,
    crescentfeint: () => `Deal ${6 + bonus} damage. Gain 1 Combo.`,
    loot_fang: () => `Deal ${10 + bonus} damage. Gain 3 Block.`,
    loot_comet: () => `Deal ${9 + bonus} damage. Draw 1 card.`,
    loot_blood: () => `Deal ${14 + bonus} damage. Heal 6 HP.`,
    loot_chains: () => `Deal ${11 + bonus} damage. Apply 2 Weak; Weak decreases by 1 each new player turn.`,
    loot_rupture: () => `Deal ${35 + bonus} damage. Apply 1 Weak.`,
    loot_requiem: () => `Deal ${18 + bonus} damage. Gain 6 Block.`,
    loot_cataclysm: () => `Deal ${14 + bonus} damage, or ${19 + bonus} if the enemy has Poison or Weak.`,
    loot_covenant: () => `Deal ${40 + bonus} damage. Lose 8 HP and gain 10 Corruption.`,
    // A few non-attacks need fuller wording than their original short labels.
    catalyst: () => 'Apply 1 Poison. Then, if the enemy has 4 or more Poison, deal 5 damage.',
    wolf: () => 'Summon Athena for 3 enemy turns. Each turn, she attacks for 7 base damage plus Pack Power and Strength.',
    summonwolf: () => 'Summon Athena for 3 enemy turns. Each turn, she attacks for 7 base damage plus Pack Power and Strength. Summoning again refreshes her duration.',
    howl: () => 'Your companion gains 3 Pack Power for this battle, adding 3 damage to each of her attacks.',
    veil: () => 'Gain 7 Block. Gain Ward, halving all attacks during the next enemy turn.',
    aquamirror: () => 'Gain 8 Block. Gain Ward, halving all attacks during the next enemy turn.'
  };
  if (effects[baseId]) return effects[baseId]();
  // Current card data owns the effect. Never fall back to the outdated text table.
  const base = CARDS[baseId] || card;
  const text = base.desc.replace(/\s*\[Stage [^\]]+\]/gu, '').trim();
  return bonus ? `${text} Evolution adds ${bonus} damage to each attack hit from this card.` : text;
}

function accurateCardRules(id, card = CARDS[id]) {
  if (!card) return [];
  const baseId = cardBaseId(id, card);
  const effect = accurateCardEffect(id, card);
  const rules = {
    ...MECHANIC_RULES,
    Energy: 'Mana: the number on the card is its cost to play. You normally regain 3 Mana each turn; buffs and Bind can change the amount.',
    Poison: 'Poison: at the start of the enemy turn, deal damage equal to the current Poison stacks, then remove 2 stacks. Poison bypasses Block.',
    Ward: 'Ward: halve each attack during the next enemy turn, rounding up, before Block absorbs damage. Ward expires after that enemy turn.',
    Combo: 'Combo: Quick Cut and Crescent Feint each add 1 Combo. Quick Cut deals 2 extra damage per Combo already held. Heavy Blade deals 4 extra damage per Combo and consumes every stack. Combo resets at the start of your next turn.',
    Companion: 'Companion: Athena attacks at the start of each enemy turn while active, for 7 base damage plus Pack Power and Strength. Call Athena refreshes her duration to 3 turns. Alpha Strike adds one immediate companion attack if she is active.',
    SelfDamage: 'HP cost: this bypasses your Block. Losing HP can defeat you if it reduces your HP to 0.',
    Corruption: 'Corruption: reaching 100 causes you to lose 30 HP and resets Corruption to 50. This loss can defeat you.',
    Instability: 'Instability: playing a Chaos card adds 1 stack, up to 5. Spend 5 stacks on Rupture (+6 damage to one next attack hit), Distortion (draw 1 card and gain 1 Mana), or Collapse (gain 8 Block). This works in mixed decks too.',
    RangerFocus: "Hunter's Patience: its bonus is stored until a Ranger Attack card deals a hit. Apply it once, even on a multi-hit card. Non-Ranger cards and automatic companion attacks do not spend it. Additional uses add to the stored bonus."
  };
  const keys = ['Energy', card.type];
  if (/block/i.test(effect)) keys.push('Block');
  if (/heal|restore/i.test(effect)) keys.push('Heal');
  if (/weak/i.test(effect)) keys.push('Weak');
  if (/poison/i.test(effect)) keys.push('Poison');
  if (/ward/i.test(effect)) keys.push('Ward');
  if (/strength/i.test(effect)) keys.push('Strength');
  if (/draw/i.test(effect)) keys.push('Draw');
  if (/combo/i.test(effect)) keys.push('Combo');
  if (/ignore.*block/i.test(effect)) keys.push('Pierce');
  if (/lose \d+ HP|take \d+ damage/i.test(effect)) keys.push('SelfDamage');
  if (/companion|athena|pack power/i.test(effect) || ['alpha','howl','wolf','summonwolf','packtactics'].includes(baseId)) keys.push('Companion');
  if (/corruption/i.test(effect)) keys.push('Corruption');
  const school = typeof cardGrimoire === 'function' ? cardGrimoire(id, card) : card.grimoire;
  if (school === 'chaos') keys.push('Instability');
  if (baseId === 'hunters_patience' || (school === 'ranger' && card.type === 'Attack')) keys.push('RangerFocus');
  const result = [...new Set(keys)].map(key => rules[key]).filter(Boolean);
  if (cardEvolutionBonus(card)) {
    result.push(`Spell Evolution: this copy is ${MOON_EVOLUTION_STAGES[cardEvolutionStage(card)]}. Its displayed attack damage already includes +${cardEvolutionBonus(card)} damage per hit. Its Mana cost and other effects are unchanged.`);
  }
  return result;
}

function cardPresentation(id, candidateCard) {
  const card = candidateCard || CARDS[id];
  if (!card) return null;
  const baseId = cardBaseId(id, card);
  const stage = cardEvolutionStage(card);
  const effect = accurateCardEffect(id, card);
  return {
    id, baseId, name: card.name, cost: card.cost, type: card.type,
    effect, rules: accurateCardRules(id, card), artId: baseId,
    art: card.art, grimoire: typeof cardGrimoire === 'function' ? cardGrimoire(id, card) : card.grimoire || null,
    rarity: card.rarity || 'Standard', stage,
    stageLabel: MOON_EVOLUTION_STAGES[stage],
    damageNote: /deal \d|attacks? for \d/i.test(effect)
      ? 'Shown damage is before Strength, Weak, enemy Block, and Dodge.' : ''
  };
}

function evolutionEligibility(id) {
  const card = CARDS[id];
  if (!card) return { eligible: false, reason: 'This spell is unavailable.' };
  if (cardEvolutionStage(card) >= 3) return { eligible: false, reason: 'Already Ascended (Stage III).' };
  if (card.type !== 'Attack') return { eligible: false, reason: 'This spell has no supported evolution yet. Choose an Attack card.' };
  return { eligible: true, reason: '' };
}

function cardPreviewSignature(presentation) {
  return JSON.stringify([presentation.baseId, presentation.name, presentation.cost, presentation.type, presentation.effect, presentation.stage]);
}

function makeEvolutionCandidate(id) {
  const eligibility = evolutionEligibility(id);
  if (!eligibility.eligible) return { ok: false, sourceId: id, reason: eligibility.reason };
  const previous = CARDS[id];
  const baseId = cardBaseId(id, previous);
  const base = CARDS[baseId];
  const stage = cardEvolutionStage(previous) + 1;
  const totalBonus = 2 * (stage - 1);
  const candidate = {
    ...previous,
    name: base.name + (stage === 2 ? ' · Awakened' : ' · Ascended'),
    evolutionStage: stage,
    evolutionBaseId: baseId,
    evolutionDamageBonus: totalBonus
  };
  // Resolve from the original play function once. Do not nest evolved wrappers.
  candidate.play = () => {
    const battle = state;
    battle.strength += totalBonus;
    try { base.play(); }
    finally { battle.strength -= totalBonus; }
  };
  candidate.desc = accurateCardEffect(id, candidate);
  const before = cardPresentation(id);
  const after = cardPresentation(id, candidate);
  return {
    ok: true, sourceId: id, card: candidate, before, after,
    sourceSignature: cardPreviewSignature(before),
    changes: ['+2 damage to every hit made by this card.', 'Mana cost and all other effects stay the same.', 'Only this one card copy evolves.']
  };
}

function listRunCardCopies(runState = state) {
  if (!runState) return [];
  const copies = [];
  const counts = new Map();
  for (const pileName of ['deck','hand','discard']) {
    const pile = runState[pileName] || [];
    pile.forEach((id, index) => {
      if (!CARDS[id]) return;
      const copyNumber = (counts.get(id) || 0) + 1;
      counts.set(id, copyNumber);
      copies.push({ id, pileName, index, copyNumber, presentation: cardPresentation(id), ...evolutionEligibility(id) });
    });
  }
  return copies;
}

function commitEvolution(copy, candidate, runState = state) {
  const pile = runState?.[copy?.pileName];
  if (!Array.isArray(pile) || pile[copy.index] !== copy.id) return { ok: false, error: 'That card changed. Select a card again.' };
  if (!candidate?.ok || candidate.sourceId !== copy.id) return { ok: false, error: 'Choose an eligible card and review its upgrade first.' };
  const fresh = makeEvolutionCandidate(copy.id);
  if (!fresh.ok) return { ok: false, error: fresh.reason };
  if (fresh.sourceSignature !== candidate.sourceSignature) return { ok: false, error: 'This spell changed. Review its upgrade again before confirming.' };
  let newId;
  do { newId = 'evolved_' + (++moonEvolutionSequence); } while (CARDS[newId]);
  CARDS[newId] = fresh.card;
  pile[copy.index] = newId;
  return { ok: true, id: newId, before: fresh.before, after: cardPresentation(newId) };
}

function replaceRunCardCopy(copy, newId, runState = state) {
  const pile = runState?.[copy?.pileName];
  if (!Array.isArray(pile) || pile[copy.index] !== copy.id) return { ok: false, error: 'That card changed. Select a card again.' };
  if (!CARDS[newId]) return { ok: false, error: 'The replacement spell is unavailable.' };
  const before = cardPresentation(copy.id);
  pile[copy.index] = newId;
  return { ok: true, id: newId, before, after: cardPresentation(newId) };
}

function installCardPresentation() {
  // Hand cards, inspection, and reward previews must use the same current text.
  cardText = (id, card = CARDS[id]) => accurateCardEffect(id, card);
  cardRules = (id, card = CARDS[id]) => accurateCardRules(id, card).join('\n\n');
  MECHANIC_RULES.Poison = 'Poison: damages the enemy at the start of each enemy turn for its current stack count, then loses 2 stacks. Poison bypasses Block.';
  MECHANIC_RULES.Combo = 'Combo: Quick Cut and Crescent Feint each add 1 stack. Quick Cut adds 2 damage per existing stack. Heavy Blade adds 4 damage per stack and consumes all stacks. Combo resets at the start of your next turn.';
}
installCardPresentation();

const CHAOS_FRAME='assets/base/64c7d3c0fe29441f9b728a69.webp';
const CHAOS_SPELL_ART={"chaosbolt": "assets/base/5b86f9405c0bdcffb2aed855.webp", "wildspark": "assets/base/de2d6dbc2b296b82db7a1638.webp", "fracture": "assets/base/630480ccd7a5478e5b2dfbd1.webp", "entropy": "assets/base/2d96a516866f5510e134335a.webp", "chaosward": "assets/base/0f3621b72613e3962c87441c.webp", "fateheal": "assets/base/9fa69112528b49b140d3b1f9.webp", "voidrift": "assets/base/a8d63e0cbebdc1aa785b737b.webp", "roulette": "assets/base/168b4fa452d28d1bbb895905.webp"};
const POISON_FRAME='assets/base/8d688888b042eb34b32ac212.webp';
const POISON_SPELL_ART={"venomfang": "assets/base/c13d883cb4a0d1373ef1ba85.webp", "toxicmist": "assets/base/7a36d0f128d91209fff2e947.webp", "catalyst": "assets/base/c7f416a9d309df88661dc68c.webp", "nightshade": "assets/base/9c814cbe6d6cf7dba128e6c8.webp", "viperward": "assets/base/0dd5167b27d331b7904f7916.webp", "antidote": "assets/base/8f4240f2e17499dde69f87f0.webp", "sting": "assets/base/da284c41cb9560deb89234fb.webp", "venomdraw": "assets/base/4e79395d39f2f510be7b17e0.webp"};
const HUD_ISA_PORTRAIT='assets/base/9faa605c076e5dac214565a5.png';const HUD_REI_PORTRAIT='assets/base/a97f45344a43ad4a41e6d406.png';
// Lunar Fate: advances every three completed player turns. Each phase rolls one event.
const LUNAR_PHASES=[
 ['🌑','New Moon'],['🌒','Waxing Crescent'],['🌓','First Quarter'],['🌔','Waxing Gibbous'],
 ['🌕','Full Moon'],['🌖','Waning Gibbous'],['🌗','Last Quarter'],['🌘','Waning Crescent']
];
function lunarDisplay(){
 let el=$('lunarFate');if(!el){el=document.createElement('div');el.id='lunarFate';el.setAttribute('aria-live','polite');$('intent').insertAdjacentElement('afterend',el)}
 const p=LUNAR_PHASES[state.lunarPhase];
 el.innerHTML='<div class="lunar-phase-title">'+p[0]+' '+p[1]+'</div><div class="lunar-phase-sub">LUNAR SHIFT IN '+(3-state.lunarProgress)+' TURN'+(3-state.lunarProgress===1?'':'S')+'</div>'+(state.lunarLast?'<div class="lunar-phase-sub">'+state.lunarLast+'</div>':'');
}
let lunarOverlayTimer;
function showLunarShift(phase,description,target){
 let el=$('lunarShiftOverlay');if(!el){el=document.createElement('div');el.id='lunarShiftOverlay';el.setAttribute('role','status');el.setAttribute('aria-live','assertive');document.body.appendChild(el)}
 const p=LUNAR_PHASES[phase];el.innerHTML='<div class="lunar-shift-content"><div class="lunar-shift-moon">'+p[0]+'</div><div class="lunar-shift-heading">'+p[1].toUpperCase()+'</div><div class="lunar-shift-event">'+description+'</div></div>';
 clearTimeout(lunarOverlayTimer);el.classList.remove('lunar-show');void el.offsetWidth;el.classList.add('lunar-show');
 lunarOverlayTimer=setTimeout(()=>el.classList.remove('lunar-show'),2800);
}

function lunarShift(){
 state.lunarPhase=(state.lunarPhase+1)%LUNAR_PHASES.length;
 const phase=state.lunarPhase,target=Math.random()<.5?'player':'boss';
 const onPlayer=target==='player';let description='';
 switch(phase){
 case 0: // Defensive moonlight
  if(onPlayer){state.block+=8;state.ward=true;description='Player gains 8 Block and Ward';}
  else {state.enemyBlock+=12;description='Archmage gains 12 Block';}break;
 case 1: // Growth
  if(onPlayer){state.lunarMana=1;description='Player gains +1 mana next turn';}
  else {state.bossPower+=2;description='Archmage gains +2 permanent attack power';}break;
 case 2: // Fracture
  if(onPlayer){state.block=Math.max(0,state.block-8);state.hp=Math.max(1,state.hp-4);description='Player loses up to 8 Block and 4 HP';}
  else {state.enemyBlock=Math.max(0,state.enemyBlock-8);state.enemyHP=Math.max(0,state.enemyHP-4);description='Archmage loses up to 8 Block and 4 HP';}break;
 case 3: // Strength
  if(onPlayer){state.strength+=2;state.lunarPlayerStrength+=2;description='Player gains +2 Strength for 3 turns';}
  else {state.bossPower+=2;state.lunarBossStrength+=2;description='Archmage gains +2 attack power for 3 turns';}break;
 case 4: // Full moon surge
  if(onPlayer){state.strength+=2;state.lunarPlayerStrength+=2;state.block+=8;description='Player gains +2 Strength for 3 turns and 8 Block';}
  else {state.bossPower+=2;state.lunarBossStrength+=2;state.enemyBlock+=8;description='Archmage gains +2 attack power for 3 turns and 8 Block';}break;
 case 5: // Weak here is increased damage taken in this game
  if(onPlayer){state.playerWeak+=1;description='Player suffers 1 Weak (increased incoming damage)';}
  else {state.enemyWeak+=1;description='Archmage suffers 1 Weak (increased incoming damage)';}break;
 case 6: // Eclipse
  if(onPlayer){state.block=0;state.hp=Math.max(1,state.hp-6);description='Player loses all Block and 6 HP';}
  else {state.enemyBlock=0;state.enemyHP=Math.max(0,state.enemyHP-6);description='Archmage loses all Block and 6 HP';}break;
 case 7: // Final whisper
  if(onPlayer){state.hp=Math.max(1,state.hp-3);state.playerWeak+=1;description='Player loses 3 HP and gains 1 Weak';}
  else {state.enemyHP=Math.max(0,state.enemyHP-3);state.enemyWeak+=1;description='Archmage loses 3 HP and gains 1 Weak';}break;
 }
 if(phase===3||phase===4)state.lunarStrengthTurns=3;
 state.lunarLast=(onPlayer?'ADVENTURER':'BOSS')+': '+description;
 showLunarShift(phase,description,target);
 log(LUNAR_PHASES[phase][0]+' '+LUNAR_PHASES[phase][1]+' — '+description+'!');
}
function lunarAdvance(){
 // Expire three-turn temporary Strength bonuses before the next lunar roll.
 if(state.lunarStrengthTurns>0)state.lunarStrengthTurns--;
 if(state.lunarStrengthTurns===0&&state.lunarPlayerStrength){state.strength=Math.max(0,state.strength-state.lunarPlayerStrength);state.lunarPlayerStrength=0;}
 if(state.lunarStrengthTurns===0&&state.lunarBossStrength){state.bossPower=Math.max(0,state.bossPower-state.lunarBossStrength);state.lunarBossStrength=0;}
 state.lunarProgress++;
 if(state.lunarProgress>=3){state.lunarProgress=0;lunarShift();}
}
/* All spell surfaces resolve the illustration from the card, never its deck.
 * Art and frame data are embedded by the build so the game stays self-contained.
 */
const BLADE_FRAME = "assets/base/e68c8ae12af2504e369f38dc.webp";
const NEW_SPELL_ART = {"quickcut": "assets/base/839f5753e8a42d295dce7a4b.webp", "heavyblade": "assets/base/abcc894dfa0f79e66eecfca7.webp", "parry": "assets/base/998721b1cb28981f0e86a718.webp", "riposte": "assets/base/514c410e75b8b254b53bb102.webp", "battleheal": "assets/base/b336980fa321c14e75f0edd9.webp", "battlecry": "assets/base/421930194bb059682ecbfe81.webp", "execute": "assets/base/5fc02a8af90cdce2327b5aa9.webp", "crescentfeint": "assets/base/9f0a25b86d3d7cdabd88e210.webp", "ebbflow": "assets/base/aff49af1fcb663e97f4e7cfb.webp", "packtactics": "assets/base/284687c2911be3a7d789170b.webp", "hunters_patience": "assets/base/196d1a0341b5c67c7061feee.webp", "bolt": "assets/base/4855a4c04df2122820b7e5a9.webp", "shield": "assets/base/e970d21101554670123ed967.webp", "star": "assets/base/c0147537d547e7c927bd324c.webp", "pierce": "assets/base/f87e0621dbcf8de5af6bb512.webp", "volley": "assets/base/984a64c64f759d68b22945f0.webp", "herbs": "assets/base/c5c29e0e58cf6f36986645c5.webp", "loot_fang": "assets/base/55deaa744b97ac300d13e607.webp", "loot_comet": "assets/base/1bf6539ebc65e5c0d613fca0.webp", "loot_tide": "assets/base/e616191d15cc3ec42686b83f.webp", "loot_blood": "assets/base/b2ef729ed4f773dbb37474c1.webp", "loot_chains": "assets/base/ed8508ee13532b379b59259b.webp", "loot_rupture": "assets/base/1a01e3860ca2936dd53a029e.webp", "loot_sanctuary": "assets/base/276f8dc99342c58ed8715c25.webp", "loot_requiem": "assets/base/35ca6c9d359d2987b4c65c89.webp", "loot_cataclysm": "assets/base/703323b0fb57abebea31b75c.webp", "loot_chronos": "assets/base/2fa7a5604c5d553d9088d65e.webp", "loot_covenant": "assets/base/a17e4b86b4ccde6f988410b4.webp"};

// The original Beast sheet had been assigned in sheet order. Match each motif
// to its spell while keeping every approved illustration.
const BEAST_MATCHED_ART = {
  claw: BEAST_SPELL_ART.beastheal,
  howl: BEAST_SPELL_ART.spiritbond,
  summonwolf: BEAST_SPELL_ART.claw,
  packguard: BEAST_SPELL_ART.summonwolf,
  beastheal: BEAST_SPELL_ART.alpha,
  alpha: BEAST_SPELL_ART.hunt,
  hunt: BEAST_SPELL_ART.howl,
  spiritbond: BEAST_SPELL_ART.packguard
};
const SPELL_ART = Object.freeze({
  ...CHAOS_SPELL_ART, ...POISON_SPELL_ART, ...TIDAL_SPELL_ART,
  splash: TIDAL_SPELL_ART.torrent, torrent: TIDAL_SPELL_ART.splash,
  ...RANGER_SPELL_ART, ...BEAST_MATCHED_ART,
  slash: CARD_ART.slash, lotus: CARD_ART.lotus, wolf: CARD_ART.wolf,
  moon: CARD_ART.moon, veil: CARD_ART.veil,
  ...NEW_SPELL_ART
});
const CARD_VISUAL_THEMES = {
  chaos: {frame: CHAOS_FRAME, frameClass: 'arcane-card'},
  poison: {frame: POISON_FRAME, frameClass: 'poison-card'},
  water: {frame: TIDAL_FRAME, frameClass: 'tidal-card'},
  beast: {frame: BEAST_FRAME, frameClass: 'beast-card'},
  melee: {frame: BLADE_FRAME, frameClass: 'blade-card'},
  ranger: {frame: RANGER_FRAME, frameClass: 'ranger-card'},
  lunar: {frame: CHAOS_FRAME, frameClass: 'lunar-card'}
};
const LEGACY_CARD_VISUAL_SCHOOLS = {slash:'melee', wolf:'beast'};

function getCardVisual(id, card = CARDS[id]) {
  // A comparison can contain a preview card that is not registered yet.
  const baseId = card?.baseId || card?.artId || cardBaseId(id, card);
  const original = CARDS[baseId] || card;
  const school = card?.grimoire || original?.grimoire || LEGACY_CARD_VISUAL_SCHOOLS[baseId] || 'lunar';
  const theme = CARD_VISUAL_THEMES[school] || CARD_VISUAL_THEMES.lunar;
  return {
    baseId, school, ...theme,
    artwork: SPELL_ART[baseId] || CARD_ART[original?.art] || null,
    rarity: String(card?.rarity || original?.rarity || 'standard').toLowerCase()
  };
}

function createCardArtwork(id, {card = CARDS[id], className = '', lazy = true} = {}) {
  const visual = getCardVisual(id, card);
  const node = document.createElement(visual.artwork ? 'img' : 'span');
  node.className = 'md-card-artwork' + (className ? ' ' + className : '');
  node.dataset.cardArt = visual.baseId;
  if (visual.artwork) {
    node.src = visual.artwork;
    node.alt = '';
    node.loading = lazy ? 'lazy' : 'eager';
    node.decoding = 'async';
    node.draggable = false;
    // The five original sprite-sheet crops contain thin painted dividers.
    // Inset the displayed artwork within its existing clipping container.
    if (['slash','lotus','wolf','moon','veil'].includes(visual.baseId)) node.dataset.insetArt = 'true';
  } else {
    // Defensive fallback for future cards; all current cards have raster art.
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = artSvg(card?.art || 'chaos');
  }
  return node;
}

function cardArtElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderCardFace(element, id, card = CARDS[id]) {
  const visual = getCardVisual(id, card);
  element.classList.add('chaos-card', visual.frameClass);
  element.dataset.cardId = id;
  element.dataset.cardArt = visual.baseId;
  element.dataset.rarity = visual.rarity;
  if (card.name.length >= 16) element.classList.add('chaos-title-long');
  else if (card.name.length >= 12) element.classList.add('chaos-title-medium');
  element.style.setProperty('--chaos-frame', 'url("' + visual.frame + '")');
  const artwork = cardArtElement('div', 'chaos-art');
  artwork.appendChild(createCardArtwork(id, {card, lazy:false}));
  element.append(
    artwork,
    cardArtElement('div', 'chaos-cost', card.cost),
    cardArtElement('strong', 'chaos-name', card.name),
    cardArtElement('em', 'chaos-type', card.type),
    cardArtElement('div', 'chaos-desc', cardText(id, card))
  );
}

function fillAvailableCardButton(button, id, card, count) {
  button.type = 'button';
  button.className = 'md-editor-card';
  button.title = 'Add ' + card.name + ' to your deck. ' + card.desc;
  const artwork = cardArtElement('span', 'md-editor-card-art');
  artwork.appendChild(createCardArtwork(id));
  const copy = cardArtElement('span', 'md-editor-card-copy');
  copy.append(
    cardArtElement('strong', 'md-editor-card-name', card.name),
    cardArtElement('small', 'md-editor-card-meta', card.cost + ' Mana · ' + card.type + ' · ' + count + '/2 copies'),
    cardArtElement('span', 'md-editor-card-effect', card.desc)
  );
  button.append(artwork, copy);
}

function fillSelectedCardButton(button, id, card, index) {
  button.type = 'button';
  button.className = 'md-selected-card';
  button.title = 'Remove ' + card.name + '. ' + card.desc;
  button.setAttribute('aria-label', 'Remove card ' + (index + 1) + ': ' + card.name);
  const artwork = cardArtElement('span', 'md-selected-card-art');
  artwork.appendChild(createCardArtwork(id));
  const copy = cardArtElement('span', 'md-selected-card-copy', (index + 1) + '. ' + card.name);
  copy.appendChild(cardArtElement('small', '', card.cost + ' Mana · ' + card.type));
  const remove = cardArtElement('span', 'md-selected-card-remove', '×');
  remove.setAttribute('aria-hidden', 'true');
  button.append(artwork, copy, remove);
}

function renderPileCards(container, ids) {
  container.replaceChildren();
  const counts = new Map();
  ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
  for (const [id, count] of counts) {
    const card = CARDS[id];
    if (!card) continue;
    const button = cardArtElement('button', 'md-pile-card');
    button.type = 'button';
    button.title = 'Inspect ' + card.name;
    const artwork = cardArtElement('span', 'md-pile-card-art');
    artwork.appendChild(createCardArtwork(id));
    const copy = cardArtElement('span', 'md-pile-card-copy');
    copy.append(
      cardArtElement('strong', '', card.name + ' × ' + count),
      cardArtElement('small', '', card.cost + ' Mana · ' + card.type),
      cardArtElement('span', '', cardText(id, card))
    );
    button.append(artwork, copy);
    button.addEventListener('click', () => openInspect(id));
    container.appendChild(button);
  }
  if (!counts.size) container.textContent = 'Empty pile';
}


function render(){if(!state)return;lunarDisplay();$('topHP').textContent=state.hp+'/'+state.maxHP;$('playerHP').textContent=state.hp+'/'+state.maxHP;$('enemyHP').textContent=isWolfPack()?'3 WOLVES':state.enemyHP+'/'+state.enemyMax;$('playerFill').style.width=100*state.hp/state.maxHP+'%';$('enemyFill').style.width=100*state.enemyHP/state.enemyMax+'%';const sharedEnemyBar=$('enemyFill').closest('.hpbar')||$('enemyFill').parentElement.parentElement;sharedEnemyBar.classList.toggle('hide-pack-health',isWolfPack());$('enemyHP').classList.toggle('hide-pack-health',isWolfPack());$('playerBlock').textContent='✧ '+state.block+' Block';$('enemyBlock').textContent='✧ '+state.enemyBlock+' Block';$('energy').textContent=state.energy+'/3';const surge=document.getElementById('chaosSurge');if(surge){surge.hidden=!hasChaosMechanic()||!state||state.hp<=0;surge.dataset.stacks=state.instability||0;surge.querySelectorAll('button').forEach(b=>b.disabled=(state.instability||0)<5)}$('deckCount').textContent=state.deck.length;$('discardCount').textContent=state.discard.length;$('intent').replaceChildren();const intentAction=document.createElement('span');intentAction.className='intent-action';intentAction.textContent='ENEMY INTENT · '+bossIntent().label;const intentPhase=document.createElement('span');intentPhase.className='intent-phase';intentPhase.textContent=isSeraphine()?'MOON MINI-BOSS · BLOOD HUNGER / LIFESTEAL':isWolfPack()?'STAR ENCOUNTER · BLEED / BIND':isEclipseMoth()?'STAR ENCOUNTER · LUNAR MAGIC':isWeepingPetal()?'STAR ENCOUNTER · CURSE / WEAKNESS':isKitsune()?'STAR ENCOUNTER · TRICKSTER': 'BOSS '+bossPhaseName();$('intent').append(intentAction,intentPhase);$('arena').classList.toggle('boss-enraged',!isKitsune()&&!isWolfPack()&&!isWeepingPetal()&&!isEclipseMoth()&&state.bossPhase===2);$('arena').classList.toggle('boss-final',!isKitsune()&&!isWolfPack()&&!isWeepingPetal()&&!isEclipseMoth()&&state.bossPhase===3);$('enemyLabel').textContent=isSeraphine()?'LADY SERAPHINE':isWolfPack()?'THORNBOUND WOLF PACK':isEclipseMoth()?'ECLIPSE MOTH':isWeepingPetal()?'WEEPING PETAL':isKitsune()?'AMETHYST KITSUNE':'SHADOW ARCHMAGE';$('enemyActor').classList.toggle('kitsune-encounter',isKitsune());$('enemyActor').classList.toggle('weeping-encounter',isWeepingPetal());$('enemyActor').classList.toggle('moth-encounter',isEclipseMoth());$('enemyActor').classList.toggle('seraphine-encounter',isSeraphine());const enemyPortrait=$('enemyActor').querySelector('img');let bloodFx=$('seraphineBloodFx');if(!bloodFx){bloodFx=document.createElement('div');bloodFx.id='seraphineBloodFx';bloodFx.className='seraphine-blood';bloodFx.innerHTML='<i class="blood-drip"></i>'.repeat(6);$('enemyActor').appendChild(bloodFx);}let pack=$('wolfPackArt');if(isWolfPack()){if(!pack){pack=document.createElement('div');pack.id='wolfPackArt';pack.className='wolf-pack-art';$('enemyActor').appendChild(pack);}enemyPortrait.style.visibility='hidden';pack.style.display='flex';pack.replaceChildren();state.wolves.forEach((hp,i)=>{const unit=document.createElement('button');unit.type='button';unit.className='wolf-unit'+(hp<=0?' defeated':'')+(state.wolfTarget===i?' selected':'');unit.disabled=hp<=0;unit.title='Thornbound Wolf · '+hp+'/'+(state.wolfMaxHP||35)+' HP · Click to target';unit.innerHTML='<img src="'+WOLF_ART+'" alt="Thornbound Wolf"><div class="wolf-health-ui"><div class="wolf-health-title">THORNBOUND WOLF</div><div class="wolf-health-track"><div class="wolf-health-fill" style="width:'+(hp/(state.wolfMaxHP||35)*100)+'%"></div></div><span>'+hp+'/'+(state.wolfMaxHP||35)+'</span></div>';unit.onclick=()=>{state.wolfTarget=i;render()};pack.appendChild(unit)});}else{enemyPortrait.style.visibility='';if(pack)pack.style.display='none';}if(isSeraphine()||isKitsune()||isWeepingPetal()||isEclipseMoth()){
 const kind=isSeraphine()?'seraphine':isEclipseMoth()?'moth':isWeepingPetal()?'weeping':'kitsune';
 if(enemyPortrait.dataset.monster!==kind){enemyPortrait.dataset.originalSrc=enemyPortrait.dataset.originalSrc||enemyPortrait.src;enemyPortrait.src=isSeraphine()?SERAPHINE_ART:isEclipseMoth()?ECLIPSE_MOTH_ART:isWeepingPetal()?WEEPING_PETAL_ART:KITSUNE_ART;enemyPortrait.dataset.monster=kind;enemyPortrait.alt=isSeraphine()?'Lady Seraphine, the Blood Countess':isEclipseMoth()?'Eclipse Moth, terrifying lunar creature':isWeepingPetal()?'Weeping Petal, ghostly cherry blossom spirit':'Amethyst Kitsune, nine-tailed fox spirit';}
 }else if(enemyPortrait.dataset.monster==='kitsune'||enemyPortrait.dataset.monster==='weeping'||enemyPortrait.dataset.monster==='moth'||enemyPortrait.dataset.monster==='seraphine'){enemyPortrait.src=enemyPortrait.dataset.originalSrc;enemyPortrait.dataset.monster='archmage';enemyPortrait.alt='Shadow Archmage';} const oldPackStatus=$('wolfPackStatus');if(oldPackStatus)oldPackStatus.remove();if(isWolfPack()){const status=document.createElement('span');status.id='wolfPackStatus';status.className='status-chip';status.textContent='🐺 '+state.wolves.filter(h=>h>0).length+' wolves · 🩸 Bleed '+state.bleedTurns+' turns'+(state.bindTurns?' · ⛓ Bind':'');$('statusRow').appendChild(status)}$('endTurn').disabled=busy||state.hand.length>7;$('endTurn').textContent=state.hand.length>7?'Discard '+(state.hand.length-7)+' Card'+(state.hand.length-7===1?'':'s'):'☾ End Turn';$('handCount').textContent='Hand '+state.hand.length+'/7'+(state.hand.length>7?' · DISCARD '+(state.hand.length-7):'');$('statusRow').innerHTML=(isWeepingPetal()&&state.playerVulnerableTurns?'<span class="status-chip">🌸 Vulnerable '+state.playerVulnerableTurns+' turns</span>':'')+(isKitsune()&&state.enemyDodge?'<span class="status-chip">✦ Kitsune Dodge · 1 attack</span>':'')+(state.enemyPoison?'<span class="status-chip">☠ Enemy Poison '+state.enemyPoison+'</span>':'')+(state.enemyWeak?'<span class="status-chip">✦ Enemy Weak '+state.enemyWeak+' · ×'+(1+.4*state.enemyWeak).toFixed(1)+'</span>':'')+(state.playerWeak?'<span class="status-chip">✦ Your Weak '+state.playerWeak+' · ×'+(1+.4*state.playerWeak).toFixed(1)+'</span>':'')+(chosenDeck==='melee'?'<span class="status-chip" title="Quick Cut builds Combo. Each stack adds 2 to later Quick Cuts; Heavy Blade uses all stacks for +4 each. Resets next turn.">⚔ Combo '+state.combo+' · Heavy Blade bonus +'+(state.combo*4)+'</span>':'');let hand=$('hand');hand.replaceChildren();state.hand.forEach((id,i)=>{let c=CARDS[id],b=document.createElement('div');b.className='card';b.setAttribute('role','button');b.tabIndex=0;b.setAttribute('aria-disabled',String(busy||(state.hand.length<=7&&c.cost>state.energy)));b.classList.toggle('discard-choice',state.hand.length>7);b.title=(state.hand.length>7?'CLICK TO DISCARD — ':'')+c.name+'\n'+cardText(id,c)+'\n\n'+cardRules(id,c);renderCardFace(b,id,c);b.addEventListener('click',()=>state.hand.length>7?discardFromHand(i):play(i));b.addEventListener('keydown',e=>{if(e.target===b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();state.hand.length>7?discardFromHand(i):play(i)}});const inspect=document.createElement('button');inspect.type='button';inspect.className='inspect-trigger';inspect.textContent='ⓘ';inspect.title='Inspect '+c.name;inspect.setAttribute('aria-label','Inspect '+c.name+' — read card effects and rules');inspect.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();openInspect(id)});b.appendChild(inspect);hand.appendChild(b)})}
function discardFromHand(i){if(busy||state.hand.length<=7)return;const id=state.hand.splice(i,1)[0];state.discard.push(id);log('Discarded '+CARDS[id].name+' · '+state.hand.length+'/7 cards');render()}
document.addEventListener('DOMContentLoaded',()=>{for(const [id,t] of [['surgeRupture','rupture'],['surgeDistortion','distortion'],['surgeCollapse','collapse']])document.getElementById(id)?.addEventListener('click',()=>surgeAction(t))});
function surgeAction(type){if(busy||!state||state.instability<5||!hasChaosMechanic())return;state.instability=0;if(type==='rupture')state.surgeBonus=6;else if(type==='distortion'){draw(1);state.energy++}else block(8);render()}
function play(i){if(busy||!state||state.hp<=0||state.enemyHP<=0)return;if(state.hand.length>7){log('Choose a card to discard first.');return;}let id=state.hand[i],c=CARDS[id];if(!c||c.cost>state.energy)return;state.energy-=c.cost;state.hand.splice(i,1);state.discard.push(id);resolveCardCast(id);render();if(!resolveEnemyDefeat('Your spell')&&state.hp<=0)finish(false)}
function finish(win){busy=true;render();setTimeout(()=>{$('resultTitle').textContent=win?'✦ VICTORY ✦':'☾ DEFEAT ☽';$('resultText').textContent=win?(state.enemyType==='archmage'?'The Shadow Archmage has fallen. The moonlit ruins are yours.':'Your enemy has fallen. The lunar path awaits.'):'The darkness overcame your spellcaster. Try another combination of cards.';$('resultOverlay').classList.remove('hidden')},700)}
// Shadow Archmage: deterministic, visible boss phases. The next action is always shown.
const KITSUNE_ART='assets/base/4cf40d9a6b7bb08a981bbedd.webp';
const WEEPING_PETAL_ART='assets/base/c0701cff4fbb677c0f24646d.webp';
const ECLIPSE_MOTH_ART='assets/base/1df8cf5ef22ceefcd4b5d960.webp';
const SERAPHINE_ART='assets/base/807162e76d360431f75f5fbd.webp';
function isSeraphine(){return !!(state&&state.enemyType==='seraphine')}
function seraphineIntent(){
 const turn=state.bossAction;
 if(state.enemyHP<=state.enemyMax*.40&&!state.bloodFeastUsed)return {kind:'bloodfeast',label:'🩸 BLOOD FEAST · 22 damage + heal 10 HP'};
 const moves=[
  {kind:'kiss',label:'🩸 Crimson Kiss · 12 damage + lifesteal 12 HP'},
  {kind:'letting',label:'⚔ Bloodletting · 16 damage + Bleed 3 × 2 turns'},
  {kind:'veil',label:'✧ Sanguine Veil · Gain 15 Block'}
 ];return moves[turn%moves.length];
}
function seraphineTurn(a){
 const strike=(damage)=>{
   const before=state.hp;
   const dealt=applyIncoming(damage+(state.bloodHunger>=3?5:0));
   if(state.bloodHunger>=3){state.bloodHunger=0;log('🩸 BLOOD HUNGER unleashed! +5 attack damage.')}
   if(dealt>0)state.bloodHunger=Math.min(3,state.bloodHunger+1);
   return dealt;
 };
 if(a.kind==='kiss'){
   const dealt=strike(12);
   const healed=Math.min(12,state.enemyMax-state.enemyHP);
   state.enemyHP+=healed;
   log('🩸 Crimson Kiss: '+dealt+' damage and '+healed+' HP restored.');
 }else if(a.kind==='letting'){
   strike(16);state.bleedTurns=2;state.bleedDamage=3;
   log('🩸 Bloodletting: Bleed 3 for two turns!');
 }else if(a.kind==='veil'){
   state.enemyBlock+=15;log('✧ Sanguine Veil: Seraphine gains 15 Block.');
 }else if(a.kind==='bloodfeast'){
   state.bloodFeastUsed=true;strike(22);
   const healed=Math.min(10,state.enemyMax-state.enemyHP);
   state.enemyHP+=healed;log('🩸 BLOOD FEAST! '+healed+' HP restored.');
 }
}
function isEclipseMoth(){return !!(state&&state.enemyType==='moth')}
function mothIntent(){const moves=[
 {kind:'moondust',label:'☽ Moon Dust · 8 damage + Vulnerable (1 turn)'},
 {kind:'distortion',label:'◈ Lunar Distortion · Advance lunar clock by 1'},
 {kind:'wings',label:'✧ Eclipse Wings · 8 damage + 10 Block'},
 {kind:'frenzy',label:'☾ Lunar Frenzy · 16 damage at Full/New Moon, otherwise 9'}
 ];return moves[state.bossAction%moves.length]}
function executeMothIntent(a){
 if(a.kind==='moondust'){applyIncoming(8);state.playerVulnerableTurns=Math.max(state.playerVulnerableTurns,1);log('☽ Moon Dust: Vulnerable for 1 turn!')}
 else if(a.kind==='distortion'){state.lunarProgress++;if(state.lunarProgress>=3){state.lunarProgress=0;lunarShift()}log('◈ Lunar Distortion accelerates the lunar cycle!')}
 else if(a.kind==='wings'){state.enemyBlock+=10;applyIncoming(8);log('✧ Eclipse Wings: +10 Block!')}
 else{const phaseName=(LUNAR_PHASES[state.lunarPhase]||[]).join(' ').toLowerCase();const empowered=phaseName.includes('full')||phaseName.includes('new');applyIncoming(empowered?16:9);log('☾ Lunar Frenzy! '+(empowered?'16':'9')+' damage!')}
}
function isWeepingPetal(){return !!(state&&state.enemyType==='weeping')}
function petalIntent(){const moves=[{kind:'petalstorm',label:'🌸 Petal Storm · 20 damage'},{kind:'embrace',label:'✧ Sorrow’s Embrace · 2 Weak for 2 turns'},{kind:'touch',label:'☽ Withering Touch · 8 damage + Vulnerable for 2 turns'}];return moves[state.bossAction%moves.length]}
function executePetalIntent(a){if(a.kind==='petalstorm'){log('🌸 PETAL STORM! Cursed petals cut through the air!');applyIncoming(20)}else if(a.kind==='embrace'){state.playerWeak=Math.max(state.playerWeak,2);log('✧ SORROW’S EMBRACE! You are Weakened for two turns.')}else{applyIncoming(8);state.playerVulnerableTurns=Math.max(Number(state.playerVulnerableTurns)||0,3);log('☽ WITHERING TOUCH! Vulnerable for two turns.')}}
function petalLament(){if(!isWeepingPetal()||state.enemyHP>0||state.petalLamentDone)return;state.petalLamentDone=true;log('🌸 FINAL LAMENT! Her last petals lash out for 5 damage (Block protects you).');applyIncoming(5);if(state.hp<=0)log('Final Lament was fatal!')}
function isKitsune(){return !!(state&&state.enemyType==='kitsune')}
function kitsuneIntent(){const moves=[{kind:'phantom',d:11,label:'✦ Phantom Tail · 11 × 2 + Dodge (1 hit)'},{kind:'bite',d:17,label:'⚔ Moonfang Bite · 17 damage'},{kind:'foxfire',d:14,label:'☄ Violet Foxfire · 14 damage'},{kind:'phantom',d:11,label:'✦ Phantom Tail · 11 × 2 + Dodge (1 hit)'}];return moves[state.bossAction%moves.length]}
function executeKitsuneIntent(a){if(a.kind==='phantom'){log('PHANTOM TAIL! The Kitsune strikes twice and shimmers into an illusion.');applyIncoming(a.d);if(state.hp>0)applyIncoming(a.d);state.enemyDodge=1;}else{log(a.kind==='bite'?'The Kitsune lunges with a savage bite!':'Violet foxfire erupts!');applyIncoming(a.d)}}
function bossPhaseName(){return state.bossPhase===1?'PHASE I · CHALLENGER':state.bossPhase===2?'PHASE II · AWAKENING':'PHASE III · FINAL STAND'}
function bossPhaseUpdate(){if(isSeraphine()||isEclipseMoth()||isWeepingPetal()||isWolfPack())return;
 if(state.enemyType&&state.enemyType!=='archmage')return;
 const next=state.enemyHP<=state.enemyMax*.35?3:state.enemyHP<=state.enemyMax*.70?2:1;
 if(next>state.bossPhase){state.bossPhase=next;state.bossAction=0;state.bossCharge=0;
 log(next===2?'⚡ The Archmage awakens! Double strikes begin.':'☾ FINAL STAND! The Archmage prepares Eclipse!');
 const i=$('intent');i.classList.remove('boss-phase-flash');void i.offsetWidth;i.classList.add('boss-phase-flash');}
}
const WOLF_ART='assets/base/fcab079f2d22e9d441b693e5.webp';
function isWolfPack(){return !!state&&state.enemyType==='wolfpack'}
function wolfIntent(){const living=state.wolves.filter(h=>h>0).length;const turn=state.bossAction+1;return {kind:'wolfpack',label:(turn%3===0?'⛓ Bind · -1 mana next turn + ':'🐺 Rending Bite · 6 damage + 2 Bleed × 2 turns · ')+living+' wolves'}}
function wolfSync(){state.enemyHP=state.wolves.reduce((a,b)=>a+b,0)}
function wolfHit(damage){let i=state.wolfTarget;if(state.wolves[i]<=0)i=state.wolves.findIndex(h=>h>0);if(i<0)return 0;const hit=Math.min(state.wolves[i],damage);state.wolves[i]-=hit;wolfSync();if(state.wolves[i]===0){log('🐺 Thornbound Wolf '+(i+1)+' defeated!');state.wolfTarget=state.wolves.findIndex(h=>h>0)}return hit}
function wolfTurn(){const living=state.wolves.filter(h=>h>0).length;const bind=state.bossAction%3===2;for(let i=0;i<living&&state.hp>0;i++){applyIncoming(6);state.bleedTurns=2;state.bleedDamage=2;log('🐺 Rending Bite! Bleed for 2 turns.')}if(bind){state.bindTurns=1;log('⛓ BIND! Your next turn has one less mana.')} }
function bossIntent(){if(isSeraphine())return seraphineIntent();if(isEclipseMoth())return mothIntent();if(isWeepingPetal())return petalIntent();if(isWolfPack())return wolfIntent();
 if(isKitsune())return kitsuneIntent();
 if(state.bossPhase===1){const seq=[{kind:'strike',d:13,label:'⚔ Shadow Strike · 13 damage'},{kind:'ward',b:11,label:'✧ Dark Ward · 11 Block'},{kind:'hex',d:12,w:1,label:'☄ Soulfire · 12 damage + 1 Weak'},{kind:'double',d:8,label:'⚔ Twin Fang · 8 × 2'}];return seq[state.bossAction%seq.length]}
 if(state.bossPhase===2){const seq=[{kind:'double',d:10,label:'⚔ Twin Fang · 10 × 2'},{kind:'sunder',d:15,label:'⛓ Sunder · Halve Block, then 15 damage'},{kind:'ritual',b:9,label:'✧ Dark Ritual · 9 Block, +2 future attack damage'},{kind:'hex',d:17,w:1,label:'☄ Soulfire · 17 damage + 1 Weak'}];return seq[state.bossAction%seq.length]}
 const seq=[{kind:'charge',label:'☾ Eclipse Charging · Ultimate next turn'},{kind:'eclipse',d:28,label:'☄ ECLIPSE · 28 damage (Ward and Block work)'},{kind:'double',d:12,label:'⚔ Final Judgment · 12 × 2'},{kind:'sunder',d:19,label:'⛓ Shattered Guard · Halve Block, then 19 damage'},{kind:'ritual',b:7,label:'✧ Dark Ritual · 7 Block, +2 future attack damage'}];return seq[state.bossAction%seq.length]
}
function executeBossIntent(a){if(isSeraphine()){seraphineTurn(a);return;}if(isEclipseMoth()){executeMothIntent(a);return;}if(isWeepingPetal()){executePetalIntent(a);return;}if(isWolfPack()){wolfTurn();return;}
 if(isKitsune()){executeKitsuneIntent(a);return}
 const power=state.bossPower;
 if(a.kind==='ward'){state.enemyBlock+=a.b;log('Archmage gains '+a.b+' Block.');}
 else if(a.kind==='ritual'){state.enemyBlock+=a.b;state.bossPower+=2;log('Dark Ritual! Boss gains '+a.b+' Block and +2 attack power.');}
 else if(a.kind==='charge'){log('The moon darkens! ECLIPSE strikes next turn.');}
 else if(a.kind==='sunder'){state.block=Math.ceil(state.block/2);log('Sunder shatters half your Block!');applyIncoming(a.d+power);}
 else if(a.kind==='double'){applyIncoming(a.d+power);if(state.hp>0)applyIncoming(a.d+power);}
 else if(a.kind==='hex'){applyIncoming(a.d+power);if(state.hp>0)state.playerWeak+=a.w;}
 else applyIncoming(a.d+power);
}
function resolveEnemyDefeat(source){
 if(!state||state.enemyHP>0)return false;
 if(isWeepingPetal())petalLament();
 if(state.hp<=0){log('The final effect was fatal.');finish(false)}
 else{log('✦ '+source+' defeated the enemy!');finish(true)}
 return true;
}
function enemyTurn(){if(busy||!state)return;if(state.hand.length>7){log('Discard '+(state.hand.length-7)+' card(s) before ending your turn!');render();return;}
 busy=true;render();log(isSeraphine()?'Lady Seraphine laughs as blood gathers in her palms...':isWolfPack()?'The Thornbound Wolf pack surrounds you...':isEclipseMoth()?'The Eclipse Moth unfolds its cursed wings...':isWeepingPetal()?'Weeping Petal drifts toward you...':isKitsune()?'Amethyst Kitsune takes her turn...':'The Shadow Archmage takes its turn...');
 setTimeout(()=>{if(state.summon>0){state.summon--;let d=7+state.packPower+state.strength;attack(d-state.strength);log('Athena strikes!');if(resolveEnemyDefeat('Athena'))return}
 tickPoison();
 if(resolveEnemyDefeat('Poison'))return;
 bossPhaseUpdate();render();
 setTimeout(()=>{const action=bossIntent();try{executeBossIntent(action)}catch(err){console.error('Enemy action error:',err);log('Enemy action recovered; battle continues.')}state.ward=false;state.bossAction++;state.intentIndex++;render();if(state.hp<=0){finish(false);return}
 setTimeout(()=>{state.turn++;state.block=0;state.enemyBlock=0;lunarAdvance();if(resolveEnemyDefeat('Lunar magic'))return;if((isWolfPack()||isSeraphine())&&state.bleedTurns>0){state.hp=Math.max(0,state.hp-state.bleedDamage);state.bleedTurns--;log('🩸 Bleed deals '+state.bleedDamage+' damage!');if(state.hp<=0){finish(false);return;}}state.energy=Math.max(0,3+state.lunarMana-(isWolfPack()&&state.bindTurns>0?1:0));if(isWolfPack())state.bindTurns=0;state.lunarMana=0;state.playerWeak=Math.max(0,state.playerWeak-1);state.playerVulnerableTurns=Math.max(0,(Number(state.playerVulnerableTurns)||0)-1);state.enemyWeak=Math.max(0,state.enemyWeak-1);state.combo=0;draw(2);bossPhaseUpdate();busy=false;render();log('Turn '+state.turn+' · Draw 2 · '+(isWolfPack()?'THORNBOUND WOLF PACK':isWeepingPetal()?'WEEPING PETAL':isKitsune()?'AMETHYST KITSUNE':bossPhaseName()))},450)},500)},400)
}
document.querySelectorAll('[data-hero]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.hero)));$('endTurn').addEventListener('click',enemyTurn);$('restartBtn').addEventListener('click',()=>{$('startOverlay').classList.remove('hidden');$('resultOverlay').classList.add('hidden')});$('again').addEventListener('click',()=>{$('resultOverlay').classList.add('hidden');$('startOverlay').classList.remove('hidden')});$('helpBtn').addEventListener('click',()=>$('info').classList.toggle('hidden'));$('closeInfo').addEventListener('click',()=>$('info').classList.add('hidden'));for(let i=0;i<22;i++){let e=document.createElement('span');e.className='petal';e.textContent='✿';e.style.left=Math.random()*100+'%';e.style.top=-Math.random()*600+'px';e.style.animationDuration=6+Math.random()*9+'s';e.style.animationDelay=-Math.random()*10+'s';e.style.opacity=.3+Math.random()*.5;$('petals').appendChild(e)}
