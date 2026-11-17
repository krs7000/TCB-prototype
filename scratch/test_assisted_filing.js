const fs = require('fs');
const { JSDOM } = require('jsdom');
const vm = require('vm');

async function runTests() {
  console.log('=== RUNNING ASSISTED FILING COMPREHENSIVE VERIFICATION SUITE ===');

  // Prepare DOM
  const html = fs.readFileSync('main/index.html', 'utf8')
    .replace(/<script[^>]*src=["']http[^"']*["']><\/script>/gi, '')
    .replace(/<script[^>]*src=["']app\.js[^"']*["']><\/script>/gi, '')
    .replace(/<script[^>]*src=["']assisted-filing\.js[^"']*["']><\/script>/gi, '');

  const appCode = fs.readFileSync('main/app.js', 'utf8');
  const assistedFilingCode = fs.readFileSync('main/assisted-filing.js', 'utf8');

  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'http://localhost/main/index.html'
  });
  const { window } = dom;

  // Polyfill minimal browser APIs
  window.scrollTo = () => {};
  window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

  // Mock Web Speech API
  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'en-US';
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
      this.started = false;
    }
    start() {
      this.started = true;
      if (typeof this.onstart === 'function') this.onstart();
    }
    stop() {
      this.started = false;
      if (typeof this.onend === 'function') this.onend();
    }
    abort() {
      this.started = false;
      if (typeof this.onend === 'function') this.onend();
    }
  }

  // Mock SpeechSynthesis
  class MockSpeechSynthesis {
    constructor() {
      this.speaking = false;
    }
    speak(utterance) {
      this.speaking = true;
      setTimeout(() => {
        if (typeof utterance.onstart === 'function') utterance.onstart();
      }, 10);
    }
    cancel() {
      this.speaking = false;
    }
  }
  class MockSpeechSynthesisUtterance {
    constructor(text) {
      this.text = text;
      this.lang = 'en-US';
      this.onend = null;
      this.onerror = null;
      this.onstart = null;
    }
  }

  window.SpeechRecognition = MockSpeechRecognition;
  window.speechSynthesis = new MockSpeechSynthesis();
  window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  // Run scripts in context
  const context = dom.getInternalVMContext();
  vm.runInContext(appCode, context);
  vm.runInContext(assistedFilingCode, context);

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failCount++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Initial State & Feature Detection
  // ----------------------------------------------------
  assert(typeof window.AssistedFiling === 'object', 'AssistedFiling module loaded');
  assert(window.AssistedFiling.isSpeechRecognitionSupported === true, 'SpeechRecognition detected as supported');
  assert(window.AssistedFiling.isSpeechSynthesisSupported === true, 'SpeechSynthesis detected as supported');

  // Elements exist in DOM
  const panelEl = window.document.getElementById('assistedFilingPanel');
  const topBtnEl = window.document.getElementById('assistedFilingTopBtn');
  const floatBtnEl = window.document.getElementById('assistedFilingFloatingBtn');
  const dictationModalEl = window.document.getElementById('dictationReviewModal');

  assert(!!panelEl, '#assistedFilingPanel exists in DOM');
  assert(panelEl.getAttribute('role') === 'region', '#assistedFilingPanel has role="region"');
  assert(panelEl.getAttribute('aria-label') === 'Interaction assistance panel', '#assistedFilingPanel has accessible label');
  assert(!!topBtnEl, '#assistedFilingTopBtn exists in DOM');
  assert(!!floatBtnEl, '#assistedFilingFloatingBtn exists in DOM');
  assert(!!dictationModalEl, '#dictationReviewModal exists in DOM');
  assert(panelEl.textContent.includes('“Open messages”'), '#assistedFilingPanel contains "“Open messages”"');
  assert(panelEl.textContent.includes('“Open marketplace”'), '#assistedFilingPanel contains "“Open marketplace”"');
  assert(panelEl.textContent.includes('“Home”'), '#assistedFilingPanel contains "“Home”"');
  assert(panelEl.textContent.includes('“Back”'), '#assistedFilingPanel contains "“Back”"');

  // Verify the 3 notice boxes remain hidden (display: none)
  const noticeBoxes = window.document.querySelectorAll('.assistance-notice, .assistance-commands-note');
  assert(noticeBoxes.length === 3, 'All 3 notice boxes (.assistance-notice and .assistance-commands-note) exist in DOM');
  noticeBoxes.forEach((box, idx) => {
    assert(box.style.display === 'none', `Notice box #${idx + 1} has inline style display: none`);
  });

  // ----------------------------------------------------
  // TEST 2: Panel Toggle and Keyboard Escape & Teardown on Close
  // ----------------------------------------------------
  assert(!panelEl.classList.contains('open'), 'Panel is initially closed');
  window.AssistedFiling.openPanel(topBtnEl);
  assert(panelEl.classList.contains('open'), 'Panel opened via openPanel()');
  assert(window.AssistedFiling.state.isPanelOpen === true, 'state.isPanelOpen is true');
  
  // Starting voice nav and then closing panel must terminate voice recognition
  window.AssistedFiling.startVoiceNav();
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav is listening inside panel');
  window.AssistedFiling.closePanel();
  assert(!panelEl.classList.contains('open'), 'Panel closed via closePanel()');
  assert(window.AssistedFiling.state.isNavListening === false, 'Closing panel terminates active voice recognition');
  assert(window.document.activeElement === topBtnEl, 'Focus restored to opening button after panel close');

  // ----------------------------------------------------
  // TEST 3: Login as Applicant and Visibility
  // ----------------------------------------------------
  const emailInput = window.document.getElementById('loginEmail');
  if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
  await window.handleLogin({ preventDefault: () => {} });
  const otpInput = window.document.getElementById('loginOtpCode');
  if (otpInput) otpInput.value = '123456';
  window.verifyLoginOtp();

  // In closure, check isLoggedIn and currentRole
  assert(window.isLoggedIn === true, 'Applicant logged in successfully');
  assert(topBtnEl.style.display !== 'none', 'Assisted Filing topbar button is visible for applicant');
  assert(floatBtnEl.style.display !== 'none', 'Floating assistance launcher is visible for applicant');

  // ----------------------------------------------------
  // TEST 4: Voice Navigation Commands & Strict Matching
  // ----------------------------------------------------

  // 4a: "Open my cases"
  let res = window.AssistedFiling.processVoiceNavCommand("Open my cases");
  assert(res.handled === true && res.command === 'open_my_cases', 'Command "Open my cases" handled successfully');
  assert(window.currentPage === 'user-submissions', 'Current page navigated to "user-submissions"');

  // Context check: If already on cases, should report already on page
  let resDup = window.AssistedFiling.processVoiceNavCommand("Open my cases");
  assert(resDup.handled === false && resDup.reason.includes('already viewing'), 'Command "Open my cases" rejects redundant navigation cleanly');

  // Strict matching check: Random sentence containing "cases" must NOT trigger navigation
  let accidentalCasesRes = window.AssistedFiling.processVoiceNavCommand("There are multiple legal cases in university history");
  assert(accidentalCasesRes.handled === false && accidentalCasesRes.error === 'unknown_command', 'Arbitrary sentence containing "cases" is rejected');

  // 4b: "Show forms"
  res = window.AssistedFiling.processVoiceNavCommand("Show forms");
  assert(res.handled === true && res.command === 'show_forms', 'Command "Show forms" handled successfully');
  assert(window.currentPage === 'filing-hub', 'Current page navigated to "filing-hub"');

  // Strict matching check: Random sentence containing "forms" must NOT trigger navigation
  let accidentalFormsRes = window.AssistedFiling.processVoiceNavCommand("All biological forms adapt to environmental pressures");
  assert(accidentalFormsRes.handled === false && accidentalFormsRes.error === 'unknown_command', 'Arbitrary sentence containing "forms" is rejected');

  // 4c: "Open IP guidelines"
  res = window.AssistedFiling.processVoiceNavCommand("Open IP guidelines");
  assert(res.handled === true && res.command === 'open_ip_guidelines', 'Command "Open IP guidelines" handled successfully');
  assert(window.currentPage === 'ip-guidelines', 'Current page navigated to "ip-guidelines"');

  // Strict matching check: Random sentence containing "guidelines" must NOT trigger navigation
  let accidentalGuideRes = window.AssistedFiling.processVoiceNavCommand("Follow university campus guidelines for parking");
  assert(accidentalGuideRes.handled === false && accidentalGuideRes.error === 'unknown_command', 'Arbitrary sentence containing "guidelines" is rejected');

  // 4d: "Open messages"
  res = window.AssistedFiling.processVoiceNavCommand("Open messages");
  assert(res.handled === true && res.command === 'open_messages', 'Command "Open messages" handled successfully');
  assert(window.currentPage === 'messages', 'Current page navigated to "messages"');
  assert(window.AssistedFiling.state.lastFeedbackMessage === 'Opening Messages...', 'Live feedback state updated to "Opening Messages..."');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'Opening Messages...', 'Live feedback card updated to "Opening Messages..."');

  // Context check: If already on messages, should report already on page
  let resDupMsg = window.AssistedFiling.processVoiceNavCommand("Open messages");
  assert(resDupMsg.handled === false && resDupMsg.reason.includes('already viewing'), 'Command "Open messages" rejects redundant navigation cleanly');
  assert(resDupMsg.reason === 'You are already viewing Messages.', 'Exact redundant rejection message matches');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'You are already viewing Messages.', 'Feedback card shows exact redundant rejection message');

  // Strict matching check: Random sentence containing "messages" must NOT trigger navigation
  let accidentalMsgRes = window.AssistedFiling.processVoiceNavCommand("There were three error messages returned by database");
  assert(accidentalMsgRes.handled === false && accidentalMsgRes.error === 'unknown_command', 'Arbitrary sentence containing "messages" is rejected');

  // Variations for "Open messages"
  const msgVariations = [
    "Show messages",
    "Go to messages",
    "Open inbox",
    "Messages",
    "Show inbox",
    "Go to inbox",
    "Inbox",
    "The messages",
    "The inbox",
    "My messages",
    "My inbox",
    "Message",
    "Open message",
    "Open my messages",
    "Open the inbox"
  ];
  for (const phrase of msgVariations) {
    window.currentPage = 'filing-hub';
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === true && r.command === 'open_messages' && window.currentPage === 'messages', `Variation "${phrase}" handled`);
  }

  // executeVoiceNavCommand interface for "Open messages"
  window.currentPage = 'filing-hub';
  let resMsgExec = window.AssistedFiling.executeVoiceNavCommand("Open messages");
  assert(resMsgExec.handled === true && resMsgExec.command === 'open_messages' && window.currentPage === 'messages', 'executeVoiceNavCommand("Open messages") handled');

  // Role / Auth checks for open_messages:
  window.isLoggedIn = false;
  let resMsgUnauth = window.AssistedFiling.processVoiceNavCommand("Open messages");
  assert(resMsgUnauth.handled === false && resMsgUnauth.reason.includes('sign in'), '"Open messages" rejected when unauthenticated');
  window.isLoggedIn = true;

  window.currentRole = 'reviewer';
  let resMsgRole = window.AssistedFiling.processVoiceNavCommand("Open messages");
  assert(resMsgRole.handled === false && resMsgRole.reason.includes('applicant portal'), '"Open messages" rejected for non-applicant role');
  window.currentRole = 'applicant';

  // 4e: "Open marketplace"
  res = window.AssistedFiling.processVoiceNavCommand("Open marketplace");
  assert(res.handled === true && res.command === 'open_marketplace', 'Command "Open marketplace" handled successfully');
  assert(window.currentPage === 'marketplace-dash', 'Current page navigated to "marketplace-dash"');
  assert(window.AssistedFiling.state.lastFeedbackMessage === 'Opening Marketplace...', 'Live feedback state updated to "Opening Marketplace..."');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'Opening Marketplace...', 'Live feedback card updated to "Opening Marketplace..."');

  // Context check: If already on marketplace, should report already on page
  let resDupMkt = window.AssistedFiling.processVoiceNavCommand("Open marketplace");
  assert(resDupMkt.handled === false && resDupMkt.reason.includes('already viewing'), 'Command "Open marketplace" rejects redundant navigation cleanly');
  assert(resDupMkt.reason === 'You are already viewing the Marketplace.', 'Exact redundant rejection message matches');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'You are already viewing the Marketplace.', 'Feedback card shows exact redundant rejection message');

  // Strict matching check: Random sentence containing "marketplace" must NOT trigger navigation
  let accidentalMktRes = window.AssistedFiling.processVoiceNavCommand("The international university marketplace research program");
  assert(accidentalMktRes.handled === false && accidentalMktRes.error === 'unknown_command', 'Arbitrary sentence containing "marketplace" is rejected');

  // Variations for "Open marketplace"
  const mktVariations = [
    "Show marketplace",
    "Go to marketplace",
    "Marketplace",
    "The marketplace",
    "University marketplace",
    "Open the marketplace",
    "Open university marketplace",
    "Go to the university marketplace",
    "Marketplaces"
  ];
  for (const phrase of mktVariations) {
    window.currentPage = 'filing-hub';
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === true && r.command === 'open_marketplace' && window.currentPage === 'marketplace-dash', `Variation "${phrase}" handled`);
  }

  // executeVoiceNavCommand interface for "Open marketplace"
  window.currentPage = 'filing-hub';
  let resMktExec = window.AssistedFiling.executeVoiceNavCommand("Open marketplace");
  assert(resMktExec.handled === true && resMktExec.command === 'open_marketplace' && window.currentPage === 'marketplace-dash', 'executeVoiceNavCommand("Open marketplace") handled');

  // Public routing when logged out:
  window.isLoggedIn = false;
  window.currentPage = 'landing';
  let resMktPublic = window.AssistedFiling.processVoiceNavCommand("Open marketplace");
  assert(resMktPublic.handled === true && window.currentPage === 'marketplace', 'Command "Open marketplace" navigates to public "marketplace" when logged out');

  // Redundant rejection when already viewing public marketplace
  let resDupMktPublic = window.AssistedFiling.processVoiceNavCommand("Open marketplace");
  assert(resDupMktPublic.handled === false && resDupMktPublic.reason === 'You are already viewing the Marketplace.', 'Redundant rejection on public "marketplace"');
  window.isLoggedIn = true;

  // Verify getStepInstructionText for messages and marketplace-dash / marketplace / user-dashboard
  window.currentPage = 'messages';
  assert(window.AssistedFiling.getStepInstructionText().includes('Messages'), 'getStepInstructionText returns text for messages');
  window.currentPage = 'marketplace-dash';
  assert(window.AssistedFiling.getStepInstructionText().includes('Marketplace'), 'getStepInstructionText returns text for marketplace-dash');
  window.currentPage = 'marketplace';
  assert(window.AssistedFiling.getStepInstructionText().includes('Marketplace'), 'getStepInstructionText returns text for public marketplace');
  window.currentPage = 'user-dashboard';
  assert(window.AssistedFiling.getStepInstructionText().includes('Home'), 'getStepInstructionText returns text for user-dashboard');

  // 4f: "Home"
  window.navigateTo('filing-hub');
  assert(window.currentPage === 'filing-hub', 'Setup on filing-hub before testing "Home"');
  res = window.AssistedFiling.processVoiceNavCommand("Home");
  assert(res.handled === true && res.command === 'home', 'Command "Home" handled successfully');
  assert(window.currentPage === 'user-dashboard', 'Current page navigated to "user-dashboard" via "Home"');
  assert(window.AssistedFiling.state.lastFeedbackMessage === 'Opening Home...', 'Live feedback state updated to "Opening Home..."');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'Opening Home...', 'Live feedback card updated to "Opening Home..."');

  // Context check: If already on Home (user-dashboard), reject cleanly
  let resDupHome = window.AssistedFiling.processVoiceNavCommand("Home");
  assert(resDupHome.handled === false && resDupHome.reason === 'You are already on the Home page.', 'Command "Home" rejects redundant navigation cleanly when already on Home');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'You are already on the Home page.', 'Feedback card shows exact redundant Home rejection message');

  // Strict matching check: Random sentence containing "home" or "dashboard" must NOT trigger navigation
  let accidentalHomeRes = window.AssistedFiling.processVoiceNavCommand("Working from home increases research productivity");
  assert(accidentalHomeRes.handled === false && accidentalHomeRes.error === 'unknown_command', 'Arbitrary sentence containing "home" is rejected');
  let accidentalDashRes = window.AssistedFiling.processVoiceNavCommand("The sensor dashboard indicator blinked twice");
  assert(accidentalDashRes.handled === false && accidentalDashRes.error === 'unknown_command', 'Arbitrary sentence containing "dashboard" is rejected');

  // Variations for "Home"
  const homeVariations = [
    "Home",
    "Go home",
    "Open home",
    "Go to home",
    "Dashboard",
    "Open dashboard",
    "Go to dashboard",
    "Show home",
    "View home",
    "Home page",
    "Open home page",
    "Go to home page",
    "My dashboard",
    "Open my dashboard",
    "Return home"
  ];
  for (const phrase of homeVariations) {
    window.currentPage = 'filing-hub';
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === true && r.command === 'home' && window.currentPage === 'user-dashboard', `Home variation "${phrase}" handled`);
  }

  // executeVoiceNavCommand interface for "Home"
  window.currentPage = 'filing-hub';
  let resHomeExec = window.AssistedFiling.executeVoiceNavCommand("Home");
  assert(resHomeExec.handled === true && resHomeExec.command === 'home' && window.currentPage === 'user-dashboard', 'executeVoiceNavCommand("Home") handled');

  // Public routing for "Home" when logged out:
  window.isLoggedIn = false;
  window.currentPage = 'marketplace';
  let resHomePublic = window.AssistedFiling.processVoiceNavCommand("Home");
  assert(resHomePublic.handled === true && window.currentPage === 'landing', 'Command "Home" navigates to public "landing" when logged out');
  let resDupHomePublic = window.AssistedFiling.processVoiceNavCommand("Home");
  assert(resDupHomePublic.handled === false && resDupHomePublic.reason === 'You are already on the Home page.', 'Redundant "Home" rejected on public "landing"');
  window.isLoggedIn = true;

  // 4g: "Back"
  // Reset at root user-dashboard
  window.navigateTo('user-dashboard');
  assert(window.currentPage === 'user-dashboard', 'At root user-dashboard');

  // When already at root user-dashboard with no previous page, "Back" must reject cleanly
  let resBackRoot = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackRoot.handled === false && resBackRoot.reason.includes('no previous page'), 'Command "Back" rejected cleanly when already at root user-dashboard');

  // Multi-page navigation stack: user-dashboard -> filing-hub -> ip-guidelines -> messages
  window.AssistedFiling.processVoiceNavCommand("Show forms");
  assert(window.currentPage === 'filing-hub', 'Navigated to filing-hub');
  window.AssistedFiling.processVoiceNavCommand("Open IP guidelines");
  assert(window.currentPage === 'ip-guidelines', 'Navigated to ip-guidelines');
  window.AssistedFiling.processVoiceNavCommand("Open messages");
  assert(window.currentPage === 'messages', 'Navigated to messages');

  // Speak "Back" #1: messages -> ip-guidelines
  let resBack1 = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBack1.handled === true && resBack1.command === 'back', 'Command "Back" #1 handled');
  assert(window.currentPage === 'ip-guidelines', 'Command "Back" #1 returned to "ip-guidelines"');
  assert(window.AssistedFiling.state.lastFeedbackMessage === 'Going back...', 'Live feedback state updated to "Going back..."');
  assert(window.document.getElementById('voiceNavMessage').textContent === 'Going back...', 'Live feedback card updated to "Going back..."');

  // Speak "Back" #2: ip-guidelines -> filing-hub
  let resBack2 = window.AssistedFiling.processVoiceNavCommand("Go back");
  assert(resBack2.handled === true && resBack2.command === 'back', 'Command "Go back" #2 handled');
  assert(window.currentPage === 'filing-hub', 'Command "Go back" #2 returned to "filing-hub"');

  // Speak "Back" #3: filing-hub -> user-dashboard
  let resBack3 = window.AssistedFiling.processVoiceNavCommand("Return");
  assert(resBack3.handled === true && resBack3.command === 'back', 'Command "Return" #3 handled');
  assert(window.currentPage === 'user-dashboard', 'Command "Return" #3 returned to "user-dashboard"');

  // Speak "Back" #4 at root user-dashboard: rejected cleanly
  let resBack4 = window.AssistedFiling.processVoiceNavCommand("Navigate back");
  assert(resBack4.handled === false && resBack4.reason.includes('no previous page'), 'Command "Navigate back" at root user-dashboard rejected cleanly');

  // Subpage fallback when no prior history exists: falls back to "user-dashboard"
  window.currentPage = 'user-submissions';
  window.AssistedFiling.state.pageHistory = [];
  let resBackFallback = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackFallback.handled === true && resBackFallback.command === 'back' && window.currentPage === 'user-dashboard', '"Back" on subpage with no prior history falls back to "user-dashboard"');

  // Variations for "Back"
  const backVariations = [
    "Back",
    "Go back",
    "Return",
    "Return back",
    "Navigate back",
    "Move back",
    "Take me back"
  ];
  for (const phrase of backVariations) {
    window.navigateTo('user-dashboard');
    window.navigateTo('marketplace-dash');
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === true && r.command === 'back' && window.currentPage === 'user-dashboard', `Back variation "${phrase}" handled`);
  }

  // Strict matching check: Arbitrary sentence containing "back" must NOT trigger navigation
  let accidentalBackRes = window.AssistedFiling.processVoiceNavCommand("The researcher came back from the field station");
  assert(accidentalBackRes.handled === false && accidentalBackRes.error === 'unknown_command', 'Arbitrary sentence containing "back" is rejected');

  // Public routing for "Back" when logged out:
  window.isLoggedIn = false;
  window.navigateTo('landing');
  let resBackPublicRoot = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackPublicRoot.handled === false && resBackPublicRoot.reason.includes('no previous page'), '"Back" rejected when at root public "landing"');
  window.navigateTo('marketplace');
  let resBackPublic = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackPublic.handled === true && window.currentPage === 'landing', '"Back" returns from public "marketplace" to "landing"');
  window.isLoggedIn = true;
  window.navigateTo('user-dashboard');

  // Rapid alternating sequence: "Show forms" -> "Open IP guidelines" -> "Home" -> "Back"
  window.AssistedFiling.processVoiceNavCommand("Show forms");
  window.AssistedFiling.processVoiceNavCommand("Open IP guidelines");
  let resHomeReset = window.AssistedFiling.processVoiceNavCommand("Home");
  assert(resHomeReset.handled === true && window.currentPage === 'user-dashboard', '"Home" returned to "user-dashboard"');
  let resBackAfterHome = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackAfterHome.handled === false && resBackAfterHome.reason.includes('no previous page'), '"Back" immediately after "Home" is rejected rather than looping into old history');

  // Interoperability between UI Back button (window.goDashboardBack / window.goBack) and Voice "Back"
  window.navigateTo('user-dashboard');
  window.navigateTo('filing-hub');
  window.navigateTo('patent-form');
  window.goDashboardBack(); // UI Back from patent-form -> filing-hub
  assert(window.currentPage === 'filing-hub', 'UI goDashboardBack returned from patent-form to filing-hub');
  let resVoiceBackAfterUiBack = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resVoiceBackAfterUiBack.handled === true && window.currentPage === 'user-dashboard', 'Voice "Back" after UI Back returns to "user-dashboard" instead of looping forward to "patent-form"');

  // Notifications toggle does not pollute Back history
  window.navigateTo('user-dashboard');
  window.navigateTo('filing-hub');
  window.navigateTo('notifications'); // Toggles notifications dropdown without changing page
  assert(window.currentPage === 'filing-hub', 'Notifications toggle kept currentPage on "filing-hub"');
  let resBackAfterNotif = window.AssistedFiling.processVoiceNavCommand("Back");
  assert(resBackAfterNotif.handled === true && window.currentPage === 'user-dashboard', 'Voice "Back" after notifications toggle returns cleanly to "user-dashboard"');

  // 4h: Voice rejection for step navigation and draft saving (exclusively gesture-controlled)
  const stepVariations = [
    "Next step",
    "next page",
    "next section",
    "go next",
    "go to next",
    "go to next step",
    "go to the next step",
    "next"
  ];
  stepVariations.forEach(phrase => {
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === false && r.error === 'unhandled_voice_command', `"${phrase}" strictly rejected by voice navigation`);
    assert(r.reason && r.reason.includes('gesture'), `"${phrase}" informs user of gesture control`);
  });

  const prevVariations = [
    "Previous step",
    "previous page",
    "previous section",
    "go previous",
    "go to previous",
    "go to previous step",
    "previous"
  ];
  prevVariations.forEach(phrase => {
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === false && r.error === 'unhandled_voice_command', `"${phrase}" strictly rejected by voice navigation`);
    assert(r.reason && r.reason.includes('gesture'), `"${phrase}" informs user of gesture control`);
  });

  const draftVariations = [
    "Save draft",
    "Save the draft",
    "Save a draft",
    "Save as draft",
    "Save this draft",
    "Save my draft",
    "Save form draft",
    "Save progress",
    "save"
  ];
  draftVariations.forEach(phrase => {
    let r = window.AssistedFiling.processVoiceNavCommand(phrase);
    assert(r.handled === false && r.error === 'unhandled_voice_command', `"${phrase}" strictly rejected by voice navigation`);
    assert(r.reason && r.reason.includes('gesture'), `"${phrase}" informs user of gesture control`);
  });

  // Test executeVoiceNavCommand interface
  assert(window.AssistedFiling.executeVoiceNavCommand("Next step").handled === false, 'executeVoiceNavCommand("Next step") handled === false');
  assert(window.AssistedFiling.executeVoiceNavCommand("Previous step").handled === false, 'executeVoiceNavCommand("Previous step") handled === false');
  assert(window.AssistedFiling.executeVoiceNavCommand("Save draft").handled === false, 'executeVoiceNavCommand("Save draft") handled === false');

  // Test evaluateCommandContext rejection for voice modality
  const evalVoiceNext = window.AssistedFiling.evaluateCommandContext("next_step", "voice");
  assert(evalVoiceNext.valid === false && evalVoiceNext.reason.includes('gesture'), 'evaluateCommandContext rejects "next_step" for voice modality');
  const evalVoicePrev = window.AssistedFiling.evaluateCommandContext("previous_step", "voice");
  assert(evalVoicePrev.valid === false && evalVoicePrev.reason.includes('gesture'), 'evaluateCommandContext rejects "previous_step" for voice modality');
  const evalVoiceDraft = window.AssistedFiling.evaluateCommandContext("save_draft", "voice");
  assert(evalVoiceDraft.valid === false && evalVoiceDraft.reason.includes('gesture'), 'evaluateCommandContext rejects "save_draft" for voice modality');

  // 4e: Forbidden commands (Submit, Delete, Withdraw, Approve)
  let forbiddenRes1 = window.AssistedFiling.processVoiceNavCommand("Submit application");
  assert(forbiddenRes1.handled === false && forbiddenRes1.error === 'forbidden_command', '"Submit" command safely blocked by policy');

  let forbiddenRes2 = window.AssistedFiling.processVoiceNavCommand("Delete draft");
  assert(forbiddenRes2.handled === false && forbiddenRes2.error === 'forbidden_command', '"Delete" command safely blocked by policy');

  let forbiddenRes3 = window.AssistedFiling.processVoiceNavCommand("Withdraw case");
  assert(forbiddenRes3.handled === false && forbiddenRes3.error === 'forbidden_command', '"Withdraw" command safely blocked by policy');

  let forbiddenRes4 = window.AssistedFiling.processVoiceNavCommand("Approve filing");
  assert(forbiddenRes4.handled === false && forbiddenRes4.error === 'forbidden_command', '"Approve" command safely blocked by policy');

  // 4f: Unknown commands
  let unknownRes = window.AssistedFiling.processVoiceNavCommand("Order a pizza with extra cheese");
  assert(unknownRes.handled === false && unknownRes.error === 'unknown_command', 'Unknown command properly rejected with help prompt');

  // ----------------------------------------------------
  // TEST 5: Voice Command Rejection for Form Wizard Steps & Gesture Navigation
  // ----------------------------------------------------
  window.navigateTo('patent-form');
  assert(window.currentPage === 'patent-form', 'Navigated to patent-form');
  assert(window.currentWizardStep === 1, 'Current step is 1');

  // Test "Previous step" voice command: strictly rejected, step unchanged
  let prevStep1Res = window.AssistedFiling.processVoiceNavCommand("Previous step");
  assert(prevStep1Res.handled === false, '"Previous step" voice command strictly rejected');
  assert(window.currentWizardStep === 1, 'Current step remained 1');

  // Test "Next step" voice command: strictly rejected, step unchanged
  let voiceNextRes = window.AssistedFiling.processVoiceNavCommand("Next step");
  assert(voiceNextRes.handled === false, '"Next step" voice command strictly rejected');
  assert(window.currentWizardStep === 1, 'Current step remained 1; voice step navigation rejected');

  // Also verify executeVoiceNavCommand alias strictly rejects "Next step"
  let aliasNextRes = window.AssistedFiling.executeVoiceNavCommand("Next step");
  assert(aliasNextRes.handled === false, 'executeVoiceNavCommand alias strictly rejects "Next step"');

  // Advance to Step 2 using Gesture Navigation (1 Finger)
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  let gestureNextRes = window.AssistedFiling.processGesture("one_finger");
  assert(gestureNextRes.handled === true && gestureNextRes.action === 'next_step', 'Gesture 1 Finger advanced wizard to Step 2');
  assert(window.currentWizardStep === 2, 'Current step advanced to 2 via gesture');

  // Return to Step 1 using Gesture Navigation (2 Fingers)
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  let gesturePrevRes = window.AssistedFiling.processGesture("two_fingers");
  assert(gesturePrevRes.handled === true && gesturePrevRes.action === 'previous_step', 'Gesture 2 Fingers returned wizard to Step 1');
  assert(window.currentWizardStep === 1, 'Current step returned to 1 via gesture');

  // Advance back to step 2 using 1 Finger gesture
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  window.AssistedFiling.processGesture("one_finger");
  assert(window.currentWizardStep === 2, 'Step is now 2');

  // ----------------------------------------------------
  // TEST 6: Voice-Assisted Form Entry (Dictation) on Step 2
  // ----------------------------------------------------
  // Verify field and clearly labeled microphone button
  const descField = window.document.getElementById('disclosure-description');
  assert(!!descField, 'Found #disclosure-description field on Step 2');

  // Accessibility label association test
  const descLabel = window.document.querySelector('label[for="disclosure-description"]');
  assert(!!descLabel, 'Found associated label[for="disclosure-description"] for field accessibility');

  const dictateBtn = window.document.getElementById('btnDictateDesc');
  assert(!!dictateBtn, 'Found #btnDictateDesc microphone button beside #disclosure-description');
  assert(dictateBtn.textContent.includes('Dictate'), 'Microphone button has clear "Dictate" text label');
  assert(dictateBtn.getAttribute('aria-label') === 'Dictate Description of the Intellectual Property', 'Dictate button has descriptive aria-label');

  // Start dictation with trigger element
  window.AssistedFiling.startDictation('disclosure-description', 'Description of the Intellectual Property', dictateBtn);
  assert(window.AssistedFiling.state.isDictating === true, 'state.isDictating is true');

  // Multi-segment speech recognition simulation
  const mockRec = window.AssistedFiling.state.dictationRecognitionInstance;
  assert(!!mockRec, 'Dictation recognition instance created');
  
  // Trigger onresult with multi-segment results
  mockRec.onresult({
    results: [
      [{ transcript: 'A solar-powered bamboo filtration device' }],
      [{ transcript: 'utilizing activated carbon and UV light sterilization.' }]
    ]
  });

  // Review modal checks
  assert(dictationModalEl.style.display === 'flex' || dictationModalEl.classList.contains('active'), 'Dictation review modal displayed');
  const reviewInput = window.document.getElementById('dictationReviewInput');
  assert(!!reviewInput, 'Review input textarea exists');
  assert(reviewInput.value === 'A solar-powered bamboo filtration device utilizing activated carbon and UV light sterilization.', 'Multi-segment recognized speech successfully concatenated in review box');

  // Allow editing in review modal (simulate user correcting text via touch/typing)
  reviewInput.value = reviewInput.value + ' Optimized for Palawan island communities.';

  // Insert reviewed text into target field
  window.AssistedFiling.insertDictatedText('replace');
  assert(descField.value.includes('Optimized for Palawan island communities'), 'Dictated and reviewed text inserted into #disclosure-description');
  assert(window.wizardData.disclosureDescription.includes('Optimized for Palawan island communities'), 'Dictated text synced to wizardData.disclosureDescription');
  assert(dictationModalEl.style.display === 'none' || !dictationModalEl.classList.contains('active'), 'Review modal closed after insertion');

  // Test Appending text
  descField.value = 'Initial technical setup.';
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description of the Intellectual Property', 'Secondary filtration stage.');
  window.AssistedFiling.insertDictatedText('append');
  assert(descField.value.includes('Initial technical setup.') && descField.value.includes('Secondary filtration stage.'), 'Append preserved existing text and appended new content');

  // Verify plain text insertion (no HTML injection)
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description of the Intellectual Property', '<script>alert("hacked")</script>');
  window.AssistedFiling.insertDictatedText('replace');
  assert(descField.value === '<script>alert("hacked")</script>', 'Plain text preserved literally without HTML execution');

  // Test cancellation and focus restoration
  window.AssistedFiling.startDictation('disclosure-description', 'Description of the Intellectual Property', dictateBtn);
  window.AssistedFiling.cancelDictation();
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation cancelled successfully');
  assert(window.document.activeElement === dictateBtn, 'Focus restored to Dictate button on dictation cancellation');

  // Test backdrop click dismiss
  window.AssistedFiling.startDictation('disclosure-description', 'Description of the Intellectual Property', dictateBtn);
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description', 'Sample speech');
  assert(dictationModalEl.style.display !== 'none', 'Modal open before backdrop click');
  dictationModalEl.click(); // clicks modal overlay
  assert(dictationModalEl.style.display === 'none', 'Backdrop click safely dismissed review modal');

  // ----------------------------------------------------
  // TEST 7: Draft Saving Exclusivity (Voice Rejected, Gesture Executed)
  // ----------------------------------------------------
  descField.value = 'Novel filtration method using coconut shell biochar and bamboo matrix.';
  
  // Natural variation: "Save the draft" spoken via voice MUST be rejected
  let draftRes = window.AssistedFiling.processVoiceNavCommand("Save the draft");
  assert(draftRes.handled === false, '"Save the draft" natural voice command strictly rejected');
  assert(!window.submissions.some(s => s.formData && s.formData.disclosureDescription === descField.value), 'No draft saved via voice command');

  let directDraftVoice = window.AssistedFiling.executeVoiceNavCommand("Save draft");
  assert(directDraftVoice.handled === false, '"Save draft" strictly rejected via executeVoiceNavCommand');

  // Draft saving is exclusively executed via 4 Fingers gesture (or UI button)
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  window.AssistedFiling.state.gestureHoldExecuted = false;
  let gestureDraftRes = window.AssistedFiling.processGesture("four_fingers", { holdDuration: 1300, minHold: 1200 });
  assert(gestureDraftRes.handled === true && gestureDraftRes.action === 'save_draft', 'Gesture 4 Fingers executed save draft');

  // Check that submissions now includes the saved draft with dictated description
  const savedDraft = window.submissions.find(s => s.status === 'Draft' && s.formData && s.formData.disclosureDescription === descField.value);
  assert(!!savedDraft, 'Draft submission created and saved via gesture');
  assert(savedDraft.formData.disclosureDescription === descField.value, 'Dictated description saved inside draft record formData');

  // ----------------------------------------------------
  // TEST 8: Dictation Separation from Voice Navigation
  // ----------------------------------------------------
  // While dictating, words like "Next step" must NOT trigger navigation
  window.AssistedFiling.startDictation('disclosure-description', 'Description of the Intellectual Property');
  assert(window.AssistedFiling.state.isDictating === true, 'Dictation active');

  // If dictation receives "Next step", it is placed into review text, NOT executed
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description of the Intellectual Property', 'Next step in our process is filtration');
  assert(window.currentWizardStep === 2, 'Wizard step did not change; voice navigation was not triggered during dictation');
  window.AssistedFiling.cancelDictation();
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation safely cancelled');

  // ----------------------------------------------------
  // TEST 9: Speech Synthesis (Read Instructions & Auto-Mute)
  // ----------------------------------------------------
  window.AssistedFiling.startVoiceNav();
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav is listening');

  window.AssistedFiling.readCurrentStepInstructions();
  assert(window.AssistedFiling.state.isSpeakingInstructions === true, 'isSpeakingInstructions is true');
  assert(window.AssistedFiling.state.isNavListening === false, 'Voice navigation muted while instructions are being read');

  window.AssistedFiling.stopReadingInstructions();
  assert(window.AssistedFiling.state.isSpeakingInstructions === false, 'isSpeakingInstructions reset to false');

  // ----------------------------------------------------
  // TEST 10: Teardown on Leaving Interface & Logout
  // ----------------------------------------------------
  window.AssistedFiling.startVoiceNav();
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav is listening before landing nav');
  
  // Navigate away to public landing page
  window.navigateTo('landing');
  assert(window.AssistedFiling.state.isNavListening === false, 'Voice recognition stopped when navigating to landing page');
  assert(window.AssistedFiling.state.isPanelOpen === false, 'Assisted Filing panel closed when leaving applicant portal');

  // Navigate back to cases, start nav, then logout
  window.navigateTo('user-submissions');
  window.AssistedFiling.startVoiceNav();
  window.logout();
  assert(window.AssistedFiling.state.isNavListening === false, 'Voice navigation stopped on logout');
  assert(window.AssistedFiling.state.isPanelOpen === false, 'Assisted Filing panel closed on logout');

  // ----------------------------------------------------
  // TEST 12: Live SpeechRecognition Stream, Interim Results, Auto-Restart Status Persistence & STT Variations
  // ----------------------------------------------------
  window.isLoggedIn = true;
  window.currentRole = 'applicant';
  window.navigateTo('user-dashboard');
  window.AssistedFiling.startVoiceNav();

  const navRec = window.AssistedFiling.state.navRecognitionInstance;
  assert(!!navRec, 'Active navRecognitionInstance created');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Listening for commands... Speak a supported command.',
    'Initial startVoiceNav sets status to "Listening for commands... Speak a supported command."'
  );

  // 12a: Interim result (isFinal: false) immediately executes valid command & updates Action/Status
  const interimItem1 = [{ transcript: 'Show form' }];
  interimItem1.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [interimItem1] });
  assert(window.currentPage === 'filing-hub', 'Interim "Show form" (isFinal: false) immediately navigated to filing-hub');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Action / Status immediately updated to "Displaying filing forms..." on interim match (not stuck on Listening)'
  );

  // Second interim frame refining "Show form" -> "Show forms" at same index 0 must NOT trigger redundant error
  const interimItem2 = [{ transcript: 'Show forms' }];
  interimItem2.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [interimItem2] });
  assert(
    window.document.getElementById('voiceNavTranscript').textContent === '"Show forms"',
    'Refined interim frame updated Heard Speech to "Show forms"'
  );
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Refined interim frame at same index did not overwrite "Displaying filing forms..." with redundant error'
  );

  // Finalization (isFinal: true) of same index 0 must NOT trigger redundant error
  const finalItem1 = [{ transcript: 'Show forms.' }];
  finalItem1.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [finalItem1] });
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Finalized frame at same index preserved "Displaying filing forms..." without duplicate trigger'
  );

  // 12b: Auto-restart (onend -> start -> onstart) and onerror("no-speech") must NOT overwrite Action/Status
  navRec.onend();
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav auto-restarted on onend');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Auto-restart onstart did NOT overwrite "Displaying filing forms..." with "Listening for commands..."'
  );

  navRec.onerror({ error: 'no-speech' });
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Idle no-speech error did NOT overwrite "Displaying filing forms..."'
  );

  // 12c: Continuous session multi-utterance accumulation & multi-segment joining
  const segA = [{ transcript: 'Open' }];
  segA.isFinal = true;
  const segB = [{ transcript: 'messages' }];
  segB.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [segA, segB] });
  assert(window.currentPage === 'messages', 'Multi-segment ["Open", "messages"] joined with space and navigated to messages');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening Messages...',
    'Multi-segment command updated status to "Opening Messages..."'
  );

  // Subsequent utterance in continuous array where resultIndex=0 still includes old finalized segments
  const segC = [{ transcript: 'Open IP guidelines' }];
  segC.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [segA, segB, segC] });
  assert(window.currentPage === 'ip-guidelines', 'Accumulated continuous results skipped old finalized indices and executed latest command');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening IP guidelines...',
    'Latest command in accumulated continuous results updated status to "Opening IP guidelines..."'
  );

  // 12d: maxAlternatives fallback when primary transcript is misheard
  const altItem = [
    { transcript: 'so farms' },
    { transcript: 'Open marketplace' }
  ];
  altItem.isFinal = true;
  navRec.onresult({ resultIndex: 3, results: [segA, segB, segC, altItem] });
  assert(window.currentPage === 'marketplace-dash', 'maxAlternatives fallback matched valid command in alternative #2');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening Marketplace...',
    'Alternative command updated status to "Opening Marketplace..."'
  );

  // 12e: Unfinalized unknown interim speech flushed on onend (never stuck on Listening)
  const unknownInterim = [{ transcript: 'Random unrecognized phrase' }];
  unknownInterim.isFinal = false;
  navRec.onresult({ resultIndex: 4, results: [segA, segB, segC, altItem, unknownInterim] });
  navRec.onend();
  assert(
    window.document.getElementById('voiceNavMessage').textContent.includes('Command not recognized'),
    'Unfinalized interim speech flushed on onend and updated status to Command not recognized'
  );

  // 12f: Natural speech, punctuation, quotes, fillers, singular/plural & STT variations
  const sttVariations = [
    { phrase: 'Open my case.', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'My case!', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Um, open my cases please', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Open submissions', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Show form.', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Open the filing forms', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Show me forms', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Open filing hub', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'So forms', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Show forums', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Open I.P. guidelines', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open I P guideline', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open intellectual property guidelines', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open guide lines', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open in box', expectedCmd: 'open_messages', expectedPage: 'messages', startPage: 'user-dashboard' },
    { phrase: 'Please open messages', expectedCmd: 'open_messages', expectedPage: 'messages', startPage: 'user-dashboard' },
    { phrase: 'Open market place', expectedCmd: 'open_marketplace', expectedPage: 'marketplace-dash', startPage: 'user-dashboard' },
    { phrase: 'Market place', expectedCmd: 'open_marketplace', expectedPage: 'marketplace-dash', startPage: 'user-dashboard' },
    { phrase: 'Homepage', expectedCmd: 'home', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Go back home', expectedCmd: 'home', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Take me back home', expectedCmd: 'home', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: "Let's go home", expectedCmd: 'home', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Please go home', expectedCmd: 'home', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Please go back', expectedCmd: 'back', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'I want to go back', expectedCmd: 'back', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Back, please!', expectedCmd: 'back', expectedPage: 'user-dashboard', startPage: 'filing-hub' },
    { phrase: 'Show farms', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Shoe forms', expectedCmd: 'show_forms', expectedPage: 'filing-hub', startPage: 'user-dashboard' },
    { phrase: 'Open mic cases', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Open may cases', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Open my applications', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Open my filings', expectedCmd: 'open_my_cases', expectedPage: 'user-submissions', startPage: 'filing-hub' },
    { phrase: 'Open IP guide', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open eye pea guidelines', expectedCmd: 'open_ip_guidelines', expectedPage: 'ip-guidelines', startPage: 'user-dashboard' },
    { phrase: 'Open messaging', expectedCmd: 'open_messages', expectedPage: 'messages', startPage: 'user-dashboard' },
    { phrase: 'Open chat', expectedCmd: 'open_messages', expectedPage: 'messages', startPage: 'user-dashboard' },
    { phrase: 'Open market', expectedCmd: 'open_marketplace', expectedPage: 'marketplace-dash', startPage: 'user-dashboard' }
  ];

  for (const item of sttVariations) {
    window.navigateTo('user-dashboard');
    if (item.startPage !== 'user-dashboard') {
      window.navigateTo(item.startPage);
    }
    const r = window.AssistedFiling.processVoiceNavCommand(item.phrase);
    assert(
      r.handled === true && r.command === item.expectedCmd && window.currentPage === item.expectedPage,
      `STT variation "${item.phrase}" -> ${item.expectedCmd} (${item.expectedPage})`
    );
  }

  // 12g: Multi-segment interim execution followed by 2-segment or merged 1-segment finalization
  window.navigateTo('user-dashboard');
  navRec.onend(); // reset continuous session state
  const msIntA = [{ transcript: 'Open' }];
  msIntA.isFinal = false;
  const msIntB = [{ transcript: 'messages' }];
  msIntB.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [msIntA, msIntB] });
  assert(window.currentPage === 'messages', '2-segment interim ["Open", "messages"] immediately navigated to messages');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening Messages...',
    '2-segment interim set status to "Opening Messages..."'
  );

  const msFinA = [{ transcript: 'Open' }];
  msFinA.isFinal = true;
  const msFinB = [{ transcript: 'messages' }];
  msFinB.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [msFinA, msFinB] });
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening Messages...',
    '2-segment finalization ["Open", "messages"] preserved "Opening Messages..." without "Command not recognized: Open"'
  );

  // Merged 1-segment finalization test
  window.navigateTo('user-dashboard');
  navRec.onend();
  const mgIntA = [{ transcript: 'Show' }];
  mgIntA.isFinal = false;
  const mgIntB = [{ transcript: 'forms' }];
  mgIntB.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [mgIntA, mgIntB] });
  assert(window.currentPage === 'filing-hub', '2-segment interim ["Show", "forms"] navigated to filing-hub');
  const mgMergedFin = [{ transcript: 'Show forms' }];
  mgMergedFin.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [mgMergedFin] });
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Displaying filing forms...',
    'Merged 1-segment finalization ["Show forms"] preserved "Displaying filing forms..." without redundant error'
  );

  // 12h: Mixed finalized + interim segments in the same onresult event
  window.navigateTo('user-dashboard');
  navRec.onend();
  const mixFinA = [{ transcript: 'Open' }];
  mixFinA.isFinal = true;
  const mixIntB = [{ transcript: 'my cases' }];
  mixIntB.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [mixFinA, mixIntB] });
  assert(window.currentPage === 'user-submissions', 'Mixed [final "Open", interim "my cases"] in same event navigated to user-submissions');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening My Cases...',
    'Mixed final+interim event set status to "Opening My Cases..."'
  );

  // 12i: Split finalized segments across consecutive events (resultIndex=0 prefix -> resultIndex=1 completion)
  window.navigateTo('filing-hub');
  navRec.onend();
  const splitPref = [{ transcript: 'Take me' }];
  splitPref.isFinal = true;
  navRec.onresult({ resultIndex: 0, results: [splitPref] });
  assert(
    !window.document.getElementById('voiceNavMessage').textContent.includes('Command not recognized'),
    'Incomplete finalized prefix "Take me" held without premature Command not recognized error'
  );
  const splitComp = [{ transcript: 'home' }];
  splitComp.isFinal = true;
  navRec.onresult({ resultIndex: 1, results: [splitPref, splitComp] });
  assert(window.currentPage === 'user-dashboard', 'Split finalized ["Take me", "home"] across resultIndex=0 -> resultIndex=1 navigated to user-dashboard');
  assert(
    window.document.getElementById('voiceNavMessage').textContent === 'Opening Home...',
    'Split finalized ["Take me", "home"] updated status to "Opening Home..."'
  );

  // 12j: Consecutive commands appended within a single unfinalized continuous segment (including repeated "Back back")
  window.navigateTo('user-dashboard');
  navRec.onend();
  const contSeg1 = [{ transcript: 'Show forms' }];
  contSeg1.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [contSeg1] });
  assert(window.currentPage === 'filing-hub', 'Continuous segment step 1 ("Show forms") -> filing-hub');

  const contSeg2 = [{ transcript: 'Show forms open IP guidelines' }];
  contSeg2.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [contSeg2] });
  assert(window.currentPage === 'ip-guidelines', 'Continuous segment step 2 ("Show forms open IP guidelines") -> ip-guidelines');

  const contSeg3 = [{ transcript: 'Show forms open IP guidelines open messages' }];
  contSeg3.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [contSeg3] });
  assert(window.currentPage === 'messages', 'Continuous segment step 3 ("... open messages") -> messages');

  const contSeg4 = [{ transcript: 'Show forms open IP guidelines open messages back' }];
  contSeg4.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [contSeg4] });
  assert(window.currentPage === 'ip-guidelines', 'Continuous segment step 4 ("... back") -> ip-guidelines');

  const contSeg5 = [{ transcript: 'Show forms open IP guidelines open messages back back' }];
  contSeg5.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [contSeg5] });
  assert(window.currentPage === 'filing-hub', 'Continuous segment step 5 ("... back back") -> filing-hub');

  // 12k: Form wizard prefix protection ("Go back" interim -> "Go back step" interim does not exit wizard)
  window.navigateTo('patent-form');
  window.currentWizardStep = 2;
  navRec.onend();
  const wizInterim1 = [{ transcript: 'Go back' }];
  wizInterim1.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [wizInterim1] });
  assert(window.currentPage === 'patent-form', 'Interim "Go back" inside form wizard held briefly without prematurely exiting patent-form');
  const wizInterim2 = [{ transcript: 'Go back step' }];
  wizInterim2.isFinal = false;
  navRec.onresult({ resultIndex: 0, results: [wizInterim2] });
  assert(window.currentPage === 'patent-form' && window.currentWizardStep === 2, 'Refined "Go back step" stayed on patent-form Step 2');
  assert(
    window.document.getElementById('voiceNavMessage').textContent.includes('Display 2 Fingers'),
    'Refined "Go back step" displayed gesture guidance for previous step'
  );

  // 12l: Auto-restart recovery when recognition.start() throws synchronously on onend
  let throwOnFirstStart = true;
  const origStart = navRec.start.bind(navRec);
  navRec.start = function () {
    if (throwOnFirstStart) {
      throwOnFirstStart = false;
      throw new Error('InvalidStateError: recognition already started');
    }
    return origStart();
  };
  navRec.onend();
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert(window.AssistedFiling.state.isNavListening === true && navRec.started === true, 'Voice nav recovered via scheduled auto-restart after synchronous start() throw');
  navRec.start = origStart;

  window.AssistedFiling.stopVoiceNav();

  // ----------------------------------------------------
  // TEST 11: Node.js Runtime Safety (Non-browser / headless execution)
  // ----------------------------------------------------
  // In pure Node.js environments without global.window, evaluateCommandContext
  // and processVoiceNavCommand must execute safely without throwing ReferenceError: window is not defined
  const savedWindow = global.window;
  delete global.window;
  try {
    const rawModule = require('../main/assisted-filing.js');
    const bareContextMsg = rawModule.evaluateCommandContext('open_messages');
    assert(bareContextMsg.valid === false && bareContextMsg.reason.includes('sign in'), 'evaluateCommandContext("open_messages") safely runs without global.window');

    const bareContextMkt = rawModule.evaluateCommandContext('open_marketplace');
    assert(bareContextMkt.valid === true, 'evaluateCommandContext("open_marketplace") safely runs without global.window');

    const bareMsgRes = rawModule.processVoiceNavCommand('Open messages');
    assert(bareMsgRes.handled === false && bareMsgRes.reason.includes('sign in'), 'processVoiceNavCommand("Open messages") safely runs without global.window');

    const bareMktRes = rawModule.processVoiceNavCommand('Open marketplace');
    assert(bareMktRes.handled === true && bareMktRes.command === 'open_marketplace', 'processVoiceNavCommand("Open marketplace") safely runs without global.window');

    const bareContextHome = rawModule.evaluateCommandContext('home');
    assert(bareContextHome.valid === true, 'evaluateCommandContext("home") safely runs without global.window');

    const bareHomeRes = rawModule.processVoiceNavCommand('Home');
    assert(bareHomeRes.handled === true && bareHomeRes.command === 'home', 'processVoiceNavCommand("Home") safely runs without global.window');

    const bareContextBack = rawModule.evaluateCommandContext('back');
    assert(bareContextBack.valid === true, 'evaluateCommandContext("back") safely runs without global.window');

    const bareBackRes = rawModule.processVoiceNavCommand('Back');
    assert(bareBackRes.handled === true && bareBackRes.command === 'back', 'processVoiceNavCommand("Back") safely runs without global.window');
  } finally {
    global.window = savedWindow;
  }

  console.log('====================================================');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================');

  process.exit(failCount > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
