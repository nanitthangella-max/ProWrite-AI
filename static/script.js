(() => {
  const HISTORY_KEY = "prowrite_flask_history_v1";

  const EXAMPLE_INPUTS = {
    "Job Application": {
      recipient: "Hiring Manager for Senior Product Designer at Linear",
      keyPoints:
        "6 years designing B2B SaaS workflows; led checkout redesign lifting activation by 24%; deeply admire your keyboard-first UI speed",
    },
    "Referral Request": {
      recipient: "Alex Rivera, Staff Software Engineer at Stripe",
      keyPoints:
        "Applying for Backend Engineer role (Req #4821); 4 years building high-throughput payment APIs in Go; fellow UT Austin alumnus",
    },
    "Interview Follow-up": {
      recipient: "Maya Patel, Technical Recruiter at Figma",
      keyPoints:
        "Completed final panel on Tuesday; excited about the collaborative multiplayer infrastructure team; happy to share additional architecture samples",
    },
    "Internship Request": {
      recipient: "Engineering Internship Team at Datadog",
      keyPoints:
        "Junior CS major graduating May 2027; built a distributed log visualizer in Rust and React; available full-time for Summer 2027",
    },
    "Thank-you After Interview": {
      recipient: "David Chen, VP of Product at Notion",
      keyPoints:
        "Loved discussing your Q3 AI workspace roadmap; appreciated your perspective on user trust; confident my onboarding experience aligns closely",
    },
  };

  const VIEW_LABELS = {
    home: "Home",
    "email-writer": "Email Writer",
    "linkedin-writer": "LinkedIn Message Writer",
    history: "History",
    about: "About",
  };

  // State
  let activeView = "home";
  let activePlatform = "Email";
  let lastOutput = null;
  let variationCount = 0;
  let isLoading = false;
  let historyItems = loadHistory();

  // DOM Elements
  const sidebar = document.getElementById("sidebar");
  const mobileBackdrop = document.getElementById("mobile-backdrop");
  const openSidebarBtn = document.getElementById("open-sidebar-btn");
  const closeSidebarBtn = document.getElementById("close-sidebar-btn");
  const topbarSectionLabel = document.getElementById("topbar-section-label");
  const quickComposeBtn = document.getElementById("quick-compose-btn");
  const historyCountBadge = document.getElementById("history-count-badge");

  const viewHome = document.getElementById("view-home");
  const viewWriter = document.getElementById("view-writer");
  const viewHistory = document.getElementById("view-history");
  const viewAbout = document.getElementById("view-about");

  const writerTitle = document.getElementById("writer-title");
  const writerSubtitle = document.getElementById("writer-subtitle");
  const writerForm = document.getElementById("writer-form");
  const messageTypeSelect = document.getElementById("message-type");
  const recipientInput = document.getElementById("recipient");
  const keyPointsInput = document.getElementById("key-points");
  const platformHelper = document.getElementById("platform-helper");
  const validationAlert = document.getElementById("validation-alert");
  const generateBtn = document.getElementById("generate-btn");
  const fillExampleBtn = document.getElementById("fill-example-btn");

  const outputMeta = document.getElementById("output-meta");
  const outputEmpty = document.getElementById("output-empty");
  const outputLoading = document.getElementById("output-loading");
  const loadingText = document.getElementById("loading-text");
  const outputError = document.getElementById("output-error");
  const outputErrorText = document.getElementById("output-error-text");
  const retryBtn = document.getElementById("retry-btn");

  const emailOutput = document.getElementById("email-output");
  const emailSubjectEl = document.getElementById("email-subject");
  const emailBodyEl = document.getElementById("email-body");
  const copySubjectBtn = document.getElementById("copy-subject-btn");

  const linkedinOutput = document.getElementById("linkedin-output");
  const linkedinBodyEl = document.getElementById("linkedin-body");
  const linkedinCharCount = document.getElementById("linkedin-char-count");
  const linkedinProgress = document.getElementById("linkedin-progress");

  const copyBtn = document.getElementById("copy-btn");
  const regenerateBtn = document.getElementById("regenerate-btn");
  const clearBtn = document.getElementById("clear-btn");

  const historyListEl = document.getElementById("history-list");
  const historyEmptyEl = document.getElementById("history-empty");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyItems));
    } catch {
      // Ignore storage errors
    }
    updateHistoryBadge();
  }

  function updateHistoryBadge() {
    if (historyItems.length > 0) {
      historyCountBadge.textContent = String(historyItems.length);
      historyCountBadge.hidden = false;
    } else {
      historyCountBadge.hidden = true;
    }
  }

  function openMobileMenu() {
    sidebar.classList.add("open");
    mobileBackdrop.hidden = false;
  }

  function closeMobileMenu() {
    sidebar.classList.remove("open");
    mobileBackdrop.hidden = true;
  }

  function setView(view) {
    activeView = view;

    viewHome.hidden = view !== "home";
    viewWriter.hidden = view !== "email-writer" && view !== "linkedin-writer";
    viewHistory.hidden = view !== "history";
    viewAbout.hidden = view !== "about";

    topbarSectionLabel.textContent = VIEW_LABELS[view] || "Home";

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.nav === view);
    });

    if (view === "email-writer") {
      setPlatform("Email", false);
    } else if (view === "linkedin-writer") {
      setPlatform("LinkedIn", false);
    } else if (view === "history") {
      renderHistory();
    }

    closeMobileMenu();
  }

  function setPlatform(platform, syncNav = true) {
    activePlatform = platform;

    document.querySelectorAll(".segment-btn").forEach((btn) => {
      const isSelected = btn.dataset.platform === platform;
      btn.classList.toggle("active", isSelected);
      btn.setAttribute("aria-checked", String(isSelected));
    });

    if (platform === "Email") {
      writerTitle.textContent = "Professional Email Writer";
      writerSubtitle.textContent =
        "Generates a structured Subject line and Email Body tailored to your recipient.";
      platformHelper.textContent =
        "Emails generate a separate Subject line and formatted Body.";
      if (syncNav) setView("email-writer");
    } else {
      writerTitle.textContent = "LinkedIn Message Writer";
      writerSubtitle.textContent =
        "Generates a friendly, concise LinkedIn message strictly under 300 characters.";
      platformHelper.textContent =
        "LinkedIn messages are formatted strictly under 300 characters.";
      if (syncNav) setView("linkedin-writer");
    }

    if (lastOutput && lastOutput.platform !== platform) {
      lastOutput = null;
      renderOutputState("empty");
    } else if (!lastOutput && !isLoading) {
      outputMeta.textContent = `Ready for ${platform} output`;
    }
  }

  function showValidationError(msg) {
    validationAlert.textContent = msg;
    validationAlert.hidden = false;
  }

  function clearValidationError() {
    validationAlert.textContent = "";
    validationAlert.hidden = true;
  }

  function updateToolbarButtons() {
    const hasInputs =
      recipientInput.value.trim().length > 0 ||
      keyPointsInput.value.trim().length > 0;
    const canRegenerate =
      recipientInput.value.trim().length >= 2 &&
      keyPointsInput.value.trim().length >= 5;

    copyBtn.disabled = isLoading || !lastOutput;
    regenerateBtn.disabled = isLoading || (!lastOutput && !canRegenerate);
    clearBtn.disabled = isLoading || (!lastOutput && !hasInputs);
  }

  function renderOutputState(state, errorMessage = "") {
    outputEmpty.hidden = state !== "empty";
    outputLoading.hidden = state !== "loading";
    outputError.hidden = state !== "error";
    emailOutput.hidden = state !== "email";
    linkedinOutput.hidden = state !== "linkedin";

    if (state === "empty") {
      outputMeta.textContent = `Ready for ${activePlatform} output`;
    } else if (state === "loading") {
      loadingText.textContent = `Drafting your ${messageTypeSelect.value.toLowerCase()} for ${activePlatform}...`;
      outputMeta.textContent = "Generating...";
    } else if (state === "error") {
      outputErrorText.textContent = errorMessage;
      outputMeta.textContent = "Generation failed";
    } else if (state === "email" && lastOutput) {
      emailSubjectEl.textContent = lastOutput.subject;
      emailBodyEl.textContent = lastOutput.body;
      const words = lastOutput.body.trim().split(/\s+/).filter(Boolean).length;
      outputMeta.textContent = `Email · ${words} words · ${lastOutput.body.length} chars`;
    } else if (state === "linkedin" && lastOutput) {
      const len = lastOutput.message.length;
      linkedinBodyEl.textContent = lastOutput.message;
      linkedinCharCount.textContent = `${len} / 300 chars`;
      linkedinCharCount.classList.toggle("over-limit", len >= 300);
      const pct = Math.min(100, Math.round((len / 300) * 100));
      linkedinProgress.style.width = `${pct}%`;
      outputMeta.textContent = `LinkedIn · ${len} / 300 chars`;
    }

    updateToolbarButtons();
  }

  async function requestGeneration(variation = 0) {
    const messageType = messageTypeSelect.value;
    const recipient = recipientInput.value.trim();
    const keyPoints = keyPointsInput.value.trim();

    if (recipient.length < 2) {
      showValidationError("Please enter who this message is for.");
      return;
    }
    if (keyPoints.length < 5) {
      showValidationError("Please enter 2–3 key points to include.");
      return;
    }

    clearValidationError();
    isLoading = true;
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating Message...";
    renderOutputState("loading");

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType,
          recipient,
          keyPoints,
          platform: activePlatform,
          variation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Request failed (HTTP ${response.status})`);
      }

      lastOutput = data;
      renderOutputState(data.platform === "Email" ? "email" : "linkedin");

      historyItems.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        messageType,
        recipient,
        keyPoints,
        output: data,
      });
      historyItems = historyItems.slice(0, 50);
      saveHistory();
    } catch (err) {
      renderOutputState(
        "error",
        err instanceof Error ? err.message : "Unable to connect to server."
      );
    } finally {
      isLoading = false;
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Message";
      updateToolbarButtons();
    }
  }

  async function copyText(text, triggerButton, defaultLabel, successLabel) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    triggerButton.textContent = successLabel;
    setTimeout(() => {
      triggerButton.textContent = defaultLabel;
    }, 1800);
  }

  function renderHistory() {
    historyListEl.textContent = "";
    const hasItems = historyItems.length > 0;
    historyEmptyEl.hidden = hasItems;
    clearHistoryBtn.hidden = !hasItems;

    historyItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "history-item";

      const top = document.createElement("div");
      top.className = "history-item-top";

      const left = document.createElement("div");
      const meta = document.createElement("div");
      meta.className = "history-meta";
      const platformStrong = document.createElement("strong");
      platformStrong.textContent = item.output.platform;
      const metaRest = document.createTextNode(
        ` · ${item.messageType} · To: ${item.recipient}`
      );
      meta.appendChild(platformStrong);
      meta.appendChild(metaRest);

      const title = document.createElement("h3");
      title.className = "history-title";
      title.textContent =
        item.output.platform === "Email"
          ? item.output.subject
          : `LinkedIn note to ${item.recipient}`;

      left.appendChild(meta);
      left.appendChild(title);

      const actions = document.createElement("div");
      actions.className = "history-actions";

      const copyItemBtn = document.createElement("button");
      copyItemBtn.type = "button";
      copyItemBtn.className = "btn btn-outline-sm";
      copyItemBtn.textContent = "Copy";
      copyItemBtn.addEventListener("click", () => {
        const text =
          item.output.platform === "Email"
            ? `Subject: ${item.output.subject}\n\n${item.output.body}`
            : item.output.message;
        copyText(text, copyItemBtn, "Copy", "Copied");
      });

      const openItemBtn = document.createElement("button");
      openItemBtn.type = "button";
      openItemBtn.className = "btn btn-outline-sm";
      openItemBtn.textContent = "Open";
      openItemBtn.addEventListener("click", () => {
        messageTypeSelect.value = item.messageType;
        recipientInput.value = item.recipient;
        keyPointsInput.value = item.keyPoints;
        lastOutput = item.output;
        setPlatform(item.output.platform, true);
        renderOutputState(item.output.platform === "Email" ? "email" : "linkedin");
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-outline-sm";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        historyItems = historyItems.filter((x) => x.id !== item.id);
        saveHistory();
        renderHistory();
      });

      actions.appendChild(copyItemBtn);
      actions.appendChild(openItemBtn);
      actions.appendChild(deleteBtn);

      top.appendChild(left);
      top.appendChild(actions);

      const body = document.createElement("p");
      body.className = "history-body";
      body.textContent =
        item.output.platform === "Email"
          ? item.output.body
          : item.output.message;

      card.appendChild(top);
      card.appendChild(body);
      historyListEl.appendChild(card);
    });
  }

  // Event Listeners
  openSidebarBtn.addEventListener("click", openMobileMenu);
  closeSidebarBtn.addEventListener("click", closeMobileMenu);
  mobileBackdrop.addEventListener("click", closeMobileMenu);

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.nav));
  });

  document.querySelectorAll("[data-launch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setPlatform(btn.dataset.launch, true);
    });
  });

  document.querySelectorAll("[data-template]").forEach((btn) => {
    btn.addEventListener("click", () => {
      messageTypeSelect.value = btn.dataset.template;
      setPlatform("Email", true);
    });
  });

  document.querySelectorAll(".segment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setPlatform(btn.dataset.platform, true);
    });
  });

  quickComposeBtn.addEventListener("click", () => {
    if (activeView === "linkedin-writer") {
      recipientInput.value = "";
      keyPointsInput.value = "";
      lastOutput = null;
      renderOutputState("empty");
    } else {
      setPlatform("Email", true);
    }
  });

  fillExampleBtn.addEventListener("click", () => {
    const sample = EXAMPLE_INPUTS[messageTypeSelect.value];
    if (!sample) return;
    recipientInput.value = sample.recipient;
    keyPointsInput.value = sample.keyPoints;
    clearValidationError();
    updateToolbarButtons();
  });

  recipientInput.addEventListener("input", () => {
    clearValidationError();
    updateToolbarButtons();
  });

  keyPointsInput.addEventListener("input", () => {
    clearValidationError();
    updateToolbarButtons();
  });

  writerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    variationCount = 0;
    requestGeneration(0);
  });

  regenerateBtn.addEventListener("click", () => {
    variationCount += 1;
    requestGeneration(variationCount);
  });

  retryBtn.addEventListener("click", () => {
    requestGeneration(variationCount);
  });

  clearBtn.addEventListener("click", () => {
    recipientInput.value = "";
    keyPointsInput.value = "";
    lastOutput = null;
    variationCount = 0;
    clearValidationError();
    renderOutputState("empty");
  });

  copyBtn.addEventListener("click", () => {
    if (!lastOutput) return;
    const text =
      lastOutput.platform === "Email"
        ? `Subject: ${lastOutput.subject}\n\n${lastOutput.body}`
        : lastOutput.message;
    copyText(text, copyBtn, "Copy", "Copied");
  });

  copySubjectBtn.addEventListener("click", () => {
    if (!lastOutput || lastOutput.platform !== "Email") return;
    copyText(lastOutput.subject, copySubjectBtn, "Copy subject", "Subject copied");
  });

  clearHistoryBtn.addEventListener("click", () => {
    historyItems = [];
    saveHistory();
    renderHistory();
  });

  // Init
  updateHistoryBadge();
  updateToolbarButtons();
})();
