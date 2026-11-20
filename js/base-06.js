
/* Moonlight Duel: approved reward artwork rendered as reusable SVG viewports.
   install() embeds each source PNG only once. No bitmap copies or edits needed. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const XLINK = 'http://www.w3.org/1999/xlink';
  const boxes = {
    primary: ['sprite', 14, 91, 360, 137],
    primaryFocus: ['sprite', 359, 91, 371, 137],
    primaryPressed: ['sprite', 722, 91, 360, 137],
    primaryDisabled: ['sprite', 1074, 91, 362, 137],
    secondary: ['sprite', 34, 272, 384, 129],
    secondaryPressed: ['sprite', 422, 272, 388, 129],
    info: ['sprite', 812, 269, 151, 145],
    back: ['sprite', 964, 269, 153, 145],
    close: ['sprite', 1118, 269, 146, 145],
    check: ['sprite', 1263, 269, 153, 145],
    panel: ['sprite', 34, 447, 449, 562],
    panelSelected: ['sprite', 485, 433, 481, 610],
    common: ['sprite', 982, 477, 427, 108],
    rare: ['sprite', 982, 607, 427, 110],
    legendary: ['sprite', 982, 742, 427, 105],
    cursed: ['sprite', 982, 871, 427, 112],
    crest: ['frame', 686, 0, 307, 129],
    frame: ['frame', 0, 0, 1672, 941],
    discovery: ['mockup', 213, 351, 304, 223],
    spell: ['mockup', 213, 351, 304, 223],
    relic: ['mockup', 727, 352, 224, 223],
    catalyst: ['mockup', 1182, 355, 230, 208],
    coin: ['mockup', 1251, 124, 77, 69],
    ioember: ['relics', 85, 174, 225, 137],
    europapearl: ['relics', 374, 174, 225, 137],
    callistoshield: ['relics', 662, 174, 225, 137],
    enceladustear: ['relics', 950, 174, 225, 137],
    titanheart: ['relics', 1238, 174, 225, 137],
    tritonfang: ['relics', 85, 518, 225, 134],
    ganymedecrown: ['relics', 374, 518, 225, 134],
    mirandamirror: ['relics', 662, 518, 225, 134],
    charonoath: ['relics', 950, 518, 225, 134],
    rheasveil: ['relics', 1238, 518, 225, 134]
  };
  const sizes = { sprite: [1448, 1086], frame: [1672, 941], mockup: [1672, 941], relics: [1536, 1024] };
  function install(sources) {
    let host = document.getElementById('mdRewardArtDefinitions');
    if (!host) {
      host = document.createElementNS(NS, 'svg');
      host.id = 'mdRewardArtDefinitions';
      host.setAttribute('width', '0');
      host.setAttribute('height', '0');
      host.setAttribute('aria-hidden', 'true');
      host.setAttribute('focusable', 'false');
      host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      host.appendChild(document.createElementNS(NS, 'defs'));
      document.body.appendChild(host);
    }
    const defs = host.firstElementChild;
    Object.entries(sources).forEach(([key, src]) => {
      if (!src || !sizes[key]) return;
      let image = document.getElementById('mdRewardArtSource-' + key);
      if (!image) {
        image = document.createElementNS(NS, 'image');
        image.id = 'mdRewardArtSource-' + key;
        image.setAttribute('width', String(sizes[key][0]));
        image.setAttribute('height', String(sizes[key][1]));
        defs.appendChild(image);
      }
      image.setAttribute('href', src);
    });
  }
  function sprite(kind, className) {
    const spec = boxes[kind];
    if (!spec) throw new Error('Unknown reward artwork: ' + kind);
    const [source, x, y, width, height] = spec;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', [x, y, width, height].join(' '));
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'md-art-sprite' + (className ? ' ' + className : ''));
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#mdRewardArtSource-' + source);
    use.setAttributeNS(XLINK, 'xlink:href', '#mdRewardArtSource-' + source);
    svg.appendChild(use);
    return svg;
  }
  function button(label, options) {
    const opts = options || {};
    const variant = opts.variant === 'secondary' ? 'secondary' : 'primary';
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'md-ui-button ' + variant + (opts.className ? ' ' + opts.className : '');
    el.disabled = !!opts.disabled;
    const states = variant === 'secondary'
      ? { normal: 'secondary', pressed: 'secondaryPressed' }
      : { normal: 'primary', focus: 'primaryFocus', pressed: 'primaryPressed', disabled: 'primaryDisabled' };
    Object.entries(states).forEach(([state, kind]) => el.appendChild(sprite(kind, 'md-button-skin md-skin-' + state)));
    const text = document.createElement('span');
    text.className = 'md-button-label';
    text.textContent = label;
    el.appendChild(text);
    if (opts.onClick) el.addEventListener('click', opts.onClick);
    if (opts.ariaLabel) el.setAttribute('aria-label', opts.ariaLabel);
    return el;
  }
  function iconButton(kind, label, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'md-icon-button md-icon-' + kind;
    el.setAttribute('aria-label', label);
    el.title = label;
    const art = sprite(kind, 'md-icon-skin');
    art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    el.appendChild(art);
    if (onClick) el.addEventListener('click', onClick);
    return el;
  }
  function panelSkin(selected) {
    return sprite(selected ? 'panelSelected' : 'panel', 'md-panel-skin ' + (selected ? 'md-panel-selected' : 'md-panel-normal'));
  }
  function badgeSkin(rarity) {
    const value = String(rarity || '').toLowerCase();
    const key = value.includes('curs') ? 'cursed' : value.includes('legend') ? 'legendary' : /rare|epic|spell|upgrade/.test(value) ? 'rare' : 'common';
    return sprite(key, 'md-badge-skin');
  }
  function crest() { return sprite('crest', 'md-reward-crest'); }
  function frameSkin() { return sprite('frame', 'md-frame-skin'); }
  function relic(name) {
    const key = String(name || '').toLowerCase().replace(/[^a-z]/g, '');
    const art = sprite(boxes[key] ? key : 'relic', 'md-relic-art');
    art.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    return art;
  }
  window.MDRewardArt = { install, sprite, createArt: sprite, button, iconButton, panelSkin, badgeSkin, crest, frameSkin, relic, boxes };
})();

MDRewardArt.install({"sprite": "assets/base/6b893961ca6714f5913e0c51.webp", "frame": "assets/base/3b9edc2dd0b1f8a056d6c26c.webp", "mockup": "assets/base/f12081dc7d0c2c350a65e077.webp", "relics": "assets/base/31eb9f13bb3f1c84a8317d22.webp"});
