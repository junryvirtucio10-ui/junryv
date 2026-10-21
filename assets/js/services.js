export function initServices() {
  const cards = [...document.querySelectorAll(".service-card")];
  if (!cards.length) return;
  const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  cards.forEach((card) => {
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ["--card-rx", "--card-ry", "--card-x", "--card-y"].forEach((property) =>
        card.style.removeProperty(property),
      );
    };
    card.addEventListener("pointermove", (event) => {
      if (!pointerMedia.matches || reducedMotion.matches || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        card.style.setProperty("--card-rx", `${((0.5 - y) * 4).toFixed(2)}deg`);
        card.style.setProperty("--card-ry", `${((x - 0.5) * 4).toFixed(2)}deg`);
        card.style.setProperty("--card-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--card-y", `${(y * 100).toFixed(1)}%`);
      });
    });
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
    pointerMedia.addEventListener("change", reset);
    reducedMotion.addEventListener("change", reset);
    window.addEventListener("blur", reset);

  });
}
