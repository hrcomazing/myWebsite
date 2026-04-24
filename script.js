const capabilityContent = {
  avionics: {
    kicker: "Safety-critical engineering",
    index: "01",
    title: "Deterministic avionics software with respect for timing, interfaces, and reliability.",
    copy:
      "I am strongest when software has to behave predictably and the cost of ambiguity is real. That means disciplined interfaces, careful tasking, and implementation that respects the system around it.",
    points: [
      "Ada/C implementation for embedded and avionics-oriented systems",
      "Attention to deterministic behavior, maintainability, and integration boundaries",
      "Comfort operating in systems where verification matters as much as velocity",
    ],
  },
  debugging: {
    kicker: "Root-cause analysis",
    index: "02",
    title: "Systems debugging that turns scattered symptoms into a verified explanation.",
    copy:
      "I like technical environments where the issue is not obvious and the truth is distributed across interfaces, tooling, and runtime behavior. The work is to reduce noise, isolate the real boundary, and prove the fix.",
    points: [
      "Structured triage across runtime signals, assumptions, and handoff points",
      "Instrumentation-first approach when the system is opaque or integration-heavy",
      "Bias toward reusable debugging methods instead of one-off heroics",
    ],
  },
  tooling: {
    kicker: "Practical automation",
    index: "03",
    title: "AI tooling designed as engineering infrastructure rather than hype.",
    copy:
      "I use AI where it can reduce friction for real work: search, documentation, synthesis, and execution support. The bar is simple: the workflow has to be useful, trustworthy, and worth repeating.",
    points: [
      "Local-first workflows for technical knowledge retrieval and reuse",
      "Automation shaped around engineering tasks, not generic chatbot interactions",
      "Care for operator trust, signal quality, and clear human handoff points",
    ],
  },
};

const depthContent = {
  workflow: {
    label: "Repeatable diagnosis",
    title: "A debugging workflow built to reduce ambiguity quickly.",
    copy:
      "My default debugging pattern is simple: build a model of the system, instrument the boundaries that can falsify that model, isolate the failure mode, then verify the fix under the same conditions that produced the issue.",
    points: [
      "Start with signals, not stories. Symptoms are clues, not conclusions.",
      "Reduce the search space by checking interfaces, assumptions, and timing boundaries.",
      "Leave behind better observability so the same class of issue is easier to diagnose next time.",
    ],
  },
  interfaces: {
    label: "Interface contracts",
    title: "Ada/C boundaries are where reliability is protected or quietly lost.",
    copy:
      "In embedded work, interface quality has a long half-life. Clear contracts, explicit assumptions, and disciplined data handling make systems easier to integrate, reason about, and trust over time.",
    points: [
      "Be precise about ownership, expectations, and failure behavior at boundaries.",
      "Treat interface clarity as a reliability tool, not just a style preference.",
      "Design for maintainers who need to understand the system under pressure later.",
    ],
  },
  tooling: {
    label: "Applied AI",
    title: "Useful AI systems come from workflow design, not model enthusiasm.",
    copy:
      "The interesting part is not adding AI for its own sake. It is choosing the right point in an engineering workflow where retrieval, summarization, or structured automation can save time without weakening rigor.",
    points: [
      "Keep humans in charge of judgment while reducing lookup and synthesis overhead.",
      "Prefer local control and repeatability where technical context is sensitive.",
      "Measure success by whether engineers actually return to the workflow the next day.",
    ],
  },
};

const setListItems = (element, items) => {
  element.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
};

const activateButtons = (buttons, activeButton) => {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

const capabilityButtons = document.querySelectorAll("[data-capability]");
const capabilityKicker = document.getElementById("capability-kicker");
const capabilityIndex = document.getElementById("capability-index");
const capabilityTitle = document.getElementById("capability-title");
const capabilityCopy = document.getElementById("capability-copy");
const capabilityPoints = document.getElementById("capability-points");

capabilityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = capabilityContent[button.dataset.capability];
    if (!content) return;

    activateButtons(capabilityButtons, button);
    capabilityKicker.textContent = content.kicker;
    capabilityIndex.textContent = content.index;
    capabilityTitle.textContent = content.title;
    capabilityCopy.textContent = content.copy;
    setListItems(capabilityPoints, content.points);
  });
});

const depthButtons = document.querySelectorAll("[data-depth]");
const depthLabel = document.getElementById("depth-label");
const depthTitle = document.getElementById("depth-title");
const depthCopy = document.getElementById("depth-copy");
const depthPointOne = document.getElementById("depth-point-1");
const depthPointTwo = document.getElementById("depth-point-2");
const depthPointThree = document.getElementById("depth-point-3");

depthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = depthContent[button.dataset.depth];
    if (!content) return;

    activateButtons(depthButtons, button);
    depthLabel.textContent = content.label;
    depthTitle.textContent = content.title;
    depthCopy.textContent = content.copy;
    depthPointOne.textContent = content.points[0];
    depthPointTwo.textContent = content.points[1];
    depthPointThree.textContent = content.points[2];
  });
});

const navLinks = document.querySelectorAll("[data-nav-link]");
const sectionMap = new Map(
  Array.from(document.querySelectorAll("[data-section]")).map((section) => [section.dataset.section, section])
);

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navLink === sectionId);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.dataset.section);
      }
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0,
  }
);

sectionMap.forEach((section) => {
  sectionObserver.observe(section);
});

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -6% 0px",
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const yearNode = document.getElementById("current-year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}
