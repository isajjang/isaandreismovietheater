
(function(){
const popup=document.createElement('div');popup.id='pileInfo';popup.style.cssText='display:none;position:fixed;inset:0;z-index:9999;background:#080316d9;align-items:center;justify-content:center;padding:18px';
popup.innerHTML='<div style="width:min(440px,95vw);background:#211038;border:1px solid #d3a0e5;border-radius:16px;padding:25px;text-align:center;box-shadow:0 0 35px #8b4ac966"><h2 style="font-family:Cinzel;color:#ffe4b8" id="pileTitle"></h2><div id="pileItems" style="line-height:1.8;color:#e9d8fa"></div><button id="closePile" style="background:#50287d;color:white;border:1px solid #c7a1ed;border-radius:9px;padding:12px 30px;cursor:pointer">Close</button></div>';
document.body.appendChild(popup);
function inspect(type){
 if(!state)return;
 const list=type==='deck'?state.deck:state.discard;
 document.getElementById('pileTitle').textContent=(type==='deck'?'Draw Pile':'Discard Pile')+' · '+list.length;
 renderPileCards(document.getElementById('pileItems'),list);
 popup.style.display='flex';
}
document.querySelector('.pile-deck').addEventListener('click',()=>inspect('deck'));
document.querySelector('.pile-discard').addEventListener('click',()=>inspect('discard'));
document.getElementById('closePile').addEventListener('click',()=>popup.style.display='none');
popup.addEventListener('click',e=>{if(e.target===popup)popup.style.display='none'});
})();
