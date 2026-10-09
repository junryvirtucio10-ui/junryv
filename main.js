const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('open');
}));
const filterButtons = [...document.querySelectorAll('.filter-button')];
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-group]').forEach(group => {
    group.hidden = selected !== 'all' && group.dataset.group !== selected;
  });
}));
document.querySelector('#year').textContent = new Date().getFullYear();

const portfolioAudio = document.querySelector('#portfolio-audio');
const audioToggle = document.querySelector('.audio-toggle');
const audioToggleLabel = audioToggle?.querySelector('.audio-toggle-label');
const audioStatus = document.querySelector('.audio-status');
const entryGate = document.querySelector('.entry-gate');
const entryGatePlay = entryGate?.querySelector('.entry-gate-play');
const entryGateSilent = entryGate?.querySelector('.entry-gate-silent');
const entryGateStatus = entryGate?.querySelector('.entry-gate-status');

if (portfolioAudio && audioToggle && audioToggleLabel) {
  const setAudioPlaying = playing => {
    audioToggle.setAttribute('aria-pressed', String(playing));
    audioToggle.setAttribute('aria-label', playing ? 'Pause portfolio audio' : 'Play portfolio audio');
    audioToggle.classList.toggle('is-playing', playing);
    audioToggleLabel.textContent = playing ? 'Now playing' : 'Click to play';
  };

  portfolioAudio.addEventListener('play', () => {
    if (audioStatus) audioStatus.textContent = '';
    setAudioPlaying(true);
  });
  portfolioAudio.addEventListener('pause', () => setAudioPlaying(false));
  portfolioAudio.addEventListener('ended', () => setAudioPlaying(false));
  portfolioAudio.addEventListener('error', () => {
    audioToggle.disabled = true;
    audioToggle.setAttribute('aria-label', 'Portfolio audio unavailable');
    audioToggleLabel.textContent = 'Audio unavailable';
    if (audioStatus) audioStatus.textContent = 'The portfolio audio could not be loaded.';
    if (entryGatePlay) entryGatePlay.disabled = true;
    if (entryGateStatus) entryGateStatus.textContent = 'The soundtrack could not be loaded. You can continue without sound.';
  });
  audioToggle.addEventListener('click', async () => {
    if (!portfolioAudio.paused) {
      portfolioAudio.pause();
      return;
    }

    try {
      await portfolioAudio.play();
    } catch (error) {
      if (error?.name === 'AbortError' && portfolioAudio.paused) return;
      if (audioStatus) audioStatus.textContent = 'Audio could not be played. Please try again.';
      console.error('Could not play portfolio audio.', error);
    }
  });

  if (entryGate?.showModal && entryGatePlay && entryGateSilent) {
    entryGate.classList.add('is-entering');
    entryGate.showModal();
    window.setTimeout(() => entryGate.classList.remove('is-entering'), 30);
    let entryGateCloseTimer;

    const closeEntryGate = () => {
      if (!entryGate.open || entryGate.classList.contains('is-closing')) return;
      entryGate.classList.add('is-closing');
      entryGateCloseTimer = window.setTimeout(() => {
        if (entryGate.open) entryGate.close();
      }, 450);
    };

    entryGate.addEventListener('transitionend', event => {
      if (event.propertyName !== 'opacity' || event.target !== entryGate || !entryGate.classList.contains('is-closing')) return;
      window.clearTimeout(entryGateCloseTimer);
      entryGate.close();
    });
    entryGate.addEventListener('cancel', event => {
      event.preventDefault();
      closeEntryGate();
    });
    entryGatePlay.addEventListener('click', async () => {
      entryGatePlay.disabled = true;
      if (entryGateStatus) entryGateStatus.textContent = 'Starting soundtrack…';
      try {
        const playRequest = portfolioAudio.play();
        closeEntryGate();
        await playRequest;
      } catch (error) {
        if (error?.name === 'AbortError' && !portfolioAudio.paused) {
          return;
        }
        if (audioStatus) audioStatus.textContent = 'Sound could not be started. Use the soundtrack button to try again.';
        console.error('Could not start soundtrack from the entry screen.', error);
      } finally {
        entryGatePlay.disabled = false;
      }
    });
    entryGateSilent.addEventListener('click', closeEntryGate);
  }
}

const processSteps = document.querySelector('.process-steps');
if (processSteps) {
  const steps = [...processSteps.querySelectorAll('li')];
  let framePending = false;

  const updateProcessFocus = () => {
    framePending = false;
    const sectionBounds = processSteps.getBoundingClientRect();
    if (sectionBounds.bottom < 0 || sectionBounds.top > window.innerHeight) return;

    const focusLine = window.innerHeight * .5;
    let activeStep = steps[0];
    let closestDistance = Infinity;

    for (const step of steps) {
      const bounds = step.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - focusLine);
      if (distance < closestDistance) {
        closestDistance = distance;
        activeStep = step;
      }
    }

    processSteps.classList.add('has-focus');
    for (const step of steps) step.classList.toggle('is-active', step === activeStep);
    const progress = activeStep.offsetTop + activeStep.offsetHeight / 2;
    processSteps.style.setProperty('--process-progress', `${Math.round(progress)}px`);
  };

  const scheduleProcessFocus = () => {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(updateProcessFocus);
  };

  window.addEventListener('scroll', scheduleProcessFocus, { passive: true });
  window.addEventListener('resize', scheduleProcessFocus);
  scheduleProcessFocus();
}
