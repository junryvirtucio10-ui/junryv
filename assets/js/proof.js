export function initProof() {
  const carousel = document.querySelector(".proof-carousel");
  if (!carousel) return;
  const stage = carousel.querySelector(".proof-stage");
  const cards = [...stage.querySelectorAll(".proof-card")];
  if (!cards.length) return;

  // Read the original work gallery before the reels carousel creates its clones.
  const work = [...document.querySelectorAll("#work .video-card, #work .reel-card")];
  const published = [...new Map(work.map((link) => [link.href, link])).values()];
  const youtube = published.filter((link) => new URL(link.href).hostname.includes("youtube.com"));
  const totals = { all: published.length, youtube: youtube.length, reels: published.length - youtube.length };
  document.querySelectorAll("[data-proof-stat]").forEach((number) => {
    number.textContent = String(totals[number.dataset.proofStat]).padStart(2, "0");
  });

  let active = 0;
  let gesture = null;
  let suppressClick = false;
  let clickTimer;
  const labels = cards.map((card) => card.getAttribute("aria-label"));
  const wrap = (index) => (index + cards.length) % cards.length;
  const render = (index) => {
    if (cards.includes(document.activeElement)) carousel.focus({ preventScroll: true });
    active = wrap(index);
    cards.forEach((card, cardIndex) => {
      const position = cardIndex === active ? "active"
        : cardIndex === wrap(active - 1) ? "previous"
        : cardIndex === wrap(active + 1) ? "next" : "hidden";
      card.dataset.position = position;
      card.tabIndex = position === "active" ? 0 : -1;
      card.setAttribute("aria-hidden", String(position !== "active"));
      card.setAttribute("aria-label", labels[cardIndex]);
      card.inert = position === "hidden";
    });
    carousel.querySelector(".proof-current").textContent = String(active + 1).padStart(2, "0");
    carousel.querySelector(".proof-current-title").textContent = ` — ${cards[active].querySelector("img").alt}`;
  };
  carousel.querySelector(".proof-total").textContent = String(cards.length).padStart(2, "0");
  carousel.querySelectorAll("[data-proof-direction]").forEach((button) => {
    button.addEventListener("click", () => render(active + Number(button.dataset.proofDirection)));
  });
  carousel.addEventListener("keydown", (event) => {
    const destinations = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: cards.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    render(destinations[event.key]);
  });
  stage.addEventListener("click", (event) => {
    const card = event.target.closest(".proof-card");
    if (!card) return;
    if (suppressClick) { event.preventDefault(); return; }
    const index = cards.indexOf(card);
    if (index !== active) { event.preventDefault(); render(index); }
  });
  stage.addEventListener("dragstart", (event) => event.preventDefault());
  stage.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0, dragging: false };
  });
  stage.addEventListener("pointermove", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(y) > 10 && Math.abs(y) > Math.abs(x)) { gesture = null; return; }
      if (Math.abs(x) < 10) return;
      gesture.dragging = true;
      stage.setPointerCapture(event.pointerId);
    }
    gesture.distance = x;
  });
  const finish = (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const { distance, dragging } = gesture;
    gesture = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (!dragging) return;
    suppressClick = true;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { suppressClick = false; }, 180);
    if (event.type !== "pointercancel" && Math.abs(distance) > 40) render(active + (distance < 0 ? 1 : -1));
  };
  stage.addEventListener("pointerup", finish);
  stage.addEventListener("pointercancel", finish);
  stage.addEventListener("pointerleave", () => { if (gesture && !gesture.dragging) gesture = null; });
  carousel.classList.add("is-ready");
  carousel.querySelector(".proof-controls").hidden = cards.length < 2;
  render(0);
}
