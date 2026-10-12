export function initWork() {
  const workSection = document.querySelector("#work");
  if (!workSection) return;
  const filterButtons = [...workSection.querySelectorAll(".filter-button")];
  const videoHoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
  const videoHoverCursor = document.createElement("div");
  videoHoverCursor.className = "video-hover-cursor";
  videoHoverCursor.setAttribute("aria-hidden", "true");
  videoHoverCursor.innerHTML = "<span>View project</span><span>↗</span>";
  document.body.append(videoHoverCursor);

  const hideVideoCursor = () => {
    videoHoverCursor.classList.remove("is-visible");
    document.body.classList.remove("video-cursor-active");
  };
  const moveVideoCursor = (event) => {
    if (!videoHoverMedia.matches || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const left = Math.max(8, bounds.left + 8);
    const right = Math.min(window.innerWidth - 152, bounds.right - 152);
    const top = Math.max(8, bounds.top + 8);
    const bottom = Math.min(window.innerHeight - 46, bounds.bottom - 46);
    if (right < left || bottom < top) {
      hideVideoCursor();
      return;
    }
    const x = Math.max(left, Math.min(event.clientX - 72, right));
    const y = Math.max(top, Math.min(event.clientY - 19, bottom));
    videoHoverCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    videoHoverCursor.classList.add("is-visible");
    document.body.classList.add("video-cursor-active");
  };
  workSection.querySelectorAll(".video-media, .reel-card").forEach((card) => {
    card.addEventListener("pointerenter", moveVideoCursor);
    card.addEventListener("pointermove", moveVideoCursor);
    card.addEventListener("pointerleave", hideVideoCursor);
    card.addEventListener("click", hideVideoCursor);
  });
  videoHoverMedia.addEventListener("change", hideVideoCursor);
  window.addEventListener("scroll", hideVideoCursor, { passive: true });
  window.addEventListener("blur", hideVideoCursor);
  document.addEventListener("keydown", hideVideoCursor);
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => {
      const selected = button.dataset.filter;
      hideVideoCursor();
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      workSection.querySelectorAll("[data-group]").forEach((group) => {
        group.hidden = selected !== "all" && group.dataset.group !== selected;
      });
    }),
  );
}
