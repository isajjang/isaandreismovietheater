
(function(){
 const $=id=>document.getElementById(id);
 const api=window.MoonDeckEditor;
 const launch=$('moonLaunch'),editor=$('moonDeckModal');
 let chosen=[],cards=[],editing=null;
 const grim=api.grimoires(),catalog=api.cards();
 const isHeal=id=>/heal|regenerat|recover|restore|mend|antidote|lifesteal/i.test(catalog[id]?.desc||'');
 function healCount(){return cards.filter(isHeal).length}
 function owner(id){return chosen.find(g=>grim[g].cardIds.includes(id))}
 function status(t){$('moonDeckStatus').textContent=t}
 function openEditor(){launch.classList.add('hidden');editor.classList.remove('hidden');window.MoonlightSoundtrack?.setMode('deck');draw()}
 function draw(){
  $('moonGrimoires').replaceChildren();
  for(const [id,g] of Object.entries(grim)){
   const b=document.createElement('button');b.className=chosen.includes(id)?'active':'';
   b.textContent=g.icon+' '+g.title;b.onclick=()=>{if(chosen.includes(id)){chosen=chosen.filter(x=>x!==id);cards=cards.filter(c=>chosen.some(g=>grim[g].cardIds.includes(c)))}else if(chosen.length<2)chosen.push(id);else{status('Only two Grimoires allowed.');return}draw()};
   $('moonGrimoires').appendChild(b)
  }
  const available=$('moonAvailableCards');available.replaceChildren();
  const ids=[...new Set(chosen.flatMap(g=>grim[g].cardIds))];
  ids.forEach(id=>{
   const c=catalog[id];if(!c)return;
   const count=cards.filter(x=>x===id).length;
   const b=document.createElement('button');b.disabled=cards.length>=15||count>=2||(isHeal(id)&&healCount()>=2);
   fillAvailableCardButton(b,id,c,count);
   b.onclick=()=>{cards.push(id);draw()};available.appendChild(b);
  });
  const list=$('moonSelectedCards');list.replaceChildren();
  cards.forEach((id,i)=>{const c=catalog[id];const b=document.createElement('button');fillSelectedCardButton(b,id,c,i);b.onclick=()=>{cards.splice(i,1);draw()};list.appendChild(b)});
  $('moonDeckCount').textContent='Your Deck · '+cards.length+'/15 · Healing '+healCount()+'/2';
  const saved=$('moonSavedDecks');saved.replaceChildren();
  Object.entries(api.saved()).forEach(([id,d])=>{const b=document.createElement('button');b.textContent='✎ '+d.title;b.onclick=()=>{editing=id;chosen=[...d.grimoires];cards=[...d.cards];$('moonDeckName').value=d.title;draw();status('Editing '+d.title)};saved.appendChild(b)});
 }
 function validate(){
  if(!$('moonDeckName').value.trim())return 'Enter a deck name.';
  if(chosen.length!==2)return 'Select exactly two Grimoires.';
  if(cards.length!==15)return 'Your deck needs exactly 15 cards.';
  if(new Set(cards).size===0)return 'Choose cards.';
  if(cards.some(id=>cards.filter(x=>x===id).length>2))return 'Only two copies per card.';
  if(healCount()>2)return 'Only two healing cards.';
  for(const g of chosen){const unique=grim[g].cardIds;const owned=cards.filter(id=>unique.includes(id)&&!chosen.some(other=>other!==g&&grim[other].cardIds.includes(id)));if(owned.length<3)return 'At least 3 cards from each Grimoire.'}
  return null;
 }
 function save(play){
  const error=validate();if(error){status(error);return}
  try{const id=api.save($('moonDeckName').value,chosen,[...cards],editing);editing=id;status('Saved! Your custom deck is ready.');if(play){editor.classList.add('hidden');api.select(id);api.openSelection()}else draw()}
  catch(e){status(e.message)}
 }
 $('moonDeckSave').onclick=()=>save(false);
 $('moonDeckPlay').onclick=()=>save(true);
 $('moonDeckClear').onclick=()=>{editing=null;cards=[];chosen=[];draw();status('Cleared.')};
 $('moonDeckClose').onclick=()=>{editor.classList.add('hidden');launch.classList.remove('hidden')};
 $('moonLaunchDuel').onclick=()=>{launch.classList.add('hidden');api.openSelection()};
 $('moonLaunchDeck').onclick=openEditor;
 $('moonLaunchStory').onclick=()=>alert('Story mode is coming soon. Duel mode is playable now.');
 $('moonLaunchCollection').onclick=()=>alert('Collection is coming soon. Use Deck Builder to browse the available cards.');
 $('moonLaunchSettings').onclick=()=>{const btn=$('moonMusicToggle');if(btn)btn.click();else alert('Music controls appear in the lower-right corner.')};
 // Always show the title menu at first launch, while retaining the existing character selection.
 draw();
})();
