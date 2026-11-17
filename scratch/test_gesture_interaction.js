const fs = require('fs');
const { JSDOM } = require('jsdom');
const vm = require('vm');

console.log('=== RUNNING GESTURE INTERACTION COMPREHENSIVE VERIFICATION SUITE ===');

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
window.scrollBy = () => {};
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);

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

class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
  }
  speak(utterance) {
    this.speaking = true;
  }
  cancel() {
    this.speaking = false;
  }
}

window.SpeechRecognition = MockSpeechRecognition;
window.speechSynthesis = new MockSpeechSynthesis();
window.SpeechSynthesisUtterance = function (text) {
  this.text = text;
  this.lang = 'en-US';
};

// Mock MediaStream & Track
class MockMediaStreamTrack {
  constructor(kind = 'video') {
    this.kind = kind;
    this.enabled = true;
    this.stopped = false;
  }
  stop() {
    this.stopped = true;
  }
}

class MockMediaStream {
  constructor() {
    this.tracks = [new MockMediaStreamTrack('video')];
  }
  getTracks() {
    return this.tracks;
  }
  getVideoTracks() {
    return this.tracks.filter(t => t.kind === 'video');
  }
}

window.navigator.mediaDevices = {
  getUserMedia: async (constraints) => {
    return new MockMediaStream();
  }
};

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
  console.log('\n--- 1. VERIFY DOM ELEMENTS FOR GESTURE HUD & CARD ---');
  assert(!!window.document.getElementById('btnGestureToggle'), '#btnGestureToggle exists in panel');
  assert(!!window.document.getElementById('btnToggleGesturePreview'), '#btnToggleGesturePreview exists in panel');
  assert(!!window.document.getElementById('btnClearGestureLog'), '#btnClearGestureLog exists in panel');
  assert(!!window.document.getElementById('gestureHudContainer'), '#gestureHudContainer exists in panel');
  assert(!!window.document.getElementById('gestureCanvas'), '#gestureCanvas exists in panel');
  assert(!!window.document.getElementById('gestureVideo'), '#gestureVideo exists in panel');
  assert(!!window.document.getElementById('gestureDetectionBadge'), '#gestureDetectionBadge exists in panel');
  assert(!!window.document.getElementById('gestureHoldProgressWrap'), '#gestureHoldProgressWrap exists in panel');
  assert(!!window.document.getElementById('gestureStatusBadge'), '#gestureStatusBadge exists in panel');
  assert(!!window.document.getElementById('cameraUnsupportedNotice'), '#cameraUnsupportedNotice exists in panel');
  assert(!!window.document.getElementById('gestureFeedbackDetected'), '#gestureFeedbackDetected exists in panel');
  assert(!!window.document.getElementById('gestureFeedbackAction'), '#gestureFeedbackAction exists in panel');

  const cardHtml = window.document.querySelector('.gesture-reference-card')?.innerHTML || '';
  assert(cardHtml.includes('Thumbs Up'), 'Reference card includes "Thumbs Up"');
  assert(cardHtml.includes('Thumbs Down'), 'Reference card includes "Thumbs Down"');
  assert(cardHtml.includes('1 Finger'), 'Reference card includes "1 Finger"');
  assert(cardHtml.includes('2 Fingers'), 'Reference card includes "2 Fingers"');
  assert(cardHtml.includes('3 Fingers'), 'Reference card includes "3 Fingers"');
  assert(cardHtml.includes('4 Fingers'), 'Reference card includes "4 Fingers"');
  assert(!cardHtml.includes('Open Palm'), 'Reference card strictly excludes "Open Palm"');
  assert(!cardHtml.includes('Toggle dictation'), 'Reference card strictly excludes "Toggle dictation"');
  assert(!cardHtml.includes('Wave Right'), 'Reference card strictly excludes "Wave Right"');
  assert(!cardHtml.includes('Wave Left'), 'Reference card strictly excludes "Wave Left"');
  assert(!cardHtml.includes('Hand Move Down'), 'Reference card strictly excludes "Hand Move Down"');
  assert(!cardHtml.includes('Hand Move Up'), 'Reference card strictly excludes "Hand Move Up"');

  // Authenticate applicant
  console.log('\n--- 2. APPLICANT AUTHENTICATION ---');
  const emailInput = window.document.getElementById('loginEmail');
  if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
  await window.handleLogin({ preventDefault: () => {} });
  const otpInput = window.document.getElementById('loginOtpCode');
  if (otpInput) otpInput.value = '123456';
  window.verifyLoginOtp();
  assert(window.isLoggedIn === true, 'Applicant Juan dela Cruz logged in successfully');

  console.log('\n--- 3. WEBCAM LIFECYCLE, PERMISSIONS & TEARDOWN ---');
  // Initial state: inactive
  assert(window.AssistedFiling.state.isGestureActive === false, 'Gesture navigation is initially inactive');
  assert(window.AssistedFiling.state.gestureStream === null, 'Gesture stream is initially null');

  // Activate via startGestureRecognition()
  const startSuccess = await window.AssistedFiling.startGestureRecognition();
  assert(startSuccess === true, 'startGestureRecognition returned true');
  assert(window.AssistedFiling.state.isGestureActive === true, 'state.isGestureActive is true');
  assert(window.AssistedFiling.state.gestureStream !== null, 'gestureStream is populated with MockMediaStream');
  const tracks = window.AssistedFiling.state.gestureStream.getTracks();
  assert(tracks.length > 0 && !tracks[0].stopped, 'Stream track is active and not stopped');

  // Stop via stopGestureRecognition()
  window.AssistedFiling.stopGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === false, 'state.isGestureActive reset to false');
  assert(window.AssistedFiling.state.gestureStream === null, 'gestureStream cleared to null');
  assert(tracks[0].stopped === true, 'All media stream tracks were stopped (.stop() called)');

  // Test teardown on panel close
  await window.AssistedFiling.startGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === true, 'Gesture recognition restarted');
  window.AssistedFiling.closePanel();
  assert(window.AssistedFiling.state.isGestureActive === false, 'Closing panel automatically stopped gesture recognition');

  // Test teardown on navigate away from applicant portal
  await window.AssistedFiling.startGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === true, 'Gesture recognition active before page navigation');
  window.navigateTo('landing');
  assert(window.AssistedFiling.state.isGestureActive === false, 'Navigating away from applicant portal stopped gesture recognition');

  // Log back in for logout test
  if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
  await window.handleLogin({ preventDefault: () => {} });
  if (otpInput) otpInput.value = '123456';
  window.verifyLoginOtp();

  // Test teardown on logout
  await window.AssistedFiling.startGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === true, 'Gesture recognition active before logout');
  window.logout();
  assert(window.AssistedFiling.state.isGestureActive === false, 'Logout stopped gesture recognition completely');

  // Log back in for remaining tests
  if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
  await window.handleLogin({ preventDefault: () => {} });
  if (otpInput) otpInput.value = '123456';
  window.verifyLoginOtp();

  console.log('\n--- 4. CAMERA PERMISSION DENIED & ERROR HANDLING ---');
  const originalGetUserMedia = window.navigator.mediaDevices.getUserMedia;
  window.navigator.mediaDevices.getUserMedia = async () => {
    const err = new Error('Permission denied');
    err.name = 'NotAllowedError';
    throw err;
  };

  const deniedResult = await window.AssistedFiling.startGestureRecognition();
  assert(deniedResult === false, 'startGestureRecognition returned false gracefully on NotAllowedError');
  assert(window.AssistedFiling.state.isGestureActive === false, 'isGestureActive remained false');
  const warningEl = window.document.getElementById('cameraUnsupportedNotice');
  assert(warningEl && warningEl.style.display !== 'none', 'Camera warning notice displayed on permission denial');

  // Restore getUserMedia
  window.navigator.mediaDevices.getUserMedia = originalGetUserMedia;

  console.log('\n--- 5. GESTURE RECOGNITION LOGIC & BOUNDARY CHECKS ---');
  // On user-dashboard (outside form wizard):
  // 1 Finger should be rejected with context check
  const invalidOneFinger = window.AssistedFiling.processGesture('one_finger', { timestamp: 1000 });
  assert(invalidOneFinger.handled === false, '1 Finger rejected when not in form wizard');

  // Start patent form
  window.navigateTo('patent-form');
  assert(window.currentWizardStep === 1, 'Currently on Step 1 of Patent wizard');

  // 2 Fingers at Step 1 should reject (boundary check: already on first step)
  const invalidTwoFingers = window.AssistedFiling.processGesture('two_fingers', { timestamp: 2000 });
  assert(invalidTwoFingers.handled === false, '2 Fingers rejected when on Step 1 (boundary protection)');
  assert(window.currentWizardStep === 1, 'Still on Step 1');

  // 1 Finger at Step 1 -> advances to Step 2
  const validOneFinger = window.AssistedFiling.processGesture('one_finger', { timestamp: 3500 });
  assert(validOneFinger.handled === true && validOneFinger.action === 'next_step', '1 Finger advanced to next step');
  assert(window.currentWizardStep === 2, 'Step advanced to 2');

  // 2 Fingers at Step 2 -> returns to Step 1
  const validTwoFingers = window.AssistedFiling.processGesture('two_fingers', { timestamp: 5000 });
  assert(validTwoFingers.handled === true && validTwoFingers.action === 'previous_step', '2 Fingers returned to previous step');
  assert(window.currentWizardStep === 1, 'Returned to Step 1');

  // Advance through steps to final step
  const maxSteps = typeof window.getMaxWizardSteps === 'function' ? window.getMaxWizardSteps() : 5;
  while (window.currentWizardStep < maxSteps) {
    window.nextWizardStep();
  }
  assert(window.currentWizardStep === maxSteps, `Advanced to final Step ${maxSteps}`);

  // 1 Finger at final step should be rejected (use 3 fingers to submit)
  const finalOneFinger = window.AssistedFiling.processGesture('one_finger', { timestamp: 7000 });
  assert(finalOneFinger.handled === false, '1 Finger rejected on final step (safeguard against accidental advance)');

  // Verify deprecated dynamic motion swipe gestures are strictly unhandled and rejected
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  const finalWaveRight = window.AssistedFiling.processGesture('wave_right', { timestamp: 7900 });
  assert(finalWaveRight.handled === false && finalWaveRight.error === 'unknown_gesture', 'Wave Right rejected as unknown gesture');
  const finalWaveLeft = window.AssistedFiling.processGesture('wave_left', { timestamp: 8000 });
  assert(finalWaveLeft.handled === false && finalWaveLeft.error === 'unknown_gesture', 'Wave Left rejected as unknown gesture');
  const finalMoveUp = window.AssistedFiling.processGesture('hand_move_up', { timestamp: 8100 });
  assert(finalMoveUp.handled === false && finalMoveUp.error === 'unknown_gesture', 'Hand Move Up rejected as unknown gesture');

  // Return to Step 2 for dictation and drafting tests
  while (window.currentWizardStep > 2) {
    window.prevWizardStep();
  }
  assert(window.currentWizardStep === 2, 'Back on Step 2 (Technical Disclosure with #disclosure-description)');
  assert(!!window.document.getElementById('disclosure-description'), '#disclosure-description is present in DOM on Step 2');

  console.log('\n--- 6. PAGE SCROLLING GESTURES (THUMBS UP & THUMBS DOWN) ---');
  let scrolledY = 0;
  window.scrollBy = (options) => {
    scrolledY += options.top || 0;
  };

  // Thumbs Down -> scroll down (+300px)
  const scrollDownRes = window.AssistedFiling.processGesture('thumbs_down', { timestamp: 8500, distance: 300 });
  assert(scrollDownRes.handled === true && scrollDownRes.action === 'scroll_down', 'Thumbs Down recognized and handled');
  assert(scrolledY === 300, 'Page scrolled down by 300px via Thumbs Down');

  // Thumbs Up -> scroll up (-200px)
  const scrollUpRes = window.AssistedFiling.processGesture('thumbs_up', { timestamp: 9000, distance: 200 });
  assert(scrollUpRes.handled === true && scrollUpRes.action === 'scroll_up', 'Thumbs Up recognized and handled');
  assert(scrolledY === 100, 'Page scrolled up by 200px (net 100px) via Thumbs Up');

  // Verify hand_move_down is rejected and not recognized
  const handDownRes = window.AssistedFiling.processGesture('hand_move_down', { timestamp: 9500, distance: 100 });
  assert(handDownRes.handled === false && handDownRes.error === 'unknown_gesture', 'Hand Move Down rejected as unknown gesture');

  console.log('\n--- 7. WORKFLOW ACTION: 4 FINGERS (SAVE DRAFT) ---');
  // Test hold accumulation below threshold if minHold is passed
  const partialHold = window.AssistedFiling.processGesture('four_fingers', {
    timestamp: 10000,
    holdDuration: 600, // 0.6s
    minHold: 1200
  });
  assert(partialHold.handled === false && partialHold.holding === true, '4 Fingers with 600ms hold is not triggered prematurely');
  assert(partialHold.percent === 50, 'Hold progress accurately calculated as 50%');

  const progressWrap = window.document.getElementById('gestureHoldProgressWrap');
  const progressText = window.document.getElementById('gestureHoldPercent');
  assert(progressWrap.style.display !== 'none', 'Hold progress bar is displayed during hold');
  assert(progressText.textContent === '50%', 'Hold percentage text displayed as 50%');

  // Test full hold threshold reaching 1.2s or direct save
  const descEl = window.document.getElementById('disclosure-description');
  if (descEl) descEl.value = 'Invention disclosure description saved via 4 Fingers gesture.';

  const fullHold = window.AssistedFiling.processGesture('four_fingers', {
    timestamp: 11500,
    holdDuration: 1250, // 1.25s
    minHold: 1200
  });
  assert(fullHold.handled === true && fullHold.action === 'save_draft', '4 Fingers with >= 1.2s hold successfully saved draft');

  // Verify draft in submissions array
  const savedDraft = window.submissions.find(s => s.status === 'Draft' && s.formData?.disclosureDescription?.includes('4 Fingers'));
  assert(!!savedDraft, 'Draft record successfully created and persisted via 4 Fingers gesture');

  // Test continuous hold duplicate prevention
  const duplicateHold = window.AssistedFiling.processGesture('four_fingers', {
    timestamp: 12000,
    holdDuration: 1800,
    minHold: 1200
  });
  assert(duplicateHold.handled === false && duplicateHold.alreadyExecuted === true, 'Continuous 4 Fingers hold prevents multiple duplicate saves');

  console.log('\n--- 8. WORKFLOW ACTION: 3 FINGERS (SUBMIT APPLICATION) ---');
  // 1. Submit on Step 2 should be rejected with step validation notice
  assert(window.currentWizardStep === 2, 'Currently on Step 2');
  const invalidSubmit = window.AssistedFiling.processGesture('three_fingers', { timestamp: 14000 });
  assert(invalidSubmit.handled === false, '3 Fingers rejected when not on review step (step validation safeguard)');
  assert(invalidSubmit.reason?.includes('Step 2'), 'Rejection notice informs user of current step');

  // 2. Advance to Step 5 (final Review & Submit step)
  while (window.currentWizardStep < maxSteps) {
    window.nextWizardStep();
  }
  assert(window.currentWizardStep === maxSteps, `Advanced to final Step ${maxSteps} for submission`);

  // 3. Submit on final step
  const validSubmit = window.AssistedFiling.processGesture('three_fingers', { timestamp: 16000 });
  assert(validSubmit.handled === true && validSubmit.action === 'submit', '3 Fingers successfully submitted application on review step');

  // Return to Step 2 for remaining tests
  window.navigateTo('patent-form');
  window.nextWizardStep();
  assert(window.currentWizardStep === 2, 'Rendered Step 2 with description field for Section 9');

  console.log('\n--- 9. OPEN PALM REMOVAL & NEUTRAL HAND IDLE BEHAVIOR ---');
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation initially inactive');
  assert(!!window.document.getElementById('disclosure-description'), '#disclosure-description present on Step 2');

  // 1. processGesture('open_palm') is strictly rejected as unknown_gesture
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  const openPalmRes = window.AssistedFiling.processGesture('open_palm', { timestamp: 17000 });
  assert(openPalmRes.handled === false && openPalmRes.error === 'unknown_gesture', 'open_palm is rejected as unknown_gesture');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false after open_palm rejection');
  assert(window.AssistedFiling.state.dictationRecognitionInstance === null, 'Dictation recognition instance not created');

  // 2. 5 extended fingers evaluated via detectPostureFromLandmarks returns null (idle/neutral)
  const openPalmLmTest = createBaseHand();
  openPalmLmTest[0] = { x: 0.5, y: 0.75 };
  openPalmLmTest[2] = { x: 0.32, y: 0.55 }; openPalmLmTest[4] = { x: 0.2, y: 0.38 };
  openPalmLmTest[5] = { x: 0.4, y: 0.5 }; openPalmLmTest[6] = { x: 0.4, y: 0.4 }; openPalmLmTest[8] = { x: 0.4, y: 0.2 };
  openPalmLmTest[9] = { x: 0.48, y: 0.5 }; openPalmLmTest[10] = { x: 0.48, y: 0.4 }; openPalmLmTest[12] = { x: 0.48, y: 0.18 };
  openPalmLmTest[13] = { x: 0.56, y: 0.5 }; openPalmLmTest[14] = { x: 0.56, y: 0.4 }; openPalmLmTest[16] = { x: 0.56, y: 0.22 };
  openPalmLmTest[17] = { x: 0.64, y: 0.5 }; openPalmLmTest[18] = { x: 0.64, y: 0.42 }; openPalmLmTest[20] = { x: 0.64, y: 0.25 };
  const nullPostureRes = window.AssistedFiling.detectPostureFromLandmarks(openPalmLmTest);
  assert(nullPostureRes === null, '5 extended fingers evaluates to null (neutral/idle)');

  // 3. analyzeHandLandmarks with 5 extended fingers triggers zero actions
  const frameRes = window.AssistedFiling.analyzeHandLandmarks(openPalmLmTest, 17500);
  assert(frameRes.detected === true, 'Hand is detected');
  assert(frameRes.posture === null, 'Posture is null (neutral)');
  assert(frameRes.result === undefined, 'Zero actions triggered by 5 extended fingers');
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation remains false');
  assert(window.currentWizardStep === 2, 'Still on Step 2 (no navigation triggered)');
  window.AssistedFiling.state.gestureCooldownUntil = 0;

  console.log('\n--- 10. COOLDOWN DEBOUNCING VERIFICATION ---');
  // First gesture succeeds
  const firstFinger = window.AssistedFiling.processGesture('two_fingers', { timestamp: 20000 });
  assert(firstFinger.handled === true, 'First two_fingers succeeded');

  // Immediate second gesture within cooldown window (e.g. 50ms later)
  const rapidFinger = window.AssistedFiling.processGesture('two_fingers', { timestamp: 20050 });
  assert(rapidFinger.handled === false && rapidFinger.throttled === true, 'Rapid second two_fingers was throttled by cooldown');

  // After cooldown period passes (> 1000ms later)
  const delayedFinger = window.AssistedFiling.processGesture('one_finger', { timestamp: 21500 });
  assert(delayedFinger.handled === true, 'Delayed gesture after cooldown window succeeded');

  console.log('\n--- 11. LANDMARK POSTURE RECOGNITION ENGINE ---');
  function createBaseHand() {
    return Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  }

  // 11.1 Synthesize Thumbs Up Landmarks
  const thumbsUpLm = createBaseHand();
  thumbsUpLm[0] = { x: 0.5, y: 0.7 }; // wrist
  thumbsUpLm[2] = { x: 0.35, y: 0.45 }; // thumb MCP
  thumbsUpLm[4] = { x: 0.35, y: 0.18 }; // thumb tip (high up)
  thumbsUpLm[5] = { x: 0.45, y: 0.5 }; thumbsUpLm[6] = { x: 0.45, y: 0.55 }; thumbsUpLm[8] = { x: 0.45, y: 0.68 }; // index folded
  thumbsUpLm[9] = { x: 0.5, y: 0.5 }; thumbsUpLm[10] = { x: 0.5, y: 0.55 }; thumbsUpLm[12] = { x: 0.5, y: 0.68 }; // middle folded
  thumbsUpLm[13] = { x: 0.55, y: 0.5 }; thumbsUpLm[14] = { x: 0.55, y: 0.55 }; thumbsUpLm[16] = { x: 0.55, y: 0.68 }; // ring folded
  thumbsUpLm[17] = { x: 0.6, y: 0.5 }; thumbsUpLm[18] = { x: 0.6, y: 0.55 }; thumbsUpLm[20] = { x: 0.6, y: 0.68 }; // pinky folded

  const detectedThumbsUp = window.AssistedFiling.detectPostureFromLandmarks(thumbsUpLm);
  assert(detectedThumbsUp === 'thumbs_up', 'detectPostureFromLandmarks classified Thumbs Up posture correctly');

  // 11.2 Synthesize Thumbs Down Landmarks
  const thumbsDownLm = createBaseHand();
  thumbsDownLm[0] = { x: 0.5, y: 0.6 }; // wrist
  thumbsDownLm[2] = { x: 0.35, y: 0.5 }; // thumb MCP
  thumbsDownLm[4] = { x: 0.35, y: 0.75 }; // thumb tip pointing downward below wrist & palm
  thumbsDownLm[5] = { x: 0.45, y: 0.45 }; thumbsDownLm[6] = { x: 0.45, y: 0.5 }; thumbsDownLm[8] = { x: 0.45, y: 0.55 }; // index folded
  thumbsDownLm[9] = { x: 0.5, y: 0.45 }; thumbsDownLm[10] = { x: 0.5, y: 0.5 }; thumbsDownLm[12] = { x: 0.5, y: 0.55 }; // middle folded
  thumbsDownLm[13] = { x: 0.55, y: 0.45 }; thumbsDownLm[14] = { x: 0.55, y: 0.5 }; thumbsDownLm[16] = { x: 0.55, y: 0.55 }; // ring folded
  thumbsDownLm[17] = { x: 0.6, y: 0.45 }; thumbsDownLm[18] = { x: 0.6, y: 0.5 }; thumbsDownLm[20] = { x: 0.6, y: 0.55 }; // pinky folded

  const detectedThumbsDown = window.AssistedFiling.detectPostureFromLandmarks(thumbsDownLm);
  assert(detectedThumbsDown === 'thumbs_down', 'detectPostureFromLandmarks classified Thumbs Down posture correctly');

  // 11.3 Synthesize 1 Finger Landmarks (index extended, others folded)
  const oneFingerLm = createBaseHand();
  oneFingerLm[0] = { x: 0.5, y: 0.7 };
  oneFingerLm[2] = { x: 0.35, y: 0.55 }; oneFingerLm[4] = { x: 0.4, y: 0.55 }; // thumb folded
  oneFingerLm[5] = { x: 0.42, y: 0.5 }; oneFingerLm[6] = { x: 0.42, y: 0.42 }; oneFingerLm[8] = { x: 0.4, y: 0.2 }; // index extended
  oneFingerLm[9] = { x: 0.52, y: 0.5 }; oneFingerLm[10] = { x: 0.52, y: 0.55 }; oneFingerLm[12] = { x: 0.52, y: 0.68 }; // middle folded
  oneFingerLm[13] = { x: 0.58, y: 0.5 }; oneFingerLm[14] = { x: 0.58, y: 0.55 }; oneFingerLm[16] = { x: 0.58, y: 0.68 }; // ring folded
  oneFingerLm[17] = { x: 0.64, y: 0.5 }; oneFingerLm[18] = { x: 0.64, y: 0.55 }; oneFingerLm[20] = { x: 0.64, y: 0.68 }; // pinky folded

  const detectedOneFinger = window.AssistedFiling.detectPostureFromLandmarks(oneFingerLm);
  assert(detectedOneFinger === 'one_finger', 'detectPostureFromLandmarks classified 1 Finger posture correctly');

  // 11.4 Synthesize 2 Fingers Landmarks (index + middle extended, others folded)
  const peaceLm = createBaseHand();
  peaceLm[0] = { x: 0.5, y: 0.7 };
  peaceLm[2] = { x: 0.35, y: 0.55 }; peaceLm[4] = { x: 0.4, y: 0.55 }; // thumb folded
  peaceLm[5] = { x: 0.42, y: 0.5 }; peaceLm[6] = { x: 0.42, y: 0.42 }; peaceLm[8] = { x: 0.4, y: 0.2 }; // index extended
  peaceLm[9] = { x: 0.52, y: 0.5 }; peaceLm[10] = { x: 0.52, y: 0.42 }; peaceLm[12] = { x: 0.54, y: 0.2 }; // middle extended
  peaceLm[13] = { x: 0.58, y: 0.5 }; peaceLm[14] = { x: 0.58, y: 0.55 }; peaceLm[16] = { x: 0.58, y: 0.68 }; // ring folded
  peaceLm[17] = { x: 0.64, y: 0.5 }; peaceLm[18] = { x: 0.64, y: 0.55 }; peaceLm[20] = { x: 0.64, y: 0.68 }; // pinky folded

  const detectedPeace = window.AssistedFiling.detectPostureFromLandmarks(peaceLm);
  assert(detectedPeace === 'two_fingers', 'detectPostureFromLandmarks classified 2 Fingers posture correctly');

  // 11.5 Synthesize 3 Fingers Landmarks (index + middle + ring extended, pinky & thumb folded)
  const threeFingersLm = createBaseHand();
  threeFingersLm[0] = { x: 0.5, y: 0.7 };
  threeFingersLm[2] = { x: 0.35, y: 0.55 }; threeFingersLm[4] = { x: 0.4, y: 0.55 }; // thumb folded
  threeFingersLm[5] = { x: 0.42, y: 0.5 }; threeFingersLm[6] = { x: 0.42, y: 0.42 }; threeFingersLm[8] = { x: 0.4, y: 0.2 }; // index extended
  threeFingersLm[9] = { x: 0.52, y: 0.5 }; threeFingersLm[10] = { x: 0.52, y: 0.42 }; threeFingersLm[12] = { x: 0.52, y: 0.18 }; // middle extended
  threeFingersLm[13] = { x: 0.58, y: 0.5 }; threeFingersLm[14] = { x: 0.58, y: 0.42 }; threeFingersLm[16] = { x: 0.58, y: 0.22 }; // ring extended
  threeFingersLm[17] = { x: 0.64, y: 0.5 }; threeFingersLm[18] = { x: 0.64, y: 0.55 }; threeFingersLm[20] = { x: 0.64, y: 0.68 }; // pinky folded

  const detectedThreeFingers = window.AssistedFiling.detectPostureFromLandmarks(threeFingersLm);
  assert(detectedThreeFingers === 'three_fingers', 'detectPostureFromLandmarks classified 3 Fingers posture correctly');

  // 11.6 Synthesize 4 Fingers Landmarks (index + middle + ring + pinky extended, thumb folded)
  const fourFingerTestLm = createBaseHand();
  fourFingerTestLm[0] = { x: 0.5, y: 0.75 };
  fourFingerTestLm[2] = { x: 0.4, y: 0.55 }; fourFingerTestLm[4] = { x: 0.55, y: 0.55 }; // thumb folded across palm
  fourFingerTestLm[5] = { x: 0.4, y: 0.5 }; fourFingerTestLm[6] = { x: 0.4, y: 0.4 }; fourFingerTestLm[8] = { x: 0.4, y: 0.2 }; // index extended
  fourFingerTestLm[9] = { x: 0.48, y: 0.5 }; fourFingerTestLm[10] = { x: 0.48, y: 0.4 }; fourFingerTestLm[12] = { x: 0.48, y: 0.18 }; // middle extended
  fourFingerTestLm[13] = { x: 0.56, y: 0.5 }; fourFingerTestLm[14] = { x: 0.56, y: 0.4 }; fourFingerTestLm[16] = { x: 0.56, y: 0.22 }; // ring extended
  fourFingerTestLm[17] = { x: 0.64, y: 0.5 }; fourFingerTestLm[18] = { x: 0.64, y: 0.42 }; fourFingerTestLm[20] = { x: 0.64, y: 0.25 }; // pinky extended

  const detectedFourFingers = window.AssistedFiling.detectPostureFromLandmarks(fourFingerTestLm);
  assert(detectedFourFingers === 'four_fingers', 'detectPostureFromLandmarks classified 4 Fingers posture correctly');

  // 11.7 Synthesize Open Palm Landmarks
  const openPalmLm = createBaseHand();
  openPalmLm[0] = { x: 0.5, y: 0.75 };
  openPalmLm[2] = { x: 0.32, y: 0.55 }; openPalmLm[4] = { x: 0.2, y: 0.38 }; // thumb extended out
  openPalmLm[5] = { x: 0.4, y: 0.5 }; openPalmLm[6] = { x: 0.4, y: 0.4 }; openPalmLm[8] = { x: 0.4, y: 0.2 }; // index extended
  openPalmLm[9] = { x: 0.48, y: 0.5 }; openPalmLm[10] = { x: 0.48, y: 0.4 }; openPalmLm[12] = { x: 0.48, y: 0.18 }; // middle extended
  openPalmLm[13] = { x: 0.56, y: 0.5 }; openPalmLm[14] = { x: 0.56, y: 0.4 }; openPalmLm[16] = { x: 0.56, y: 0.22 }; // ring extended
  openPalmLm[17] = { x: 0.64, y: 0.5 }; openPalmLm[18] = { x: 0.64, y: 0.42 }; openPalmLm[20] = { x: 0.64, y: 0.25 }; // pinky extended

  const detectedOpenPalm = window.AssistedFiling.detectPostureFromLandmarks(openPalmLm);
  assert(detectedOpenPalm === null, 'detectPostureFromLandmarks treats 5 extended fingers as null (neutral/idle)');

  // 11.4 Verify Motion Trajectory Does Not Trigger Wave Right (Dynamic Motion Removed)
  const swipeHand1 = createBaseHand();
  swipeHand1[0] = { x: 0.25, y: 0.5 }; swipeHand1[5] = { x: 0.25, y: 0.45 }; swipeHand1[17] = { x: 0.25, y: 0.55 };
  window.AssistedFiling.analyzeHandLandmarks(swipeHand1, 30000);

  const swipeHand2 = createBaseHand();
  swipeHand2[0] = { x: 0.38, y: 0.5 }; swipeHand2[5] = { x: 0.38, y: 0.45 }; swipeHand2[17] = { x: 0.38, y: 0.55 };
  window.AssistedFiling.analyzeHandLandmarks(swipeHand2, 30100);

  const swipeHand3 = createBaseHand();
  swipeHand3[0] = { x: 0.55, y: 0.5 }; swipeHand3[5] = { x: 0.55, y: 0.45 }; swipeHand3[17] = { x: 0.55, y: 0.55 };
  const swipeAnalysis = window.AssistedFiling.analyzeHandLandmarks(swipeHand3, 30200);

  assert(swipeAnalysis.gesture !== 'wave_right' && swipeAnalysis.motion !== true, 'Dynamic landmark sequence strictly does NOT trigger Wave Right swipe');

  // 11.5 Verify Motion Trajectory Does Not Trigger Wave Left (Dynamic Motion Removed)
  const swipeLeftHand1 = createBaseHand();
  swipeLeftHand1[0] = { x: 0.65, y: 0.5 }; swipeLeftHand1[5] = { x: 0.65, y: 0.45 }; swipeLeftHand1[17] = { x: 0.65, y: 0.55 };
  window.AssistedFiling.analyzeHandLandmarks(swipeLeftHand1, 31000);

  const swipeLeftHand2 = createBaseHand();
  swipeLeftHand2[0] = { x: 0.48, y: 0.5 }; swipeLeftHand2[5] = { x: 0.48, y: 0.45 }; swipeLeftHand2[17] = { x: 0.48, y: 0.55 };
  window.AssistedFiling.analyzeHandLandmarks(swipeLeftHand2, 31100);

  const swipeLeftHand3 = createBaseHand();
  swipeLeftHand3[0] = { x: 0.28, y: 0.5 }; swipeLeftHand3[5] = { x: 0.28, y: 0.45 }; swipeLeftHand3[17] = { x: 0.28, y: 0.55 };
  const swipeLeftAnalysis = window.AssistedFiling.analyzeHandLandmarks(swipeLeftHand3, 31200);

  assert(swipeLeftAnalysis.gesture !== 'wave_left' && swipeLeftAnalysis.motion !== true, 'Dynamic landmark sequence strictly does NOT trigger Wave Left swipe');

  console.log('\n--- 12. GESTURE HUD & FEEDBACK CONTROLS ---');
  window.AssistedFiling.toggleGesturePreview();
  const hudContainer = window.document.getElementById('gestureHudContainer');
  assert(hudContainer.style.display !== 'none', 'toggleGesturePreview toggles HUD container visible');

  window.AssistedFiling.clearGestureFeedback();
  const detFeedback = window.document.getElementById('gestureFeedbackDetected');
  assert(detFeedback.textContent === '(None)', 'clearGestureFeedback resets detection display');

  console.log('\n--- 13. CONCURRENCY & RE-ENTRANCE PROTECTION ---');
  // Trigger startGestureRecognition while already active or starting
  const secondStart = await window.AssistedFiling.startGestureRecognition();
  assert(secondStart === true, 'Re-entrant startGestureRecognition returns true immediately without duplicate stream');

  console.log('\n--- 14. DICTATION REVIEW MODAL NAVIGATION LOCK ---');
  window.navigateTo('patent-form');
  window.nextWizardStep();
  assert(window.currentWizardStep === 2, 'Rendered Step 2 with description field');
  assert(!!window.document.getElementById('disclosure-description'), '#disclosure-description present in DOM');
  window.AssistedFiling.showDictationReviewModal('disclosure-description', 'Description', 'Temporary draft text');
  const reviewModalEl = window.document.getElementById('dictationReviewModal');
  assert(reviewModalEl && reviewModalEl.style.display !== 'none', 'Dictation review modal is open');

  const lockedOneFinger = window.AssistedFiling.processGesture('one_finger', { timestamp: 35000 });
  assert(lockedOneFinger.handled === false, '1 Finger rejected while dictation review modal is open');
  assert(window.currentWizardStep === 2, 'Wizard step preserved (pending dictation protected from loss)');

  const lockedTwoFingers = window.AssistedFiling.processGesture('two_fingers', { timestamp: 36000 });
  assert(lockedTwoFingers.handled === false, '2 Fingers rejected while dictation review modal is open');

  const lockedSaveDraft = window.AssistedFiling.processGesture('four_fingers', { timestamp: 37000 });
  assert(lockedSaveDraft.handled === false, '4 Fingers draft save rejected while review modal is open');

  const lockedSubmit = window.AssistedFiling.processGesture('three_fingers', { timestamp: 37500 });
  assert(lockedSubmit.handled === false, '3 Fingers submit rejected while review modal is open');

  // Dismiss review modal
  window.AssistedFiling.cancelDictation();
  assert(reviewModalEl.style.display === 'none', 'Review modal dismissed cleanly');

  console.log('\n--- 15. DICTATION VOICE NAV RESUMPTION & UNSUPPORTED HANDLING ---');
  // Start voice nav
  window.AssistedFiling.startVoiceNav();
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav is listening');

  // Start dictation
  window.AssistedFiling.startDictation('disclosure-description', 'IP Description');
  assert(window.AssistedFiling.state.isDictating === true, 'Dictation active');
  assert(window.AssistedFiling.state.isNavListening === false, 'Voice nav paused while dictating');

  // Stop dictation and resume voice nav
  window.AssistedFiling.stopDictation();
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation stopped');
  assert(window.AssistedFiling.state.isNavListening === true, 'Voice nav automatically resumed listening after dictation stop');
  window.AssistedFiling.closeDictationReviewModal();
  window.AssistedFiling.stopVoiceNav();
  window.AssistedFiling.state.gestureCooldownUntil = 0;

  console.log('\n--- 16. HALT SCROLLING UTILITY & GESTURE DICTATION TOGGLE ---');
  let scrollHalted = false;
  const originalScrollBy = window.scrollBy;
  window.scrollBy = (options) => {
    if (typeof options === 'object' && options.top === 0 && options.behavior === 'instant') {
      scrollHalted = true;
    }
  };
  window.AssistedFiling.haltScrolling();
  assert(scrollHalted === true, 'AssistedFiling.haltScrolling() executes instant 0-offset reset');
  window.scrollBy = originalScrollBy;

  // Verify open_palm rejected and does not toggle dictation
  window.navigateTo('patent-form');
  window.nextWizardStep();
  assert(window.currentWizardStep === 2, 'On Step 2 for Section 16');
  const toggleOn16 = window.AssistedFiling.processGesture('open_palm', { timestamp: 43000 });
  assert(toggleOn16.handled === false && toggleOn16.error === 'unknown_gesture', 'Open Palm rejected as unknown_gesture in Section 16');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false');
  window.navigateTo('patent-form');
  window.AssistedFiling.state.gestureCooldownUntil = 0;

  console.log('\n--- 17. LANDMARK NULL & MALFORMED INPUT SAFETY ---');
  assert(window.AssistedFiling.detectPostureFromLandmarks(null) === null, 'Null landmarks return null safely');
  assert(window.AssistedFiling.detectPostureFromLandmarks([]) === null, 'Empty array returns null safely');
  assert(window.AssistedFiling.detectPostureFromLandmarks(new Array(21)) === null, 'Array of undefines returns null without throwing');
  const malformedLandmarks = createBaseHand();
  delete malformedLandmarks[4];
  delete malformedLandmarks[8];
  assert(window.AssistedFiling.detectPostureFromLandmarks(malformedLandmarks) === null, 'Partially missing landmark indices handled safely');

  const emptyLandmarkAnalysis = window.AssistedFiling.analyzeHandLandmarks(null);
  assert(emptyLandmarkAnalysis.detected === false, 'analyzeHandLandmarks handles null safely');

  console.log('\n--- 18. MOTION STATE CLEANUP & GESTURE STABILITY ON HAND LOSS/RE-ENTRY ---');
  assert(window.AssistedFiling.state.centroidHistory === undefined, 'centroidHistory state cleaned up and removed');
  window.AssistedFiling.analyzeHandLandmarks(swipeHand1, 45000);
  const handLossAnalysis = window.AssistedFiling.analyzeHandLandmarks(null, 45100);
  assert(handLossAnalysis.detected === false, 'analyzeHandLandmarks handles null safely');
  // Hand re-enters on opposite side: should NOT trigger false swipe
  const reEnterHand = createBaseHand();
  reEnterHand[0] = { x: 0.8, y: 0.5 };
  const reEnterAnalysis = window.AssistedFiling.analyzeHandLandmarks(reEnterHand, 45200);
  assert(reEnterAnalysis.motion !== true && reEnterAnalysis.gesture !== 'wave_right' && reEnterAnalysis.gesture !== 'wave_left', 'Re-entering hand does not trigger swipe across lost-frame gap');

  console.log('\n--- 19. PIXEL SEGMENTATION: LAB GLOVES & DIVERSE SKIN TONES ---');
  function createSyntheticFrame(width, height, colorFn) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const [r, g, b, a] = colorFn(x, y);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
      }
    }
    return { data, width, height };
  }

  // 19.1 Blue nitrile laboratory glove (B > R, B > G)
  const blueGloveFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 40 && x <= 120 && y >= 30 && y <= 100) {
      return [35, 65, 180, 255]; // blue nitrile
    }
    return [20, 20, 20, 255]; // dark background
  });
  const blueGloveAnalysis = window.AssistedFiling.analyzeFrameData(blueGloveFrame, 47000);
  assert(blueGloveAnalysis.detected === true, 'Blue nitrile laboratory glove successfully detected');

  // 19.2 Purple nitrile laboratory glove
  const purpleGloveFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 40 && x <= 120 && y >= 30 && y <= 100) {
      return [110, 45, 140, 255]; // purple nitrile
    }
    return [20, 20, 20, 255];
  });
  const purpleGloveAnalysis = window.AssistedFiling.analyzeFrameData(purpleGloveFrame, 48000);
  assert(purpleGloveAnalysis.detected === true, 'Purple nitrile laboratory glove successfully detected');

  // 19.3 Deep melanin-rich skin tone (R ~ 55, G ~ 35, B ~ 25)
  const deepSkinFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 40 && x <= 120 && y >= 30 && y <= 100) {
      return [58, 38, 26, 255]; // deep skin tone
    }
    return [10, 10, 10, 255];
  });
  const deepSkinAnalysis = window.AssistedFiling.analyzeFrameData(deepSkinFrame, 49000);
  assert(deepSkinAnalysis.detected === true, 'Deep melanin-rich skin tone successfully detected');

  // 19.4 Bounding box resolution scaling properties
  assert(blueGloveAnalysis.box?.sourceWidth === 160 && blueGloveAnalysis.box?.sourceHeight === 120, 'Analysis box contains source dimensions for accurate HUD scaling');

  console.log('\n--- 20. FINAL STEP MESSAGE & CONTINUOUS HOLD SPAM PREVENTION ---');
  window.navigateTo('patent-form');
  window.currentWizardStep = 5; // Step 5 (Preview & Submit)
  const finalStepAdvance = window.AssistedFiling.processGesture('one_finger', { timestamp: 51000 });
  assert(finalStepAdvance.handled === false && finalStepAdvance.reason?.includes('3 fingers'), 'Final step 1 finger navigation correctly reports "3 fingers" in safety rejection notice');

  // Dashboard hold rejection single warning
  window.navigateTo('user-dashboard');
  const dashboardHold1 = window.AssistedFiling.processGesture('four_fingers', { timestamp: 53000, holdDuration: 1300 });
  assert(dashboardHold1.handled === false, '4 Fingers outside form wizard rejected');
  assert(window.AssistedFiling.state.gestureHoldExecuted === true, 'gestureHoldExecuted marked true to prevent toast spamming on continuous hold');
  const dashboardHold2 = window.AssistedFiling.processGesture('four_fingers', { timestamp: 53050, holdDuration: 1350 });
  assert(dashboardHold2.alreadyExecuted === true, 'Continuous hold throttled without repeated error toasts');

  console.log('\n--- 21. HUD PREVIEW BUTTON TEXT SYNCHRONIZATION ---');
  window.AssistedFiling.stopGestureRecognition();
  const previewBtnEl = window.document.getElementById('btnToggleGesturePreview');
  assert(previewBtnEl.textContent.includes('HUD Preview'), 'HUD preview button says "HUD Preview" when camera is off');
  await window.AssistedFiling.startGestureRecognition();
  assert(previewBtnEl.textContent.includes('Hide Preview'), 'HUD preview button updates to "Hide Preview" when HUD opens');
  window.AssistedFiling.stopGestureRecognition();

  console.log('\n--- 22. GOOGLE MEDIAPIPE CDN DEPENDENCY INCLUSION ---');
  const indexHtmlRaw = fs.readFileSync('main/index.html', 'utf8');
  assert(indexHtmlRaw.includes('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'), 'index.html includes MediaPipe camera_utils CDN script');
  assert(indexHtmlRaw.includes('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'), 'index.html includes MediaPipe hands CDN script');

  console.log('\n--- 23. GOOGLE MEDIAPIPE HANDS INITIALIZATION & CONFIGURATION ---');
  class MockMediaPipeHands {
    constructor(config) {
      MockMediaPipeHands.lastInstance = this;
      this.config = config;
      this.options = null;
      this.resultsCallback = null;
      this.closed = false;
      this.sentFrames = [];
    }
    setOptions(opts) {
      this.options = opts;
    }
    onResults(cb) {
      this.resultsCallback = cb;
    }
    async send(payload) {
      this.sentFrames.push(payload);
    }
    close() {
      this.closed = true;
    }
  }

  window.Hands = MockMediaPipeHands;
  const mpStartSuccess = await window.AssistedFiling.startGestureRecognition();
  assert(mpStartSuccess === true, 'startGestureRecognition succeeded with MediaPipe available');
  assert(window.AssistedFiling.state.isMediaPipeActive === true, 'state.isMediaPipeActive set to true');
  assert(window.AssistedFiling.state.mediaPipeHands instanceof MockMediaPipeHands, 'mediaPipeHands instance created');
  assert(typeof MockMediaPipeHands.lastInstance.config.locateFile === 'function', 'locateFile resolver function provided');
  assert(MockMediaPipeHands.lastInstance.config.locateFile('test.wasm').includes('https://cdn.jsdelivr.net/npm/@mediapipe/hands/test.wasm'), 'locateFile points to @mediapipe/hands CDN');
  assert(MockMediaPipeHands.lastInstance.options.maxNumHands === 1, 'MediaPipe maxNumHands configured to 1');
  assert(MockMediaPipeHands.lastInstance.options.modelComplexity === 1, 'MediaPipe modelComplexity configured to 1');
  assert(MockMediaPipeHands.lastInstance.options.minDetectionConfidence === 0.5, 'MediaPipe minDetectionConfidence configured to 0.5');
  assert(MockMediaPipeHands.lastInstance.options.minTrackingConfidence === 0.5, 'MediaPipe minTrackingConfidence configured to 0.5');
  assert(typeof MockMediaPipeHands.lastInstance.resultsCallback === 'function', 'onResults callback registered');

  console.log('\n--- 24. MEDIAPIPE ONRESULTS FEEDING & SKELETAL HUD RENDERING ---');
  // Feed simulated results through onResults
  MockMediaPipeHands.lastInstance.resultsCallback({
    multiHandLandmarks: [thumbsUpLm]
  });
  assert(window.AssistedFiling.state.lastHandLandmarks === thumbsUpLm, 'lastHandLandmarks stored in state on landmark results');

  // Verify HAND_CONNECTIONS skeleton structure
  const connections = window.AssistedFiling.HAND_CONNECTIONS;
  assert(Array.isArray(connections) && connections.length === 21, 'HAND_CONNECTIONS defines all 21 standard skeletal bone connections');

  // Verify Skeletal HUD Canvas Rendering
  const drawnLines = [];
  const drawnArcs = [];
  let fillRectCount = 0;
  let strokeRectCount = 0;

  const mockCtx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    drawImage: () => {},
    strokeRect: (x, y, w, h) => { strokeRectCount++; },
    fillRect: (x, y, w, h) => { fillRectCount++; },
    beginPath: () => {},
    moveTo: (x, y) => { drawnLines.push({ type: 'move', x, y }); },
    lineTo: (x, y) => { drawnLines.push({ type: 'line', x, y }); },
    stroke: () => {},
    fill: () => {},
    arc: (x, y, r, sa, ea) => { drawnArcs.push({ x, y, r }); },
    fillText: () => {},
    measureText: () => ({ width: 50 }),
  };

  const canvasEl = window.document.getElementById('gestureCanvas');
  canvasEl.getContext = () => mockCtx;

  window.AssistedFiling.renderGestureHUD(null, 'thumbs_up', 65, thumbsUpLm);
  assert(drawnLines.length >= 21, 'renderGestureHUD draws lines for all skeletal bone connections');
  assert(drawnArcs.length >= 21, 'renderGestureHUD draws joint points for all 21 landmarks');
  assert(strokeRectCount >= 2, 'renderGestureHUD draws grid reticle and hand bounding box');

  // Verify horizontal mirroring projection on HUD canvas: x=0.35 on 320px width -> (1 - 0.35) * 320 = 208px
  const mirroredWristX = (1 - thumbsUpLm[0].x) * 320;
  const matchingArc = drawnArcs.find(a => Math.abs(a.x - mirroredWristX) < 1.0);
  assert(!!matchingArc, 'Skeletal HUD correctly projects mirrored coordinates to match user space video reflection');

  // Empty landmarks clears HUD and hold state
  MockMediaPipeHands.lastInstance.resultsCallback({
    multiHandLandmarks: []
  });
  assert(window.AssistedFiling.state.lastHandLandmarks === null, 'multiHandLandmarks empty clears lastHandLandmarks to null');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 0, 'Empty hand result resets gesture hold duration');

  console.log('\n--- 25. SKELETAL POSTURE DISAMBIGUATION ---');
  // 1. Thumbs Up posture: thumb extended high, index, middle, ring, pinky folded
  const thumbsResult = window.AssistedFiling.detectPostureFromLandmarks(thumbsUpLm);
  assert(thumbsResult === 'thumbs_up', 'thumbsUpLm classifies as thumbs_up');
  assert(thumbsResult !== 'two_fingers', 'thumbsUpLm strictly never classifies as two_fingers');
  assert(thumbsResult !== 'thumbs_down', 'thumbsUpLm strictly never classifies as thumbs_down');

  // 2. Exact test case for live webcam bug: thumb up with prominent index knuckle
  // Knuckle at y=0.5, but finger folded into fist with tip at y=0.68
  const knuckleBugLm = createBaseHand();
  knuckleBugLm[0] = { x: 0.5, y: 0.7 };
  knuckleBugLm[2] = { x: 0.35, y: 0.45 }; knuckleBugLm[4] = { x: 0.35, y: 0.18 }; // thumb tip high
  knuckleBugLm[5] = { x: 0.45, y: 0.5 }; knuckleBugLm[6] = { x: 0.45, y: 0.55 }; knuckleBugLm[8] = { x: 0.45, y: 0.68 }; // index folded
  knuckleBugLm[9] = { x: 0.5, y: 0.5 }; knuckleBugLm[10] = { x: 0.5, y: 0.55 }; knuckleBugLm[12] = { x: 0.5, y: 0.68 }; // middle folded
  knuckleBugLm[13] = { x: 0.55, y: 0.5 }; knuckleBugLm[14] = { x: 0.55, y: 0.55 }; knuckleBugLm[16] = { x: 0.55, y: 0.68 }; // ring folded
  knuckleBugLm[17] = { x: 0.6, y: 0.5 }; knuckleBugLm[18] = { x: 0.6, y: 0.55 }; knuckleBugLm[20] = { x: 0.6, y: 0.68 }; // pinky folded

  const bugCheckResult = window.AssistedFiling.detectPostureFromLandmarks(knuckleBugLm);
  assert(bugCheckResult === 'thumbs_up', 'Hand with index knuckle and thumb up classifies as thumbs_up via joint tracking');
  assert(bugCheckResult !== 'two_fingers', 'Hand with index knuckle and thumb up does NOT misdetect as two_fingers');

  // 3. Thumbs down posture: thumb pointing downwards below wrist/palm, 4 fingers folded
  const thumbsDownResult = window.AssistedFiling.detectPostureFromLandmarks(thumbsDownLm);
  assert(thumbsDownResult === 'thumbs_down', 'thumbsDownLm classifies as thumbs_down');
  assert(thumbsDownResult !== 'thumbs_up', 'thumbsDownLm strictly never classifies as thumbs_up');

  // 4. 2 Fingers: index and middle extended, ring and pinky folded, thumb folded
  const peaceResult = window.AssistedFiling.detectPostureFromLandmarks(peaceLm);
  assert(peaceResult === 'two_fingers', 'peaceLm classifies as two_fingers');
  assert(peaceResult !== 'thumbs_up', 'peaceLm strictly never classifies as thumbs_up');
  assert(peaceResult !== 'one_finger', 'peaceLm strictly never classifies as one_finger');

  // 5. 1 Finger posture: index extended only
  const pointLm = createBaseHand();
  pointLm[0] = { x: 0.5, y: 0.7 };
  pointLm[2] = { x: 0.35, y: 0.55 }; pointLm[4] = { x: 0.4, y: 0.55 }; // thumb folded
  pointLm[5] = { x: 0.42, y: 0.5 }; pointLm[6] = { x: 0.42, y: 0.42 }; pointLm[8] = { x: 0.4, y: 0.2 }; // index extended
  pointLm[9] = { x: 0.52, y: 0.5 }; pointLm[10] = { x: 0.52, y: 0.55 }; pointLm[12] = { x: 0.52, y: 0.68 }; // middle folded
  pointLm[13] = { x: 0.58, y: 0.5 }; pointLm[14] = { x: 0.58, y: 0.55 }; pointLm[16] = { x: 0.58, y: 0.68 }; // ring folded
  pointLm[17] = { x: 0.64, y: 0.5 }; pointLm[18] = { x: 0.64, y: 0.55 }; pointLm[20] = { x: 0.64, y: 0.68 }; // pinky folded

  const pointResult = window.AssistedFiling.detectPostureFromLandmarks(pointLm);
  assert(pointResult === 'one_finger', 'Single pointing index finger classifies as one_finger');
  assert(pointResult !== 'two_fingers', 'Single pointing index finger strictly never classifies as two_fingers');

  // 6. 3 Fingers posture: index + middle + ring extended, pinky & thumb curled
  const threeResult = window.AssistedFiling.detectPostureFromLandmarks(threeFingersLm);
  assert(threeResult === 'three_fingers', 'threeFingersLm classifies as three_fingers');
  assert(threeResult !== 'two_fingers', 'threeFingersLm strictly never classifies as two_fingers');
  assert(threeResult !== 'four_fingers', 'threeFingersLm strictly never classifies as four_fingers');

  // 7. 4 Fingers posture vs Open Palm
  const fourResult = window.AssistedFiling.detectPostureFromLandmarks(fourFingerTestLm);
  assert(fourResult === 'four_fingers', 'fourFingerTestLm classifies as four_fingers');
  assert(fourResult !== 'open_palm', 'fourFingerTestLm with thumb folded strictly never classifies as open_palm');

  const openResult = window.AssistedFiling.detectPostureFromLandmarks(openPalmLm);
  assert(openResult === null, 'openPalmLm with thumb extended outward evaluates to null (neutral/idle)');
  assert(openResult !== 'four_fingers', 'openPalmLm strictly never classifies as four_fingers');

  console.log('\n--- 26. TEMPORAL POSTURE SMOOTHING & HOLD NOISE TOLERANCE ---');
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.gestureHoldDurationMs = 0;
  window.AssistedFiling.state.lastActivePosture = null;

  // Frame 1: Thumbs Up
  const f1 = window.AssistedFiling.analyzeHandLandmarks(thumbsUpLm, 60000);
  assert(f1.detected === true && f1.gesture === 'thumbs_up', 'Frame 1 initiates thumbs up hold');
  const initialStartTime = window.AssistedFiling.state.gestureHoldStartTime;
  assert(initialStartTime === 60000, 'Hold start time recorded at 60000');

  // Frame 2: 1-frame camera noise / tracking drop (null posture)
  const noiseLm = createBaseHand(); // all points flat 0.5 -> null posture
  const f2 = window.AssistedFiling.analyzeHandLandmarks(noiseLm, 60050);
  assert(window.AssistedFiling.state.gestureHoldStartTime === initialStartTime, 'Single-frame noise does not discard active thumbs up hold');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 50, 'Hold duration advances through single-frame noise');

  // Frame 3: Thumbs Up resumes
  const f3 = window.AssistedFiling.analyzeHandLandmarks(thumbsUpLm, 60100);
  assert(window.AssistedFiling.state.gestureHoldStartTime === initialStartTime, 'Hold remains continuous after single-frame noise');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 100, 'Hold duration accumulated to 100ms');

  // Hand removed completely (null landmark array) -> immediate hold reset
  window.AssistedFiling.analyzeHandLandmarks(null, 60200);
  assert(window.AssistedFiling.state.gestureHoldStartTime === null, 'Hand removal (null landmarks) immediately resets hold');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 0, 'Hold duration reset to 0 upon hand loss');

  console.log('\n--- 27. MEDIAPIPE TEARDOWN & OFFLINE RAW PIXEL FALLBACK ---');
  // Teardown with MediaPipe active
  window.AssistedFiling.stopGestureRecognition();
  assert(MockMediaPipeHands.lastInstance.closed === true, 'stopGestureRecognition calls mediaPipeHands.close()');
  assert(window.AssistedFiling.state.isMediaPipeActive === false, 'isMediaPipeActive set to false on teardown');
  assert(window.AssistedFiling.state.mediaPipeHands === null, 'mediaPipeHands reference cleared to null');

  // Offline / CDN Unavailable Fallback: window.Hands is undefined
  window.Hands = undefined;
  const offlineStart = await window.AssistedFiling.startGestureRecognition();
  assert(offlineStart === true, 'startGestureRecognition succeeds when window.Hands is undefined (graceful offline fallback)');
  assert(window.AssistedFiling.state.isGestureActive === true, 'Gesture navigation active in offline mode');
  assert(window.AssistedFiling.state.isMediaPipeActive === false, 'isMediaPipeActive remains false in offline mode');
  assert(window.AssistedFiling.state.mediaPipeHands === null, 'mediaPipeHands remains null in offline mode');

  // Verify raw pixel frame analysis still works seamlessly in offline mode
  const offlineFrameAnalysis = window.AssistedFiling.analyzeFrameData(blueGloveFrame, 65000);
  assert(offlineFrameAnalysis.detected === true, 'Raw pixel frame analysis functions properly in offline fallback mode');

  window.AssistedFiling.stopGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === false, 'Offline gesture recognition cleanly stopped');

  console.log('\n--- 28. COMPLETE EXCLUSION OF DYNAMIC MOTION GESTURES ---');
  // 28.1 Fast rightward lateral motion does not trigger wave_right or any motion gesture
  for (let t = 0; t <= 400; t += 100) {
    const stationaryH = createBaseHand();
    stationaryH[0] = { x: 0.5, y: 0.5 };
    stationaryH[5] = { x: 0.5, y: 0.45 };
    stationaryH[17] = { x: 0.5, y: 0.55 };
    window.AssistedFiling.analyzeHandLandmarks(stationaryH, 70000 + t);
  }
  const fastSwipeH = createBaseHand();
  fastSwipeH[0] = { x: 0.68, y: 0.5 };
  fastSwipeH[5] = { x: 0.68, y: 0.45 };
  fastSwipeH[17] = { x: 0.68, y: 0.55 };
  const swipeAfterStationary = window.AssistedFiling.analyzeHandLandmarks(fastSwipeH, 70500);
  assert(swipeAfterStationary.gesture !== 'wave_right' && swipeAfterStationary.motion !== true, 'Fast lateral hand motion strictly never triggers wave_right');

  // 28.2 Fast leftward lateral motion does not trigger wave_left or any motion gesture
  for (let t = 0; t <= 300; t += 100) {
    const stationaryLeft = createBaseHand();
    stationaryLeft[0] = { x: 0.55, y: 0.5 };
    stationaryLeft[5] = { x: 0.55, y: 0.45 };
    stationaryLeft[17] = { x: 0.55, y: 0.55 };
    window.AssistedFiling.analyzeHandLandmarks(stationaryLeft, 70600 + t);
  }
  const fastSwipeLeftH = createBaseHand();
  fastSwipeLeftH[0] = { x: 0.22, y: 0.5 };
  fastSwipeLeftH[5] = { x: 0.22, y: 0.45 };
  fastSwipeLeftH[17] = { x: 0.22, y: 0.55 };
  const swipeLeftAfterStationary = window.AssistedFiling.analyzeHandLandmarks(fastSwipeLeftH, 70950);
  assert(swipeLeftAfterStationary.gesture !== 'wave_left' && swipeLeftAfterStationary.motion !== true, 'Fast leftward hand motion strictly never triggers wave_left');

  // 28.3 Fast downward vertical motion does not trigger hand_move_down or any motion gesture
  for (let t = 0; t <= 300; t += 100) {
    const stationaryV = createBaseHand();
    stationaryV[0] = { x: 0.5, y: 0.3 };
    stationaryV[5] = { x: 0.5, y: 0.25 };
    stationaryV[17] = { x: 0.5, y: 0.35 };
    window.AssistedFiling.analyzeHandLandmarks(stationaryV, 71000 + t);
  }
  const fastMoveDownH = createBaseHand();
  fastMoveDownH[0] = { x: 0.5, y: 0.48 };
  fastMoveDownH[5] = { x: 0.5, y: 0.43 };
  fastMoveDownH[17] = { x: 0.5, y: 0.53 };
  const moveDownAfterStationary = window.AssistedFiling.analyzeHandLandmarks(fastMoveDownH, 71400);
  assert(moveDownAfterStationary.gesture !== 'hand_move_down' && moveDownAfterStationary.motion !== true, 'Fast vertical hand motion strictly never triggers hand_move_down');

  // 28.4 Fast upward vertical motion does not trigger hand_move_up or any motion gesture
  for (let t = 0; t <= 300; t += 100) {
    const stationaryUp = createBaseHand();
    stationaryUp[0] = { x: 0.5, y: 0.65 };
    stationaryUp[5] = { x: 0.5, y: 0.6 };
    stationaryUp[17] = { x: 0.5, y: 0.7 };
    window.AssistedFiling.analyzeHandLandmarks(stationaryUp, 71500 + t);
  }
  const fastMoveUpH = createBaseHand();
  fastMoveUpH[0] = { x: 0.5, y: 0.28 };
  fastMoveUpH[5] = { x: 0.5, y: 0.23 };
  fastMoveUpH[17] = { x: 0.5, y: 0.33 };
  const moveUpAfterStationary = window.AssistedFiling.analyzeHandLandmarks(fastMoveUpH, 71900);
  assert(moveUpAfterStationary.gesture !== 'hand_move_up' && moveUpAfterStationary.motion !== true, 'Fast upward hand motion strictly never triggers hand_move_up');

  // 28.5 GESTURE_MAP verification: strictly contains 7 active postures and excludes 4 legacy motions
  const gMap = window.AssistedFiling.GESTURE_MAP;
  assert(gMap !== undefined && typeof gMap === 'object', 'AssistedFiling.GESTURE_MAP is defined');
  assert(!('wave_right' in gMap), 'GESTURE_MAP strictly excludes wave_right');
  assert(!('wave_left' in gMap), 'GESTURE_MAP strictly excludes wave_left');
  assert(!('hand_move_down' in gMap), 'GESTURE_MAP strictly excludes hand_move_down');
  assert(!('hand_move_up' in gMap), 'GESTURE_MAP strictly excludes hand_move_up');
  assert('one_finger' in gMap, 'GESTURE_MAP contains one_finger');
  assert('two_fingers' in gMap, 'GESTURE_MAP contains two_fingers');
  assert('thumbs_up' in gMap, 'GESTURE_MAP contains thumbs_up');
  assert('thumbs_down' in gMap, 'GESTURE_MAP contains thumbs_down');
  assert('three_fingers' in gMap, 'GESTURE_MAP contains three_fingers');
  assert('four_fingers' in gMap, 'GESTURE_MAP contains four_fingers');
  assert(!('open_palm' in gMap), 'GESTURE_MAP strictly excludes open_palm');
  const procOpenPalm = window.AssistedFiling.processGesture('open_palm');
  assert(procOpenPalm.handled === false && procOpenPalm.error === 'unknown_gesture', 'open_palm is rejected as unknown_gesture');

  // 28.6 trackCentroidMotion removal verification
  assert(window.AssistedFiling.trackCentroidMotion === undefined, 'trackCentroidMotion is removed from AssistedFiling');

  // 28.7 Direct processGesture checks for all 4 deprecated motion gestures and variants
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  const procWaveRight = window.AssistedFiling.processGesture('wave_right');
  assert(procWaveRight.handled === false && procWaveRight.error === 'unknown_gesture', 'wave_right is rejected as unknown_gesture');
  const procWaveLeft = window.AssistedFiling.processGesture('wave_left');
  assert(procWaveLeft.handled === false && procWaveLeft.error === 'unknown_gesture', 'wave_left is rejected as unknown_gesture');
  const procMoveDown = window.AssistedFiling.processGesture('hand_move_down');
  assert(procMoveDown.handled === false && procMoveDown.error === 'unknown_gesture', 'hand_move_down is rejected as unknown_gesture');
  const procMoveUp = window.AssistedFiling.processGesture('hand_move_up');
  assert(procMoveUp.handled === false && procMoveUp.error === 'unknown_gesture', 'hand_move_up is rejected as unknown_gesture');

  // Variant naming checks
  const procWaveRightUpper = window.AssistedFiling.processGesture('WAVE_RIGHT');
  assert(procWaveRightUpper.handled === false && procWaveRightUpper.error === 'unknown_gesture', 'WAVE_RIGHT is rejected as unknown_gesture');
  const procWaveLeftHyphen = window.AssistedFiling.processGesture('wave-left');
  assert(procWaveLeftHyphen.handled === false && procWaveLeftHyphen.error === 'unknown_gesture', 'wave-left is rejected as unknown_gesture');

  console.log('\n--- 29. ROBUST SKELETAL CLASSIFICATION (GUN GESTURE, 4-FINGER, SIDE VIEW) ---');
  // 29.1 Gun gesture / 3-finger gesture: thumb sticking out laterally, index & middle extended high
  const gunHandLm = createBaseHand();
  gunHandLm[0] = { x: 0.5, y: 0.7 };
  gunHandLm[2] = { x: 0.35, y: 0.55 };
  gunHandLm[4] = { x: 0.15, y: 0.55 }; // thumb tip extended laterally outward to left
  gunHandLm[5] = { x: 0.42, y: 0.5 }; gunHandLm[6] = { x: 0.42, y: 0.42 }; gunHandLm[8] = { x: 0.4, y: 0.2 }; // index ext
  gunHandLm[9] = { x: 0.52, y: 0.5 }; gunHandLm[10] = { x: 0.52, y: 0.42 }; gunHandLm[12] = { x: 0.54, y: 0.2 }; // middle ext
  gunHandLm[13] = { x: 0.58, y: 0.5 }; gunHandLm[14] = { x: 0.58, y: 0.55 }; gunHandLm[16] = { x: 0.58, y: 0.68 }; // ring folded
  gunHandLm[17] = { x: 0.64, y: 0.5 }; gunHandLm[18] = { x: 0.64, y: 0.55 }; gunHandLm[20] = { x: 0.64, y: 0.68 }; // pinky folded
  const gunClassification = window.AssistedFiling.detectPostureFromLandmarks(gunHandLm);
  assert(gunClassification !== 'two_fingers', 'Gun gesture with extended thumb strictly never misdetects as two_fingers');
  assert(gunClassification === null, 'Gun gesture correctly ignored as unmapped posture');

  // 29.2 4-Finger Hand: 4 fingers extended, thumb folded across palm (e.g. number 4)
  const fourFingerLm = createBaseHand();
  fourFingerLm[0] = { x: 0.5, y: 0.75 };
  fourFingerLm[2] = { x: 0.4, y: 0.55 };
  fourFingerLm[4] = { x: 0.55, y: 0.55 }; // thumb curled across palm
  fourFingerLm[5] = { x: 0.4, y: 0.5 }; fourFingerLm[6] = { x: 0.4, y: 0.4 }; fourFingerLm[8] = { x: 0.4, y: 0.2 };
  fourFingerLm[9] = { x: 0.48, y: 0.5 }; fourFingerLm[10] = { x: 0.48, y: 0.4 }; fourFingerLm[12] = { x: 0.48, y: 0.18 };
  fourFingerLm[13] = { x: 0.56, y: 0.5 }; fourFingerLm[14] = { x: 0.56, y: 0.4 }; fourFingerLm[16] = { x: 0.56, y: 0.22 };
  fourFingerLm[17] = { x: 0.64, y: 0.5 }; fourFingerLm[18] = { x: 0.64, y: 0.42 }; fourFingerLm[20] = { x: 0.64, y: 0.25 };
  const fourFingerClassification = window.AssistedFiling.detectPostureFromLandmarks(fourFingerLm);
  assert(fourFingerClassification !== 'open_palm', '4-finger hand with curled thumb strictly never misdetects as open_palm');
  assert(fourFingerClassification === 'four_fingers', '4-finger hand correctly classifies as four_fingers');

  // 29.2b Relaxed 5-Finger Open Hand (Right Hand & Left/Mirrored Hand)
  const rightRelaxedLm = createBaseHand();
  rightRelaxedLm[0] = { x: 0.5, y: 0.75 };
  rightRelaxedLm[2] = { x: 0.35, y: 0.55 }; rightRelaxedLm[4] = { x: 0.26, y: 0.51 }; // relaxed thumb at 45 deg
  rightRelaxedLm[5] = { x: 0.40, y: 0.50 }; rightRelaxedLm[6] = { x: 0.40, y: 0.40 }; rightRelaxedLm[8] = { x: 0.40, y: 0.20 };
  rightRelaxedLm[9] = { x: 0.48, y: 0.50 }; rightRelaxedLm[10] = { x: 0.48, y: 0.40 }; rightRelaxedLm[12] = { x: 0.48, y: 0.18 };
  rightRelaxedLm[13] = { x: 0.56, y: 0.50 }; rightRelaxedLm[14] = { x: 0.56, y: 0.40 }; rightRelaxedLm[16] = { x: 0.56, y: 0.22 };
  rightRelaxedLm[17] = { x: 0.64, y: 0.50 }; rightRelaxedLm[18] = { x: 0.64, y: 0.42 }; rightRelaxedLm[20] = { x: 0.64, y: 0.25 };
  const rightRelaxedClassification = window.AssistedFiling.detectPostureFromLandmarks(rightRelaxedLm);
  assert(rightRelaxedClassification === null, 'Right relaxed 5-finger open hand evaluates to null (neutral/idle)');
  assert(rightRelaxedClassification !== 'four_fingers', 'Right relaxed 5-finger hand strictly never misdetects as four_fingers');

  const leftRelaxedLm = createBaseHand();
  leftRelaxedLm[0] = { x: 0.5, y: 0.75 };
  leftRelaxedLm[5] = { x: 0.60, y: 0.50 }; leftRelaxedLm[6] = { x: 0.60, y: 0.40 }; leftRelaxedLm[8] = { x: 0.60, y: 0.20 };
  leftRelaxedLm[9] = { x: 0.52, y: 0.50 }; leftRelaxedLm[10] = { x: 0.52, y: 0.40 }; leftRelaxedLm[12] = { x: 0.52, y: 0.18 };
  leftRelaxedLm[13] = { x: 0.44, y: 0.50 }; leftRelaxedLm[14] = { x: 0.44, y: 0.40 }; leftRelaxedLm[16] = { x: 0.44, y: 0.22 };
  leftRelaxedLm[17] = { x: 0.36, y: 0.50 }; leftRelaxedLm[18] = { x: 0.36, y: 0.42 }; leftRelaxedLm[20] = { x: 0.36, y: 0.25 };
  leftRelaxedLm[2] = { x: 0.65, y: 0.55 }; leftRelaxedLm[4] = { x: 0.74, y: 0.51 }; // relaxed thumb at right
  const leftRelaxedClassification = window.AssistedFiling.detectPostureFromLandmarks(leftRelaxedLm);
  assert(leftRelaxedClassification === null, 'Left/mirrored relaxed 5-finger open hand evaluates to null (neutral/idle)');
  assert(leftRelaxedClassification !== 'four_fingers', 'Left/mirrored relaxed 5-finger hand strictly never misdetects as four_fingers');

  // 29.3 Side View / Edge-On Thumbs Up (reviewer attack vector)
  const sideThumbsUpLm = createBaseHand();
  sideThumbsUpLm[0] = { x: 0.5, y: 0.7, z: 0 };
  sideThumbsUpLm[2] = { x: 0.45, y: 0.45, z: 0.05 };
  sideThumbsUpLm[4] = { x: 0.45, y: 0.2, z: 0.05 }; // thumb tip extended high
  // Fingers aligned behind each other in depth, curled into fist
  sideThumbsUpLm[5] = { x: 0.5, y: 0.5, z: 0 }; sideThumbsUpLm[6] = { x: 0.5, y: 0.55, z: 0.02 }; sideThumbsUpLm[8] = { x: 0.5, y: 0.65, z: 0.01 };
  sideThumbsUpLm[9] = { x: 0.51, y: 0.5, z: -0.02 }; sideThumbsUpLm[10] = { x: 0.51, y: 0.55, z: -0.01 }; sideThumbsUpLm[12] = { x: 0.51, y: 0.65, z: -0.02 };
  sideThumbsUpLm[13] = { x: 0.52, y: 0.5, z: -0.04 }; sideThumbsUpLm[14] = { x: 0.52, y: 0.55, z: -0.03 }; sideThumbsUpLm[16] = { x: 0.52, y: 0.65, z: -0.04 };
  sideThumbsUpLm[17] = { x: 0.53, y: 0.5, z: -0.06 }; sideThumbsUpLm[18] = { x: 0.53, y: 0.55, z: -0.05 }; sideThumbsUpLm[20] = { x: 0.53, y: 0.65, z: -0.06 };
  const sideThumbsUpRes = window.AssistedFiling.detectPostureFromLandmarks(sideThumbsUpLm);
  assert(sideThumbsUpRes === 'thumbs_up', 'Side view edge-on thumbs up classifies as thumbs_up via 3D knuckle/curl analysis');
  assert(sideThumbsUpRes !== 'two_fingers', 'Side view edge-on thumbs up strictly never misdetects as two_fingers');

  console.log('\n--- 30. THUMBS UP HOLD IMMEDIATE ABORT ON EXPLICIT GESTURE SWITCH ---');
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.gestureHoldDurationMs = 0;

  // Frame A: Thumbs Up initiates hold
  window.AssistedFiling.analyzeHandLandmarks(thumbsUpLm, 80000);
  assert(window.AssistedFiling.state.gestureHoldStartTime === 80000, 'Thumbs up hold active at 80000');

  // Frame B: User deliberately switches to Two Fingers (posture switch)
  window.AssistedFiling.analyzeHandLandmarks(peaceLm, 80050);
  assert(window.AssistedFiling.state.gestureHoldStartTime === null, 'Switching from Thumbs Up to Two Fingers immediately aborts hold timer');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 0, 'Hold duration reset to 0 upon deliberate posture change');

  console.log('\n--- 31. SYNCHRONOUS SEND ERROR RECOVERY & NODE RUNTIME SAFETY ---');
  // Verify that synchronous throw inside mediaPipeHands.send is caught safely without deadlock
  class ThrowingMediaPipeHands {
    send() {
      throw new Error('Simulated synchronous WebGL buffer error');
    }
    close() {}
  }
  window.Hands = ThrowingMediaPipeHands;
  await window.AssistedFiling.startGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === true, 'Gesture recognition initialized with throwing mock');
  window.AssistedFiling.stopGestureRecognition();
  assert(window.AssistedFiling.state.isGestureActive === false, 'Stopped cleanly despite synchronous send errors');

  console.log('\n--- 32. REALISTIC FOLDED THUMB DISAMBIGUATION (LOW THUMB TIP ON PALM) ---');
  // 1 Finger with thumb resting on lower palm below MCP
  const realOneFinger = createBaseHand();
  realOneFinger[0] = { x: 0.5, y: 0.75 };
  realOneFinger[2] = { x: 0.40, y: 0.55 }; realOneFinger[4] = { x: 0.48, y: 0.60 }; // thumb on lower palm
  realOneFinger[5] = { x: 0.42, y: 0.5 }; realOneFinger[6] = { x: 0.42, y: 0.4 }; realOneFinger[8] = { x: 0.42, y: 0.2 }; // index ext
  realOneFinger[9] = { x: 0.50, y: 0.5 }; realOneFinger[10] = { x: 0.50, y: 0.55 }; realOneFinger[12] = { x: 0.50, y: 0.65 }; // middle folded
  realOneFinger[13] = { x: 0.58, y: 0.5 }; realOneFinger[14] = { x: 0.58, y: 0.55 }; realOneFinger[16] = { x: 0.58, y: 0.65 }; // ring folded
  realOneFinger[17] = { x: 0.64, y: 0.5 }; realOneFinger[18] = { x: 0.64, y: 0.55 }; realOneFinger[20] = { x: 0.64, y: 0.65 }; // pinky folded
  const realOneRes = window.AssistedFiling.detectPostureFromLandmarks(realOneFinger);
  assert(realOneRes === 'one_finger', '1 Finger with low folded thumb on palm classifies as one_finger');
  assert(realOneRes !== 'thumbs_down', '1 Finger with low folded thumb strictly never misclassifies as thumbs_down');

  // 2 Fingers with low folded thumb
  const realTwoFingers = createBaseHand();
  realTwoFingers[0] = { x: 0.5, y: 0.75 };
  realTwoFingers[2] = { x: 0.40, y: 0.55 }; realTwoFingers[4] = { x: 0.48, y: 0.60 };
  realTwoFingers[5] = { x: 0.42, y: 0.5 }; realTwoFingers[6] = { x: 0.42, y: 0.4 }; realTwoFingers[8] = { x: 0.42, y: 0.2 };
  realTwoFingers[9] = { x: 0.50, y: 0.5 }; realTwoFingers[10] = { x: 0.50, y: 0.4 }; realTwoFingers[12] = { x: 0.50, y: 0.18 };
  realTwoFingers[13] = { x: 0.58, y: 0.5 }; realTwoFingers[14] = { x: 0.58, y: 0.55 }; realTwoFingers[16] = { x: 0.58, y: 0.65 };
  realTwoFingers[17] = { x: 0.64, y: 0.5 }; realTwoFingers[18] = { x: 0.64, y: 0.55 }; realTwoFingers[20] = { x: 0.64, y: 0.65 };
  const realTwoRes = window.AssistedFiling.detectPostureFromLandmarks(realTwoFingers);
  assert(realTwoRes === 'two_fingers', '2 Fingers with low folded thumb on palm classifies as two_fingers');

  // 3 Fingers with low folded thumb
  const realThreeFingers = createBaseHand();
  realThreeFingers[0] = { x: 0.5, y: 0.75 };
  realThreeFingers[2] = { x: 0.40, y: 0.55 }; realThreeFingers[4] = { x: 0.48, y: 0.60 };
  realThreeFingers[5] = { x: 0.42, y: 0.5 }; realThreeFingers[6] = { x: 0.42, y: 0.4 }; realThreeFingers[8] = { x: 0.42, y: 0.2 };
  realThreeFingers[9] = { x: 0.50, y: 0.5 }; realThreeFingers[10] = { x: 0.50, y: 0.4 }; realThreeFingers[12] = { x: 0.50, y: 0.18 };
  realThreeFingers[13] = { x: 0.58, y: 0.5 }; realThreeFingers[14] = { x: 0.58, y: 0.4 }; realThreeFingers[16] = { x: 0.58, y: 0.22 };
  realThreeFingers[17] = { x: 0.64, y: 0.5 }; realThreeFingers[18] = { x: 0.64, y: 0.55 }; realThreeFingers[20] = { x: 0.64, y: 0.65 };
  const realThreeRes = window.AssistedFiling.detectPostureFromLandmarks(realThreeFingers);
  assert(realThreeRes === 'three_fingers', '3 Fingers with low folded thumb on palm classifies as three_fingers');

  // 4 Fingers with low folded thumb
  const realFourFingers = createBaseHand();
  realFourFingers[0] = { x: 0.5, y: 0.75 };
  realFourFingers[2] = { x: 0.40, y: 0.55 }; realFourFingers[4] = { x: 0.48, y: 0.60 };
  realFourFingers[5] = { x: 0.42, y: 0.5 }; realFourFingers[6] = { x: 0.42, y: 0.4 }; realFourFingers[8] = { x: 0.42, y: 0.2 };
  realFourFingers[9] = { x: 0.50, y: 0.5 }; realFourFingers[10] = { x: 0.50, y: 0.4 }; realFourFingers[12] = { x: 0.50, y: 0.18 };
  realFourFingers[13] = { x: 0.58, y: 0.5 }; realFourFingers[14] = { x: 0.58, y: 0.4 }; realFourFingers[16] = { x: 0.58, y: 0.22 };
  realFourFingers[17] = { x: 0.64, y: 0.5 }; realFourFingers[18] = { x: 0.64, y: 0.42 }; realFourFingers[20] = { x: 0.64, y: 0.25 };
  const realFourRes = window.AssistedFiling.detectPostureFromLandmarks(realFourFingers);
  assert(realFourRes === 'four_fingers', '4 Fingers with low folded thumb on palm classifies as four_fingers');

  console.log('\n--- 33. RAW PIXEL FALLBACK 6-POSTURE CLASSIFICATION & NEUTRAL HAND ---');
  // 1. Raw Thumbs Down
  const rawThumbsDownFrame = createSyntheticFrame(160, 120, (x, y) => {
    if ((x >= 50 && x <= 110 && y >= 30 && y <= 70) || (x >= 70 && x <= 90 && y >= 70 && y <= 115)) {
      return [200, 140, 100, 255];
    }
    return [20, 20, 20, 255];
  });
  const rawThumbsDownAnalysis = window.AssistedFiling.analyzeFrameData(rawThumbsDownFrame, 90000);
  assert(rawThumbsDownAnalysis.detected === true && rawThumbsDownAnalysis.gesture === 'thumbs_down', 'Raw pixel fallback classifies Thumbs Down');

  // 2. Raw Thumbs Up
  const rawThumbsUpFrame = createSyntheticFrame(160, 120, (x, y) => {
    if ((x >= 50 && x <= 110 && y >= 60 && y <= 105) || (x >= 50 && x <= 70 && y >= 25 && y <= 60)) {
      return [200, 140, 100, 255];
    }
    return [20, 20, 20, 255];
  });
  const rawThumbsUpAnalysis = window.AssistedFiling.analyzeFrameData(rawThumbsUpFrame, 91000);
  assert(rawThumbsUpAnalysis.detected === true && rawThumbsUpAnalysis.gesture === 'thumbs_up', 'Raw pixel fallback classifies Thumbs Up');

  // 3. Raw 1 Finger
  const rawOneFingerFrame = createSyntheticFrame(160, 120, (x, y) => {
    if ((x >= 72 && x <= 88 && y >= 25 && y <= 65) || (x >= 60 && x <= 100 && y >= 65 && y <= 105)) {
      return [200, 140, 100, 255];
    }
    return [20, 20, 20, 255];
  });
  const rawOneFingerAnalysis = window.AssistedFiling.analyzeFrameData(rawOneFingerFrame, 92000);
  assert(rawOneFingerAnalysis.detected === true && rawOneFingerAnalysis.gesture === 'one_finger', 'Raw pixel fallback classifies 1 Finger');

  // 4. Raw 2 Fingers
  const rawTwoFingersFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (((x >= 56 && x <= 72) || (x >= 88 && x <= 104)) && y >= 25 && y <= 60) return [200, 140, 100, 255];
    if (x >= 55 && x <= 105 && y >= 60 && y <= 105) return [200, 140, 100, 255];
    return [20, 20, 20, 255];
  });
  const rawTwoFingersAnalysis = window.AssistedFiling.analyzeFrameData(rawTwoFingersFrame, 93000);
  assert(rawTwoFingersAnalysis.detected === true && rawTwoFingersAnalysis.gesture === 'two_fingers', 'Raw pixel fallback classifies 2 Fingers');

  // 5. Raw 3 Fingers
  const rawThreeFingersFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 55 && x <= 96 && y >= 25 && y <= 60) return [200, 140, 100, 255];
    if (x >= 55 && x <= 112 && y >= 60 && y <= 105) return [200, 140, 100, 255];
    return [20, 20, 20, 255];
  });
  const rawThreeFingersAnalysis = window.AssistedFiling.analyzeFrameData(rawThreeFingersFrame, 94000);
  assert(rawThreeFingersAnalysis.detected === true && rawThreeFingersAnalysis.gesture === 'three_fingers', 'Raw pixel fallback classifies 3 Fingers');

  // 6. Raw 4 Fingers
  const rawFourFingersFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 52 && x <= 108 && y >= 25 && y <= 105) return [200, 140, 100, 255];
    return [20, 20, 20, 255];
  });
  const rawFourFingersAnalysis = window.AssistedFiling.analyzeFrameData(rawFourFingersFrame, 95000);
  assert(rawFourFingersAnalysis.detected === true && rawFourFingersAnalysis.gesture === 'four_fingers', 'Raw pixel fallback classifies 4 Fingers');

  // 7. Raw Open Hand (Neutral / Idle)
  const rawOpenPalmFrame = createSyntheticFrame(160, 120, (x, y) => {
    if (x >= 30 && x <= 130 && y >= 30 && y <= 105) return [200, 140, 100, 255];
    return [20, 20, 20, 255];
  });
  const rawOpenPalmAnalysis = window.AssistedFiling.analyzeFrameData(rawOpenPalmFrame, 96000);
  assert(rawOpenPalmAnalysis.detected === true && rawOpenPalmAnalysis.posture === null, 'Raw pixel fallback treats Open Palm / 5 extended fingers as neutral (null posture)');

  console.log('\n--- 34. HUD HOLD PROGRESS EXCLUSIVITY & 4-FINGER 1200MS HOLD IN CAMERA STREAM ---');
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.gestureHoldDurationMs = 0;
  window.AssistedFiling.state.lastActivePosture = null;
  window.AssistedFiling.state.gestureCooldownUntil = 0;

  const holdProgressEl = window.document.getElementById('gestureHoldProgressWrap');

  // Frame 1: Thumbs Up -> hold progress bar MUST NOT be displayed
  window.AssistedFiling.analyzeHandLandmarks(thumbsUpLm, 100000);
  assert(holdProgressEl.style.display === 'none', 'Hold progress bar is NOT displayed during Thumbs Up scroll');

  // Frame 2: Thumbs Down -> hold progress bar MUST NOT be displayed
  window.AssistedFiling.analyzeHandLandmarks(thumbsDownLm, 100500);
  assert(holdProgressEl.style.display === 'none', 'Hold progress bar is NOT displayed during Thumbs Down scroll');

  // Frame 3: 1 Finger -> hold progress bar MUST NOT be displayed
  window.AssistedFiling.analyzeHandLandmarks(oneFingerLm, 101000);
  assert(holdProgressEl.style.display === 'none', 'Hold progress bar is NOT displayed during 1 Finger step navigation');

  // Frame 4: 2 Fingers -> hold progress bar MUST NOT be displayed
  window.AssistedFiling.analyzeHandLandmarks(peaceLm, 101500);
  assert(holdProgressEl.style.display === 'none', 'Hold progress bar is NOT displayed during 2 Fingers step navigation');

  // Frame 5-8: 4 Fingers held across 1200ms in wizard
  window.navigateTo('patent-form');
  window.currentWizardStep = 2;
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.lastActivePosture = null;
  window.AssistedFiling.state.gestureHoldExecuted = false;
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  window.AssistedFiling.cancelDictation();

  // 4 Fingers start (0ms) -> holding, save not yet executed
  const fourF1 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 110000);
  assert(fourF1.result?.handled === false && fourF1.result?.holding === true, '4 Fingers at 0ms is holding, not prematurely saved');

  // 4 Fingers mid-hold (600ms) -> hold progress bar visible at 50%
  const fourF2 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 110600);
  assert(fourF2.result?.handled === false && fourF2.result?.holding === true, '4 Fingers at 600ms still holding');
  assert(holdProgressEl.style.display !== 'none', 'Hold progress bar IS displayed during 4 Fingers hold');
  const percentText = window.document.getElementById('gestureHoldPercent');
  assert(percentText.textContent === '50%', 'Hold progress bar displays 50% at 600ms');

  // 4 Fingers complete (1200ms) -> save executed!
  const fourF3 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 111200);
  assert(fourF3.result?.handled === true && fourF3.result?.action === 'save_draft', '4 Fingers at 1200ms executes save draft in camera loop');

  // 4 Fingers continuous held (1300ms) -> throttled
  const fourF4 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 111300);
  assert(fourF4.result?.handled === false && fourF4.result?.alreadyExecuted === true, '4 Fingers continuous hold throttled in camera loop');

  console.log('\n--- 35. 5 EXTENDED FINGERS (OPEN HAND) IN CAMERA STREAM TREATED AS NEUTRAL / IDLE (ZERO ACTIONS) ---');
  window.navigateTo('patent-form');
  window.currentWizardStep = 2;
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.lastActivePosture = null;
  window.AssistedFiling.state.gestureHoldExecuted = false;
  window.AssistedFiling.state.gestureCooldownUntil = 0;
  window.AssistedFiling.cancelDictation();
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation initially inactive');

  // Frame 1 (120000): 5 extended fingers shown in camera stream -> neutral / idle, zero actions
  const palmF1 = window.AssistedFiling.analyzeHandLandmarks(openPalmLm, 120000);
  assert(palmF1.detected === true, 'Camera Frame 1: Hand detected');
  assert(palmF1.posture === null, 'Camera Frame 1: Posture is null (neutral/idle)');
  assert(palmF1.result === undefined, 'Camera Frame 1: Zero actions triggered by open hand');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false');

  // Frame 2 (120500): Continuously holding 5 extended fingers at 500ms -> remains neutral / idle
  const palmF2 = window.AssistedFiling.analyzeHandLandmarks(openPalmLm, 120500);
  assert(palmF2.detected === true, 'Camera Frame 2: Hand detected');
  assert(palmF2.posture === null, 'Camera Frame 2: Posture remains null');
  assert(palmF2.result === undefined, 'Camera Frame 2: Zero actions triggered during continuous hold');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false during continuous open hand');

  // Frame 3 (121500): Continuously holding 5 extended fingers past 1200ms -> zero actions
  const palmF3 = window.AssistedFiling.analyzeHandLandmarks(openPalmLm, 121500);
  assert(palmF3.detected === true, 'Camera Frame 3: Hand detected');
  assert(palmF3.posture === null, 'Camera Frame 3: Posture remains null');
  assert(palmF3.result === undefined, 'Camera Frame 3: Continues to trigger zero actions past cooldown');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false past cooldown');

  // Frame 4 (122000): User lowers hand (hand removed from camera frame)
  window.AssistedFiling.analyzeHandLandmarks(null, 122000);
  assert(window.AssistedFiling.state.lastActivePosture === null, 'Hand removal clears active posture');
  assert(window.AssistedFiling.state.gestureHoldExecuted === false, 'Hand removal resets gestureHoldExecuted');
  assert(window.AssistedFiling.state.isDictating === false, 'Dictation remains inactive after lowering hand');

  // Frame 5 (123000): User shows 5 extended fingers AGAIN -> still neutral / idle, zero actions
  const palmF5 = window.AssistedFiling.analyzeHandLandmarks(openPalmLm, 123000);
  assert(palmF5.detected === true, 'Camera Frame 5: Hand detected');
  assert(palmF5.posture === null, 'Camera Frame 5: Posture is null on second exposure');
  assert(palmF5.result === undefined, 'Camera Frame 5: Re-exposure of 5 extended fingers triggers zero actions');
  assert(window.AssistedFiling.state.isDictating === false, 'isDictating remains false');

  // Frame 6 (123500): Extended hold of 5 extended fingers maintains step and form state unchanged
  const palmF6 = window.AssistedFiling.analyzeHandLandmarks(openPalmLm, 123500);
  assert(palmF6.result === undefined, 'Frame 6 triggers zero actions');
  assert(window.currentWizardStep === 2, 'Wizard step unchanged at Step 2');
  const reviewModal35 = window.document.getElementById('dictationReviewModal');
  assert(reviewModal35?.style.display === 'none', 'Dictation review modal remains closed');

  console.log('\n--- 36. 4-FINGER HOLD RAPID TRANSITION TO RELAXED OPEN HAND (HOLD ABORT) ---');
  window.AssistedFiling.state.postureBuffer = [];
  window.AssistedFiling.state.gestureHoldStartTime = null;
  window.AssistedFiling.state.gestureHoldDurationMs = 0;
  window.AssistedFiling.state.lastActivePosture = null;
  window.AssistedFiling.state.gestureHoldExecuted = false;
  window.AssistedFiling.state.gestureCooldownUntil = 0;

  // Frame 1 (130000ms): User presents 4 Fingers to begin save draft hold
  const holdF1 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 130000);
  assert(holdF1.detected === true, 'Hold start: 4 fingers detected');
  assert(window.AssistedFiling.state.lastActivePosture === 'four_fingers', 'Active posture is four_fingers');
  assert(window.AssistedFiling.state.gestureHoldStartTime === 130000, 'Hold timer initiated at 130000ms');

  // Frame 2 (130600ms): Hold progress reaches 600ms (50% progress)
  const holdF2 = window.AssistedFiling.analyzeHandLandmarks(fourFingerTestLm, 130600);
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 600, 'Hold duration at 600ms');
  assert(window.AssistedFiling.state.gestureHoldExecuted === false, 'Draft not prematurely saved at 600ms');
  const holdWrapEl = window.document.getElementById('gestureHoldProgressWrap');
  assert(holdWrapEl.style.display === 'block', 'Hold progress wrap visible at 600ms');

  // Frame 3 (130700ms): User relaxes hand into 5 extended fingers (relaxed open hand)
  const abortF1 = window.AssistedFiling.analyzeHandLandmarks(rightRelaxedLm, 130700);
  assert(abortF1.detected === true, 'Relaxed hand detected in frame 3');

  // Frame 4 (130750ms): Second consecutive frame of relaxed open hand -> hold immediately cancelled
  const abortF2 = window.AssistedFiling.analyzeHandLandmarks(rightRelaxedLm, 130750);
  assert(window.AssistedFiling.state.gestureHoldStartTime === null, 'Hold timer immediately cancelled upon relaxing to 5 fingers');
  assert(window.AssistedFiling.state.gestureHoldDurationMs === 0, 'Hold duration reset to 0');
  assert(window.AssistedFiling.state.lastActivePosture === null, 'Last active posture cleared to null');
  assert(holdWrapEl.style.display === 'none', 'Hold progress wrap hidden upon hold cancellation');

  // Frame 5 (131500ms): Past original 1200ms mark, user continues showing relaxed hand
  const abortF3 = window.AssistedFiling.analyzeHandLandmarks(rightRelaxedLm, 131500);
  assert(abortF3.result === undefined, 'Zero actions triggered past original 1200ms deadline');
  assert(window.AssistedFiling.state.gestureHoldExecuted === false, 'Draft save safely blocked: zero accidental draft saved');

  console.log('====================================================');
  console.log(`GESTURE TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================');

  process.exit(failCount > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
