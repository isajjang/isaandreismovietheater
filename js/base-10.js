
(()=>{
 let hero='isa';
 const menu=document.getElementById('moonTestMenu');
 const open=()=>{menu.classList.remove('hidden');document.getElementById('moonTestExit').hidden=true};
 document.getElementById('moonTestOpen').addEventListener('click',open);
 document.getElementById('moonTestClose').addEventListener('click',()=>menu.classList.add('hidden'));
 document.querySelectorAll('[data-test-hero]').forEach(btn=>btn.addEventListener('click',()=>{
  hero=btn.dataset.testHero;
  document.querySelectorAll('[data-test-hero]').forEach(b=>b.classList.toggle('selected',b===btn));
 }));
 document.querySelectorAll('[data-test-enemy]').forEach(btn=>btn.addEventListener('click',()=>{
  if(!window.MoonTestArena){alert('Test arena unavailable');return}
  window.MoonTestArena.launch(btn.dataset.testEnemy,hero);
 }));
 document.getElementById('moonTestExit').addEventListener('click',()=>{window.MoonTestArena.home()});
})();
