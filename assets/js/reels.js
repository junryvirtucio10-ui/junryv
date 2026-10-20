export function initReels(root) {
  const carousel = root.querySelector(".reels-carousel");
  const stage = carousel?.querySelector(".reels-grid");
  if (!stage) return;
  // Add another .reel-card in index.html: slides and controls use this list automatically.
  const sources = [...stage.querySelectorAll(".reel-card")];
  if (sources.length < 3) return;
  const navigation = carousel.querySelector(".reels-navigation");
  const status = carousel.querySelector(".reels-status");
  const dots = carousel.querySelector(".reels-dots");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = 0;
  let moving = false;
  let gesture = null;
  let suppressClick = false;
  let suppressionTimer;
  const wrap = (index) => (index + sources.length) % sources.length;
  const title = (index) => sources[index].querySelector("img").alt;
  const step = () => stage.clientWidth * (window.innerWidth <= 680 ? 0.64 : 0.33);

  const position = (shift = 0) => {
    stage.querySelectorAll(".reel-card").forEach((card) => {
      const offset = Number(card.dataset.slot) + shift;
      const distance = Math.min(Math.abs(offset), 1);
      card.style.transform = `translate(-50%, -50%) translateX(${offset * step()}px) scale(${1 - distance * 0.16})`;
      card.style.opacity = String(1 - distance * 0.54);
    });
  };

  const render = () => {
    stage.classList.remove("is-moving", "is-dragging");
    const cards = [];
    // Extra offscreen neighbours make the wrap seamless, including with just three reels.
    for (let slot = -2; slot <= 2; slot += 1) {
      const index = wrap(active + slot);
      const card = sources[index].cloneNode(true);
      card.dataset.slot = String(slot);
      card.dataset.reelIndex = String(index);
      card.draggable = false;
      card.querySelector("img").draggable = false;
      card.classList.toggle("is-active", slot === 0);
      card.setAttribute("aria-label", slot === 0 ? `Watch ${title(index)} on Facebook` : `Show ${title(index)}`);
      if (slot !== 0) {
        card.setAttribute("role", "button");
        card.removeAttribute("target");
        card.querySelector(".reel-bottom").innerHTML = 'BRING INTO FOCUS <b aria-hidden="true">↔</b>';
      }
      if (Math.abs(slot) > 1) {
        card.inert = true;
        card.setAttribute("aria-hidden", "true");
      }
      cards.push(card);
    }
    stage.replaceChildren(...cards);
    position();
    status.textContent = `${String(active + 1).padStart(2, "0")} / ${String(sources.length).padStart(2, "0")} — ${title(active)}`;
    [...dots.children].forEach((dot, index) => {
      dot.setAttribute("aria-pressed", String(index === active));
    });
  };

  const move = (direction, destination = wrap(active + direction)) => {
    if (moving) return;
    moving = true;
    if (stage.contains(document.activeElement)) carousel.focus({ preventScroll: true });
    stage.classList.remove("is-dragging");
    // Commit the current drag position before starting the snap animation.
    stage.getBoundingClientRect();
    stage.classList.add("is-moving");
    position(-direction);
    window.setTimeout(() => {
      active = destination;
      render();
      moving = false;
    }, reducedMotion.matches ? 0 : 420);
  };

  sources.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show reel ${index + 1}: ${title(index)}`);
    dot.addEventListener("click", () => {
      if (index === active) return;
      const forward = wrap(index - active);
      move(forward <= sources.length / 2 ? 1 : -1, index);
    });
    dots.append(dot);
  });
  navigation.querySelectorAll("[data-reel-direction]").forEach((button) => {
    button.addEventListener("click", () => move(Number(button.dataset.reelDirection)));
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === " " && event.target.matches('.reel-card[role="button"]')) {
      event.preventDefault();
      event.target.click();
    }
  });
  stage.addEventListener("click", (event) => {
    const card = event.target.closest(".reel-card");
    if (!card) return;
    if (suppressClick || moving) {
      event.preventDefault();
      return;
    }
    const slot = Number(card.dataset.slot);
    if (slot !== 0) {
      event.preventDefault();
      move(Math.sign(slot));
    }
  });
  stage.addEventListener("dragstart", (event) => event.preventDefault());
  stage.addEventListener("pointerdown", (event) => {
    if (moving || !event.isPrimary || event.button !== 0) return;
    stage.classList.remove("is-moving");
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0, dragging: false };
  });
  stage.addEventListener("pointermove", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(y) > 10 && Math.abs(y) > Math.abs(x)) {
        gesture = null;
        return;
      }
      if (Math.abs(x) < 8) return;
      gesture.dragging = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("is-dragging");
    }
    gesture.distance = Math.max(-step(), Math.min(step(), x));
    position(gesture.distance / step());
  });
  const finishGesture = (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const { distance, dragging } = gesture;
    gesture = null;
    if (!dragging) return;
    suppressClick = true;
    window.clearTimeout(suppressionTimer);
    suppressionTimer = window.setTimeout(() => { suppressClick = false; }, 150);
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (event.type !== "pointercancel" && Math.abs(distance) >= Math.min(55, step() * 0.2)) {
      move(distance < 0 ? 1 : -1);
    } else {
      stage.classList.remove("is-dragging");
      stage.classList.add("is-moving");
      position();
    }
  };
  stage.addEventListener("pointerup", finishGesture);
  stage.addEventListener("pointercancel", finishGesture);
  stage.addEventListener("pointerleave", () => { if (gesture && !gesture.dragging) gesture = null; });
  window.addEventListener("resize", () => { if (!moving) position(); });
  carousel.classList.add("is-ready");
  navigation.hidden = false;
  render();
}
