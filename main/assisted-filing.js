/**
 * THE CREATOR'S BULWARK — ASSISTED FILING MODULE
 * HCI Capstone Multimodal Interaction Engine (Voice & Gesture)
 *
 * Implements:
 * 1. Voice User Interface (predictable command set, state validation, safety restrictions)
 * 2. Voice-Assisted Form Entry (Dictation with text review before insertion)
 * 3. Gesture Interaction Engine (Complete Gesture Reference Card via Camera Computer Vision)
 * 4. Speech synthesis for step instructions (with recognition auto-muting)
 * 5. Feature detection, error handling, and privacy compliance
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AssistedFiling = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // Feature detection
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition || null
      : null;
  const isSpeechRecognitionSupported = Boolean(SpeechRecognition);
  const isSpeechSynthesisSupported =
    typeof window !== "undefined" && Boolean(window.speechSynthesis);
  const getNav = () =>
    typeof window !== "undefined" && window.navigator
      ? window.navigator
      : typeof navigator !== "undefined"
      ? navigator
      : null;
  const isCameraSupported = Boolean(
    getNav() &&
      getNav().mediaDevices &&
      typeof getNav().mediaDevices.getUserMedia === "function"
  );

  // Module state
  const state = {
    isPanelOpen: false,
    isNavListening: false,
    isDictating: false,
    isSpeakingInstructions: false,
    wasNavActiveBeforeDictation: false,
    wasNavActiveBeforeReading: false,
    activeDictationFieldId: null,
    activeDictationFieldLabel: null,
    lastRecognizedSpeech: "",
    lastFeedbackMessage: "Ready. Click 'Start Listening' to speak commands.",
    navRecognitionInstance: null,
    dictationRecognitionInstance: null,
    pageHistory: [],
    lastNavigatedPage: null,
    isNavigatingBack: false,

    // Gesture Interaction state
    isGestureActive: false,
    isStartingGesture: false,
    isGesturePreviewOpen: false,
    gestureStream: null,
    gestureAnimationId: null,
    mediaPipeHands: null,
    isMediaPipeActive: false,
    postureBuffer: [],
    lastHandLandmarks: null,
    lastDetectedGesture: null,
    lastGestureAction: "Ready. Click 'Enable Gesture Navigation' to activate camera.",
    gestureHoldStartTime: null,
    gestureHoldDurationMs: 0,
    gestureHoldExecuted: false,
    gestureCooldownUntil: 0,
    lastFrameTime: 0,
  };

  let lastPanelTriggerEl = null;
  let lastDictationTriggerEl = null;
  let navInterimTimer = null;
  let navRestartTimer = null;
  let navResumeReadingTimer = null;
  let pendingInterimTranscript = "";
  let pendingInterimEntries = [];
  let hasActiveVoiceFeedback = false;

  function clearNavTimers() {
    if (navInterimTimer) {
      clearTimeout(navInterimTimer);
      navInterimTimer = null;
    }
    if (navRestartTimer) {
      clearTimeout(navRestartTimer);
      navRestartTimer = null;
    }
    if (navResumeReadingTimer) {
      clearTimeout(navResumeReadingTimer);
      navResumeReadingTimer = null;
    }
  }

  /**
   * Helper to escape HTML for safety
   */
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Safe getter for DOM element
   */
  function getEl(id) {
    return typeof document !== "undefined" ? document.getElementById(id) : null;
  }

  /**
   * Safe helpers for window-level functions (prevents ReferenceError in headless Node)
   */
  function safeToast(msg, type = "info") {
    if (typeof window !== "undefined" && typeof window.showToast === "function") {
      window.showToast(msg, type);
    }
  }

  function safeNavigate(page, isBack = false) {
    if (typeof window !== "undefined" && typeof window.navigateTo === "function") {
      window.navigateTo(page, isBack);
    }
  }

  /**
   * Resolve target page for "Back" voice navigation command
   */
  function resolveBackTarget(consume = false) {
    const role = getAppRole();
    const isLoggedIn = typeof window !== "undefined" && Boolean(window.isLoggedIn);
    const currentPage = typeof window !== "undefined" ? window.currentPage : "";

    if (typeof window === "undefined") {
      return "landing";
    }

    const rootPage =
      isLoggedIn && role === "applicant"
        ? "user-dashboard"
        : isLoggedIn
        ? "admin-dashboard"
        : "landing";

    if (currentPage === rootPage) {
      return null;
    }

    const invalidForApplicant = new Set([
      "landing",
      "login",
      "signup",
      "register",
      "forgot-password",
      "verify-otp",
      "reset-password",
      "admin-login",
      "evaluator-login",
      "reviewer-login",
      "forms",
      "guidelines",
      "marketplace",
      "faq",
      "contact",
      "terms",
      "about",
      "news",
      "notifications",
    ]);

    if (
      state.lastNavigatedPage &&
      state.lastNavigatedPage === currentPage &&
      Array.isArray(state.pageHistory) &&
      state.pageHistory.length > 0
    ) {
      let idx = state.pageHistory.length - 1;
      while (
        idx >= 0 &&
        (state.pageHistory[idx] === currentPage ||
          (isLoggedIn && role === "applicant" && invalidForApplicant.has(state.pageHistory[idx])))
      ) {
        idx--;
      }
      if (idx >= 0) {
        const target = state.pageHistory[idx];
        if (consume) {
          state.pageHistory.splice(idx);
        }
        return target;
      }
    }

    if (consume) {
      state.pageHistory = [];
    }
    return rootPage;
  }

  /**
   * Update visual feedback elements in the assistance panel
   */
  function updateFeedbackUI(transcript, message, statusClass = "") {
    if (transcript !== null) {
      state.lastRecognizedSpeech = transcript;
      const transcriptEl = getEl("voiceNavTranscript");
      if (transcriptEl) {
        transcriptEl.textContent = transcript || "(No speech detected yet)";
      }
    }
    if (message !== null) {
      state.lastFeedbackMessage = message;
      const messageEl = getEl("voiceNavMessage");
      if (messageEl) {
        messageEl.textContent = message;
      }
    }

    const badgeEl = getEl("voiceNavStatusBadge");
    if (badgeEl && statusClass) {
      badgeEl.className = `voice-status-badge ${statusClass}`;
      if (statusClass === "status-listening") {
        badgeEl.textContent = "Listening...";
      } else if (statusClass === "status-processing") {
        badgeEl.textContent = "Processing...";
      } else if (statusClass === "status-error") {
        badgeEl.textContent = "Attention Needed";
      } else {
        badgeEl.textContent = "Microphone Off";
      }
    }
  }

  /**
   * Update Start/Stop Listening button UI
   */
  function updateVoiceNavButtonUI(isListening) {
    const btn = getEl("btnVoiceNavToggle");
    const textEl = getEl("btnVoiceNavToggleText");
    if (!btn) return;

    btn.setAttribute("aria-pressed", isListening ? "true" : "false");
    if (isListening) {
      btn.classList.add("listening");
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-danger");
      if (textEl) textEl.textContent = "Stop Listening";
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-microphone-slash";
    } else {
      btn.classList.remove("listening");
      btn.classList.remove("btn-danger");
      btn.classList.add("btn-primary");
      if (textEl) textEl.textContent = "Start Listening";
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-microphone";
    }
  }

  /**
   * Normalize user role
   */
  function getAppRole() {
    if (typeof window === "undefined") return "applicant";
    let role = window.currentRole || "applicant";
    if (typeof window.normalizeRole === "function") {
      role = window.normalizeRole(role);
    }
    role = String(role).toLowerCase();
    if (role === "client") return "applicant";
    return role;
  }

  /**
   * Check if user is currently in a guided filing form wizard
   */
  function isFormWizardActive() {
    if (typeof window === "undefined") return false;
    const formPages = [
      "patent-form",
      "trademark-form",
      "copyright-form",
      "utility-form",
      "industrial-form",
    ];
    if (formPages.includes(window.currentPage)) {
      return true;
    }
    if (
      window.currentPage === "forms" &&
      typeof window.isAdvancedGuidedFlow === "function" &&
      window.isAdvancedGuidedFlow()
    ) {
      return true;
    }
    return false;
  }

  /**
   * Check if current page is valid for a given command
   */
  function evaluateCommandContext(commandName, modality = "voice") {
    const role = getAppRole();
    const isLoggedIn = typeof window !== "undefined" && Boolean(window.isLoggedIn);
    const currentPage = typeof window !== "undefined" ? window.currentPage : "";

    switch (commandName) {
      case "open_my_cases":
        if (!isLoggedIn) {
          return { valid: false, reason: "Please sign in to access your cases." };
        }
        if (role !== "applicant") {
          return { valid: false, reason: "This command is only available in the applicant portal." };
        }
        if (currentPage === "user-submissions") {
          return { valid: false, reason: "You are already viewing My Cases." };
        }
        return { valid: true };

      case "show_forms":
        if (currentPage === "filing-hub" || currentPage === "forms") {
          return { valid: false, reason: "You are already viewing the forms catalog." };
        }
        return { valid: true };

      case "open_ip_guidelines":
        if (currentPage === "ip-guidelines" || currentPage === "guidelines") {
          return { valid: false, reason: "You are already viewing the IP guidelines." };
        }
        return { valid: true };

      case "open_messages":
        if (!isLoggedIn) {
          return { valid: false, reason: "Please sign in to access your messages." };
        }
        if (role !== "applicant") {
          return { valid: false, reason: "This command is only available in the applicant portal." };
        }
        if (currentPage === "messages") {
          return { valid: false, reason: "You are already viewing Messages." };
        }
        return { valid: true };

      case "open_marketplace":
        if (currentPage === "marketplace-dash" || currentPage === "marketplace") {
          return { valid: false, reason: "You are already viewing the Marketplace." };
        }
        return { valid: true };

      case "home":
      case "go_home":
      case "open_home":
        if (isLoggedIn && role === "applicant") {
          if (currentPage === "user-dashboard") {
            return { valid: false, reason: "You are already on the Home page." };
          }
          return { valid: true };
        }
        if (!isLoggedIn && currentPage === "landing") {
          return { valid: false, reason: "You are already on the Home page." };
        }
        if (isLoggedIn && role !== "applicant" && currentPage === "admin-dashboard") {
          return { valid: false, reason: "You are already on the Home page." };
        }
        return { valid: true };

      case "back":
      case "go_back": {
        const target = resolveBackTarget(false);
        if (!target) {
          return {
            valid: false,
            reason: "You are already on the Home page with no previous page to go back to.",
          };
        }
        return { valid: true };
      }

      case "next_step": {
        if (modality === "voice") {
          return {
            valid: false,
            reason: "Step navigation is controlled via gestures. Display 1 Finger to advance to the next step.",
          };
        }
        const reviewModal = getEl("dictationReviewModal");
        if (
          state.isDictating ||
          (reviewModal &&
            reviewModal.style.display !== "none" &&
            reviewModal.classList.contains("active"))
        ) {
          return {
            valid: false,
            reason: "Please confirm or cancel your dictated text before changing steps.",
          };
        }
        if (!isFormWizardActive()) {
          return {
            valid: false,
            reason: "Next step navigation is only available while filling out an application form.",
          };
        }
        const maxSteps =
          typeof window.getMaxWizardSteps === "function"
            ? window.getMaxWizardSteps()
            : 4;
        const currentStep = parseInt(window.currentWizardStep, 10) || 1;
        if (currentStep >= maxSteps) {
          return {
            valid: false,
            reason: "You are already on the final step. Use 3 fingers to submit the application.",
          };
        }
        return { valid: true };
      }

      case "submit":
      case "submit_form": {
        const reviewModal = getEl("dictationReviewModal");
        if (
          state.isDictating ||
          (reviewModal &&
            reviewModal.style.display !== "none" &&
            reviewModal.classList.contains("active"))
        ) {
          return {
            valid: false,
            reason: "Please confirm or cancel your dictated text before submitting.",
          };
        }
        if (!isFormWizardActive()) {
          return {
            valid: false,
            reason: "Submitting is only available while filling out an application form.",
          };
        }
        const maxSteps =
          typeof window.getMaxWizardSteps === "function"
            ? window.getMaxWizardSteps()
            : 4;
        const currentStep = parseInt(window.currentWizardStep, 10) || 1;
        if (currentStep < maxSteps) {
          return {
            valid: false,
            reason: `Please complete and review all wizard sections before submitting. Currently on Step ${currentStep} of ${maxSteps}.`,
          };
        }
        return { valid: true };
      }

      case "previous_step": {
        if (modality === "voice") {
          return {
            valid: false,
            reason: "Step navigation is controlled via gestures. Display 2 Fingers to return to the previous step.",
          };
        }
        const reviewModal = getEl("dictationReviewModal");
        if (
          state.isDictating ||
          (reviewModal &&
            reviewModal.style.display !== "none" &&
            reviewModal.classList.contains("active"))
        ) {
          return {
            valid: false,
            reason: "Please confirm or cancel your dictated text before changing steps.",
          };
        }
        if (!isFormWizardActive()) {
          return {
            valid: false,
            reason: "Previous step navigation is only available while filling out an application form.",
          };
        }
        const step = parseInt(window.currentWizardStep, 10) || 1;
        if (step <= 1) {
          return {
            valid: false,
            reason: "You are already on the first step of this form.",
          };
        }
        return { valid: true };
      }

      case "save_draft": {
        if (modality === "voice") {
          return {
            valid: false,
            reason: "Draft saving is controlled via gestures. Hold 4 Fingers for 1.2s to save draft progress.",
          };
        }
        const reviewModal = getEl("dictationReviewModal");
        if (
          reviewModal &&
          reviewModal.style.display !== "none" &&
          reviewModal.classList.contains("active")
        ) {
          return {
            valid: false,
            reason: "Please confirm or cancel your dictated text before saving the draft.",
          };
        }
        if (!isFormWizardActive()) {
          return {
            valid: false,
            reason: "Draft saving is only available while filling out an application form.",
          };
        }
        return { valid: true };
      }

      default:
        return { valid: false, reason: "Unknown command context." };
    }
  }

  /**
   * Normalize spoken transcript for command matching
   */
  function normalizeVoiceText(raw) {
    if (!raw) return "";
    return String(raw)
      .toLowerCase()
      .replace(/['"“”‘’.,\/#!$%\^&\*;:{}=\-_`~()?[\]\\|<>+]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Strip conversational fillers / politeness tokens from start and end
   */
  function stripPoliteFillers(clean) {
    if (!clean) return "";
    return clean
      .replace(
        /^(?:(?:um+|uh+|er+|ah+|oh+|okay|ok|hey|hi|hello|well|now|so|please|can\s+you|could\s+you|would\s+you|will\s+you|can\s+we|let\s+s|lets|let\s+us|i\s+want\s+to|i\s+would\s+like\s+to|i\s+d\s+like\s+to)\s+)+/i,
        ""
      )
      .replace(/(?:\s+(?:please|now|right\s+now|for\s+me|thanks|thank\s+you))+$/i, "")
      .trim();
  }

  /**
   * Check whether a spoken transcript is an incomplete prefix of a supported command
   * (e.g., user has only spoken "Open", "Show", "Go to", "Take me", "Open my", "Open IP" so far)
   */
  function isIncompleteCommandPrefix(rawTranscript) {
    const clean = normalizeVoiceText(rawTranscript);
    if (!clean) return false;
    const core = stripPoliteFillers(clean);
    if (!core) {
      return true;
    }
    return /^(?:open|show|view|go|go\s+to|go\s+back\s+to|navigate|navigate\s+to|take|take\s+me|take\s+me\s+to|take\s+me\s+back|take\s+me\s+back\s+to|return\s+to|bring|bring\s+me|bring\s+up|pull|pull\s+up|look|look\s+at|check|read|see|display|explore|visit|browse|switch|switch\s+to|so|shoe|sure|(?:(?:open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|bring\s+up|pull\s+up|look\s+at|check|read|see|display|explore|visit|browse)\s+)?(?:me|up|my|mic|might|may|by|the|all|available|psu|university|ip|i\s+p|eye\s+pea|i\s+pee|it|id|ap|ivy|ib|ig|intellectual|intellectual\s+property|patent|application|filing|pre\s*filing|evaluator|case|technology)+)$/i.test(
      core
    );
  }

  /**
   * Classify a single normalized/raw phrase into a voice command, forbidden action, gesture-only action, or unknown
   */
  function classifySingleVoicePhrase(text, clean, core) {
    const matchesAny = (patterns) =>
      patterns.some((rx) => rx.test(clean) || rx.test(core));

    // 1. FORBIDDEN COMMANDS CHECK
    const forbiddenPattern =
      /\b(submit|submission|delete|deletion|remove|withdraw|withdrawal|approve|approval)\b/i;
    if (forbiddenPattern.test(clean)) {
      return { type: "forbidden", transcript: text };
    }

    // 2. STEP NAVIGATION & DRAFT SAVING ARE EXCLUSIVELY GESTURE-CONTROLLED
    // (Checked before general commands so "go back step" / "back page" / "back section" classify as gesture_only)
    if (
      matchesAny([
        /^(go\s*(to\s*)?(the\s*)?)?next$/i,
        /\b(go\s*(to\s*)?(the\s*)?)?next\s*(step|section|page)\b/i,
      ])
    ) {
      return {
        type: "gesture_only",
        command: "next_step",
        reason:
          "Step navigation is controlled via gestures. Display 1 Finger to advance to the next step.",
        transcript: text,
      };
    }

    if (
      matchesAny([
        /^(go\s*(to\s*)?(the\s*)?)?previous$/i,
        /\b(go\s*(to\s*)?(the\s*)?)?(previous|back)\s+(step|section|page)\b/i,
      ])
    ) {
      return {
        type: "gesture_only",
        command: "previous_step",
        reason:
          "Step navigation is controlled via gestures. Display 2 Fingers to return to the previous step.",
        transcript: text,
      };
    }

    if (
      matchesAny([
        /^save$/i,
        /\b(save\s*(the\s*|my\s*|this\s*|a\s*|as\s*|form\s*|current\s*|application\s*)?draft|save\s*(progress|form))\b/i,
      ])
    ) {
      return {
        type: "gesture_only",
        command: "save_draft",
        reason:
          "Draft saving is controlled via gestures. Hold 4 Fingers for 1.2s to save draft progress.",
        transcript: text,
      };
    }

    // 3. MATCH PREDICTABLE COMMAND SET
    // Command 1: Open my cases
    if (
      matchesAny([
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|check|see|display|bring\s+up|pull\s+up|look\s+at)(?:\s+(?:me|up))?\s+(?:my\s+|the\s+|all\s+|mic\s+|might\s+|may\s+|by\s+)*(?:ip\s+|patent\s+|application\s+|filing\s+)*(?:cases?|case\s+list|submissions?|filings)\b/i,
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|check|see|display|bring\s+up|pull\s+up|look\s+at)(?:\s+(?:me|up))?\s+(?:my\s+|all\s+)(?:ip\s+|patent\s+|filing\s+)*applications?\b/i,
        /^(?:(?:open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|check|see|display|bring\s+up|pull\s+up|look\s+at)(?:\s+(?:me|up))?\s+)?(?:my\s+|the\s+|all\s+|mic\s+|might\s+|may\s+|by\s+)*(?:ip\s+|patent\s+|application\s+|filing\s+)*(?:cases?|case\s+list|submissions?|filings)$/i,
        /^(?:my\s+|all\s+)(?:ip\s+|patent\s+|filing\s+)*applications?$/i,
      ])
    ) {
      return { type: "command", command: "open_my_cases", transcript: text };
    }

    // Command 2: Show forms
    if (
      matchesAny([
        /\b(show|open|view|go\s+to|navigate\s+to|take\s+me\s+to|see|display|check|bring\s+up|pull\s+up|look\s+at|so|shoe|sure|short)(?:\s+(?:me|up))?\s+(?:the\s+|my\s+|all\s+|available\s+)*(?:filing\s+|pre\s*filing\s+|ip\s+|application\s+)*(?:forms?(?:\s+catalog)?|forums?|filing\s+hub|new\s+filing)\b/i,
        /\b(show|shoe|sure|open)(?:\s+(?:me|up|the|all))?\s+(?:filing\s+|ip\s+)*(?:farms?|firms?|fonts?|force|folders?)\b/i,
        /^(?:(?:show|open|view|go\s+to|navigate\s+to|take\s+me\s+to|see|display|check|bring\s+up|pull\s+up|look\s+at|so|shoe|sure|short)(?:\s+(?:me|up))?\s+)?(?:the\s+|my\s+|all\s+|available\s+)*(?:filing\s+|pre\s*filing\s+|ip\s+|application\s+)*(?:forms?(?:\s+catalog)?|forums?|filing\s+hub|new\s+filing)$/i,
      ])
    ) {
      return { type: "command", command: "show_forms", transcript: text };
    }

    // Command 3: Open IP guidelines
    if (
      matchesAny([
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|read|see|display|check|bring\s+up|pull\s+up)(?:\s+(?:me|up))?\s+(?:the\s+|my\s+|psu\s+|university\s+)*(?:ip\s+|i\s+p\s+|eye\s+pea\s+|i\s+pee\s+|intellectual\s+property\s+|it\s+|id\s+|ap\s+|ivy\s+|ib\s+|ig\s+)?(?:guidelines?|guide\s+lines?|guidances?)\b/i,
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|read|see|display|check)(?:\s+(?:me|up))?\s+(?:the\s+|my\s+|psu\s+|university\s+)*(?:ip\s+|i\s+p\s+|eye\s+pea\s+|i\s+pee\s+|intellectual\s+property\s+|it\s+|id\s+|ap\s+)(?:guides?|guide)\b/i,
        /^(?:(?:open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|read|see|display|check|bring\s+up|pull\s+up)(?:\s+(?:me|up))?\s+)?(?:the\s+|my\s+|psu\s+|university\s+)*(?:ip\s+|i\s+p\s+|eye\s+pea\s+|i\s+pee\s+|intellectual\s+property\s+|it\s+|id\s+|ap\s+|ivy\s+|ib\s+|ig\s+)?(?:guidelines?|guide\s+lines?|guidances?)$/i,
        /^(?:the\s+|psu\s+|university\s+)*(?:ip\s+|i\s+p\s+|intellectual\s+property\s+)(?:guides?|guide)$/i,
      ])
    ) {
      return { type: "command", command: "open_ip_guidelines", transcript: text };
    }

    // Command 4: Open messages
    if (
      matchesAny([
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|check|read|see|display|bring\s+up|pull\s+up)(?:\s+(?:me|up))?\s+(?:the\s+|my\s+|all\s+)*(?:evaluator\s+|case\s+|ip\s+)*(?:messages?|messaging|inbox|in\s+box|chats?|inquiries|massages?|messengers?)\b/i,
        /^(?:(?:open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|check|read|see|display|bring\s+up|pull\s+up)(?:\s+(?:me|up))?\s+)?(?:the\s+|my\s+|all\s+)*(?:evaluator\s+|case\s+|ip\s+)*(?:messages?|messaging|inbox|in\s+box|chats?|inquiries|massages?|messengers?)$/i,
      ])
    ) {
      return { type: "command", command: "open_messages", transcript: text };
    }

    // Command 5: Open marketplace
    if (
      matchesAny([
        /\b(open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|see|explore|display|check|visit|browse)(?:\s+(?:me|up))?\s+(?:the\s+|my\s+)*(?:university\s+|psu\s+|ip\s+|technology\s+)*(?:marketplaces?|market\s+places?|marketplace\s*dash|market\s+pages?|market\s+plays?|market\s+spaces?|markets?)\b/i,
        /^(?:(?:open|show|view|go\s+to|navigate\s+to|take\s+me\s+to|see|explore|display|check|visit|browse)(?:\s+(?:me|up))?\s+)?(?:the\s+|my\s+)*(?:university\s+|psu\s+|ip\s+|technology\s+)*(?:marketplaces?|market\s+places?|marketplace\s*dash|market\s+pages?|market\s+plays?|market\s+spaces?|markets?)$/i,
      ])
    ) {
      return { type: "command", command: "open_marketplace", transcript: text };
    }

    // Command 6: Home
    if (
      matchesAny([
        /^(?:(?:open|show|view|go(?:\s+back)?(?:\s+to)?|return(?:\s+back)?(?:\s+to)?|navigate(?:\s+back)?(?:\s+to)?|take\s+me(?:\s+back)?(?:\s+to)?|bring\s+me(?:\s+back)?(?:\s+to)?|switch(?:\s+to)?|back(?:\s+to)?|head(?:\s+back)?(?:\s+to)?)(?:\s+(?:me|up))?\s+)?(?:the\s+|my\s+)?(?:home(?:\s*page|\s*screen|\s*dashboard)?|dashboard|main\s+dashboard|applicant\s+dashboard|user\s+dashboard|main\s+page|main\s+screen)$/i,
        /^(?:home\s+)+home$/i,
      ])
    ) {
      return { type: "command", command: "home", transcript: text };
    }

    // Command 7: Back
    if (
      matchesAny([
        /^(?:(?:go|navigate|move|take\s+me|bring\s+me|get|step|head|go\s+on)\s+)?back(?:\s+(?:one\s+page|a\s+page|one|up))?$/i,
        /^return(?:\s+back)?$/i,
        /^(?:(?:go\s+)?back\s+)+(?:go\s+)?back$/i,
      ])
    ) {
      return { type: "command", command: "back", transcript: text };
    }

    return { type: "unknown", transcript: text };
  }

  /**
   * Classify a spoken transcript into a voice command, forbidden action, gesture-only action, or unknown.
   * Supports multi-command continuous segments (e.g. "Show forms open messages", "Show forms home", "Back back")
   * by resolving to the latest valid command when a transcript is a sequence of valid commands.
   */
  function classifyVoiceCommand(rawTranscript) {
    if (!rawTranscript) return { type: "unknown", transcript: "" };
    const text = String(rawTranscript).trim();
    const clean = normalizeVoiceText(text);
    if (!clean) return { type: "unknown", transcript: text };
    const core = stripPoliteFillers(clean) || clean;

    const direct = classifySingleVoicePhrase(text, clean, core);
    if (direct.type === "forbidden" || direct.type === "gesture_only") {
      return direct;
    }

    // Check if core consists of a valid command followed by another valid command
    const words = core.split(" ");
    if (words.length >= 2 && words.length <= 14) {
      for (let splitIdx = 1; splitIdx < words.length; splitIdx++) {
        const prefix = words.slice(0, splitIdx).join(" ");
        const suffix = words.slice(splitIdx).join(" ");
        const prefixClass = classifySingleVoicePhrase(prefix, prefix, prefix);
        if (prefixClass.type === "command") {
          const suffixClass = classifyVoiceCommand(suffix);
          if (suffixClass.type !== "unknown") {
            return Object.assign({}, suffixClass, { transcript: text });
          }
        }
      }
    }

    return direct;
  }

  /**
   * Process a speech recognition transcript for voice navigation
   */
  function processVoiceNavCommand(rawTranscript) {
    if (!rawTranscript) return;
    const text = String(rawTranscript).trim();
    if (!text) return;

    hasActiveVoiceFeedback = true;
    updateFeedbackUI(`"${text}"`, null, "status-processing");

    const classified = classifyVoiceCommand(text);

    // 1. FORBIDDEN COMMANDS CHECK
    if (classified.type === "forbidden") {
      const msg =
        "For security, submitting, deleting, withdrawing, and approving applications cannot be triggered by voice. Please use the on-screen buttons.";
      updateFeedbackUI(null, msg, "status-error");
      safeToast(msg, "warning");
      return { handled: false, error: "forbidden_command", transcript: text };
    }

    // 2. MATCH PREDICTABLE COMMAND SET
    if (classified.type === "command") {
      const cmd = classified.command;

      if (cmd === "open_my_cases") {
        const check = evaluateCommandContext("open_my_cases");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Opening My Cases...", "status-listening");
        safeNavigate("user-submissions");
        return { handled: true, command: "open_my_cases", transcript: text };
      }

      if (cmd === "show_forms") {
        const check = evaluateCommandContext("show_forms");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Displaying filing forms...", "status-listening");
        if (getAppRole() === "applicant" && typeof window !== "undefined" && window.isLoggedIn) {
          safeNavigate("filing-hub");
        } else {
          safeNavigate("forms");
        }
        return { handled: true, command: "show_forms", transcript: text };
      }

      if (cmd === "open_ip_guidelines") {
        const check = evaluateCommandContext("open_ip_guidelines");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Opening IP guidelines...", "status-listening");
        if (getAppRole() === "applicant" && typeof window !== "undefined" && window.isLoggedIn) {
          safeNavigate("ip-guidelines");
        } else {
          safeNavigate("guidelines");
        }
        return { handled: true, command: "open_ip_guidelines", transcript: text };
      }

      if (cmd === "open_messages") {
        const check = evaluateCommandContext("open_messages");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Opening Messages...", "status-listening");
        safeNavigate("messages");
        return { handled: true, command: "open_messages", transcript: text };
      }

      if (cmd === "open_marketplace") {
        const check = evaluateCommandContext("open_marketplace");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Opening Marketplace...", "status-listening");
        if (getAppRole() === "applicant" && typeof window !== "undefined" && window.isLoggedIn) {
          safeNavigate("marketplace-dash");
        } else {
          safeNavigate("marketplace");
        }
        return { handled: true, command: "open_marketplace", transcript: text };
      }

      if (cmd === "home") {
        const check = evaluateCommandContext("home");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        updateFeedbackUI(null, "Opening Home...", "status-listening");
        const isLoggedIn = typeof window !== "undefined" && Boolean(window.isLoggedIn);
        if (isLoggedIn && getAppRole() === "applicant") {
          safeNavigate("user-dashboard");
        } else if (isLoggedIn) {
          safeNavigate("admin-dashboard");
        } else {
          safeNavigate("landing");
        }
        return { handled: true, command: "home", transcript: text };
      }

      if (cmd === "back") {
        const check = evaluateCommandContext("back");
        if (!check.valid) {
          updateFeedbackUI(null, check.reason, "status-error");
          safeToast(check.reason, "info");
          return { handled: false, reason: check.reason, transcript: text };
        }
        const targetPage = resolveBackTarget(true);
        updateFeedbackUI(null, "Going back...", "status-listening");
        state.isNavigatingBack = true;
        try {
          safeNavigate(targetPage, true);
        } finally {
          state.isNavigatingBack = false;
        }
        return { handled: true, command: "back", target: targetPage, transcript: text };
      }
    }

    // 3. STEP NAVIGATION & DRAFT SAVING ARE EXCLUSIVELY GESTURE-CONTROLLED
    if (classified.type === "gesture_only") {
      updateFeedbackUI(null, classified.reason, "status-error");
      safeToast(classified.reason, "info");
      return {
        handled: false,
        error: "unhandled_voice_command",
        reason: classified.reason,
        transcript: text,
      };
    }

    // 4. UNKNOWN COMMAND
    const unknownMsg = `Command not recognized: "${text}". Supported voice commands: "Open my cases", "Show forms", "Open IP guidelines", "Open messages", "Open marketplace", "Home", or "Back".`;
    updateFeedbackUI(null, unknownMsg, "status-error");
    return { handled: false, error: "unknown_command", transcript: text };
  }

  /**
   * Execute voice navigation command (phrase execution interface)
   */
  function executeVoiceNavCommand(phrase) {
    return processVoiceNavCommand(phrase);
  }

  /**
   * Extract the best matching transcript from a SpeechRecognitionResult item
   */
  function extractBestTranscript(item, priorContext = "") {
    if (!item) return "";
    const len = typeof item.length === "number" ? item.length : item[0] ? 1 : 0;
    const prefix = priorContext ? `${priorContext} ` : "";
    let firstNonEmpty = "";

    for (let a = 0; a < len; a++) {
      const alt = item[a] && String(item[a].transcript || "").trim();
      if (!alt) continue;
      if (!firstNonEmpty) firstNonEmpty = alt;

      if (prefix) {
        const combinedClass = classifyVoiceCommand(prefix + alt);
        if (combinedClass.type !== "unknown") {
          return alt;
        }
      }
      const altClass = classifyVoiceCommand(alt);
      if (altClass.type !== "unknown") {
        return alt;
      }
    }

    return firstNonEmpty;
  }

  /**
   * Start Voice Navigation Recognition
   */
  function startVoiceNav() {
    if (!isSpeechRecognitionSupported) {
      const warn = getEl("voiceUnsupportedNotice");
      if (warn) warn.style.display = "flex";
      updateFeedbackUI(
        null,
        "Speech recognition is not supported in this browser. Please use touch/keyboard controls.",
        "status-error",
      );
      return false;
    }

    if (state.isDictating) {
      state.wasNavActiveBeforeDictation = false;
      stopDictation(false);
    }

    clearNavTimers();
    pendingInterimTranscript = "";
    pendingInterimEntries = [];
    hasActiveVoiceFeedback = false;

    try {
      if (state.navRecognitionInstance) {
        try {
          state.navRecognitionInstance.onstart = null;
          state.navRecognitionInstance.onresult = null;
          state.navRecognitionInstance.onerror = null;
          state.navRecognitionInstance.onend = null;
          state.navRecognitionInstance.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 5;

      let isAutoRestart = false;
      let restartRetryCount = 0;
      const consumedMap = new Map();
      let lastExecutedUtterance = null;

      function recordConsumedExecution(textToExecute, classified, entries, isFinalFlag) {
        const now = Date.now();
        const cmdKey = (classified && (classified.command || classified.type)) || "unknown";
        const cleanExec = normalizeVoiceText(textToExecute);
        const pageAfter = typeof window !== "undefined" ? window.currentPage : "";

        if (Array.isArray(entries)) {
          for (const entry of entries) {
            if (entry && typeof entry.index === "number" && entry.index >= 0) {
              consumedMap.set(entry.index, {
                clean: entry.fullClean || cleanExec,
                command: cmdKey,
                time: now,
                isFinal: Boolean(entry.isFinal || isFinalFlag),
                pageAfter,
              });
            }
          }
        }

        lastExecutedUtterance = {
          clean: cleanExec,
          command: cmdKey,
          time: now,
          isFinal: Boolean(isFinalFlag),
          pageAfter,
        };
      }

      function flushPendingInterim() {
        if (navInterimTimer) {
          clearTimeout(navInterimTimer);
          navInterimTimer = null;
        }
        if (
          !pendingInterimTranscript ||
          !state.isNavListening ||
          state.isSpeakingInstructions ||
          state.isDictating
        ) {
          pendingInterimTranscript = "";
          pendingInterimEntries = [];
          return;
        }
        const textToProcess = pendingInterimTranscript;
        const entriesToRecord = pendingInterimEntries;
        pendingInterimTranscript = "";
        pendingInterimEntries = [];

        const classified = classifyVoiceCommand(textToProcess);
        processVoiceNavCommand(textToProcess);
        recordConsumedExecution(textToProcess, classified, entriesToRecord, false);
      }

      recognition.onstart = function () {
        restartRetryCount = 0;
        state.isNavListening = true;
        updateVoiceNavButtonUI(true);
        if (!hasActiveVoiceFeedback && !isAutoRestart) {
          updateFeedbackUI(
            null,
            "Listening for commands... Speak a supported command.",
            "status-listening",
          );
        } else {
          const badgeEl = getEl("voiceNavStatusBadge");
          if (badgeEl && !badgeEl.classList.contains("status-error")) {
            badgeEl.className = "voice-status-badge status-listening";
            badgeEl.textContent = "Listening...";
          }
        }
      };

      recognition.onresult = function (event) {
        if (
          !state.isNavListening ||
          state.isSpeakingInstructions ||
          state.isDictating
        ) {
          // Prevent spoken instructions or stopped sessions from triggering voice commands
          return;
        }

        const results = event && event.results ? event.results : [];
        const now = Date.now();
        const currentPage = typeof window !== "undefined" ? window.currentPage : "";

        const unconsumedEntries = [];
        let unconsumedText = "";
        let justFinalizedDisplay = "";

        for (let i = 0; i < results.length; ++i) {
          const item = results[i];
          if (!item || !item[0]) continue;

          const rawIsFinal =
            typeof item.isFinal === "boolean"
              ? item.isFinal
              : item[0] && typeof item[0].isFinal === "boolean"
              ? item[0].isFinal
              : true;

          const seg = extractBestTranscript(item, unconsumedText);
          if (!seg) continue;
          const segClean = normalizeVoiceText(seg);
          if (!segClean) continue;

          const prev = consumedMap.get(i);
          if (prev) {
            // 1. Exact normalized match with already-executed segment at index i
            if (segClean === prev.clean) {
              if (prev.isFinal && rawIsFinal) {
                continue;
              }
              if (!prev.isFinal && rawIsFinal && currentPage === prev.pageAfter) {
                prev.isFinal = true;
                justFinalizedDisplay = seg;
                continue;
              }
              if (!rawIsFinal && now - prev.time <= 2500 && currentPage === prev.pageAfter) {
                continue;
              }
            }

            // 2. Check if browser merged multi-segment interim utterance into segment i
            if (
              lastExecutedUtterance &&
              now - lastExecutedUtterance.time <= 2500 &&
              currentPage === lastExecutedUtterance.pageAfter &&
              segClean === lastExecutedUtterance.clean
            ) {
              prev.clean = segClean;
              prev.isFinal = rawIsFinal;
              lastExecutedUtterance.isFinal = rawIsFinal;
              justFinalizedDisplay = seg;
              continue;
            }

            // 3. New words appended to already-executed segment i in continuous stream
            if (segClean.startsWith(prev.clean + " ")) {
              const suffixClean = segClean.slice(prev.clean.length).trim();
              const suffixClass = classifyVoiceCommand(suffixClean);
              const fullClass = classifyVoiceCommand(seg);
              const fullCmd = fullClass.command || fullClass.type;

              // If suffix is only polite filler (e.g. "please") and full command is unchanged, deduplicate
              if (
                suffixClass.type === "unknown" &&
                fullClass.type !== "unknown" &&
                fullCmd === prev.command &&
                currentPage === prev.pageAfter
              ) {
                prev.clean = segClean;
                prev.isFinal = rawIsFinal;
                justFinalizedDisplay = seg;
                continue;
              }

              // If "go back" refined into "go back home" or "go back step", evaluate full refined phrase
              if (
                prev.command === "back" &&
                (fullClass.command === "home" || fullClass.type === "gesture_only")
              ) {
                unconsumedEntries.push({
                  index: i,
                  textPart: seg,
                  fullClean: segClean,
                  isFinal: rawIsFinal,
                });
                unconsumedText += (unconsumedText ? " " : "") + seg;
                continue;
              }

              // Otherwise evaluate the newly spoken suffix after prev.clean
              unconsumedEntries.push({
                index: i,
                textPart: suffixClean,
                fullClean: segClean,
                isFinal: rawIsFinal,
              });
              unconsumedText += (unconsumedText ? " " : "") + suffixClean;
              continue;
            }

            // 4. Phonetic / singular->plural refinement of same command at index i (e.g. "Show form" -> "Show forms")
            if (currentPage === prev.pageAfter) {
              const segClass = classifyVoiceCommand(seg);
              const segCmd = segClass.command || segClass.type;
              if (
                prev.command &&
                prev.command !== "unknown" &&
                segCmd === prev.command &&
                (!prev.isFinal || now - prev.time <= 2500)
              ) {
                prev.clean = segClean;
                prev.isFinal = rawIsFinal;
                justFinalizedDisplay = seg;
                continue;
              }
            }
          }

          unconsumedEntries.push({
            index: i,
            textPart: seg,
            fullClean: segClean,
            isFinal: rawIsFinal,
          });
          unconsumedText += (unconsumedText ? " " : "") + seg;
        }

        if (!unconsumedText) {
          if (justFinalizedDisplay) {
            updateFeedbackUI(`"${justFinalizedDisplay}"`, null);
          }
          return;
        }

        const anyInterim = unconsumedEntries.some((e) => !e.isFinal);
        const allFinal = unconsumedEntries.length > 0 && !anyInterim;
        const classified = classifyVoiceCommand(unconsumedText);

        // Matched a valid command, gesture-only action, or forbidden action
        if (classified.type !== "unknown") {
          // If interim "back" / "go back" / "return" is spoken while in a form wizard or on root page,
          // wait briefly (220ms) in case the user is mid-phrase saying "go back step" or "go back home"
          const isAmbiguousBackPrefix =
            anyInterim &&
            classified.command === "back" &&
            (isFormWizardActive() || !evaluateCommandContext("back").valid);

          if (isAmbiguousBackPrefix) {
            updateFeedbackUI(`"${unconsumedText}"`, null);
            pendingInterimTranscript = unconsumedText;
            pendingInterimEntries = unconsumedEntries;
            if (navInterimTimer) clearTimeout(navInterimTimer);
            navInterimTimer = setTimeout(() => {
              navInterimTimer = null;
              flushPendingInterim();
            }, 220);
            return;
          }

          if (navInterimTimer) {
            clearTimeout(navInterimTimer);
            navInterimTimer = null;
          }
          pendingInterimTranscript = "";
          pendingInterimEntries = [];

          processVoiceNavCommand(unconsumedText);
          recordConsumedExecution(unconsumedText, classified, unconsumedEntries, allFinal);
          return;
        }

        // Unrecognized phrase: check if all segments are finalized or still interim
        if (allFinal) {
          if (isIncompleteCommandPrefix(unconsumedText)) {
            // Hold incomplete prefix (e.g. finalized "Open" or "Take me") briefly so next segment can join it
            updateFeedbackUI(`"${unconsumedText}"`, null);
            pendingInterimTranscript = unconsumedText;
            pendingInterimEntries = unconsumedEntries;
            if (navInterimTimer) clearTimeout(navInterimTimer);
            navInterimTimer = setTimeout(() => {
              navInterimTimer = null;
              flushPendingInterim();
            }, 900);
            return;
          }

          if (navInterimTimer) {
            clearTimeout(navInterimTimer);
            navInterimTimer = null;
          }
          pendingInterimTranscript = "";
          pendingInterimEntries = [];
          processVoiceNavCommand(unconsumedText);
          recordConsumedExecution(unconsumedText, classified, unconsumedEntries, true);
          return;
        }

        // Interim unrecognized phrase: update Heard Speech and arm settle timer
        updateFeedbackUI(`"${unconsumedText}"`, null);
        pendingInterimTranscript = unconsumedText;
        pendingInterimEntries = unconsumedEntries;
        if (navInterimTimer) {
          clearTimeout(navInterimTimer);
        }
        const settleDelayMs = isIncompleteCommandPrefix(unconsumedText) ? 1200 : 750;
        navInterimTimer = setTimeout(() => {
          navInterimTimer = null;
          flushPendingInterim();
        }, settleDelayMs);
      };

      recognition.onerror = function (event) {
        const errorType = event && event.error ? event.error : "unknown";
        let userMessage = "Speech recognition error.";
        if (errorType === "not-allowed") {
          clearNavTimers();
          pendingInterimTranscript = "";
          pendingInterimEntries = [];
          userMessage =
            "Microphone permission was denied. Please allow microphone access in your browser settings.";
          state.isNavListening = false;
          updateVoiceNavButtonUI(false);
          updateFeedbackUI(null, userMessage, "status-error");
        } else if (errorType === "no-speech") {
          if (pendingInterimTranscript) {
            flushPendingInterim();
            return;
          }
          if (!hasActiveVoiceFeedback) {
            userMessage = "No speech detected. Still listening for commands...";
            updateFeedbackUI(null, userMessage, "status-listening");
          }
          return; // don't abort
        } else if (errorType === "network") {
          if (pendingInterimTranscript) {
            flushPendingInterim();
          }
          userMessage =
            "Speech recognition network error. Please check your internet connection.";
          updateFeedbackUI(null, userMessage, "status-error");
        } else if (errorType === "audio-capture") {
          clearNavTimers();
          pendingInterimTranscript = "";
          pendingInterimEntries = [];
          userMessage =
            "No microphone detected. Please connect an audio input device.";
          state.isNavListening = false;
          updateVoiceNavButtonUI(false);
          updateFeedbackUI(null, userMessage, "status-error");
        } else if (errorType === "aborted") {
          // Normal stop or pause
          return;
        } else {
          userMessage = `Speech error (${errorType}). Please try again.`;
          updateFeedbackUI(null, userMessage, "status-error");
        }
      };

      function scheduleAutoRestart() {
        const retryDelays = [150, 400, 800];
        const delay = retryDelays[Math.min(restartRetryCount, retryDelays.length - 1)];
        restartRetryCount++;

        if (navRestartTimer) clearTimeout(navRestartTimer);
        navRestartTimer = setTimeout(() => {
          navRestartTimer = null;
          if (
            !state.isNavListening ||
            state.isSpeakingInstructions ||
            state.isDictating
          ) {
            return;
          }
          try {
            recognition.start();
          } catch (_errRetry) {
            if (restartRetryCount < retryDelays.length) {
              scheduleAutoRestart();
            } else {
              state.isNavListening = false;
              updateVoiceNavButtonUI(false);
              updateFeedbackUI(null, "Microphone stopped.", "status-idle");
            }
          }
        }, delay);
      }

      recognition.onend = function () {
        if (
          pendingInterimTranscript &&
          state.isNavListening &&
          !state.isSpeakingInstructions &&
          !state.isDictating
        ) {
          flushPendingInterim();
        }

        if (
          state.isNavListening &&
          !state.isSpeakingInstructions &&
          !state.isDictating
        ) {
          // Auto restart continuous listening if still flagged
          isAutoRestart = true;
          consumedMap.clear();
          lastExecutedUtterance = null;
          try {
            recognition.start();
          } catch (_) {
            scheduleAutoRestart();
          }
        } else if (!state.isNavListening) {
          updateVoiceNavButtonUI(false);
          updateFeedbackUI(null, "Microphone stopped.", "status-idle");
        }
      };

      state.navRecognitionInstance = recognition;
      state.isNavListening = true;
      updateVoiceNavButtonUI(true);
      updateFeedbackUI(
        null,
        "Listening for commands... Speak a supported command.",
        "status-listening",
      );
      recognition.start();
      return true;
    } catch (err) {
      console.warn("SpeechRecognition start error:", err);
      state.isNavListening = false;
      updateVoiceNavButtonUI(false);
      updateFeedbackUI(null, "Could not start speech recognition.", "status-error");
      return false;
    }
  }

  /**
   * Stop Voice Navigation Recognition
   */
  function stopVoiceNav() {
    clearNavTimers();
    pendingInterimTranscript = "";
    pendingInterimEntries = [];
    hasActiveVoiceFeedback = false;
    state.isNavListening = false;
    if (state.navRecognitionInstance) {
      try {
        state.navRecognitionInstance.onstart = null;
        state.navRecognitionInstance.onresult = null;
        state.navRecognitionInstance.onerror = null;
        state.navRecognitionInstance.stop();
      } catch (_) {}
    }
    updateVoiceNavButtonUI(false);
    updateFeedbackUI(null, "Microphone stopped.", "status-idle");
  }

  /**
   * Toggle Voice Navigation
   */
  function toggleVoiceNav() {
    if (state.isNavListening) {
      stopVoiceNav();
    } else {
      startVoiceNav();
    }
  }

  /**
   * Clear recognition feedback log
   */
  function clearFeedback() {
    clearNavTimers();
    pendingInterimTranscript = "";
    pendingInterimEntries = [];
    hasActiveVoiceFeedback = true;
    updateFeedbackUI(
      "",
      "Log cleared. Ready for commands.",
      state.isNavListening ? "status-listening" : "status-idle",
    );
  }

  // ============================================================
  // VOICE-ASSISTED FORM ENTRY (DICTATION) ENGINE
  // ============================================================

  /**
   * Start dictation for a specific field
   */
  function startDictation(fieldId, fieldLabel, triggerEl) {
    if (!isSpeechRecognitionSupported) {
      const msg =
        "Speech recognition is not supported in this browser. Please use your touchscreen keyboard or typing.";
      safeToast(msg, "warning");
      return false;
    }

    if (triggerEl && typeof triggerEl.focus === "function") {
      lastDictationTriggerEl = triggerEl;
    } else if (typeof document !== "undefined" && document.activeElement) {
      lastDictationTriggerEl = document.activeElement;
    } else {
      lastDictationTriggerEl = getEl("btnDictateDesc");
    }

    // Stop reading instructions if active so TTS audio doesn't interfere with mic
    if (state.isSpeakingInstructions) {
      stopReadingInstructions();
    }

    // Pause Voice Navigation if active so words don't trigger navigation
    if (state.isNavListening) {
      state.wasNavActiveBeforeDictation = true;
      stopVoiceNav();
    } else {
      state.wasNavActiveBeforeDictation = false;
    }

    state.isDictating = true;
    state.dictationTranscript = "";
    const resolvedLabel = fieldLabel || "Description of the Intellectual Property";
    state.activeDictationFieldId = fieldId;
    state.activeDictationFieldLabel = resolvedLabel;

    // Visual feedback on the field dictate button
    const btn = getEl("btnDictateDesc");
    if (btn) {
      btn.classList.add("listening");
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Listening...</span>`;
    }

    safeToast(`Listening for ${resolvedLabel}... Speak your description clearly.`, "info");

    try {
      if (state.dictationRecognitionInstance) {
        try {
          state.dictationRecognitionInstance.onend = null;
          state.dictationRecognitionInstance.abort();
        } catch (_) {}
      }

      const dictationRec = new SpeechRecognition();
      dictationRec.continuous = false;
      dictationRec.interimResults = false;
      dictationRec.lang = "en-US";
      dictationRec.maxAlternatives = 1;

      dictationRec.onresult = function (event) {
        let transcript = "";
        if (event.results) {
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i] && event.results[i][0]) {
              const seg = String(event.results[i][0].transcript || "").trim();
              if (seg) {
                transcript += (transcript ? " " : "") + seg;
              }
            }
          }
        }
        state.dictationTranscript = transcript;
        showDictationReviewModal(fieldId, fieldLabel, transcript);
      };

      dictationRec.onerror = function (event) {
        const err = event.error;
        let msg = "Dictation encountered an issue.";
        if (err === "no-speech") {
          msg = "No speech heard. Tap 'Dictate' to try speaking again.";
        } else if (err === "not-allowed") {
          msg = "Microphone permission denied for dictation.";
        } else if (err === "network") {
          msg = "Network issue during dictation.";
        }
        safeToast(msg, "warning");
        resetDictationButtonUI();
        state.isDictating = false;

        const wasNav = state.wasNavActiveBeforeDictation;
        state.wasNavActiveBeforeDictation = false;
        if (wasNav) {
          startVoiceNav();
        }
      };

      dictationRec.onend = function () {
        resetDictationButtonUI();
        // If modal was not opened (e.g. no speech), clean up
        const modal = getEl("dictationReviewModal");
        if (!modal || modal.style.display === "none") {
          state.isDictating = false;
          const wasNav = state.wasNavActiveBeforeDictation;
          state.wasNavActiveBeforeDictation = false;
          if (wasNav) {
            startVoiceNav();
          }
        }
      };

      state.dictationRecognitionInstance = dictationRec;
      dictationRec.start();
      return true;
    } catch (err) {
      console.warn("Dictation start error:", err);
      resetDictationButtonUI();
      state.isDictating = false;
      const wasNav = state.wasNavActiveBeforeDictation;
      state.wasNavActiveBeforeDictation = false;
      if (wasNav) startVoiceNav();
      return false;
    }
  }

  function resetDictationButtonUI() {
    const btn = getEl("btnDictateDesc");
    if (btn) {
      btn.classList.remove("listening");
      btn.innerHTML = `<i class="fa-solid fa-microphone"></i> <span>Dictate</span>`;
    }
  }

  /**
   * Display the review modal for recognized text
   */
  function showDictationReviewModal(fieldId, fieldLabel, recognizedText) {
    const modal = getEl("dictationReviewModal");
    const targetLabel = getEl("dictationFieldTargetName");
    const textarea = getEl("dictationReviewInput");
    const noticeEl = getEl("dictationExistingNotice");
    const appendBtn = getEl("btnDictationAppend");
    const insertBtn = getEl("btnDictationInsert");

    state.activeDictationFieldId = fieldId;
    state.activeDictationFieldLabel = fieldLabel;

    if (targetLabel) {
      targetLabel.textContent = `Target Field: ${fieldLabel}`;
    }

    const targetEl = getEl(fieldId);
    const hasExistingText = Boolean(targetEl && targetEl.value && targetEl.value.trim().length > 0);

    if (textarea) {
      // Plain text insertion into editable review textarea
      textarea.value = String(recognizedText || "").trim();
    }

    if (noticeEl) {
      noticeEl.style.display = hasExistingText ? "block" : "none";
    }
    if (appendBtn) {
      appendBtn.style.display = hasExistingText ? "inline-flex" : "none";
    }
    if (insertBtn) {
      insertBtn.innerHTML = hasExistingText
        ? `<i class="fa-solid fa-arrows-rotate"></i> Replace Field`
        : `<i class="fa-solid fa-arrow-down-to-bracket"></i> Insert Text`;
    }

    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("active");
      if (textarea) {
        setTimeout(() => textarea.focus(), 50);
      }
    }
  }

  /**
   * Insert reviewed text into target form field
   */
  function insertDictatedText(mode = "replace") {
    const fieldId = state.activeDictationFieldId;
    const reviewTextarea = getEl("dictationReviewInput");
    const targetEl = getEl(fieldId);

    if (!targetEl || !reviewTextarea) {
      closeDictationReviewModal();
      return;
    }

    // Ensure plain text only, never executable HTML
    const textToInsert = String(reviewTextarea.value || "").trim();

    if (mode === "append" && targetEl.value && targetEl.value.trim().length > 0) {
      const existing = targetEl.value.trim();
      targetEl.value = `${existing}\n\n${textToInsert}`;
    } else {
      targetEl.value = textToInsert;
    }

    // Dispatch input & change events for validation & form sync
    targetEl.dispatchEvent(new Event("input", { bubbles: true }));
    targetEl.dispatchEvent(new Event("change", { bubbles: true }));

    // Sync to wizardData if in patent workflow
    if (typeof window !== "undefined" && window.wizardData) {
      if (fieldId === "disclosure-description") {
        window.wizardData.disclosureDescription = targetEl.value;
      }
      if (typeof window.captureWizardData === "function") {
        window.captureWizardData();
      }
    }

    closeDictationReviewModal();

    safeToast("Dictated description inserted into form.", "success");

    // Return focus to target element for normal keyboard / touch editing
    setTimeout(() => {
      try {
        targetEl.focus();
        targetEl.setSelectionRange(targetEl.value.length, targetEl.value.length);
      } catch (_) {}
    }, 100);

    state.isDictating = false;
    const wasNav = state.wasNavActiveBeforeDictation;
    state.wasNavActiveBeforeDictation = false;
    if (wasNav) {
      startVoiceNav();
    }
  }

  /**
   * Retry dictation from the review modal
   */
  function retryDictation() {
    closeDictationReviewModal();
    const fieldId = state.activeDictationFieldId || "disclosure-description";
    const fieldLabel = state.activeDictationFieldLabel || "Description of the Intellectual Property";
    setTimeout(() => {
      startDictation(fieldId, fieldLabel, lastDictationTriggerEl);
    }, 150);
  }

  /**
   * Cancel dictation without inserting text
   */
  function cancelDictation() {
    closeDictationReviewModal();
    state.isDictating = false;
    const wasNav = state.wasNavActiveBeforeDictation;
    state.wasNavActiveBeforeDictation = false;

    safeToast("Dictation cancelled. Field content preserved.", "info");

    if (lastDictationTriggerEl && typeof lastDictationTriggerEl.focus === "function") {
      try {
        lastDictationTriggerEl.focus();
      } catch (_) {}
    }

    if (wasNav) {
      startVoiceNav();
    }
  }

  function closeDictationReviewModal() {
    const modal = getEl("dictationReviewModal");
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("active");
    }
    resetDictationButtonUI();
  }

  // ============================================================
  // SPEECH SYNTHESIS ENGINE (READ STEP INSTRUCTIONS)
  // ============================================================

  function getStepInstructionText() {
    const currentPage = typeof window !== "undefined" ? window.currentPage : "";
    const currentStep = typeof window !== "undefined" ? window.currentWizardStep : 1;

    if (currentPage === "patent-form") {
      if (currentStep === 1) {
        return "Step 1: Advisory Service Sheet. Complete your client details, select the PSU service requested, and verify your contact information.";
      }
      if (currentStep === 2) {
        return "Step 2: Intellectual Property Disclosure Form. Fill out general inventor information, background and problem statement, technical description, novel features, advantages, and funding declaration. You can use the Dictate button to speak your description.";
      }
      if (currentStep === 3) {
        return "Step 3: Form 110 Supplemental Sheet. Complete this section if you have joint inventors or priority claims under international treaties.";
      }
      if (currentStep === 4) {
        return "Step 4: Optional Documents. Attach any supporting research papers, technical drawings, or pre-disclosure materials.";
      }
      return "Step 5: Preview and Submit. Review the generated official forms before final submission. Note that submission must be confirmed with the on-screen button.";
    }

    if (currentPage === "utility-form") {
      return `Utility Model Application Step ${currentStep}. Describe the construction, arrangement, or technical mechanism of your utility innovation. You can use touch or voice navigation.`;
    }

    if (currentPage === "copyright-form") {
      return `Copyright Registration Step ${currentStep}. Specify work classification, title, authorship details, and upload deposit copies.`;
    }

    if (currentPage === "industrial-form") {
      return `Industrial Design Registration Step ${currentStep}. Provide title, classification, and ornamental design specification details.`;
    }

    if (currentPage === "filing-hub") {
      return "New Intellectual Property Submission Hub. Select the protective lane for your creation: Patent, Trademark, Utility Model, Industrial Design, or Copyright.";
    }

    if (currentPage === "user-submissions") {
      return "My Cases. Review your active pre-filing applications, saved drafts, and evaluator updates.";
    }

    if (currentPage === "ip-guidelines" || currentPage === "guidelines") {
      return "Intellectual Property Guidelines. Read guidelines for protecting inventions, creative works, and institutional research at Palawan State University.";
    }

    if (currentPage === "messages") {
      return "Messages and Inquiries. Communicate directly with PSU Intellectual Property evaluators and officers regarding your submissions.";
    }

    if (currentPage === "marketplace-dash" || currentPage === "marketplace") {
      return "Technology Transfer Marketplace. Explore certified intellectual property disclosures, research innovations, and commercialization listings across Palawan State University.";
    }

    if (currentPage === "user-dashboard" || currentPage === "landing") {
      return "Home Dashboard. View your intellectual property portfolio summary, recent activity, announcements, and quick actions.";
    }

    return "Assisted Filing Mode. Use touch or voice navigation to complete your patent pre-filing application with PSU Intellectual Property Office.";
  }

  /**
   * Read step instructions aloud (Audio Output)
   */
  function readCurrentStepInstructions() {
    if (!isSpeechSynthesisSupported) {
      safeToast("Speech synthesis is not supported in this browser.", "warning");
      return false;
    }

    // Auto-mute voice navigation so spoken instructions aren't picked up as commands
    if (state.isNavListening) {
      state.wasNavActiveBeforeReading = true;
      stopVoiceNav();
    } else {
      state.wasNavActiveBeforeReading = false;
    }

    state.isSpeakingInstructions = true;
    const text = getStepInstructionText();

    const readBtn = getEl("btnReadInstructions");
    const stopBtn = getEl("btnStopReading");
    if (readBtn) readBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.95;

      utterance.onend = function () {
        finishReadingInstructions();
      };

      utterance.onerror = function () {
        finishReadingInstructions();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn("SpeechSynthesis speak error:", err);
      finishReadingInstructions();
      return false;
    }
  }

  /**
   * Stop reading instructions
   */
  function stopReadingInstructions() {
    if (isSpeechSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    finishReadingInstructions();
  }

  function finishReadingInstructions() {
    state.isSpeakingInstructions = false;
    const readBtn = getEl("btnReadInstructions");
    const stopBtn = getEl("btnStopReading");
    if (readBtn) readBtn.style.display = "inline-flex";
    if (stopBtn) stopBtn.style.display = "none";

    const wasNav = state.wasNavActiveBeforeReading;
    state.wasNavActiveBeforeReading = false;
    // Resume voice navigation if it was active before reading
    if (wasNav) {
      if (navResumeReadingTimer) clearTimeout(navResumeReadingTimer);
      navResumeReadingTimer = setTimeout(() => {
        navResumeReadingTimer = null;
        startVoiceNav();
      }, 300);
    }
  }

  // ============================================================
  // GESTURE INTERACTION ENGINE (CAMERA COMPUTER VISION)
  // ============================================================

  /**
   * Update Gesture Toggle Button UI
   */
  function updateGestureButtonUI(isActive) {
    const btn = getEl("btnGestureToggle");
    const textEl = getEl("btnGestureToggleText");
    const badgeEl = getEl("gestureStatusBadge");
    const hudContainer = getEl("gestureHudContainer");
    const previewBtn = getEl("btnToggleGesturePreview");
    if (!btn) return;

    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    if (isActive) {
      btn.classList.add("btn-danger", "listening");
      btn.classList.remove("btn-outline-navy");
      if (textEl) textEl.textContent = "Disable Gesture Navigation";
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-video-slash";
      if (badgeEl) {
        badgeEl.className = "gesture-status-badge status-active";
        badgeEl.textContent = "Camera Active";
      }
      if (hudContainer && state.isGesturePreviewOpen) {
        hudContainer.style.display = "block";
        if (previewBtn) {
          previewBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide Preview';
        }
      }
    } else {
      btn.classList.remove("btn-danger", "listening");
      btn.classList.add("btn-outline-navy");
      if (textEl) textEl.textContent = "Enable Gesture Navigation";
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fa-solid fa-video";
      if (badgeEl) {
        badgeEl.className = "gesture-status-badge status-idle";
        badgeEl.textContent = "Camera Off";
      }
      if (hudContainer) {
        hudContainer.style.display = "none";
      }
      if (previewBtn) {
        previewBtn.innerHTML = '<i class="fa-solid fa-eye"></i> HUD Preview';
      }
    }
  }

  /**
   * Update visual feedback elements for Gesture Navigation
   */
  function updateGestureFeedbackUI(detected, action, statusClass = "") {
    if (detected !== null) {
      state.lastDetectedGesture = detected;
      const detEl = getEl("gestureFeedbackDetected");
      if (detEl) detEl.textContent = detected || "(None)";
    }
    if (action !== null) {
      state.lastGestureAction = action;
      const actEl = getEl("gestureFeedbackAction");
      if (actEl) actEl.textContent = action;
    }
    const badgeEl = getEl("gestureStatusBadge");
    if (badgeEl && statusClass && state.isGestureActive) {
      badgeEl.className = `gesture-status-badge ${statusClass}`;
    }
  }

  /**
   * Complete Gesture Reference Map for UI badges and HUD displays (strict static postures)
   */
  const GESTURE_MAP = Object.freeze({
    thumbs_up: { icon: "fa-thumbs-up", label: "Thumbs Up (Scroll Up)" },
    thumbs_down: { icon: "fa-thumbs-down", label: "Thumbs Down (Scroll Down)" },
    one_finger: { icon: "fa-hand-point-up", label: "1 Finger (Next Step)" },
    two_fingers: { icon: "fa-hand-peace", label: "2 Fingers (Prev Step)" },
    three_fingers: { icon: "fa-hand", label: "3 Fingers (Submit)" },
    four_fingers: { icon: "fa-hand", label: "4 Fingers (Save Draft)" },
    peace_sign: { icon: "fa-hand-peace", label: "2 Fingers (Prev Step)" },
    hand_detected: { icon: "fa-hand", label: "Hand Detected" },
  });

  /**
   * Update overlay badge on camera canvas
   */
  function updateGestureDetectionBadge(gesture) {
    const badge = getEl("gestureDetectionBadge");
    const text = getEl("gestureDetectionText");
    if (!badge || !text) return;

    if (!gesture) {
      badge.className = "gesture-detection-overlay-badge";
      badge.innerHTML = '<i class="fa-solid fa-hand"></i> <span>No hand detected</span>';
      return;
    }

    const item = GESTURE_MAP[gesture] || { icon: "fa-hand", label: gesture };
    badge.className = "gesture-detection-overlay-badge detected";
    badge.innerHTML = `<i class="fa-solid ${item.icon}"></i> <span>${item.label}</span>`;
  }

  /**
   * Update hold progress indicator for continuous hold postures (e.g. 4 Fingers)
   */
  function updateGestureHoldUI(percent, isHolding) {
    const wrap = getEl("gestureHoldProgressWrap");
    const bar = getEl("gestureHoldBar");
    const text = getEl("gestureHoldPercent");
    if (!wrap) return;

    if (isHolding && percent > 0) {
      wrap.style.display = "block";
      if (bar) bar.style.width = `${percent}%`;
      if (text) text.textContent = `${percent}%`;
    } else {
      wrap.style.display = "none";
      if (bar) bar.style.width = "0%";
      if (text) text.textContent = "0%";
    }
  }

  /**
   * Show/hide camera unsupported warning
   */
  function showCameraWarning(msg) {
    const el = getEl("cameraUnsupportedNotice");
    const txt = getEl("cameraUnsupportedNoticeText");
    if (el) el.style.display = "flex";
    if (txt && msg) txt.innerHTML = `<strong>Camera Notice:</strong> ${escapeHtml(msg)}`;
  }

  function hideCameraWarning() {
    const el = getEl("cameraUnsupportedNotice");
    if (el) el.style.display = "none";
  }

  /**
   * Toggle HUD preview collapse
   */
  function toggleGesturePreview() {
    const container = getEl("gestureHudContainer");
    const btn = getEl("btnToggleGesturePreview");
    if (!container) return;
    const isCurrentlyHidden = container.style.display === "none";
    state.isGesturePreviewOpen = isCurrentlyHidden;
    container.style.display = isCurrentlyHidden ? "block" : "none";
    if (btn) {
      btn.innerHTML = isCurrentlyHidden
        ? '<i class="fa-solid fa-eye-slash"></i> Hide Preview'
        : '<i class="fa-solid fa-eye"></i> HUD Preview';
    }
  }

  /**
   * Clear gesture log / feedback
   */
  function clearGestureFeedback() {
    updateGestureFeedbackUI("(None)", "Feedback cleared. Ready for gestures.", "status-idle");
    updateGestureHoldUI(0, false);
    updateGestureDetectionBadge(null);
  }

  /**
   * Smoothly scroll active form container or window
   */
  function scrollFormOrWindow(deltaY) {
    if (typeof window === "undefined") return;
    const scrollContainer =
      (typeof document !== "undefined" &&
        (document.querySelector(".patent-flow") ||
          document.querySelector(".patent-app-layout") ||
          document.querySelector(".patent-wizard-container") ||
          document.querySelector(".wizard-container") ||
          document.querySelector(".gform-wrap") ||
          document.querySelector(".form-wizard") ||
          document.querySelector("#main-content"))) ||
      null;

    if (
      scrollContainer &&
      scrollContainer.scrollHeight > scrollContainer.clientHeight &&
      typeof scrollContainer.scrollBy === "function"
    ) {
      try {
        scrollContainer.scrollBy({ top: deltaY, behavior: "smooth" });
        return;
      } catch (_) {}
    }

    if (typeof window.scrollBy === "function") {
      try {
        window.scrollBy({ top: deltaY, behavior: "smooth" });
        return;
      } catch (_) {
        try {
          window.scrollBy(0, deltaY);
          return;
        } catch (_) {}
      }
    }

    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.scrollTop += deltaY;
    }
  }

  /**
   * Cancel / halt ongoing smooth scrolling animations
   */
  function haltScrolling() {
    if (typeof window === "undefined") return;
    const scrollContainer =
      (typeof document !== "undefined" &&
        (document.querySelector(".patent-flow") ||
          document.querySelector(".patent-app-layout") ||
          document.querySelector(".patent-wizard-container") ||
          document.querySelector(".wizard-container") ||
          document.querySelector(".gform-wrap") ||
          document.querySelector(".form-wizard") ||
          document.querySelector("#main-content"))) ||
      null;

    if (scrollContainer && typeof scrollContainer.scrollBy === "function") {
      try {
        scrollContainer.scrollBy({ top: 0, left: 0, behavior: "instant" });
      } catch (_) {
        try { scrollContainer.scrollTop = scrollContainer.scrollTop; } catch (_) {}
      }
    }

    if (typeof window.scrollBy === "function") {
      try {
        window.scrollBy({ top: 0, left: 0, behavior: "instant" });
      } catch (_) {
        try { window.scrollBy(0, 0); } catch (_) {}
      }
    }
  }

  /**
   * Process a discrete or continuous gesture according to Complete Gesture Reference Card
   */
  function processGesture(rawGesture, options = {}) {
    if (!rawGesture) return { handled: false, error: "empty_gesture" };
    const gesture = String(rawGesture).toLowerCase().replace(/[\s-]+/g, "_");
    const now = options.timestamp || Date.now();

    // If continuous hold was already executed, throttle subsequent held frames silently
    if (state.gestureHoldExecuted && options.holdDuration !== undefined) {
      return { handled: false, gesture, alreadyExecuted: true };
    }

    // Check debouncing cooldown
    if (now < state.gestureCooldownUntil) {
      return {
        handled: false,
        throttled: true,
        gesture,
        reason: "Debounce cooldown active",
      };
    }

    switch (gesture) {
      // 1. PAGE SCROLLING: Thumbs Up -> "Scroll up"
      case "thumbs_up": {
        const distance = options.distance || 280;
        scrollFormOrWindow(-distance);
        updateGestureFeedbackUI("Thumbs Up", `Scrolled up ${distance}px`, "status-active");
        state.gestureCooldownUntil = now + 350;
        return { handled: true, gesture, action: "scroll_up", distance };
      }

      // 1. PAGE SCROLLING: Thumbs Down -> "Scroll down"
      case "thumbs_down": {
        const distance = options.distance || 280;
        scrollFormOrWindow(distance);
        updateGestureFeedbackUI("Thumbs Down", `Scrolled down ${distance}px`, "status-active");
        state.gestureCooldownUntil = now + 350;
        return { handled: true, gesture, action: "scroll_down", distance };
      }

      // 2. FORM NAVIGATION: 1 Finger -> "Next step / Next page"
      case "one_finger":
      case "1_finger":
      case "onefinger": {
        const check = evaluateCommandContext("next_step", "gesture");
        if (!check.valid) {
          updateGestureFeedbackUI("1 Finger", check.reason, "status-error");
          if (typeof window !== "undefined" && typeof window.showToast === "function") {
            window.showToast(check.reason, "warning");
          }
          state.gestureCooldownUntil = now + 800;
          return { handled: false, gesture, reason: check.reason };
        }
        updateGestureFeedbackUI("1 Finger", "Advancing to next section...", "status-active");
        if (typeof window !== "undefined" && typeof window.nextWizardStep === "function") {
          window.nextWizardStep();
        }
        state.gestureCooldownUntil = now + 1000;
        return { handled: true, gesture, action: "next_step" };
      }

      // 2. FORM NAVIGATION: 2 Fingers -> "Previous step / Previous page"
      case "two_fingers":
      case "2_fingers":
      case "twofingers":
      case "peace_sign": {
        const check = evaluateCommandContext("previous_step", "gesture");
        if (!check.valid) {
          updateGestureFeedbackUI("2 Fingers", check.reason, "status-error");
          if (typeof window !== "undefined" && typeof window.showToast === "function") {
            window.showToast(check.reason, "warning");
          }
          state.gestureCooldownUntil = now + 800;
          return { handled: false, gesture, reason: check.reason };
        }
        updateGestureFeedbackUI("2 Fingers", "Returning to previous section...", "status-active");
        if (typeof window !== "undefined" && typeof window.prevWizardStep === "function") {
          window.prevWizardStep();
        }
        state.gestureCooldownUntil = now + 1000;
        return { handled: true, gesture, action: "previous_step" };
      }

      // 3. WORKFLOW ACTIONS: 3 Fingers -> "Submit application"
      case "three_fingers":
      case "3_fingers":
      case "threefingers": {
        const check = evaluateCommandContext("submit", "gesture");
        if (!check.valid) {
          updateGestureFeedbackUI("3 Fingers", check.reason, "status-error");
          if (typeof window !== "undefined" && typeof window.showToast === "function") {
            window.showToast(check.reason, "warning");
          }
          state.gestureCooldownUntil = now + 800;
          return { handled: false, gesture, reason: check.reason };
        }

        // Optional hold progress if options.minHold is specified
        if (options.minHold && options.holdDuration !== undefined && options.holdDuration < options.minHold) {
          const percent = Math.min(100, Math.round((options.holdDuration / options.minHold) * 100));
          updateGestureHoldUI(percent, true);
          updateGestureFeedbackUI(
            "3 Fingers (Holding...)",
            `Hold steady to submit application: ${percent}%`,
            "status-holding"
          );
          return { handled: false, gesture, holding: true, percent, holdDuration: options.holdDuration };
        }

        if (state.gestureHoldExecuted && options.holdDuration !== undefined) {
          return { handled: false, gesture, alreadyExecuted: true };
        }

        updateGestureHoldUI(100, true);
        updateGestureFeedbackUI("3 Fingers", "Submitting application...", "status-active");

        if (typeof document !== "undefined") {
          const termsBox = document.getElementById("reviewTermsConfirm");
          const finalBtn = document.getElementById("finalSubmitBtn");
          if (termsBox && !termsBox.checked) {
            termsBox.checked = true;
            if (typeof window.toggleSubmitButton === "function") {
              window.toggleSubmitButton();
            } else if (finalBtn) {
              finalBtn.disabled = false;
            }
          }
        }

        if (typeof window !== "undefined" && typeof window.submitForm === "function") {
          window.submitForm();
        } else if (typeof document !== "undefined") {
          const submitBtn = document.getElementById("finalSubmitBtn");
          if (submitBtn && typeof submitBtn.click === "function") {
            submitBtn.click();
          }
        }

        state.gestureHoldExecuted = true;
        state.gestureCooldownUntil = now + 1500;
        setTimeout(() => updateGestureHoldUI(0, false), 800);
        return { handled: true, gesture, action: "submit" };
      }

      // 3. WORKFLOW ACTIONS: 4 Fingers -> "Save draft"
      case "four_fingers":
      case "4_fingers":
      case "fourfingers": {
        const check = evaluateCommandContext("save_draft", "gesture");
        if (!check.valid) {
          updateGestureFeedbackUI("4 Fingers", check.reason, "status-error");
          if (typeof window !== "undefined" && typeof window.showToast === "function") {
            window.showToast(check.reason, "warning");
          }
          state.gestureHoldExecuted = true;
          state.gestureCooldownUntil = now + 1000;
          return { handled: false, gesture, reason: check.reason };
        }

        // Optional hold progress if options.minHold is specified
        if (options.minHold && options.holdDuration !== undefined && options.holdDuration < options.minHold) {
          const percent = Math.min(100, Math.round((options.holdDuration / options.minHold) * 100));
          updateGestureHoldUI(percent, true);
          updateGestureFeedbackUI(
            "4 Fingers (Holding...)",
            `Hold steady to save draft: ${percent}%`,
            "status-holding"
          );
          return { handled: false, gesture, holding: true, percent, holdDuration: options.holdDuration };
        }

        if (state.gestureHoldExecuted && options.holdDuration !== undefined) {
          return { handled: false, gesture, alreadyExecuted: true };
        }

        updateGestureHoldUI(100, true);
        updateGestureFeedbackUI("4 Fingers", "Saving application draft...", "status-active");
        if (
          typeof window !== "undefined" &&
          typeof window.saveFormDraft === "function" &&
          window.isAdvancedGuidedFlow &&
          window.isAdvancedGuidedFlow()
        ) {
          window.saveFormDraft();
        } else if (typeof window !== "undefined" && typeof window.saveFormDraft === "function") {
          window.saveFormDraft();
        } else if (typeof window !== "undefined" && typeof window.saveDraft === "function") {
          window.saveDraft();
        }

        state.gestureHoldExecuted = true;
        state.gestureCooldownUntil = now + 1500;
        setTimeout(() => updateGestureHoldUI(0, false), 800);
        return { handled: true, gesture, action: "save_draft" };
      }

      default: {
        updateGestureFeedbackUI(
          rawGesture,
          `Gesture "${rawGesture}" not recognized.`,
          "status-error"
        );
        return { handled: false, error: "unknown_gesture", gesture };
      }
    }
  }

  // Google MediaPipe Hands 21-joint skeletal bone connections
  const HAND_CONNECTIONS = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index finger
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle finger
    [9, 10], [10, 11], [11, 12],
    // Ring finger
    [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm connections
    [5, 9], [9, 13], [13, 17]
  ];

  /**
   * Classify static posture from 21 MediaPipe hand landmarks
   */
  function detectPostureFromLandmarks(lm) {
    if (!lm || !Array.isArray(lm) || lm.length < 21) return null;
    for (let i = 0; i < 21; i++) {
      if (!lm[i]) return null;
    }

    const pt = (i) => {
      const item = lm[i];
      if (!item) return { x: 0, y: 0, z: 0 };
      return {
        x: typeof item.x === "number" ? item.x : Array.isArray(item) ? item[0] : 0,
        y: typeof item.y === "number" ? item.y : Array.isArray(item) ? item[1] : 0,
        z: typeof item.z === "number" ? item.z : Array.isArray(item) ? item[2] || 0 : 0,
      };
    };

    const wrist = pt(0);
    const thumbCmc = pt(1), thumbMcp = pt(2), thumbIp = pt(3), thumbTip = pt(4);
    const indexMcp = pt(5), indexPip = pt(6), indexDip = pt(7), indexTip = pt(8);
    const middleMcp = pt(9), middlePip = pt(10), middleDip = pt(11), middleTip = pt(12);
    const ringMcp = pt(13), ringPip = pt(14), ringDip = pt(15), ringTip = pt(16);
    const pinkyMcp = pt(17), pinkyPip = pt(18), pinkyDip = pt(19), pinkyTip = pt(20);

    // Anatomical finger curl and extension predicates
    function isFingerFolded(tip, pip, mcp) {
      const tipDistWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const pipDistWrist = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      const tipDistMcp = Math.hypot(tip.x - mcp.x, tip.y - mcp.y);
      const pipDistMcp = Math.hypot(pip.x - mcp.x, pip.y - mcp.y);
      return tip.y >= pip.y || tipDistWrist <= pipDistWrist || tipDistMcp <= pipDistMcp * 0.95;
    }

    function isFingerExtended(tip, pip, mcp) {
      const tipDistWrist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const pipDistWrist = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      return tip.y < pip.y && tipDistWrist > pipDistWrist && !isFingerFolded(tip, pip, mcp);
    }

    const isIndexExt = isFingerExtended(indexTip, indexPip, indexMcp);
    const isMiddleExt = isFingerExtended(middleTip, middlePip, middleMcp);
    const isRingExt = isFingerExtended(ringTip, ringPip, ringMcp);
    const isPinkyExt = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);

    const isIndexFolded = isFingerFolded(indexTip, indexPip, indexMcp);
    const isMiddleFolded = isFingerFolded(middleTip, middlePip, middleMcp);
    const isRingFolded = isFingerFolded(ringTip, ringPip, ringMcp);
    const isPinkyFolded = isFingerFolded(pinkyTip, pinkyPip, pinkyMcp);

    // Palm center coordinate
    const palmCx = (wrist.x + indexMcp.x + pinkyMcp.x) / 3;
    const palmCy = (wrist.y + indexMcp.y + pinkyMcp.y) / 3;

    // Palm orientation: right-side palm (pinky on right of index) vs left-side palm
    const isRightPalm = pinkyMcp.x > indexMcp.x;

    // Thumb extended high upward (tip is above thumb MCP and above index knuckle)
    const isThumbExtUp = thumbTip.y < thumbMcp.y && thumbTip.y < indexMcp.y;
    const thumbDistToIndexMcp = Math.hypot(thumbTip.x - indexMcp.x, thumbTip.y - indexMcp.y);
    const thumbDistToPalm = Math.hypot(thumbTip.x - palmCx, thumbTip.y - palmCy);
    const thumbMcpDistToPalm = Math.hypot(thumbMcp.x - palmCx, thumbMcp.y - palmCy);

    // Thumb pointing outward away from palm (relaxed or spread open hand)
    const isThumbPointingOutward = isRightPalm
      ? (thumbTip.x < thumbMcp.x || thumbTip.x < indexMcp.x - 0.02)
      : (thumbTip.x > thumbMcp.x || thumbTip.x > indexMcp.x + 0.02);

    // Thumb separated from fist for clean thumbs-up detection
    const isThumbSeparated = thumbDistToIndexMcp > 0.06 && (indexMcp.y - thumbTip.y > 0.04);

    // Thumb extended downward (thumbs down): thumbTip is extended downwards away from palm and MCP
    const isThumbExtDown =
      thumbTip.y > thumbMcp.y + 0.04 &&
      (thumbTip.y > palmCy + 0.06 || thumbTip.y > wrist.y * 0.95) &&
      thumbDistToPalm > thumbMcpDistToPalm * 0.75;
    const isThumbDownSeparated = isThumbExtDown && (thumbTip.y - thumbMcp.y > 0.04);

    // Thumb extended outward laterally or diagonally away from palm
    const isThumbOutward =
      (isThumbPointingOutward && thumbDistToPalm > thumbMcpDistToPalm * 0.85) ||
      (thumbDistToIndexMcp > 0.13 && thumbDistToPalm > thumbMcpDistToPalm * 0.85);

    const isThumbFolded = !isThumbExtUp && !isThumbExtDown && !isThumbOutward;

    // Thumb specifically folded across the palm (for four_fingers)
    const isThumbFoldedAcrossPalm =
      isThumbFolded &&
      !isThumbOutward &&
      !isThumbExtUp &&
      !isThumbExtDown &&
      !isThumbPointingOutward &&
      (thumbDistToPalm < thumbMcpDistToPalm * 0.85 ||
        (isRightPalm ? thumbTip.x >= indexMcp.x : thumbTip.x <= indexMcp.x));

    // 1. Thumbs Up:
    // Thumb extended up, 4 fingers curled into fist.
    if (
      isThumbExtUp &&
      isThumbSeparated &&
      isIndexFolded &&
      isMiddleFolded &&
      isRingFolded &&
      isPinkyFolded &&
      !isIndexExt &&
      !isMiddleExt &&
      !isRingExt &&
      !isPinkyExt
    ) {
      return "thumbs_up";
    }

    // 2. Thumbs Down:
    // Thumb extended down (thumbTip.y > thumbMcp.y and below wrist/palm), 4 fingers curled into fist.
    if (
      isThumbExtDown &&
      isThumbDownSeparated &&
      isIndexFolded &&
      isMiddleFolded &&
      isRingFolded &&
      isPinkyFolded &&
      !isIndexExt &&
      !isMiddleExt &&
      !isRingExt &&
      !isPinkyExt
    ) {
      return "thumbs_down";
    }

    // 3. 1 Finger:
    // Index extended, thumb/middle/ring/pinky curled.
    if (
      isIndexExt &&
      !isIndexFolded &&
      isMiddleFolded &&
      isRingFolded &&
      isPinkyFolded &&
      !isMiddleExt &&
      !isRingExt &&
      !isPinkyExt &&
      isThumbFolded &&
      !isThumbOutward &&
      !isThumbExtUp &&
      !isThumbExtDown
    ) {
      return "one_finger";
    }

    // 4. 2 Fingers:
    // Index + middle extended, ring/pinky/thumb curled.
    if (
      isIndexExt &&
      isMiddleExt &&
      !isIndexFolded &&
      !isMiddleFolded &&
      !isRingExt &&
      !isPinkyExt &&
      isRingFolded &&
      isPinkyFolded &&
      isThumbFolded &&
      !isThumbOutward &&
      !isThumbExtUp &&
      !isThumbExtDown
    ) {
      return "two_fingers";
    }

    // 5. 3 Fingers:
    // Index + middle + ring extended, pinky/thumb curled.
    if (
      isIndexExt &&
      isMiddleExt &&
      isRingExt &&
      !isIndexFolded &&
      !isMiddleFolded &&
      !isRingFolded &&
      !isPinkyExt &&
      isPinkyFolded &&
      isThumbFolded &&
      !isThumbOutward &&
      !isThumbExtUp &&
      !isThumbExtDown
    ) {
      return "three_fingers";
    }

    // 6. 4 Fingers:
    // Index + middle + ring + pinky extended, thumb curled across palm.
    if (
      isIndexExt &&
      isMiddleExt &&
      isRingExt &&
      isPinkyExt &&
      !isIndexFolded &&
      !isMiddleFolded &&
      !isRingFolded &&
      !isPinkyFolded &&
      isThumbFoldedAcrossPalm
    ) {
      return "four_fingers";
    }

    return null;
  }

  /**
   * Analyze hand landmarks (21 points) from MediaPipe or synthetic stream
   */
  function analyzeHandLandmarks(landmarks, timestamp = Date.now()) {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 21) {
      updateGestureHoldUI(0, false);
      state.gestureHoldStartTime = null;
      state.gestureHoldDurationMs = 0;
      state.gestureHoldExecuted = false;
      state.lastActivePosture = null;
      state.postureBuffer = [];
      updateGestureDetectionBadge(null);
      return { detected: false };
    }

    for (let i = 0; i < 21; i++) {
      if (!landmarks[i]) {
        updateGestureHoldUI(0, false);
        state.gestureHoldStartTime = null;
        state.gestureHoldDurationMs = 0;
        state.gestureHoldExecuted = false;
        state.lastActivePosture = null;
        state.postureBuffer = [];
        updateGestureDetectionBadge(null);
        return { detected: false };
      }
    }

    // Classify raw instantaneous posture from skeletal landmarks
    const rawPosture = detectPostureFromLandmarks(landmarks);

    // Temporal posture smoothing (3-frame stability buffer)
    if (!state.postureBuffer) state.postureBuffer = [];
    state.postureBuffer.push(rawPosture);
    if (state.postureBuffer.length > 3) {
      state.postureBuffer.shift();
    }

    let posture = null;
    if (state.postureBuffer.length >= 3) {
      const last = state.postureBuffer[state.postureBuffer.length - 1];
      if (last && state.postureBuffer.every((p) => p === last)) {
        posture = last;
      }
    } else {
      if (rawPosture && state.postureBuffer.every((p) => p === rawPosture)) {
        posture = rawPosture;
      }
    }

    if (posture) {
      updateGestureDetectionBadge(posture);

      if (state.lastActivePosture !== posture || !state.gestureHoldStartTime) {
        state.lastActivePosture = posture;
        state.gestureHoldStartTime = timestamp;
        state.gestureHoldDurationMs = 0;
        state.gestureHoldExecuted = false;
      } else {
        state.gestureHoldDurationMs = timestamp - state.gestureHoldStartTime;
      }

      const isHoldPosture = posture === "four_fingers";
      const holdPercent = isHoldPosture && state.gestureHoldDurationMs
        ? Math.min(100, Math.round((state.gestureHoldDurationMs / 1200) * 100))
        : 0;
      updateGestureHoldUI(holdPercent, isHoldPosture && holdPercent > 0);

      const minHold = isHoldPosture ? 1200 : undefined;
      const result = processGesture(posture, {
        timestamp,
        holdDuration: state.gestureHoldDurationMs,
        minHold,
      });
      return {
        detected: true,
        gesture: posture,
        holdDuration: state.gestureHoldDurationMs,
        result,
      };
    }

    // Single-frame noise tolerance during active posture hold:
    // Only tolerate tracking noise (rawPosture === null). If user deliberately switches to
    // another distinct posture (e.g. two_fingers), immediately abort hold.
    const isExplicitOtherPosture =
      rawPosture && state.lastActivePosture && rawPosture !== state.lastActivePosture;
    const isConsecutiveRelease =
      isExplicitOtherPosture ||
      (state.postureBuffer.length >= 2 &&
        state.postureBuffer.slice(-2).every((p) => p !== state.lastActivePosture));

    if (state.gestureHoldStartTime && state.lastActivePosture && !isConsecutiveRelease) {
      state.gestureHoldDurationMs = timestamp - state.gestureHoldStartTime;
      const isHoldPosture = state.lastActivePosture === "four_fingers";
      const holdPercent = isHoldPosture && state.gestureHoldDurationMs
        ? Math.min(100, Math.round((state.gestureHoldDurationMs / 1200) * 100))
        : 0;
      updateGestureHoldUI(holdPercent, isHoldPosture && holdPercent > 0);
      updateGestureDetectionBadge(state.lastActivePosture);
      const minHold = isHoldPosture ? 1200 : undefined;
      const result = processGesture(state.lastActivePosture, {
        timestamp,
        holdDuration: state.gestureHoldDurationMs,
        minHold,
      });
      return {
        detected: true,
        gesture: state.lastActivePosture,
        holdDuration: state.gestureHoldDurationMs,
        result,
      };
    }

    updateGestureHoldUI(0, false);
    state.gestureHoldStartTime = null;
    state.gestureHoldDurationMs = 0;
    state.gestureHoldExecuted = false;
    state.lastActivePosture = null;
    updateGestureDetectionBadge("hand_detected");
    return { detected: true, posture: null };
  }

  /**
   * Analyze raw pixel frame data from canvas 2D image processing
   */
  function analyzeFrameData(imageData, timestamp = Date.now()) {
    if (!imageData || !imageData.data) {
      updateGestureHoldUI(0, false);
      state.gestureHoldStartTime = null;
      state.gestureHoldDurationMs = 0;
      state.gestureHoldExecuted = false;
      updateGestureDetectionBadge(null);
      return { detected: false };
    }
    const { data, width, height } = imageData;

    let skinCount = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width, maxX = 0, minY = height, maxY = 0;

    // Subsample every 2 pixels for low CPU overhead
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Hand segmentation rule:
        // 1. Natural skin tones (light, medium, and deep/melanin-rich tones):
        const isStandardSkin =
          r > 60 &&
          g > 30 &&
          b > 15 &&
          r > g &&
          r > b &&
          r - g > 8 &&
          r - b > 8 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 12;

        const isDeepSkin =
          r > 40 &&
          g > 25 &&
          b > 15 &&
          r >= g &&
          r >= b &&
          Math.max(r, g, b) - Math.min(r, g, b) > 8;

        // 2. Laboratory gloves (blue nitrile, purple nitrile, white/off-white latex):
        const isBlueNitrileGlove =
          b > 75 &&
          b > r * 1.15 &&
          b > g;

        const isPurpleNitrileGlove =
          b > 65 &&
          r > 60 &&
          g < 95 &&
          (r + b) > 2.0 * g;

        const isWhiteLatexGlove =
          r > 140 &&
          g > 140 &&
          b > 140 &&
          Math.abs(r - g) < 25 &&
          Math.abs(r - b) < 25 &&
          Math.abs(g - b) < 25;

        if (
          isStandardSkin ||
          isDeepSkin ||
          isBlueNitrileGlove ||
          isPurpleNitrileGlove ||
          isWhiteLatexGlove
        ) {
          skinCount++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const totalSampled = (width / 2) * (height / 2);
    if (skinCount < totalSampled * 0.02) {
      updateGestureHoldUI(0, false);
      state.gestureHoldStartTime = null;
      state.gestureHoldDurationMs = 0;
      state.gestureHoldExecuted = false;
      updateGestureDetectionBadge(null);
      return { detected: false };
    }

    const cx = sumX / skinCount / width;
    const cy = sumY / skinCount / height;
    const boxW = (maxX - minX) / width;
    const boxH = (maxY - minY) / height;

    // Sample top portion (fingers / thumb up) and bottom portion (thumb down)
    const topYLimit = minY + (maxY - minY) * 0.35;
    const bottomYLimit = minY + (maxY - minY) * 0.65;
    let topSkinCount = 0;
    let leftTopSkin = 0;
    let rightTopSkin = 0;
    let centerTopSkin = 0;
    let q1Top = 0, q2Top = 0, q3Top = 0, q4Top = 0;

    let bottomSkinCount = 0;
    let bottomLeftSkin = 0;
    let bottomRightSkin = 0;
    let bottomCenterSkin = 0;

    for (let y = minY; y <= maxY; y += 2) {
      for (let x = minX; x <= maxX; x += 2) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isHandPixel =
          (r > 60 && g > 30 && b > 15 && r > g && r > b) ||
          (r > 40 && g > 25 && b > 15 && r >= g) ||
          (b > 75 && b > r * 1.15 && b > g) ||
          (b > 65 && r > 60 && (r + b) > 2.0 * g) ||
          (r > 140 && g > 140 && b > 140 && Math.abs(r - g) < 25);

        if (isHandPixel) {
          const xFrac = (x - minX) / (maxX - minX || 1);
          if (y <= topYLimit) {
            topSkinCount++;
            if (xFrac < 0.25) q1Top++;
            else if (xFrac < 0.50) q2Top++;
            else if (xFrac < 0.75) q3Top++;
            else q4Top++;

            if (xFrac < 0.38) leftTopSkin++;
            else if (xFrac > 0.62) rightTopSkin++;
            else centerTopSkin++;
          } else if (y >= bottomYLimit) {
            bottomSkinCount++;
            if (xFrac < 0.35) bottomLeftSkin++;
            else if (xFrac > 0.65) bottomRightSkin++;
            else bottomCenterSkin++;
          }
        }
      }
    }

    let posture = null;
    const skinRatio = skinCount / (totalSampled || 1);
    const aspectRatio = boxH / (boxW || 0.001);
    const relCentroidY = (cy * height - minY) / ((maxY - minY) || 1);

    // 1. Thumbs Down: fist on top, thumb extending downward at bottom
    if (
      aspectRatio > 1.05 &&
      bottomSkinCount > 6 &&
      (bottomCenterSkin > (bottomLeftSkin + bottomRightSkin) * 0.8 ||
        bottomLeftSkin > (bottomCenterSkin + bottomRightSkin) * 1.2 ||
        bottomRightSkin > (bottomCenterSkin + bottomLeftSkin) * 1.2) &&
      relCentroidY < 0.54 &&
      topSkinCount > 10
    ) {
      posture = "thumbs_down";
    }
    // 2. Thumbs Up: thumb extended up on one side/center, fist at bottom
    else if (
      aspectRatio > 1.15 &&
      topSkinCount > 6 &&
      (leftTopSkin > (centerTopSkin + rightTopSkin) * 1.3 ||
        rightTopSkin > (centerTopSkin + leftTopSkin) * 1.3) &&
      relCentroidY >= 0.46
    ) {
      posture = "thumbs_up";
    }
    // 3. 1 Finger: single vertical index finger column at top
    else if (
      aspectRatio > 1.25 &&
      topSkinCount >= 6 &&
      centerTopSkin >= 6 &&
      (q1Top + q4Top) <= (q2Top + q3Top) * 0.15
    ) {
      posture = "one_finger";
    }
    // 4. 2 Fingers: two peaks with center valley (V-shape)
    else if (
      aspectRatio > 1.25 &&
      topSkinCount > 12 &&
      leftTopSkin > 6 &&
      rightTopSkin > 6 &&
      centerTopSkin < (leftTopSkin + rightTopSkin) * 0.25
    ) {
      posture = "two_fingers";
    }
    // 5. 3 Fingers: 3 fingers active across top, but pinky side empty (q4Top low/empty)
    else if (
      aspectRatio > 1.15 &&
      topSkinCount >= 16 &&
      q1Top >= 6 && q2Top >= 6 && q3Top >= 6 &&
      q4Top <= 5
    ) {
      posture = "three_fingers";
    }
    // 6. 4 Fingers: 4 fingers active across top, thumb curled across palm (boxW < 0.5, aspectRatio >= 1.20)
    else if (
      aspectRatio >= 1.20 &&
      boxW < 0.50 &&
      topSkinCount >= 20 &&
      q1Top >= 6 && q2Top >= 6 && q3Top >= 6 && q4Top >= 6
    ) {
      posture = "four_fingers";
    }

    if (posture) {
      updateGestureDetectionBadge(posture);
      if (state.lastActivePosture !== posture || !state.gestureHoldStartTime) {
        state.lastActivePosture = posture;
        state.gestureHoldStartTime = timestamp;
        state.gestureHoldDurationMs = 0;
        state.gestureHoldExecuted = false;
      } else {
        state.gestureHoldDurationMs = timestamp - state.gestureHoldStartTime;
      }
      const isHoldPosture = posture === "four_fingers";
      const holdPercent = isHoldPosture && state.gestureHoldDurationMs
        ? Math.min(100, Math.round((state.gestureHoldDurationMs / 1200) * 100))
        : 0;
      updateGestureHoldUI(holdPercent, isHoldPosture && holdPercent > 0);

      const minHold = isHoldPosture ? 1200 : undefined;
      const result = processGesture(posture, {
        timestamp,
        holdDuration: state.gestureHoldDurationMs,
        minHold,
      });
      return {
        detected: true,
        gesture: posture,
        holdDuration: state.gestureHoldDurationMs,
        result,
        box: { minX, maxX, minY, maxY, sourceWidth: width, sourceHeight: height },
      };
    }

    updateGestureDetectionBadge("hand_detected");
    return {
      detected: true,
      posture: null,
      box: { minX, maxX, minY, maxY, sourceWidth: width, sourceHeight: height },
    };
  }

  /**
   * MediaPipe Hands onResults callback
   */
  function onMediaPipeResults(results) {
    if (!state.isGestureActive) return;

    const timestamp = Date.now();
    if (
      results &&
      results.multiHandLandmarks &&
      Array.isArray(results.multiHandLandmarks) &&
      results.multiHandLandmarks.length > 0
    ) {
      const landmarks = results.multiHandLandmarks[0];
      state.lastHandLandmarks = landmarks;
      const analysis = analyzeHandLandmarks(landmarks, timestamp);
      const isHoldPosture = analysis.gesture === "four_fingers";
      const holdPercent = isHoldPosture && state.gestureHoldDurationMs
        ? Math.min(100, Math.round((state.gestureHoldDurationMs / 1200) * 100))
        : 0;
      renderGestureHUD(null, analysis.gesture || null, holdPercent, landmarks);
    } else {
      state.lastHandLandmarks = null;
      analyzeHandLandmarks(null, timestamp);
      renderGestureHUD(null, null, 0, null);
    }
  }

  /**
   * Render HUD visuals on gesture canvas
   */
  function renderGestureHUD(box, gestureName, holdPercent, landmarks = null) {
    const canvas = getEl("gestureCanvas");
    if (!canvas || typeof canvas.getContext !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width || 320;
    const h = canvas.height || 240;

    const video = getEl("gestureVideo");
    ctx.save();
    if (video && video.readyState >= 2) {
      // Mirror video frame horizontally for natural user gesture reflection
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      try {
        ctx.drawImage(video, 0, 0, w, h);
      } catch (_) {}
      ctx.restore();
    } else {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }

    // Grid reticle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7);

    // 1. Google MediaPipe 21-joint skeletal tracking rendering
    if (landmarks && Array.isArray(landmarks) && landmarks.length >= 21) {
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      for (let i = 0; i < landmarks.length; i++) {
        const p = landmarks[i];
        const px = typeof p.x === "number" ? p.x : Array.isArray(p) ? p[0] : 0;
        const py = typeof p.y === "number" ? p.y : Array.isArray(p) ? p[1] : 0;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      // Mirrored horizontal coordinates for on-screen overlay matching mirrored video
      const padX = 0.03;
      const padY = 0.03;
      const boxLeft = Math.max(0, (1 - maxX - padX) * w);
      const boxRight = Math.min(w, (1 - minX + padX) * w);
      const boxTop = Math.max(0, (minY - padY) * h);
      const boxBottom = Math.min(h, (maxY + padY) * h);
      const boxW = boxRight - boxLeft;
      const boxH = boxBottom - boxTop;

      // Skeletal bone connections
      ctx.strokeStyle = gestureName
        ? "rgba(34, 197, 94, 0.85)"
        : "rgba(0, 229, 255, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
        const [a, b] = HAND_CONNECTIONS[i];
        const ptA = landmarks[a];
        const ptB = landmarks[b];
        if (ptA && ptB) {
          const ax = (1 - (typeof ptA.x === "number" ? ptA.x : ptA[0])) * w;
          const ay = (typeof ptA.y === "number" ? ptA.y : ptA[1]) * h;
          const bx = (1 - (typeof ptB.x === "number" ? ptB.x : ptB[0])) * w;
          const by = (typeof ptB.y === "number" ? ptB.y : ptB[1]) * h;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }

      // Skeletal landmark joints (21 joints)
      const fingertipIndices = [4, 8, 12, 16, 20];
      for (let i = 0; i < landmarks.length; i++) {
        const p = landmarks[i];
        const px = (1 - (typeof p.x === "number" ? p.x : p[0])) * w;
        const py = (typeof p.y === "number" ? p.y : p[1]) * h;
        const isTip = fingertipIndices.includes(i);
        const radius = isTip ? 4.5 : 3.0;

        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = isTip
          ? gestureName
            ? "#22c55e"
            : "#ff7f50"
          : "#ffffff";
        ctx.fill();
        ctx.strokeStyle = gestureName ? "#22c55e" : "#00e5ff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Hand tracking bounding box
      ctx.strokeStyle = gestureName ? "#22c55e" : "#00e5ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(boxLeft, boxTop, boxW, boxH);

      // Centroid / palm tracking center
      const wrist = landmarks[0];
      const idxMcp = landmarks[5];
      const pnkMcp = landmarks[17];
      if (wrist && idxMcp && pnkMcp) {
        const cx = (1 - ((wrist.x + idxMcp.x + pnkMcp.x) / 3)) * w;
        const cy = ((wrist.y + idxMcp.y + pnkMcp.y) / 3) * h;
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = gestureName ? "#22c55e" : "#ff7f50";
        ctx.fill();
      }
    } else if (box) {
      // 2. Fallback: Hand tracking bounding box from raw pixel segmentation
      const scaleX = w / (box.sourceWidth || 160);
      const scaleY = h / (box.sourceHeight || 120);
      const bx = Math.max(0, box.minX * scaleX);
      const bw = Math.min(w - bx, (box.maxX - box.minX) * scaleX);
      const by = Math.max(0, box.minY * scaleY);
      const bh = Math.min(h - by, (box.maxY - box.minY) * scaleY);

      ctx.strokeStyle = gestureName ? "#22c55e" : "#ff7f50";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = gestureName ? "#22c55e" : "#ff7f50";
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + bh / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Circular hold progress for Thumbs Up
    if (holdPercent > 0) {
      const cx = w / 2;
      const cy = h / 2;
      const radius = 36;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      const endAngle = -Math.PI / 2 + Math.PI * 2 * (holdPercent / 100);
      ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
      ctx.strokeStyle = "#e65c00";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${holdPercent}%`, cx, cy);
    }
  }

  /**
   * Continuous camera processing loop
   */
  function startCameraProcessingLoop() {
    const offscreen =
      typeof document !== "undefined" && typeof document.createElement === "function"
        ? document.createElement("canvas")
        : null;
    if (offscreen) {
      offscreen.width = 160;
      offscreen.height = 120;
    }
    const offCtx =
      offscreen && typeof offscreen.getContext === "function"
        ? offscreen.getContext("2d")
        : null;

    let isSendingFrame = false;

    function loop(timestamp) {
      if (!state.isGestureActive) return;

      const video = getEl("gestureVideo");
      if (video && video.readyState >= 2) {
        if (state.mediaPipeHands && state.isMediaPipeActive) {
          if (!isSendingFrame) {
            isSendingFrame = true;
            try {
              state.mediaPipeHands
                .send({ image: video })
                .catch((err) => {
                  console.warn("MediaPipe Hands frame error:", err);
                })
                .finally(() => {
                  isSendingFrame = false;
                });
            } catch (syncErr) {
              console.warn("MediaPipe Hands synchronous frame error:", syncErr);
              isSendingFrame = false;
            }
          }
        } else if (offCtx) {
          // Graceful fallback to raw pixel analysis
          try {
            offCtx.save();
            offCtx.translate(160, 0);
            offCtx.scale(-1, 1);
            offCtx.drawImage(video, 0, 0, 160, 120);
            offCtx.restore();

            const frameData = offCtx.getImageData(0, 0, 160, 120);
            const analysis = analyzeFrameData(frameData, timestamp || Date.now());
            const holdPercent = state.gestureHoldDurationMs
              ? Math.min(100, Math.round((state.gestureHoldDurationMs / 1200) * 100))
              : 0;
            renderGestureHUD(analysis.box, analysis.gesture, holdPercent, null);
          } catch (_) {}
        }
      } else {
        renderGestureHUD(null, null, 0, null);
      }

      const raf =
        (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" && window.requestAnimationFrame) ||
        (typeof requestAnimationFrame === "function" ? requestAnimationFrame : null);
      if (raf && state.isGestureActive) {
        state.gestureAnimationId = raf(loop);
      }
    }

    const raf =
      (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" && window.requestAnimationFrame) ||
      (typeof requestAnimationFrame === "function" ? requestAnimationFrame : null);
    if (raf && state.isGestureActive) {
      state.gestureAnimationId = raf(loop);
    }
  }

  /**
   * Request camera permission and start gesture recognition
   */
  async function startGestureRecognition() {
    if (state.isGestureActive) return true;
    if (state.isStartingGesture) return false;

    const nav = getNav();
    if (
      !nav ||
      !nav.mediaDevices ||
      typeof nav.mediaDevices.getUserMedia !== "function"
    ) {
      const msg = "Camera access is not supported in this browser or environment.";
      showCameraWarning(msg);
      updateGestureFeedbackUI("Camera Unavailable", msg, "status-error");
      return false;
    }

    state.isStartingGesture = true;
    try {
      const stream = await nav.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "user",
        },
        audio: false,
      });

      // Guard against race condition: if gesture recognition was cancelled/stopped while awaiting prompt
      if (!state.isStartingGesture) {
        try {
          stream.getTracks().forEach((track) => {
            if (typeof track.stop === "function") track.stop();
          });
        } catch (_) {}
        return false;
      }

      state.gestureStream = stream;
      state.isGestureActive = true;
      state.isGesturePreviewOpen = true;
      updateGestureButtonUI(true);
      hideCameraWarning();

      const video = getEl("gestureVideo");
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch (_) {}
      }

      // Initialize Google MediaPipe Hands if available in browser
      if (typeof window !== "undefined" && typeof window.Hands === "function") {
        try {
          const hands = new window.Hands({
            locateFile: (file) =>
              "https://cdn.jsdelivr.net/npm/@mediapipe/hands/" + file,
          });
          hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          hands.onResults(onMediaPipeResults);
          state.mediaPipeHands = hands;
          state.isMediaPipeActive = true;
        } catch (mpErr) {
          console.warn("MediaPipe Hands initialization fallback to raw pixel mode:", mpErr);
          state.mediaPipeHands = null;
          state.isMediaPipeActive = false;
        }
      } else {
        state.mediaPipeHands = null;
        state.isMediaPipeActive = false;
      }

      updateGestureFeedbackUI(
        "Camera Active",
        state.isMediaPipeActive
          ? "MediaPipe 21-joint skeletal tracking active. Show hand to camera to navigate."
          : "Gesture recognition active. Show hand to camera to navigate.",
        "status-active"
      );
      startCameraProcessingLoop();
      return true;
    } catch (err) {
      console.warn("Gesture recognition camera access error:", err);
      state.isGestureActive = false;
      updateGestureButtonUI(false);

      let msg = "Camera permission was denied or device was not found.";
      let feedbackTitle = "Camera Error";
      if (err && err.name === "NotAllowedError") {
        msg = "Camera permission denied. Please allow camera access in browser settings.";
        feedbackTitle = "Camera Denied";
      } else if (err && err.name === "NotFoundError") {
        msg = "No webcam device found on this system.";
        feedbackTitle = "No Camera Found";
      } else if (err && (err.name === "NotReadableError" || err.name === "TrackStartError")) {
        msg = "Camera is currently in use by another application or tab.";
        feedbackTitle = "Camera Busy";
      }
      showCameraWarning(msg);
      updateGestureFeedbackUI(feedbackTitle, msg, "status-error");
      return false;
    } finally {
      state.isStartingGesture = false;
    }
  }

  /**
   * Stop camera stream and tear down gesture tracking completely
   */
  function stopGestureRecognition() {
    state.isStartingGesture = false;
    state.isGestureActive = false;
    state.gestureCooldownUntil = 0;
    if (state.gestureAnimationId) {
      const caf =
        (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function" && window.cancelAnimationFrame) ||
        (typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : null);
      if (caf) {
        caf(state.gestureAnimationId);
      }
      state.gestureAnimationId = null;
    }

    if (state.mediaPipeHands) {
      try {
        if (typeof state.mediaPipeHands.close === "function") {
          state.mediaPipeHands.close();
        }
      } catch (_) {}
      state.mediaPipeHands = null;
    }
    state.isMediaPipeActive = false;
    state.lastHandLandmarks = null;
    state.postureBuffer = [];

    if (state.gestureStream) {
      try {
        state.gestureStream.getTracks().forEach((track) => {
          if (typeof track.stop === "function") track.stop();
        });
      } catch (_) {}
      state.gestureStream = null;
    }

    const video = getEl("gestureVideo");
    if (video) {
      try {
        if (typeof video.pause === "function") video.pause();
      } catch (_) {}
      video.srcObject = null;
    }

    state.isGestureActive = false;
    state.gestureHoldStartTime = null;
    state.gestureHoldDurationMs = 0;
    state.gestureHoldExecuted = false;
    state.lastActivePosture = null;

    updateGestureButtonUI(false);
    updateGestureHoldUI(0, false);
    updateGestureDetectionBadge(null);

    const canvas = getEl("gestureCanvas");
    if (canvas && typeof canvas.getContext === "function") {
      try {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width || 320, canvas.height || 240);
      } catch (_) {}
    }

    updateGestureFeedbackUI("Camera Off", "Gesture navigation disabled.", "status-idle");
  }

  /**
   * Toggle gesture recognition on/off
   */
  function toggleGestureRecognition() {
    if (state.isGestureActive) {
      stopGestureRecognition();
      return false;
    } else {
      return startGestureRecognition();
    }
  }

  // ============================================================
  // PANEL & LIFECYCLE MANAGEMENT
  // ============================================================

  function openPanel(triggerEl) {
    if (triggerEl && typeof triggerEl.focus === "function") {
      lastPanelTriggerEl = triggerEl;
    } else if (typeof document !== "undefined" && document.activeElement) {
      lastPanelTriggerEl = document.activeElement;
    }

    const panel = getEl("assistedFilingPanel");
    const topBtn = getEl("assistedFilingTopBtn");
    const floatBtn = getEl("assistedFilingFloatingBtn");

    if (panel) {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      state.isPanelOpen = true;
    }
    if (topBtn) topBtn.setAttribute("aria-expanded", "true");
    if (floatBtn) floatBtn.setAttribute("aria-expanded", "true");

    // Check speech recognition support and display notice if missing
    const unsupportedNotice = getEl("voiceUnsupportedNotice");
    if (unsupportedNotice) {
      unsupportedNotice.style.display = isSpeechRecognitionSupported ? "none" : "flex";
    }

    // Check camera support and display notice if missing
    const cameraNotice = getEl("cameraUnsupportedNotice");
    if (cameraNotice && !isCameraSupported) {
      cameraNotice.style.display = "flex";
    }

    // Set focus to the toggle button inside panel for keyboard accessibility
    const startBtn = getEl("btnVoiceNavToggle");
    if (startBtn) {
      setTimeout(() => startBtn.focus(), 100);
    }
  }

  function closePanel() {
    // Teardown recognition and camera when assistance is closed
    stopVoiceNav();
    stopGestureRecognition();

    const panel = getEl("assistedFilingPanel");
    const topBtn = getEl("assistedFilingTopBtn");
    const floatBtn = getEl("assistedFilingFloatingBtn");

    if (panel) {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      state.isPanelOpen = false;
    }
    if (topBtn) topBtn.setAttribute("aria-expanded", "false");
    if (floatBtn) floatBtn.setAttribute("aria-expanded", "false");

    // Restore focus to trigger element for WCAG keyboard accessibility
    if (lastPanelTriggerEl && typeof lastPanelTriggerEl.focus === "function") {
      try {
        lastPanelTriggerEl.focus();
      } catch (_) {}
    } else if (topBtn && topBtn.style.display !== "none") {
      try {
        topBtn.focus();
      } catch (_) {}
    }
  }

  function togglePanel(triggerEl) {
    if (state.isPanelOpen) {
      closePanel();
    } else {
      openPanel(triggerEl);
    }
  }

  /**
   * Stop all voice, audio, and gesture processes cleanly
   */
  function stopAll() {
    stopVoiceNav();
    stopDictation(false);
    stopReadingInstructions();
    stopGestureRecognition();
  }

  function stopDictation(openReviewModal = true) {
    const fieldId = state.activeDictationFieldId || "disclosure-description";
    const fieldLabel = state.activeDictationFieldLabel || "Description of the Intellectual Property";
    const text = state.dictationTranscript || "";

    if (state.dictationRecognitionInstance) {
      try {
        state.dictationRecognitionInstance.stop();
      } catch (_) {}
    }
    resetDictationButtonUI();
    state.isDictating = false;

    if (openReviewModal) {
      const modal = getEl("dictationReviewModal");
      const isAlreadyOpen = Boolean(
        modal &&
        modal.style.display !== "none" &&
        (modal.classList.contains("active") || modal.style.display === "flex")
      );
      if (!isAlreadyOpen) {
        showDictationReviewModal(fieldId, fieldLabel, text);
      }
    }

    // Resume Voice Navigation if it was active before dictation was started
    const wasNav = state.wasNavActiveBeforeDictation;
    state.wasNavActiveBeforeDictation = false;
    if (wasNav) {
      startVoiceNav();
    }
  }

  /**
   * Hook called on user navigation
   */
  function onNavigate(page, isBack = false) {
    if (page === "notifications" || page === "about" || page === "news") {
      return;
    }

    const role = getAppRole();
    const isLoggedIn = typeof window !== "undefined" && Boolean(window.isLoggedIn);
    const prevPage = typeof window !== "undefined" ? window.currentPage : "";

    const authPages = [
      "login",
      "signup",
      "register",
      "forgot-password",
      "verify-otp",
      "reset-password",
      "admin-login",
      "evaluator-login",
      "reviewer-login",
    ];
    const publicOnlyPages = [
      "landing",
      "forms",
      "guidelines",
      "marketplace",
      "faq",
      "contact",
      "terms",
    ];
    const rootPage =
      isLoggedIn && role === "applicant"
        ? "user-dashboard"
        : isLoggedIn
        ? "admin-dashboard"
        : "landing";

    if (isLoggedIn && role === "applicant" && Array.isArray(state.pageHistory)) {
      state.pageHistory = state.pageHistory.filter(
        (p) => !authPages.includes(p) && !publicOnlyPages.includes(p)
      );
    }

    if (
      page === rootPage ||
      page === "user-dashboard" ||
      page === "admin-dashboard" ||
      page === "landing"
    ) {
      state.pageHistory = [];
    } else if (isBack || state.isNavigatingBack) {
      if (Array.isArray(state.pageHistory) && state.pageHistory.length > 0) {
        const idx = state.pageHistory.lastIndexOf(page);
        if (idx !== -1) {
          state.pageHistory.splice(idx);
        } else if (state.pageHistory[state.pageHistory.length - 1] === prevPage) {
          state.pageHistory.pop();
        }
      }
    } else if (
      prevPage &&
      prevPage !== page &&
      !authPages.includes(prevPage) &&
      prevPage !== "notifications"
    ) {
      const isPrevPublicOnlyForApplicant =
        isLoggedIn && role === "applicant" && publicOnlyPages.includes(prevPage);
      if (!isPrevPublicOnlyForApplicant) {
        if (state.lastNavigatedPage && prevPage !== state.lastNavigatedPage) {
          state.pageHistory = [prevPage];
        } else if (state.pageHistory[state.pageHistory.length - 1] !== prevPage) {
          state.pageHistory.push(prevPage);
        }
      }
    }
    state.lastNavigatedPage = page;

    // Stop recognition if navigating away from applicant portal or to public screens
    const publicPages = [
      "landing",
      "login",
      "signup",
      "register",
      "forgot-password",
      "verify-otp",
      "reset-password",
    ];
    const isLeavingApplicantPortal =
      !isLoggedIn || role !== "applicant" || publicPages.includes(page);

    if (isLeavingApplicantPortal) {
      stopAll();
      closePanel();
      return;
    }

    // If active reading was occurring, stop reading on page transition
    if (state.isSpeakingInstructions) {
      stopReadingInstructions();
    }

    // If dictation or review modal was open during navigation, clean up
    if (state.isDictating) {
      stopDictation(false);
      closeDictationReviewModal();
    }
  }

  /**
   * Hook called on user logout
   */
  function onLogout() {
    state.pageHistory = [];
    state.lastNavigatedPage = null;
    stopAll();
    closePanel();
    const topBtn = getEl("assistedFilingTopBtn");
    const floatBtn = getEl("assistedFilingFloatingBtn");
    if (topBtn) topBtn.style.display = "none";
    if (floatBtn) floatBtn.style.display = "none";
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    // Teardown media streams cleanly on tab close or navigation away
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", stopAll);
      window.addEventListener("pagehide", stopAll);
    }

    // Escape key closes modal & panel
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          const dictModal = getEl("dictationReviewModal");
          if (dictModal && dictModal.style.display !== "none") {
            cancelDictation();
          } else if (state.isPanelOpen) {
            closePanel();
          }
        }
      });

      // Backdrop click dismiss for dictation review modal
      const dictModal = getEl("dictationReviewModal");
      if (dictModal) {
        dictModal.addEventListener("click", function (e) {
          if (e.target === dictModal) {
            cancelDictation();
          }
        });
      }
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  // Public API
  return {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isCameraSupported,
    state,
    openPanel,
    closePanel,
    togglePanel,
    startVoiceNav,
    stopVoiceNav,
    toggleVoiceNav,
    clearFeedback,
    classifyVoiceCommand,
    normalizeVoiceText,
    processVoiceNavCommand,
    executeVoiceNavCommand,
    evaluateCommandContext,
    startDictation,
    stopDictation,
    showDictationReviewModal,
    closeDictationReviewModal,
    insertDictatedText,
    retryDictation,
    cancelDictation,
    readCurrentStepInstructions,
    stopReadingInstructions,
    getStepInstructionText,
    startGestureRecognition,
    stopGestureRecognition,
    toggleGestureRecognition,
    toggleGesturePreview,
    clearGestureFeedback,
    processGesture,
    detectPostureFromLandmarks,
    analyzeHandLandmarks,
    analyzeFrameData,
    renderGestureHUD,
    onMediaPipeResults,
    HAND_CONNECTIONS,
    GESTURE_MAP,
    scrollFormOrWindow,
    haltScrolling,
    stopAll,
    onNavigate,
    onLogout,
    init,
  };
});
