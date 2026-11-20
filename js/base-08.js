/* One audio element owns the title, battles, Deck Builder and Mopsy's shop. */
(() => {
  'use strict';
  const audio = document.getElementById('moonlightTheme');
  const toggle = document.getElementById('moonlightSongToggle');
  const volume = document.getElementById('moonlightSongVolume');
  if (!audio || !toggle || !volume) return;

  const tracks = Object.freeze({
    main: [
      { src: 'assets/music/moonlight-duel.mp3', title: 'Moonlight Duel' },
      { src: 'assets/music/final-card.mp3', title: 'The Final Card' }
    ],
    deck: { src: 'assets/music/player-two.mp3', title: 'Player Two' },
    shop: { src: 'assets/music/mopsy-shop.mp3', title: "Mopsy's Shop" }
  });
  const preference = {
    read(key) { try { return localStorage.getItem('moonlight.music.' + key); } catch (_) { return null; } },
    write(key, value) { try { localStorage.setItem('moonlight.music.' + key, String(value)); } catch (_) {} }
  };
  let enabled = preference.read('enabled') !== 'false';
  const savedVolume = preference.read('volume');
  const startingVolume = savedVolume === null ? .35 : Number(savedVolume);
  audio.volume = Number.isFinite(startingVolume) ? Math.max(0, Math.min(1, startingVolume)) : .35;
  audio.preload = 'metadata';
  volume.value = String(Math.round(audio.volume * 100));

  let mainIndex = 0;
  let baseMode = 'main';
  let shopActive = false;
  let mode = 'main';
  let currentTrack = null;
  let trackRevision = 0;
  let pendingSeek = null;
  let pendingPlay = null;
  let mediaError = false;
  let deckObserver = null;
  let lastDeckOpen = null;
  const positions = new Map();

  function update() {
    toggle.textContent = mediaError ? '♫ Retry Music' : enabled && !audio.paused ? '❚❚ Pause Music' : '♫ Play Music';
    toggle.setAttribute('aria-pressed', String(enabled && !audio.paused));
    toggle.title = mediaError
      ? 'Music could not load. Tap to retry.'
      : (enabled && !audio.paused ? 'Now playing: ' : 'Music: ') + (currentTrack?.title || tracks.main[mainIndex].title);
  }

  function applySeek() {
    if (pendingSeek === null) return;
    const duration = Number(audio.duration);
    const destination = Number.isFinite(duration) && duration > 0
      ? Math.min(pendingSeek, Math.max(0, duration - .1)) : pendingSeek;
    try { audio.currentTime = destination; pendingSeek = null; } catch (_) { /* Retry after metadata arrives. */ }
  }

  function attemptPlay() {
    if (!enabled) { update(); return Promise.resolve(false); }
    if (pendingPlay?.revision === trackRevision) return pendingPlay.promise;
    const revision = trackRevision;
    let result;
    try { result = audio.play(); } catch (_) { update(); return Promise.resolve(false); }
    const promise = Promise.resolve(result).then(() => {
      if (!enabled) audio.pause();
      if (revision === trackRevision) { mediaError = false; update(); }
      return enabled && revision === trackRevision;
    }).catch(() => {
      // Autoplay can be blocked until a gesture. Keep the user's preference
      // enabled and retry on their first interaction; do not show a false error.
      if (revision === trackRevision) update();
      return false;
    }).finally(() => {
      if (pendingPlay?.revision === revision) pendingPlay = null;
    });
    pendingPlay = { revision, promise };
    return promise;
  }

  function activateTrack({ savePosition = true } = {}) {
    mode = shopActive ? 'shop' : baseMode;
    const next = mode === 'main' ? tracks.main[mainIndex] : tracks[mode];
    audio.loop = mode !== 'main';
    if (currentTrack?.src !== next.src) {
      if (savePosition && currentTrack && Number.isFinite(audio.currentTime)) positions.set(currentTrack.src, audio.currentTime);
      audio.pause();
      trackRevision++;
      currentTrack = next;
      mediaError = false;
      pendingSeek = positions.get(next.src) || 0;
      audio.src = next.src;
      audio.load();
      applySeek();
    }
    update();
    if (enabled && audio.paused) attemptPlay();
  }

  function setMode(next) {
    if (next === 'shop') return enterShop();
    if (next !== 'main' && next !== 'deck') return;
    baseMode = next;
    // A background Deck Builder mutation cannot interrupt an open shop.
    activateTrack();
  }

  function enterShop() {
    shopActive = true;
    activateTrack();
  }

  function leaveShop() {
    if (!shopActive) return;
    shopActive = false;
    const deck = document.getElementById('moonDeckModal');
    if (deck) baseMode = !deck.hidden && !deck.classList.contains('hidden') ? 'deck' : 'main';
    activateTrack();
  }

  function play() {
    enabled = true;
    preference.write('enabled', true);
    if (mediaError) { mediaError = false; audio.load(); }
    return attemptPlay();
  }

  function pause() {
    enabled = false;
    preference.write('enabled', false);
    audio.pause();
    update();
  }

  function syncDeckMode() {
    const deck = document.getElementById('moonDeckModal');
    if (!deck) return;
    const isOpen = !deck.hidden && !deck.classList.contains('hidden');
    if (isOpen === lastDeckOpen) return;
    lastDeckOpen = isOpen;
    baseMode = isOpen ? 'deck' : 'main';
    activateTrack();
  }

  function bindDeckMode() {
    const deck = document.getElementById('moonDeckModal');
    if (!deck || deckObserver) return;
    deckObserver = new MutationObserver(syncDeckMode);
    deckObserver.observe(deck, { attributes: true, attributeFilter: ['class', 'hidden'] });
    syncDeckMode();
  }

  audio.addEventListener('loadedmetadata', applySeek);
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => { mediaError = true; update(); });
  audio.addEventListener('ended', () => {
    if (mode !== 'main' || !enabled) return;
    if (currentTrack) positions.set(currentTrack.src, 0);
    mainIndex = (mainIndex + 1) % tracks.main.length;
    activateTrack({ savePosition: false });
  });
  toggle.addEventListener('click', () => {
    if (enabled && !audio.paused) pause(); else play();
  });
  volume.addEventListener('input', () => {
    const value = Number(volume.value);
    if (!Number.isFinite(value)) return;
    audio.volume = Math.max(0, Math.min(100, value)) / 100;
    preference.write('volume', audio.volume);
  });
  const resumeAfterGesture = event => {
    if (event.target?.closest?.('#moonlightSongControls')) return;
    if (enabled && audio.paused) attemptPlay();
  };
  document.addEventListener('pointerdown', resumeAfterGesture, { passive: true });
  document.addEventListener('keydown', resumeAfterGesture);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindDeckMode, { once: true });
  else bindDeckMode();

  window.MoonlightSoundtrack = Object.freeze({
    setMode, enterShop, leaveShop, play, pause,
    getMode: () => mode,
    getState: () => ({ mode, enabled, volume: audio.volume, track: currentTrack?.src || null, mainIndex })
  });
  activateTrack();
})();
