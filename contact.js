(() => {
  const form = document.getElementById('updates-form');
  const input = document.getElementById('signup-email');
  const submit = document.getElementById('signup-submit');
  const label = submit.querySelector('.submit-label');
  const error = document.getElementById('signup-error');
  const success = document.getElementById('signup-success');
  let submitting = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (form.dataset.signupMode === 'email') {
      const body = `Please add ${input.value.trim()} to the Coalign updates list.\n\nI would like to receive product news and development updates from Coalign.`;
      const emailLink = document.getElementById('signup-email-request');
      emailLink.href = `mailto:shanjanuary@gmail.com?subject=${encodeURIComponent('Coalign updates signup')}&body=${encodeURIComponent(body)}`;
      emailLink.hidden = false;
      success.querySelector('h2').textContent = 'Send your email to finish.';
      success.querySelector('p').textContent = 'Your signup request opens in your mail app. Send that email to ask for Coalign updates. Your address hasn’t been added automatically.';
      form.hidden = true; success.hidden = false; success.focus();
      window.location.assign(emailLink.href);
      return;
    }
    submitting = true; submit.disabled = true; label.textContent = 'Saving…';
    form.classList.add('is-submitting'); error.hidden = true;
    input.removeAttribute('aria-invalid');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(form.action, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:input.value.trim(), website:form.elements.website.value}),
        signal:controller.signal,
      });
      if (!response.ok) {
        if (response.status === 400) {
          input.setAttribute('aria-invalid', 'true');
          throw new Error('Please enter a valid email address.');
        }
        throw new Error('We couldn’t save your signup. Please try again, or email the team below.');
      }
      const result = await response.json();
      if (result.saved !== true) throw new Error('We couldn’t save your signup. Please try again.');
      form.hidden = true; success.hidden = false; success.focus();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) success.animate(
        [{opacity:.3, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}],
        {duration:350, easing:'cubic-bezier(.16,1,.3,1)'});
    } catch (failure) {
      error.textContent = failure.name === 'AbortError' ? 'The request took too long. Please try again.' : (['TypeError', 'SyntaxError'].includes(failure.name) ? 'We couldn’t save your signup. Please try again, or email the team below.' : (failure.message || 'We couldn’t save your signup. Please try again.'));
      error.hidden = false;
    } finally {
      clearTimeout(timeout); submitting = false; submit.disabled = false;
      label.textContent = 'Keep me updated'; form.classList.remove('is-submitting');
    }
  });
  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); error.hidden = true; });
  document.getElementById('signup-reset').addEventListener('click', () => {
    success.hidden = true; form.hidden = false; form.reset(); document.getElementById('signup-email-request').hidden = true; input.focus();
  });
  document.getElementById('signup-year').textContent = new Date().getFullYear();

  // Original tree artwork, with a small field of airborne light.
  const canvas = document.getElementById('signup-lights');
  const ctx = canvas.getContext('2d');
  const main = document.querySelector('.signup-main');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, previous = 0, time = 0, width = 0, height = 0, visible = true, seed = 73;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const lights = Array.from({length:45}, () => ({x:.45 + random() * .52, y:random(), size:.5 + random(), phase:random() * 6.28, speed:.01 + random() * .01}));
  function paint() {
    if (!ctx) return;
    ctx.clearRect(0,0,width,height);
    lights.forEach(light => {
      const x = light.x * width + Math.sin(time * .3 + light.phase) * 10;
      const y = (1 - ((light.y + time * light.speed) % 1)) * height;
      const alpha = Math.max(0,(.25 + .25 * Math.sin(time + light.phase)) * Math.min(1,y / 60,(height - y) / 60));
      ctx.fillStyle = `rgba(190,220,252,${alpha})`;
      ctx.beginPath(); ctx.arc(x,y,light.size,0,Math.PI * 2); ctx.fill();
    });
  }
  function draw(now) {
    if (previous) time += Math.min((now - previous) / 1000,.05);
    previous = now; paint(); frame = requestAnimationFrame(draw);
  }
  function updateMotion() {
    cancelAnimationFrame(frame); previous = 0;
    const stopped = preference.matches || !visible || document.hidden;
    document.body.classList.toggle('signup-motion', !preference.matches);
    document.body.classList.toggle('signup-paused', stopped);
    if (!stopped && ctx) frame = requestAnimationFrame(draw);
    else if (ctx) ctx.clearRect(0,0,width,height);
  }
  new ResizeObserver(() => {
    const bounds = canvas.getBoundingClientRect(); width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx?.setTransform(ratio,0,0,ratio,0,0); paint();
  }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateMotion(); }).observe(canvas);
  preference.addEventListener('change',updateMotion);
  document.addEventListener('visibilitychange',updateMotion);
  updateMotion();
})();
