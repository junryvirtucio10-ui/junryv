export function initProcess() {
  const processSteps = document.querySelector(".process-steps");
  if (processSteps) {
    const steps = [...processSteps.querySelectorAll("li")];
    if (!steps.length) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let framePending = false;

    const updateProcessFocus = () => {
      framePending = false;
      if (reducedMotion.matches) {
        processSteps.classList.remove("has-focus");
        return;
      }
      const sectionBounds = processSteps.getBoundingClientRect();
      if (sectionBounds.bottom < 0 || sectionBounds.top > window.innerHeight) return;

      const focusLine = window.innerHeight * 0.5;
      const focusRange = Math.max(220, window.innerHeight * 0.55);
      let activeStep = steps[0];
      let closestDistance = Infinity;

      for (const step of steps) {
        const bounds = step.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - focusLine);
        const focus = Math.max(0, 1 - distance / focusRange);
        step.style.setProperty("--step-focus", focus.toFixed(3));
        if (distance < closestDistance) {
          closestDistance = distance;
          activeStep = step;
        }
      }

      processSteps.classList.add("has-focus");
      for (const step of steps) step.classList.toggle("is-active", step === activeStep);
      const progress = Math.max(
        0,
        Math.min(processSteps.offsetHeight, focusLine - sectionBounds.top),
      );
      processSteps.style.setProperty("--process-progress", `${Math.round(progress)}px`);
    };

    const scheduleProcessFocus = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(updateProcessFocus);
    };

    window.addEventListener("scroll", scheduleProcessFocus, { passive: true });
    window.addEventListener("resize", scheduleProcessFocus);
    reducedMotion.addEventListener("change", scheduleProcessFocus);
    scheduleProcessFocus();
  }
}
