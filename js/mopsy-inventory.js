/* Moonlight Duel — illustrated inventory. Items belong to a run; previews are isolated. */
(() => {
  'use strict';
  const item = (name, file, description, use, rarity = 'Common') => Object.freeze({ name, art: 'assets/items/' + file + '.png', description, use, rarity });
  const DEFINITIONS = Object.freeze({
    elixir: item('Healing Elixir', 'healing-elixir', 'Restore 20 HP, up to your maximum health.', 'Drink elixir'),
    focus: item('Focus Draught', 'focus-draught', 'Begin your next battle with 1 extra Mana on the opening turn. Only one Focus Draught can be prepared at a time.', 'Prepare draught'),
    reroll: item('Card Reroll', 'card-reroll', 'Choose one card copy in your deck, then replace it with a new spell. Inspect both effects before confirming. Your deck size stays the same.', 'Choose a card'),
    card: item('Card Pack', 'card-pack', 'Discover a spell and choose 1 to add to your deck. Your deck may grow beyond 15 cards.', 'Open card pack'),
    relic: item('Mystery Lunar Relic', 'mystery-relic', 'Unveil a random moon-named relic. Its passive effect lasts for this run. Stronger relics are rarer.', 'Unveil relic', 'Rare'),
    satchel: item('Supply Satchel', 'supply-satchel', 'Open for 1 random consumable: a Healing Elixir, Focus Draught, Purifying Incense, or a rare Lunar Catalyst.', 'Open satchel'),
    incense: item('Purifying Incense', 'purifying-incense', 'Remove 25 Lunar Corruption. Excess purification is lost.', 'Burn incense'),
    catalyst: item('Lunar Catalyst', 'lunar-catalyst', 'Evolve one eligible Attack card by one stage. Compare its current and upgraded effects before confirming. Cancel to keep your catalyst.', 'Evolve a spell', 'Rare')
  });
  const ALIASES = { healing: 'elixir', 'healing-elixir': 'elixir', restorative: 'elixir', 'focus-draught': 'focus', 'card-reroll': 'reroll', 'card-pack': 'card', 'mystery-relic': 'relic', 'supply-satchel': 'satchel', 'purifying-incense': 'incense', 'lunar-catalyst': 'catalyst' };
  const RELIC_CUTOUTS = Object.freeze({
    'Io Ember': 'assets/relics/io-ember.png',
    'Europa Pearl': 'assets/relics/europa-pearl.png',
    'Callisto Shield': 'assets/relics/callisto-shield.png',
    'Enceladus Tear': 'assets/relics/enceladus-tear.png',
    'Titan Heart': 'assets/relics/titan-heart.png',
    'Triton Fang': 'assets/relics/triton-fang.png',
    'Ganymede Crown': 'assets/relics/ganymede-crown.png',
    'Miranda Mirror': 'assets/relics/miranda-mirror.png',
    'Charon Oath': 'assets/relics/charon-oath.png',
    "Rhea's Veil": 'assets/relics/rheas-veil.png'
  });
  const ORDER = Object.keys(DEFINITIONS);
  let dialog = null, overlay = null, ui = null, activeTab = 'items', selection = null;
  let testSession = null, previousFocus = null, closeCallback = null, operation = null, statusMessage = '';
  const bridge = () => window.MDMopsyBridge;
  const normalize = id => ALIASES[id] || id;
  const make = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
  function installRelicCutouts() {
    const artwork = window.MDRewardArt;
    if (!artwork || typeof artwork.relic !== 'function' || artwork.relic.moonlightCutouts) return;
    const originalRelic = artwork.relic;
    const renderRelic = name => {
      const source = Object.prototype.hasOwnProperty.call(RELIC_CUTOUTS, name) ? RELIC_CUTOUTS[name] : null;
      if (!source) return originalRelic.call(artwork, name);
      const image = make('img', 'md-art-sprite md-relic-art md-relic-cutout');
      image.src = source; image.alt = ''; image.draggable = false; image.decoding = 'async';
      image.dataset.relicName = name; image.setAttribute('aria-hidden', 'true');
      return image;
    };
    renderRelic.moonlightCutouts = true;
    artwork.relic = renderRelic;
  }
  function currentState(session = testSession) { return session || bridge()?.getState?.() || (typeof state !== 'undefined' ? state : null); }
  function storage(session = testSession, create = true) {
    const owner = currentState(session);
    if (!owner) return null;
    const key = session ? 'inventory' : 'mopsyInventory';
    if (!owner[key] && create) owner[key] = {};
    return owner[key] || null;
  }
  function context(options) { return options && Object.prototype.hasOwnProperty.call(options, 'testSession') ? options.testSession : testSession; }
  function count(id, options) { return Math.max(0, Number(storage(context(options), false)?.[normalize(id)]) || 0); }
  function addItem(id, quantity = 1, options) {
    id = normalize(id); quantity = Math.floor(Number(quantity));
    if (!DEFINITIONS[id] || !Number.isFinite(quantity) || quantity < 1) return false;
    const bag = storage(context(options)); if (!bag) return false;
    bag[id] = Math.max(0, Number(bag[id]) || 0) + quantity;
    refresh(); return true;
  }
  function consume(id, options) {
    id = normalize(id); const bag = storage(context(options), false);
    if (!bag || !DEFINITIONS[id] || !(bag[id] > 0)) return false;
    bag[id]--; if (bag[id] === 0) delete bag[id]; refresh(); return true;
  }
  function relics(session = testSession) {
    const values = session ? (session.relics || []) : (bridge()?.getRelics?.() || []);
    return values.map(r => typeof r === 'string' ? { name: r, effect: 'A passive relic carried on this journey.', rarity: 'Common' } : r);
  }
  function artFor(id, className = '') {
    const image = make('img', className); image.src = DEFINITIONS[id].art; image.alt = ''; image.draggable = false; return image;
  }
  function relicArt(relic, className = '') {
    if (relic.art) { const image = make('img', className); image.src = relic.art; image.alt = ''; image.draggable = false; return image; }
    if (window.MDRewardArt?.relic) { const art = window.MDRewardArt.relic(relic.name); art.classList.add('md-inventory-relic-art'); if (className) art.classList.add(className); return art; }
    return artFor('relic', className);
  }
  function illustratedButton(label, fn, variant = 'primary', className = '') {
    if (window.MDRewardArt?.button) return window.MDRewardArt.button(label, { onClick: fn, variant, className });
    const b = make('button', 'md-inventory-action ' + className, label); b.type = 'button'; b.addEventListener('click', fn); return b;
  }
  function report(message) { statusMessage = message; if (ui) ui.status.textContent = message; }
  function ensureUI() {
    if (overlay) return;
    overlay = make('div', 'md-inventory-overlay'); overlay.id = 'mdInventoryOverlay'; overlay.hidden = true;
    dialog = make('section', 'md-inventory-dialog'); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); dialog.setAttribute('aria-labelledby', 'mdInventoryTitle'); dialog.tabIndex = -1;
    const frame = make('img', 'md-inventory-frame'); frame.src = 'assets/ui/inventory-frame.png'; frame.alt = ''; frame.draggable = false; frame.setAttribute('aria-hidden', 'true'); dialog.appendChild(frame);
    const header = make('header', 'md-inventory-header');
    const title = make('h2', '', 'Inventory'); title.id = 'mdInventoryTitle';
    const close = make('button', 'md-inventory-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Close inventory'); close.addEventListener('click', () => closeInventory());
    header.append(title, close); dialog.appendChild(header);
    const tabs = make('div', 'md-inventory-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Inventory categories');
    const itemTab = make('button', 'md-inventory-tab', 'Items'); const relicTab = make('button', 'md-inventory-tab', 'Relics');
    itemTab.prepend(artFor('focus', 'md-tab-art')); relicTab.prepend(artFor('relic', 'md-tab-art'));
    [itemTab, relicTab].forEach((b, i) => { b.type = 'button'; b.setAttribute('role', 'tab'); b.id = i ? 'mdRelicsTab' : 'mdItemsTab'; b.setAttribute('aria-controls', 'mdInventoryGrid'); b.addEventListener('click', () => setTab(i ? 'relics' : 'items')); b.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setTab(activeTab === 'items' ? 'relics' : 'items'); (activeTab === 'items' ? itemTab : relicTab).focus(); } }); });
    tabs.append(itemTab, relicTab); dialog.appendChild(tabs);
    const content = make('div', 'md-inventory-content');
    const list = make('div', 'md-inventory-list');
    const grid = make('div', 'md-inventory-grid'); grid.id = 'mdInventoryGrid'; grid.setAttribute('role', 'tabpanel'); grid.setAttribute('aria-label', 'Inventory slots');
    const empty = make('p', 'md-inventory-empty'); list.append(grid, empty);
    const detail = make('aside', 'md-inventory-detail'); detail.setAttribute('aria-label', 'Selected item details');
    content.append(list, detail); dialog.appendChild(content);
    const footer = make('footer', 'md-inventory-footer'); const status = make('p', 'md-inventory-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); const hint = make('span', 'md-inventory-hint', 'Select an item to inspect its effect.'); footer.append(status, hint); dialog.appendChild(footer);
    overlay.appendChild(dialog); document.body.appendChild(overlay);
    ui = { itemTab, relicTab, grid, detail, empty, status, hint, header, footer };
    overlay.addEventListener('click', e => { if (e.target === overlay && !operation) closeInventory(); });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); if (operation?.demoChoice) operation.cancel(); else if (!operation) closeInventory(); return; }
      if (e.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), [href], [tabindex="0"]')].filter(el => !el.hidden && !el.closest('[hidden]'));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  function setTab(tab) { activeTab = tab; selection = null; statusMessage = ''; refresh(); }
  function canUse(id, session = testSession) {
    const s = currentState(session);
    if (!s || !(s.hp > 0)) return { ok: false, reason: 'Start a journey to use items.' };
    if (operation) return { ok: false, reason: 'Finish the current selection first.' };
    if (!count(id, { testSession: session })) return { ok: false, reason: 'This item is no longer in your satchel.' };
    if (!session && bridge()?.canUseItems && !bridge().canUseItems()) return { ok: false, reason: 'Use items on your turn or while exploring the map.' };
    if (id === 'elixir' && s.hp >= s.maxHP) return { ok: false, reason: 'Your health is already full. Keep the elixir for later.' };
    const corruption = session ? s.corruption || 0 : bridge()?.getCorruption?.();
    if (id === 'incense' && corruption === 0) return { ok: false, reason: 'You have no Lunar Corruption to remove.' };
    const prepared = session ? s.queuedMana || s.mopsyOpeningMana || 0 : (bridge()?.getQueuedMana?.() || s.mopsyOpeningMana || 0);
    if (id === 'focus' && prepared > 0) return { ok: false, reason: 'A Focus Draught is already prepared for your next battle.' };
    return { ok: true };
  }
  function refresh() {
    const liveBag = storage(null, false) || {};
    const total = Object.values(liveBag).reduce((n, v) => n + (Number(v) || 0), 0) + relics(null).length;
    for (const id of ['mdSatchelCount', 'mdMapSatchelCount']) { const badge = document.getElementById(id); if (badge) { badge.textContent = String(total); badge.hidden = !total; } }
    if (!overlay || overlay.hidden || operation?.demoChoice) return;
    ui.itemTab.setAttribute('aria-selected', String(activeTab === 'items')); ui.relicTab.setAttribute('aria-selected', String(activeTab === 'relics'));
    ui.itemTab.tabIndex = activeTab === 'items' ? 0 : -1; ui.relicTab.tabIndex = activeTab === 'relics' ? 0 : -1;
    ui.grid.setAttribute('aria-labelledby', activeTab === 'items' ? 'mdItemsTab' : 'mdRelicsTab');
    const entries = activeTab === 'items' ? ORDER.filter(id => count(id)).map(id => ({ id, ...DEFINITIONS[id], quantity: count(id) })) : relics().map((r, i) => ({ ...r, id: 'relic-' + i, passive: true }));
    if (!entries.some(e => e.id === selection)) selection = entries[0]?.id || null;
    ui.grid.replaceChildren();
    const slots = Math.max(15, Math.ceil(entries.length / 5) * 5);
    for (let i = 0; i < slots; i++) {
      const entry = entries[i];
      if (!entry) { const blank = make('div', 'md-inventory-slot empty', '+'); blank.setAttribute('aria-hidden', 'true'); ui.grid.appendChild(blank); continue; }
      const slot = make('button', 'md-inventory-slot'); slot.type = 'button'; slot.dataset.rarity = String(entry.rarity || 'Common').toLowerCase(); slot.dataset.item = entry.id;
      slot.setAttribute('aria-label', entry.name + (entry.quantity ? ', quantity ' + entry.quantity : ', passive relic')); slot.setAttribute('aria-pressed', String(selection === entry.id)); slot.title = entry.name + ' — ' + (entry.description || entry.effect);
      slot.appendChild(entry.passive ? relicArt(entry, 'md-slot-art') : artFor(entry.id, 'md-slot-art'));
      if (entry.quantity) slot.appendChild(make('span', 'md-inventory-quantity', '×' + entry.quantity));
      slot.addEventListener('click', () => { selection = entry.id; statusMessage = ''; refresh(); const restored = ui.grid.querySelector('[data-item="' + entry.id + '"]'); if (restored) restored.focus({ preventScroll: true }); });
      ui.grid.appendChild(slot);
    }
    const selected = entries.find(e => e.id === selection); renderDetail(selected);
    ui.empty.textContent = entries.length ? '' : activeTab === 'items' ? 'Your satchel is empty. Mopsy’s supplies will appear here.' : 'No relics collected yet. Your lunar charms will appear here.';
    ui.empty.hidden = !!entries.length;
    ui.status.textContent = statusMessage;
    ui.hint.textContent = testSession ? 'SHOP TEST · Purchases and items stay in this preview.' : activeTab === 'items' ? 'Items stay in your satchel until used.' : 'Relics are active automatically for this run.';
  }
  function renderDetail(entry) {
    ui.detail.replaceChildren();
    if (!entry) { const emptyArt = make('img', 'md-inventory-empty-bag'); emptyArt.src = 'assets/ui/satchel.png'; emptyArt.alt = ''; ui.detail.append(emptyArt, make('h3', '', 'Your Satchel'), make('p', '', activeTab === 'items' ? 'Collect supplies from Mopsy, then select an item to inspect or use it.' : 'Collect lunar relics to carry their passive blessings through this journey.')); return; }
    ui.detail.dataset.rarity = String(entry.rarity || 'Common').toLowerCase();
    const art = make('div', 'md-inventory-detail-art'); art.appendChild(entry.passive ? relicArt(entry) : artFor(entry.id));
    const heading = make('h3', '', entry.name); const divider = make('div', 'md-inventory-divider', '✧'); divider.setAttribute('aria-hidden', 'true');
    const desc = make('p', 'md-inventory-description', entry.description || entry.effect);
    const meta = make('p', 'md-inventory-meta', entry.passive ? (entry.moon || 'Lunar relic') + ' · ' + (entry.rarity || 'Common') : 'In your satchel: ' + entry.quantity);
    ui.detail.append(art, heading, divider, desc, meta);
    if (entry.passive) { ui.detail.appendChild(make('div', 'md-inventory-passive', 'Passive · Active')); return; }
    const availability = canUse(entry.id);
    const use = illustratedButton(entry.use, () => useItem(entry.id), 'primary', 'md-inventory-use'); use.disabled = !availability.ok; ui.detail.appendChild(use);
    if (!availability.ok) ui.detail.appendChild(make('p', 'md-inventory-use-note', availability.reason));
  }
  function notifyChange() { bridge()?.update?.(); window.dispatchEvent(new CustomEvent('moonlight:inventory-change')); }
  function finishUse(id, session, message) {
    if (!consume(id, { testSession: session })) return false;
    if (!session) notifyChange();
    report(message || DEFINITIONS[id].name + ' used.'); refresh(); return true;
  }
  function useItem(id, options) {
    id = normalize(id); const session = context(options), available = canUse(id, session);
    if (!available.ok) { report(available.reason); return { ok: false, reason: available.reason }; }
    const s = currentState(session), adapter = bridge();
    if (id === 'catalyst' || id === 'card' || id === 'reroll') return deferredUse(id, session);
    let result = { ok: true }, message = '';
    if (id === 'elixir') {
      const amount = Math.min(20, s.maxHP - s.hp);
      if (session) s.hp += amount; else result = adapter?.heal?.(20) || { ok: false };
      message = 'Restored ' + amount + ' HP. Health: ' + s.hp + '/' + s.maxHP + '.';
    } else if (id === 'focus') {
      if (session) s.queuedMana = 1; else result = adapter?.queueOpeningMana?.() || { ok: false };
      message = 'Focus Draught prepared. Your next battle begins with +1 Mana.';
    } else if (id === 'incense') {
      if (session) s.corruption = Math.max(0, (s.corruption || 0) - 25); else result = adapter?.removeCorruption?.(25) || { ok: false };
      message = 'Removed up to 25 Lunar Corruption.';
    } else if (id === 'satchel') {
      const roll = Math.random(); const found = roll < .40 ? 'elixir' : roll < .70 ? 'focus' : roll < .94 ? 'incense' : 'catalyst';
      result = { ok: addItem(found, 1, { testSession: session }) }; message = 'Inside the satchel: ' + DEFINITIONS[found].name + '.';
    } else if (id === 'relic') {
      result = adapter?.grantRandomRelic?.({ testSession: session }) || { ok: false };
      message = result.relic?.name ? result.relic.name + ' joins your relics.' : 'Lunar relic revealed.';
    } else result = { ok: false, reason: 'This item cannot be used right now.' };
    if (result === false || result?.ok === false) { report(result?.error || result?.reason || 'This item cannot be used right now. It remains in your satchel.'); return { ok: false }; }
    finishUse(id, session, message); return { ok: true, message };
  }
  function deferredUse(id, session) {
    const owner = currentState(session), bag = storage(session, false);
    const pending = { id, session, owner, bag, finished: false };
    operation = pending;
    const reopen = message => { operation = null; testSession = session; if (overlay) { overlay.hidden = false; document.body.classList.add('md-inventory-open'); } report(message); refresh(); if (dialog) requestAnimationFrame(() => dialog.focus({ preventScroll: true })); };
    const done = result => {
      if (result?.ok === false) { report(result.error || result.reason || 'The item remains in your satchel.'); return false; }
      if (pending.finished) return false; pending.finished = true;
      if (currentState(session) !== owner || storage(session, false) !== bag) { operation = null; return false; }
      finishUse(id, session, id === 'catalyst' ? 'Spell evolved. One Lunar Catalyst consumed.' : id === 'reroll' ? 'Card replaced. One Card Reroll consumed.' : 'Spell added to your deck. One Card Pack consumed.');
      reopen(statusMessage); return true;
    };
    const cancel = () => { if (pending.finished) return; pending.finished = true; reopen('Selection canceled. Your ' + DEFINITIONS[id].name + ' is still in your satchel.'); };
    pending.cancel = cancel;
    if (overlay) { overlay.hidden = true; document.body.classList.remove('md-inventory-open'); }
    const fn = id === 'catalyst' ? bridge()?.beginEvolution : bridge()?.beginCardChoice;
    if (!fn) { cancel(); return { ok: false }; }
    try { const result = fn(done, cancel, { replace: id === 'reroll', testSession: session }); if (result === false || result?.ok === false) cancel(); }
    catch (error) { cancel(); console.error('Inventory selection failed', error); }
    return { ok: true, pending: true };
  }
  function openInventory(options = {}) {
    ensureUI(); if (operation) return false;
    testSession = options.testSession || null; closeCallback = options.onClose || null;
    activeTab = options.tab === 'relics' ? 'relics' : 'items'; selection = null; statusMessage = '';
    previousFocus = document.activeElement; overlay.hidden = false; document.body.classList.add('md-inventory-open'); refresh();
    requestAnimationFrame(() => dialog.focus({ preventScroll: true })); return true;
  }
  function closeInventory(silent = false) {
    if (operation) return false;
    if (overlay) overlay.hidden = true; document.body.classList.remove('md-inventory-open');
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    const callback = closeCallback; closeCallback = null;
    if (!silent && callback) callback(); return true;
  }
  function install() {
    installRelicCutouts();
    document.getElementById('relicPouch')?.remove(); document.getElementById('relicInventory')?.remove();
    const header = document.querySelector('.game > header.hud'), logo = header?.querySelector('.logo');
    if (header && logo && !document.getElementById('mdSatchelButton')) {
      const button = make('button', 'md-satchel-button'); button.type = 'button'; button.id = 'mdSatchelButton'; button.title = 'Inventory · Items and Relics'; button.setAttribute('aria-label', 'Open inventory: items and relics');
      const image = make('img'); image.src = 'assets/ui/satchel.png'; image.alt = ''; image.draggable = false;
      const badge = make('span', 'md-satchel-count', '0'); badge.id = 'mdSatchelCount'; badge.hidden = true; button.append(image, badge); logo.insertAdjacentElement('afterend', button);
      button.addEventListener('click', () => openInventory({ testSession: null }));
    }
    const mapFrame = document.querySelector('#rogueMap .map-frame');
    if (mapFrame && !document.getElementById('mdMapSatchelButton')) {
      const button = make('button', 'md-map-satchel'); button.type = 'button'; button.id = 'mdMapSatchelButton'; button.title = 'Open inventory'; button.setAttribute('aria-label', 'Open inventory: items and relics');
      const image = make('img'); image.src = 'assets/ui/satchel.png'; image.alt = ''; image.draggable = false;
      const badge = make('span', 'md-satchel-count', '0'); badge.id = 'mdMapSatchelCount'; badge.hidden = true;
      button.append(image, badge); button.addEventListener('click', () => openInventory({ testSession: null })); mapFrame.appendChild(button);
    }
    window.addEventListener('moonlight:run-change', () => { operation = null; closeInventory(true); testSession = null; refresh(); });
    window.addEventListener('moonlight:economy-change', refresh);
    refresh();
  }
  window.MDInventory = {
    addItem, consume, count, open: openInventory, close: closeInventory, refresh, useItem,
    getDefinitions: () => DEFINITIONS,
    getState: options => ({ items: { ...(storage(context(options), false) || {}) }, relics: relics(context(options)).map(r => ({...r})), tab: activeTab, open: !!overlay && !overlay.hidden, pending: operation?.id || null }),
    setTestSession(session) { if (operation) return false; testSession = session || null; refresh(); return true; },
    reset() { const s = currentState(null); if (s) s.mopsyInventory = {}; operation = null; closeInventory(true); testSession = null; refresh(); },
    canUse, definitions: DEFINITIONS
  };
  installRelicCutouts();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
})();
