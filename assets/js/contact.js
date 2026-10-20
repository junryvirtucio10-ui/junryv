export function initContact() {
  const section = document.querySelector("#contact");
  if (!section) return;
  const form = section.querySelector("form");
  const projectType = form.querySelector("#project-type");
  const choices = [...section.querySelectorAll("[data-project]")];
  const required = [...form.querySelectorAll("[required]")];
  const progress = section.querySelector(".brief-progress-track");
  const count = section.querySelector("#brief-progress-count");
  const label = section.querySelector("#brief-progress-label");
  const editor = section.querySelector(".contact-editor");
  const previewWord = editor.querySelector(".preview-word");
  const previewCorner = editor.querySelector(".preview-corner");
  const previews = {
    "Video editing": ["edit", "MAKE", "IT POP.", "STORY / SOUND / RHYTHM"],
    "Short-form reels": ["reels", "STOP", "THE SCROLL.", "SHORT FORM. BIG ENERGY."],
    "Social media management": ["social", "SHOW", "UP LOUD.", "YOUR BRAND. IN MOTION."],
    "Graphics / thumbnails": ["graphics", "LOOK", "SHARP.", "VISUALS THAT GET THE CLICK."],
  };
  let lastProject = "";
  let cutTimer;
  const updateBrief = () => {
    choices.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.project === projectType.value));
    });
    if (projectType.value !== lastProject) {
      lastProject = projectType.value;
      const [theme, first, second, caption] = previews[lastProject] || ["edit", "MAKE", "IT POP.", "YOUR IDEA, REIMAGINED"];
      editor.dataset.preview = theme;
      previewWord.replaceChildren(document.createTextNode(first), document.createElement("br"));
      const emphasis = document.createElement("b");
      emphasis.textContent = second;
      previewWord.append(emphasis);
      previewCorner.textContent = caption;
      editor.classList.remove("preview-changing");
      requestAnimationFrame(() => editor.classList.add("preview-changing"));
      clearTimeout(cutTimer);
      cutTimer = setTimeout(() => editor.classList.remove("preview-changing"), 450);
    }
    const completed = required.filter((field) => field.value.trim() && field.validity.valid).length;
    progress.style.setProperty("--brief-complete", `${(completed / required.length) * 100}%`);
    progress.setAttribute("aria-valuemax", String(required.length));
    progress.setAttribute("aria-valuenow", String(completed));
    count.textContent = `${completed} / ${required.length}`;
    const message = completed === required.length ? "Your brief is ready. Let’s hit play." : completed ? "Nice. Your next project is taking shape." : "Let’s get your idea rolling";
    if (label.textContent !== message) label.textContent = message;
  };
  choices.forEach((button) => {
    button.addEventListener("click", () => {
      projectType.value = button.dataset.project;
      projectType.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  form.addEventListener("input", updateBrief);
  form.addEventListener("change", updateBrief);
  form.addEventListener("reset", () => requestAnimationFrame(updateBrief));
  window.addEventListener("pageshow", updateBrief);
  updateBrief();

  const play = editor.querySelector(".editor-play");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let playing = !motionPreference.matches;
  const updatePlayback = () => {
    editor.classList.toggle("is-paused", !playing);
    editor.classList.toggle("is-playing", playing);
    play.setAttribute("aria-label", playing ? "Pause creative preview" : "Play creative preview");
    play.setAttribute("aria-pressed", String(playing));
    play.querySelector("span").textContent = playing ? "Ⅱ" : "▶";
  };
  play.addEventListener("click", () => {
    playing = !playing;
    updatePlayback();
  });
  motionPreference.addEventListener("change", () => {
    playing = !motionPreference.matches;
    updatePlayback();
  });
  updatePlayback();
}
