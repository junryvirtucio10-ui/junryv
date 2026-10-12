export function initMotion() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  const revealElements = [...document.querySelectorAll(".scroll-reveal")];
  const sections = [...document.querySelectorAll("main > section")];
  const media = [...document.querySelectorAll(".video-media, .edit-preview")];
  const hasObservers = "IntersectionObserver" in window;
  const nearbySections = new Set();
  const nearbyMedia = new Set();
  const isFocused = (element) => element.contains(document.activeElement);

  // Enter inside the viewport; reset only after leaving it by a generous margin.
  // Two boundaries avoid flashing when a large entrance crosses the trigger line.
  const revealObserver = hasObservers
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting || isFocused(entry.target)) {
              entry.target.classList.add("is-revealed");
            }
          }
        },
        { threshold: 0, rootMargin: "0px 0px -64px 0px" },
      )
    : null;
  const exitObserver = hasObservers
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting && !isFocused(entry.target)) {
              entry.target.classList.remove("is-revealed");
            }
          }
        },
        { threshold: 0, rootMargin: "160px" },
      )
    : null;
  const activityObserver = hasObservers
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target;
            const collection = target.matches("main > section") ? nearbySections : nearbyMedia;
            if (entry.isIntersecting) collection.add(target);
            else collection.delete(target);
            if (target.matches("main > section")) {
              target.classList.toggle("is-in-view", entry.isIntersecting);
            }
          }
          scheduleScrollMotion();
        },
        { rootMargin: "160px" },
      )
    : null;

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  let pending = false;
  let started = false;
  let observerFrame = 0;

  const updateScrollMotion = () => {
    pending = false;
    if (reducedMotion.matches || !started) return;
    const height = window.innerHeight;
    const mobile = window.innerWidth <= 700;
    const strength = mobile ? 0.55 : 1;
    const distance = Math.max(1, root.scrollHeight - height);

    // Read all geometry before writing styles to avoid repeated layout work.
    const sectionGeometry = [...nearbySections].map((element) => ({
      element,
      bounds: element.getBoundingClientRect(),
    }));
    const mediaGeometry = [...nearbyMedia].map((element) => ({
      element,
      bounds: element.getBoundingClientRect(),
    }));
    root.style.setProperty("--page-progress", clamp(window.scrollY / distance));

    for (const { element, bounds } of sectionGeometry) {
      const phase = clamp((height - bounds.top) / (height + bounds.height));
      const centered = phase - 0.5;
      element.style.setProperty("--section-progress", phase.toFixed(4));
      element.style.setProperty("--accent-drift", `${(centered * 72 * strength).toFixed(1)}px`);
      element.style.setProperty("--grid-shift", `${(centered * -90 * strength).toFixed(1)}px`);
      if (element.classList.contains("hero")) {
        const travel = clamp(-bounds.top, 0, bounds.height);
        element.style.setProperty("--hero-drift-x", `${(-travel * 0.24 * strength).toFixed(1)}px`);
        element.style.setProperty("--hero-drift-y", `${(travel * 0.14 * strength).toFixed(1)}px`);
        element.style.setProperty(
          "--hero-portrait-drift",
          `${(travel * 0.12 * strength).toFixed(1)}px`,
        );
        element.style.setProperty(
          "--hero-portrait-scale",
          (1 + clamp(travel / bounds.height) * 0.08 * strength).toFixed(4),
        );
      }
      if (element.classList.contains("about-section")) {
        element.style.setProperty("--about-drift", `${(centered * -220 * strength).toFixed(1)}px`);
        element.style.setProperty("--portrait-scale", (1.16 - phase * 0.16).toFixed(4));
      }
      if (element.classList.contains("services-section")) {
        element.style.setProperty("--service-turn", `${(centered * -26 * strength).toFixed(2)}deg`);
        element.style.setProperty("--service-float", `${(centered * -52 * strength).toFixed(1)}px`);
      }
    }
    for (const { element, bounds } of mediaGeometry) {
      const phase = clamp((height - bounds.top) / (height + bounds.height));
      element.style.setProperty("--media-scale", (1.18 - phase * 0.12).toFixed(4));
      element.style.setProperty(
        "--media-drift",
        `${((phase - 0.5) * -24 * strength).toFixed(1)}px`,
      );
    }
  };
  const scheduleScrollMotion = () => {
    if (pending || reducedMotion.matches || !started) return;
    pending = true;
    requestAnimationFrame(updateScrollMotion);
  };
  const configureMotion = () => {
    cancelAnimationFrame(observerFrame);
    root.classList.toggle("motion-enabled", !reducedMotion.matches);
    root.classList.toggle("reveal-enabled", !reducedMotion.matches && hasObservers);
    revealObserver?.disconnect();
    exitObserver?.disconnect();
    activityObserver?.disconnect();
    nearbySections.clear();
    nearbyMedia.clear();
    sections.forEach((section) => section.classList.remove("is-in-view"));
    if (reducedMotion.matches || !hasObservers) {
      revealElements.forEach((element) => element.classList.add("is-revealed"));
      return;
    }
    // Let the hidden entrance state paint before observing the first screen.
    observerFrame = requestAnimationFrame(() => {
      observerFrame = 0;
      revealElements.forEach((element) => {
        exitObserver.observe(element);
        revealObserver.observe(element);
      });
      [...sections, ...media].forEach((element) => activityObserver.observe(element));
      scheduleScrollMotion();
    });
  };
  const start = () => {
    started = true;
    configureMotion();
  };
  const gate = document.querySelector(".entry-gate");
  if (gate?.open) gate.addEventListener("close", start, { once: true });
  else start();
  reducedMotion.addEventListener("change", () => {
    if (started) configureMotion();
  });
  window.addEventListener("scroll", scheduleScrollMotion, { passive: true });
  window.addEventListener("resize", scheduleScrollMotion);
  window.addEventListener("load", scheduleScrollMotion);
  document.addEventListener("click", scheduleScrollMotion);
  document.addEventListener("focusin", (event) => {
    event.target.closest(".scroll-reveal")?.classList.add("is-revealed");
  });
}
