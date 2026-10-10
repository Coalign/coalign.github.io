const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const questions = [...document.querySelectorAll('.faq-list details')];
const reviewedButton = document.getElementById('mark-reviewed');
const resetButton = document.getElementById('reset-review');
const decisionResult = document.getElementById('decision-result');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 641px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

function writeUrl(update) {
  const url = new URL(window.location.href);
  update(url.searchParams);
  if (url.href !== window.location.href) history.pushState(null, '', url);
}

function selectTab(tab, { focus = false, save = true } = {}) {
  tabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (save) writeUrl((params) => params.set('tab', tab.id.replace('tab-', '')));
  if (focus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], { focus: true });
    }
  });
});
document.querySelectorAll('[data-select-tab]').forEach((button) => {
  button.addEventListener('click', () => selectTab(document.getElementById(`tab-${button.dataset.selectTab}`), { focus: true }));
});

function setReviewed(reviewed, { focus = false, save = true } = {}) {
  reviewedButton.hidden = reviewed;
  decisionResult.hidden = !reviewed;
  if (save) writeUrl((params) => {
    if (reviewed) params.set('review', 'done');
    else params.delete('review');
  });
  if (focus) (reviewed ? resetButton : reviewedButton).focus();
}
reviewedButton.addEventListener('click', () => setReviewed(true, { focus: true }));
resetButton.addEventListener('click', () => setReviewed(false, { focus: true }));

questions.forEach((question) => {
  question.addEventListener('toggle', () => writeUrl((params) => {
    params.delete('faq');
    questions.filter((item) => item.open).forEach((item) => params.append('faq', item.id));
  }));
});

function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  const tab = tabs.find((item) => item.id === `tab-${params.get('tab')}`) || tabs[0];
  selectTab(tab, { save: false });
  setReviewed(params.get('review') === 'done', { save: false });
  const openQuestions = new Set(params.getAll('faq'));
  questions.forEach((question) => { question.open = openQuestions.has(question.id); });
}
window.addEventListener('popstate', restoreUrlState);
restoreUrlState();

const films = [...document.querySelectorAll('#alignment-film, #review-film')];
const filmPlayers = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionSurfaces = [...document.querySelectorAll('.intent-graph, .workflow-art, .evidence-art, .decision-art, .context-strip, .research-grid')];
const motionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
}, {rootMargin: '80px', threshold: 0.1});
motionSurfaces.forEach(surface => motionObserver.observe(surface));
let smoothScroll;
// Both films always loop, as explicitly requested. Reduced motion still
// disables diagram motion and scroll smoothing, independently of video playback.
films.forEach(film => {
  film.muted = true;
  film.defaultMuted = true;
  film.loop = true;
  film.autoplay = true;
  film.playsInline = true;
  let playbackRetry;
  function ensureFilmPlaying() {
    if (document.hidden || !film.paused) return;
    film.play().catch(() => {
      clearTimeout(playbackRetry);
      playbackRetry = setTimeout(ensureFilmPlaying, 1500);
    });
  }
  ['loadeddata', 'canplay', 'pageshow'].forEach(event => {
    (event === 'pageshow' ? window : film).addEventListener(event, ensureFilmPlaying);
  });
  film.addEventListener('pause', () => {
    if (!document.hidden) {
      clearTimeout(playbackRetry);
      playbackRetry = setTimeout(ensureFilmPlaying, 250);
    }
  });
  film.addEventListener('ended', () => {
    film.currentTime = 0;
    ensureFilmPlaying();
  });
  document.addEventListener('visibilitychange', () => {
    clearTimeout(playbackRetry);
    if (document.hidden) film.pause();
    else ensureFilmPlaying();
  });
  // Browser power/autoplay restrictions may allow playback after a normal gesture.
  ['pointerdown', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, ensureFilmPlaying, {passive: true});
  });
  filmPlayers.push(ensureFilmPlaying);
});
function applyMotionPreference() {
  document.documentElement.classList.toggle('motion-enabled', !reducedMotion.matches);
  smoothScroll?.destroy();
  smoothScroll = undefined;
  if (!reducedMotion.matches && typeof Lenis !== 'undefined') {
    smoothScroll = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      prevent: node => Boolean(node.closest('pre, [data-lenis-prevent]')),
    });
  }
  filmPlayers.forEach(play => play());
}
reducedMotion.addEventListener('change', applyMotionPreference);
applyMotionPreference();
// Navigation remains link-based, with URL history and keyboard focus intact.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || !smoothScroll || link.classList.contains('skip-link') || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const destination = new URL(link.href);
  if (destination.origin !== location.origin || destination.pathname !== location.pathname || !destination.hash) return;
  const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
  if (!target) return;
  event.preventDefault();
  smoothScroll.scrollTo(target, {
    offset: -96,
    duration: 1.25,
    easing: t => 1 - Math.pow(1 - t, 4),
    onComplete: () => {
      if (location.href !== destination.href) history.pushState(null, '', destination);
      const addedTabIndex = !target.hasAttribute('tabindex');
      if (addedTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
      if (addedTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});
    },
  });
});
document.getElementById('year').textContent = new Date().getFullYear();
