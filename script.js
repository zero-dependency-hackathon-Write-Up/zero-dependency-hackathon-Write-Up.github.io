// 1. Lenis Smooth Scroll Initialization
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// 2. Reading Progress Bar
const progressBar = document.getElementById("progressBar");

if (progressBar) {
  lenis.on("scroll", (e) => {
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScrollable > 0) {
      const scrolled = (e.scroll / totalScrollable) * 100;
      progressBar.style.width = scrolled + "%";
    }
  });
}

// 3. MDN-Style Theme Dropdown Engine (OS Default / Light / Dark)
const themeMenuBtn = document.getElementById("themeMenuButton");
const themeDropdown = document.getElementById("themeDropdown");
const themeCurrentIcon = document.getElementById("themeCurrentIcon");
const themeOptions = document.querySelectorAll(".theme-option");
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getStoredTheme() {
  return localStorage.getItem("theme") || "system";
}

function applyTheme(setting) {
  let effectiveTheme = setting;
  if (setting === "system") {
    effectiveTheme = mediaQuery.matches ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-theme", effectiveTheme);

  // Sync navbar button icon
  if (setting === "system") {
    themeCurrentIcon.className = "fa-solid fa-circle-half-stroke";
  } else if (setting === "dark") {
    themeCurrentIcon.className = "fa-solid fa-moon";
  } else {
    themeCurrentIcon.className = "fa-solid fa-sun";
  }

  // Update dropdown checkmarks
  themeOptions.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeValue === setting);
  });
}

// Set initial theme
applyTheme(getStoredTheme());

// Listen for dynamic OS theme adjustments
mediaQuery.addEventListener("change", () => {
  if (getStoredTheme() === "system") {
    applyTheme("system");
  }
});

// Dropdown interactions and click-outside dismissal
if (themeMenuBtn && themeDropdown) {
  themeMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isExpanded = themeMenuBtn.getAttribute("aria-expanded") === "true";
    themeMenuBtn.setAttribute("aria-expanded", !isExpanded);
    themeDropdown.hidden = isExpanded;
  });

  themeOptions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosenTheme = btn.dataset.themeValue;
      localStorage.setItem("theme", chosenTheme);
      applyTheme(chosenTheme);
      themeDropdown.hidden = true;
      themeMenuBtn.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (e) => {
    if (!themeDropdown.contains(e.target) && e.target !== themeMenuBtn) {
      themeDropdown.hidden = true;
      themeMenuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// 4. Clipboard Icon Copy Buttons for all Code Blocks
document.querySelectorAll("pre").forEach((block) => {
  const btn = document.createElement("button");
  btn.className = "copy-code-btn";
  btn.setAttribute("aria-label", "Copy code to clipboard");
  btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';

  btn.addEventListener("click", async () => {
    const codeElement = block.querySelector("code");
    const textToCopy = codeElement ? codeElement.innerText : block.innerText;

    try {
      await navigator.clipboard.writeText(textToCopy);
      btn.classList.add("copied");
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
      }, 1500);
    } catch (err) {
      btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
      }, 1500);
    }
  });

  block.appendChild(btn);
});

// 5. Feedback Formspree / Native AJAX Handler
const form = document.getElementById("submissionForm");
const status = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", async (e) => {
    if (form.action.includes("YOUR_FORM_ID")) {
      e.preventDefault();
      alert("Note saved locally. (Replace YOUR_FORM_ID with your Formspree ID in index.html to receive submissions via email).");
      form.reset();
      return;
    }

    e.preventDefault();
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        status.textContent = "Feedback received. Thanks for checking out the tool!";
        form.reset();
      } else {
        status.textContent = "Submission error. Please try again later.";
      }
    } catch (error) {
      status.textContent = "Submission error. Please try again later.";
    }
  });
}
