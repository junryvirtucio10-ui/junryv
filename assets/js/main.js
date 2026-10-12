import { initNavigation } from "./navigation.js";
import { initServices } from "./services.js";
import { initWork } from "./work.js";
import { initAudio } from "./audio.js";
import { initProcess } from "./process.js";
import { initMotion } from "./motion.js";

// Audio opens the entry dialog before motion waits for the dialog to close.
initNavigation();
initWork();
initServices();
initAudio();
initProcess();
initMotion();

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
