
(function(){
  function mobile(){return matchMedia('(pointer:coarse)').matches||innerWidth<=850}
  function centerMap(){
    if(!mobile())return;
    var map=document.getElementById('rogueMap'), sc=document.getElementById('mapScroll');
    if(!map||!sc||!map.classList.contains('visible'))return;
    if(!sc.dataset.mobileCentered){sc.scrollLeft=Math.max(0,(sc.scrollWidth-sc.clientWidth)/2);sc.dataset.mobileCentered='1'}
  }
  function init(){
    var map=document.getElementById('rogueMap'), sc=document.getElementById('mapScroll');
    if(!map||!sc)return;
    new MutationObserver(function(){if(map.classList.contains('visible')){sc.dataset.mobileCentered='';requestAnimationFrame(centerMap)}}).observe(map,{attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',function(){if(mobile()){sc.dataset.mobileCentered='';requestAnimationFrame(centerMap)}},{passive:true});
    if(map.classList.contains('visible'))centerMap();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
