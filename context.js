(() => {
  const hero = document.querySelector('.context-hero');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true;
  const scene = hero.querySelector('.context-art > svg');
  const packetLayer = scene.querySelector('.context-packets');
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let animationFrame = 0, previousFrame = 0, elapsed = 0;
  const packets = [];
  ['intent-route', 'agent-route', 'evidence-route', 'review-route'].forEach((id, routeIndex) => {
    const path = scene.querySelector(`#${id}`);
    const length = path.getTotalLength();
    for (let index = 0; index < 3; index++) {
      const group = document.createElementNS(svgNamespace, 'g');
      const halo = document.createElementNS(svgNamespace, 'circle');
      const point = document.createElementNS(svgNamespace, 'circle');
      halo.setAttribute('r', '8'); halo.classList.add('packet-halo');
      point.setAttribute('r', '2.4');
      group.setAttribute('fill', ['#d7e8ff', '#d6b7ff', '#a9d2ff', '#c0ecd0'][routeIndex]);
      group.append(halo, point); packetLayer.append(group);
      packets.push({path, length, group, offset: index / 3 + routeIndex * .17});
    }
  });
  function drawPackets(now) {
    if (previousFrame) elapsed += Math.min((now - previousFrame) / 1000, .05);
    previousFrame = now;
    packets.forEach(packet => {
      const progress = (elapsed / 3.8 + packet.offset) % 1;
      const point = packet.path.getPointAtLength(progress * packet.length);
      packet.group.setAttribute('transform', `translate(${point.x} ${point.y})`);
      packet.group.setAttribute('opacity', String(Math.min(1, progress * 12, (1 - progress) * 12)));
    });
    animationFrame = requestAnimationFrame(drawPackets);
  }
  function syncPackets(stopped) {
    cancelAnimationFrame(animationFrame); previousFrame = 0;
    // Phones use the CSS-based simplified map instead of the hidden SVG scene.
    if (!stopped && matchMedia('(min-width:641px)').matches) animationFrame = requestAnimationFrame(drawPackets);
  }
  const sceneBreakpoint = matchMedia('(min-width:641px)');
  sceneBreakpoint.addEventListener('change', () => update());
  hero.addEventListener('pointermove', event => {
    if (preference.matches || paused || !matchMedia('(pointer:fine)').matches || !matchMedia('(min-width:901px)').matches) return;
    const bounds = hero.getBoundingClientRect();
    scene.style.setProperty('--scene-x', `${(event.clientY - bounds.top - bounds.height / 2) / bounds.height * -5}deg`);
    scene.style.setProperty('--scene-y', `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 6}deg`);
  }, {passive:true});
  hero.addEventListener('pointerleave', () => {
    scene.style.setProperty('--scene-x', '0deg'); scene.style.setProperty('--scene-y', '0deg');
  });
  if (!preference.matches) {
    hero.classList.add('hero-entered');
    setTimeout(() => hero.classList.remove('hero-entered'), 1500);
  }

  function update() {
    const stopped = paused || preference.matches;
    hero.classList.toggle('motion-paused', stopped || !visible || document.hidden);
    syncPackets(stopped || !visible || document.hidden);
    if (preference.matches) hero.classList.remove('hero-entered');

  }
  preference.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; update(); }, {threshold: .05}).observe(hero);
  update();

  const tabs = [...document.querySelectorAll('.scenario-tabs [role="tab"]')];
  function select(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
    });
  });

  // Establish the first scenario before any interaction or animation observer.
  select(tabs[0]);

  // Tab motion follows the selected control; both tab systems stay independent.
  function addSelectionIndicator(container, selector, className, scenario = false) {
    const indicator = document.createElement('span');
    indicator.className = className; indicator.setAttribute('aria-hidden', 'true');
    container.append(indicator);
    if (!scenario) container.classList.add('has-motion-indicator');
    function position() {
      const selected = container.querySelector(`${selector}[aria-selected="true"]`);
      if (!selected) return;
      if (scenario) {
        indicator.style.setProperty('--selection-width', `${selected.offsetWidth}px`);
        indicator.style.setProperty('--selection-height', `${selected.offsetHeight}px`);
        indicator.style.setProperty('--selection-x', `${selected.offsetLeft}px`);
        indicator.style.setProperty('--selection-y', `${selected.offsetTop}px`);
      } else {
        indicator.style.setProperty('--tab-width', `${selected.offsetWidth}px`);
        indicator.style.setProperty('--tab-left', `${selected.offsetLeft}px`);
      }
    }
    new MutationObserver(position).observe(container, {subtree:true, attributes:true, attributeFilter:['aria-selected']});
    new ResizeObserver(position).observe(container);
    document.fonts.ready.then(position);
    position();
  }
  addSelectionIndicator(document.querySelector('.tabs'), '[role="tab"]', 'review-tab-indicator');
  addSelectionIndicator(document.querySelector('.scenario-tabs'), '[role="tab"]', 'scenario-selection', true);
  const activeAnimations = new Map();
  const panels = document.querySelectorAll('.tab-panel, .scenario-panels > section, #decision-result');
  function animatePanel(panel) {
    activeAnimations.get(panel)?.cancel();
    if (preference.matches || panel.hidden) return;
    const decision = panel.id === 'decision-result';
    const animation = panel.animate(decision ? [
      {clipPath:'inset(0 100% 0 0)', opacity:.5},
      {clipPath:'inset(0)', opacity:1},
    ] : [
      {opacity:.35, transform:'translateY(10px)', filter:'blur(1.5px)'},
      {opacity:1, transform:'translateY(0)', filter:'blur(0)'},
    ], {duration:decision ? 420 : 320, easing:'cubic-bezier(.16,1,.3,1)'});
    activeAnimations.set(panel, animation);
    animation.onfinish = () => { if (activeAnimations.get(panel) === animation) activeAnimations.delete(panel); };
  }
  const panelObserver = new MutationObserver(records => {
    new Set(records.map(record => record.target)).forEach(animatePanel);
  });
  panels.forEach(panel => panelObserver.observe(panel, {attributes:true, attributeFilter:['hidden']}));
  preference.addEventListener('change', () => {
    if (preference.matches) { activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear(); }
  });
})();
