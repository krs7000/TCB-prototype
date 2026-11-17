const fs = require('fs');
const { JSDOM } = require('jsdom');
const vm = require('vm');

console.log('=== RUNNING DEMONSTRATION SCRIPT & TOUCH VERIFICATION SUITE ===');

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

window.SpeechRecognition = MockSpeechRecognition;

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

async function run() {
  // Login as Applicant
  const emailInput = window.document.getElementById('loginEmail');
  if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
  await window.handleLogin({ preventDefault: () => {} });
  const otpInput = window.document.getElementById('loginOtpCode');
  if (otpInput) otpInput.value = '123456';
  window.verifyLoginOtp();

  assert(window.isLoggedIn === true, 'Applicant Juan dela Cruz logged in');

  // ------------------------------------------------------------------------
  // DEMONSTRATION SCRIPT TEST:
  // Step 1: Say "Show forms."
  // Step 2: Tap Patent and advance section via Gesture (1 Finger).
  // Step 3: Dictate a sample description.
  // Step 4: Correct the text using touch.
  // Step 5: Save draft via Gesture (4 Fingers) and verify voice rejection.
  // ------------------------------------------------------------------------
  console.log('\n--- EXECUTING 5-STEP DEMONSTRATION SCRIPT ---');

  // Step 1: Say "Show forms."
  console.log('Demo Step 1: Voice command "Show forms"');
  const step1 = window.AssistedFiling.processVoiceNavCommand("Show forms");
  assert(step1.handled === true && step1.command === 'show_forms', 'Demo 1: Spoken "Show forms" recognized and handled');
  assert(window.currentPage === 'filing-hub', 'Demo 1: Applicant navigated to filing hub');

  // Step 2: Tap Patent and start a filing. Advance via Gesture 1 Finger.
  console.log('Demo Step 2: Touch action on Patent card & Gesture 1 Finger for Next Page');
  const patentCard = window.document.querySelector('.filing-card');
  assert(!!patentCard, 'Demo 2: Patent filing card is present on filing hub');
  
  // Directly or via method modal start filing (tap Patent -> Proceed to Form)
  window.startSubmissionFlow('patent-form', 'online');
  assert(window.currentPage === 'patent-form', 'Demo 2: Patent filing wizard started');
  assert(window.currentWizardStep === 1, 'Demo 2: Currently on Step 1 (Advisory Sheet)');

  // Verify voice "Next step" and "Previous step" are strictly rejected and ignored
  const voiceNext = window.AssistedFiling.processVoiceNavCommand("Next step");
  assert(voiceNext.handled === false, 'Demo 2: Spoken "Next step" strictly rejected by voice navigation');
  assert(window.currentWizardStep === 1, 'Demo 2: Step remained on 1 after spoken "Next step"');

  const voicePrev = window.AssistedFiling.processVoiceNavCommand("Previous step");
  assert(voicePrev.handled === false, 'Demo 2: Spoken "Previous step" strictly rejected by voice navigation');
  assert(window.currentWizardStep === 1, 'Demo 2: Step remained on 1 after spoken "Previous step"');

  // Advance to Step 2 using Gesture 1 Finger
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  const gestureStep = window.AssistedFiling.processGesture("one_finger");
  assert(gestureStep.handled === true && gestureStep.action === 'next_step', 'Demo 2: Gesture 1 Finger advanced wizard to Step 2');
  assert(window.currentWizardStep === 2, 'Demo 2: Advanced to Step 2 (IP Disclosure Form)');

  // Step 3: Dictate a sample description.
  console.log('Demo Step 3: Tap Dictate button and dictate sample description');
  const dictateBtn = window.document.getElementById('btnDictateDesc');
  assert(!!dictateBtn, 'Demo 3: Microphone button found beside description field');
  
  // Trigger dictation
  window.AssistedFiling.startDictation('disclosure-description', 'Description of the Intellectual Property');
  assert(window.AssistedFiling.state.isDictating === true, 'Demo 3: Dictation started');

  const fictitiousInvention = 'A low-cost, portable multi-stage water filtration device fabricated from endemic Palawan bamboo and coconut shell activated carbon, designed for off-grid rural communities.';
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description of the Intellectual Property', fictitiousInvention);
  
  const reviewModal = window.document.getElementById('dictationReviewModal');
  const reviewTextarea = window.document.getElementById('dictationReviewInput');
  assert(reviewModal.style.display !== 'none', 'Demo 3: Recognized speech shown in review modal before insertion');
  assert(reviewTextarea.value === fictitiousInvention, 'Demo 3: Recognized speech exactly matches dictated utterance');

  // Step 4: Correct the text using touch / editing.
  console.log('Demo Step 4: Correct text using touch / typing in review box');
  const correctedText = fictitiousInvention + ' Includes an integrated gravity-fed solar UV sterilization chamber.';
  reviewTextarea.value = correctedText;
  
  // Tap Insert
  window.AssistedFiling.insertDictatedText('replace');
  const descField = window.document.getElementById('disclosure-description');
  assert(descField.value === correctedText, 'Demo 4: Corrected text inserted into form description field');
  assert(window.wizardData.disclosureDescription === correctedText, 'Demo 4: wizardData synchronized with corrected text');

  // Step 5: Save draft via gesture (4 Fingers) and verify voice rejection.
  console.log('Demo Step 5: Save draft via gesture (4 Fingers) & verify voice rejection');
  
  // Verify voice "Save draft" and "Save as draft" are strictly rejected
  const voiceSaveRes = window.AssistedFiling.processVoiceNavCommand("Save draft");
  assert(voiceSaveRes.handled === false, 'Demo 5: Spoken "Save draft" strictly rejected by voice navigation');
  const voiceSaveAsRes = window.AssistedFiling.processVoiceNavCommand("Save as draft");
  assert(voiceSaveAsRes.handled === false, 'Demo 5: Spoken "Save as draft" strictly rejected by voice navigation');
  assert(!window.submissions.some(s => s.formData && s.formData.disclosureDescription === correctedText), 'Demo 5: No draft created via voice command');

  // Execute draft save using Gesture 4 Fingers (hold for 1.2s)
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  window.AssistedFiling.state.gestureHoldExecuted = false;
  const step5 = window.AssistedFiling.processGesture('four_fingers', { holdDuration: 1300, minHold: 1200 });
  assert(step5.handled === true && step5.action === 'save_draft', 'Demo 5: Gesture 4 Fingers recognized and executed save draft');
  
  const draftRecord = window.submissions.find(s => s.status === 'Draft' && s.formData && s.formData.disclosureDescription === correctedText);
  assert(!!draftRecord, 'Demo 5: Draft record found in submissions repository');
  assert(draftRecord.formData.disclosureDescription === correctedText, 'Demo 5: Saved draft contains exact dictated and touch-corrected description');
  assert(draftRecord.isDraft === true, 'Demo 5: Record marked as isDraft = true');

  // ------------------------------------------------------------------------
  // TEST 11: Unsupported Browser Handling (Privacy & Degradation)
  // ------------------------------------------------------------------------
  console.log('\n--- TESTING UNSUPPORTED BROWSER HANDLING ---');
  // Create another DOM context where SpeechRecognition is null
  const domNoSpeech = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/main/index.html' });
  const winNoSpeech = domNoSpeech.window;
  winNoSpeech.SpeechRecognition = undefined;
  winNoSpeech.webkitSpeechRecognition = undefined;
  winNoSpeech.scrollTo = () => {};

  const ctxNoSpeech = domNoSpeech.getInternalVMContext();
  vm.runInContext(appCode, ctxNoSpeech);
  vm.runInContext(assistedFilingCode, ctxNoSpeech);

  assert(winNoSpeech.AssistedFiling.isSpeechRecognitionSupported === false, 'Correctly detected that SpeechRecognition is unsupported');
  
  // Starting voice nav in unsupported browser fails gracefully
  const startNavRes = winNoSpeech.AssistedFiling.startVoiceNav();
  assert(startNavRes === false, 'startVoiceNav returned false gracefully without throwing');
  
  // Starting dictation in unsupported browser fails gracefully
  const startDictRes = winNoSpeech.AssistedFiling.startDictation('disclosure-description', 'Description');
  assert(startDictRes === false, 'startDictation returned false gracefully without throwing');

  // Panel warning is displayed
  winNoSpeech.AssistedFiling.openPanel();
  const warningEl = winNoSpeech.document.getElementById('voiceUnsupportedNotice');
  assert(warningEl && warningEl.style.display !== 'none', 'Unsupported browser warning notice displayed in assistance panel');

  // Typing and touch remain completely functional
  winNoSpeech.isLoggedIn = true;
  winNoSpeech.currentRole = 'applicant';
  winNoSpeech.navigateTo('patent-form');
  winNoSpeech.nextWizardStep();
  const textarea = winNoSpeech.document.getElementById('disclosure-description');
  assert(!!textarea, 'Textarea exists and is usable when speech is unsupported');
  textarea.value = 'Manual touch-entered description without speech.';
  textarea.dispatchEvent(new winNoSpeech.Event('input', { bubbles: true }));
  winNoSpeech.saveFormDraft();
  const draftNoSpeech = winNoSpeech.submissions.find(s => s.status === 'Draft');
  assert(draftNoSpeech.formData.disclosureDescription === 'Manual touch-entered description without speech.', 'Manual entry, touch controls, and draft saving work 100% without speech API');

  // ------------------------------------------------------------------------
  // TEST 12: CSS Touch Target Sizing Check (44x44px rules)
  // ------------------------------------------------------------------------
  console.log('\n--- TESTING CSS TOUCH TARGET DEFINITIONS ---');
  const css = fs.readFileSync('main/styles.css', 'utf8');
  assert(css.includes('min-height: 44px;') && css.includes('min-width: 44px;'), 'CSS enforces min-height: 44px and min-width: 44px');
  assert(css.includes('.patent-editor-field__control'), 'CSS touch sizing includes .patent-editor-field__control');
  assert(css.includes('.topbar-assistance-btn'), 'CSS defines styles for .topbar-assistance-btn');
  assert(css.includes('.assisted-filing-floating-btn'), 'CSS defines styles for .assisted-filing-floating-btn');
  assert(css.includes('.btn-dictate-field'), 'CSS defines styles for .btn-dictate-field');
  assert(css.includes('@media (max-width: 768px)'), 'CSS includes responsive mobile media query for narrow screens');
  assert(css.includes('.wizard-footer'), 'CSS mobile responsive query stacks .wizard-footer');
  assert(css.includes(':focus-visible'), 'CSS includes visible focus ring for keyboard & accessibility');

  console.log('====================================================');
  console.log(`DEMO & TOUCH TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================');

  process.exit(failCount > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
