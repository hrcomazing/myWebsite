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

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const aircraftBackground = document.querySelector("[data-aircraft-background]");
const aircraftAsset = document.querySelector("[data-aircraft-asset]");
const scrollAircraft = document.querySelector("[data-scroll-aircraft]");
let previousScrollAircraftY = window.scrollY;

if (aircraftAsset) {
  aircraftAsset.addEventListener("error", () => {
    aircraftAsset.hidden = true;
  });
}

const fakeTerminalLines = [
  {
    type: "command",
    text: "tail -f /avionics/fms/diag.log",
  },
  {
    type: "log",
    time: "14:22:03.118",
    severity: "INFO",
    category: "BUS",
    text: "signal integrity nominal; arinc429 frame gap stable",
  },
  {
    type: "log",
    time: "14:22:03.642",
    severity: "INFO",
    category: "TIMING",
    text: "timing jitter within tolerance; max observed 0.31 ms",
  },
  {
    type: "command",
    text: "trace --bus arinc429 --window 500ms",
  },
  {
    type: "log",
    time: "14:22:04.090",
    severity: "WARN",
    category: "ROOT_CAUSE",
    text: "symptom converted to falsifiable signal",
    tone: "warn",
  },
  {
    type: "log",
    time: "14:22:04.214",
    severity: "INFO",
    category: "NAV",
    text: "interface boundary isolated between nav input normalization and FMS handoff",
  },
  {
    type: "command",
    text: 'rag-query "last known root cause pattern"',
  },
  {
    type: "log",
    time: "14:22:05.001",
    severity: "INFO",
    category: "RAG",
    text: "retrieval match: previous integration failure pattern",
  },
  {
    type: "log",
    time: "14:22:05.188",
    severity: "INFO",
    category: "AI_ASSIST",
    text: "candidate hypothesis ranked; engineer review required before change",
  },
  {
    type: "command",
    text: "verify --fix candidate.patch",
  },
  {
    type: "log",
    time: "14:22:06.336",
    severity: "HOLD",
    category: "VERIFY",
    text: "candidate fix requires verification against recorded timing window",
    tone: "warn",
  },
  {
    type: "log",
    time: "14:22:06.812",
    severity: "INFO",
    category: "FMS",
    text: "deterministic behavior preserved in simulated regression pass",
  },
];

class FakeTerminal {
  constructor(element, lines = fakeTerminalLines) {
    this.element = element;
    this.output = element.querySelector("[data-fake-terminal-output]");
    this.lines = lines;
    this.prompt = element.dataset.prompt || "hirsh@flight-lab:~$";
    this.timeouts = [];
    this.runId = 0;
  }

  schedule(callback, delay) {
    const timeout = window.setTimeout(callback, delay);
    this.timeouts.push(timeout);
  }

  stop() {
    this.runId += 1;
    this.timeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.timeouts = [];
  }

  clear() {
    if (this.output) {
      this.output.innerHTML = "";
    }
  }

  scrollToBottom() {
    if (this.output) {
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  createLine(line) {
    const row = document.createElement("p");
    row.className = "fake-terminal-line";

    const label = document.createElement("span");
    const textNode = document.createTextNode("");

    if (line.type === "command") {
      label.className = "fake-terminal-prompt";
      label.textContent = this.prompt;
    } else {
      label.className = `fake-terminal-time${line.tone === "warn" ? " fake-terminal-warn" : ""}`;
      label.textContent = line.time;

      const severity = document.createElement("span");
      severity.className = `fake-terminal-severity${line.tone === "warn" ? " fake-terminal-warn" : ""}`;
      severity.textContent = line.severity || "INFO";

      const category = document.createElement("span");
      category.className = "fake-terminal-category";
      category.textContent = line.category || "DIAG";

      row.append(label, severity, category, textNode);
      this.output.appendChild(row);
      this.scrollToBottom();

      return { row, textNode };
    }

    row.append(label, textNode);
    this.output.appendChild(row);
    this.scrollToBottom();

    return { row, textNode };
  }

  addCursor(row) {
    const cursor = document.createElement("span");
    cursor.className = "fake-terminal-cursor";
    cursor.setAttribute("aria-hidden", "true");
    row.appendChild(cursor);
  }

  renderStatic() {
    this.stop();
    if (!this.output) return;

    this.clear();
    this.lines.forEach((line, index) => {
      const { row, textNode } = this.createLine(line);
      textNode.textContent = ` ${line.text}`;

      if (index === this.lines.length - 1) {
        this.addCursor(row);
      }
    });
    this.scrollToBottom();
  }

  typeText(textNode, text, index, done, runId) {
    if (runId !== this.runId) return;

    textNode.textContent = ` ${text.slice(0, index)}`;
    this.scrollToBottom();

    if (index >= text.length) {
      done();
      return;
    }

    this.schedule(() => this.typeText(textNode, text, index + 1, done, runId), 14);
  }

  streamLine(index, runId) {
    if (!this.output || runId !== this.runId) return;

    if (index >= this.lines.length) {
      this.schedule(() => this.start(), 2800);
      return;
    }

    const line = this.lines[index];
    const { row, textNode } = this.createLine(line);
    const isLast = index === this.lines.length - 1;
    const showNext = () => {
      if (isLast) {
        this.addCursor(row);
      }

      this.schedule(() => this.streamLine(index + 1, runId), line.type === "command" ? 320 : 560);
    };

    if (line.type === "command") {
      this.typeText(textNode, line.text, 0, showNext, runId);
    } else {
      this.schedule(() => {
        textNode.textContent = ` ${line.text}`;
        this.scrollToBottom();
        showNext();
      }, 180);
    }
  }

  start() {
    this.stop();
    if (!this.output) return;

    if (motionQuery.matches) {
      this.renderStatic();
      return;
    }

    this.clear();
    const runId = this.runId;
    this.streamLine(0, runId);
  }
}

const fakeTerminals = Array.from(document.querySelectorAll("[data-fake-terminal]")).map(
  (terminal) => new FakeTerminal(terminal)
);

fakeTerminals.forEach((terminal) => {
  terminal.start();
});

const updateAircraftParallax = () => {
  if (!aircraftBackground || motionQuery.matches) {
    root.style.setProperty("--aircraft-parallax-x", "0px");
    root.style.setProperty("--aircraft-parallax-y", "0px");
    return;
  }

  const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(window.scrollY / maxScroll, 1);
  const heroProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
  const x = Math.sin(progress * Math.PI) * 18;
  const y = heroProgress * -24;

  root.style.setProperty("--aircraft-parallax-x", `${x.toFixed(2)}px`);
  root.style.setProperty("--aircraft-parallax-y", `${y.toFixed(2)}px`);
};

const updateScrollAircraftPosition = () => {
  if (!scrollAircraft || motionQuery.matches) return;

  const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
  const currentScroll = window.scrollY;
  const progress = Math.min(currentScroll / maxScroll, 1);
  const arc = Math.sin(progress * Math.PI);
  const x = -18 + progress * 136;
  const y = 70 - progress * 54 - arc * 7;
  const angle = -9 + progress * 18;
  const opacity = 0.34 + arc * 0.24;

  if (Math.abs(currentScroll - previousScrollAircraftY) > 1) {
    root.style.setProperty("--scroll-aircraft-direction", currentScroll > previousScrollAircraftY ? "-1" : "1");
    previousScrollAircraftY = currentScroll;
  }

  root.style.setProperty("--scroll-aircraft-x", `${x.toFixed(2)}vw`);
  root.style.setProperty("--scroll-aircraft-y", `${y.toFixed(2)}vh`);
  root.style.setProperty("--scroll-aircraft-angle", `${angle.toFixed(2)}deg`);
  root.style.setProperty("--scroll-aircraft-opacity", opacity.toFixed(2));
};

let aircraftFrame = null;

const scheduleAircraftUpdate = () => {
  if (aircraftFrame !== null) return;

  aircraftFrame = window.requestAnimationFrame(() => {
    aircraftFrame = null;
    updateAircraftParallax();
    updateScrollAircraftPosition();
  });
};

updateAircraftParallax();
updateScrollAircraftPosition();
window.addEventListener("scroll", scheduleAircraftUpdate, { passive: true });
window.addEventListener("resize", scheduleAircraftUpdate);

if (typeof motionQuery.addEventListener === "function") {
  motionQuery.addEventListener("change", () => {
    updateAircraftParallax();
    updateScrollAircraftPosition();
    fakeTerminals.forEach((terminal) => terminal.start());
  });
} else if (typeof motionQuery.addListener === "function") {
  motionQuery.addListener(() => {
    updateAircraftParallax();
    updateScrollAircraftPosition();
    fakeTerminals.forEach((terminal) => terminal.start());
  });
}
