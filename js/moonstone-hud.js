/* Decorate the existing live counters; keep the same deck/discard buttons. */
(() => {
  'use strict';
  function install() {
    const mana = document.getElementById('energy');
    const manaShell = mana?.closest('.energy');
    const zone = document.querySelector('.lower .energyzone');
    const deck = document.querySelector('.pile-deck');
    const discard = document.querySelector('.pile-discard');
    if (!manaShell || !zone || !deck || !discard || zone.dataset.moonstoneHud === 'ready') return;
    zone.dataset.moonstoneHud = 'ready';
    manaShell.classList.add('moonstone-energy');
    manaShell.querySelector('small')?.remove();
    const stone = document.createElement('img');
    stone.src = 'assets/ui/mana-moonstone.png';
    stone.alt = '';
    stone.setAttribute('aria-hidden', 'true');
    stone.className = 'moonstone-art';
    stone.draggable = false;
    manaShell.prepend(stone);
    const piles = document.createElement('div');
    piles.className = 'moonstone-piles';
    for (const [button, label, file] of [[deck, 'Deck', 'deck-pile.png'], [discard, 'Discard', 'discard-pile.png']]) {
      button.classList.add('moonstone-pile');
      button.querySelector('.pile-art')?.remove();
      const art = document.createElement('img');
      art.src = 'assets/ui/' + file;
      art.alt = '';
      art.setAttribute('aria-hidden', 'true');
      art.className = 'moonstone-pile-art';
      art.draggable = false;
      button.prepend(art);
      const caption = document.createElement('span');
      caption.className = 'moonstone-pile-caption';
      caption.textContent = label;
      button.appendChild(caption);
      piles.appendChild(button);
    }
    zone.appendChild(piles);

    function updateNames() {
      manaShell.setAttribute('aria-label', 'Mana ' + mana.textContent.replace('/', ' of '));
      manaShell.title = 'Mana · ' + mana.textContent;
      for (const [button, id, label] of [[deck, 'deckCount', 'Draw pile'], [discard, 'discardCount', 'Discard pile']]) {
        const number = document.getElementById(id)?.textContent || '0';
        button.setAttribute('aria-label', label + ' · ' + number + ' cards. Open to inspect.');
        button.title = label + ' · ' + number + ' cards';
      }
    }
    const counterObserver = new MutationObserver(updateNames);
    for (const id of ['energy', 'deckCount', 'discardCount']) {
      const counter = document.getElementById(id);
      if (counter) counterObserver.observe(counter, { childList: true, characterData: true, subtree: true });
    }
    updateNames();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
