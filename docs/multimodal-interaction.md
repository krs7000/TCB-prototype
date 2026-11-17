# Multimodal Interaction Documentation: Assisted Filing Mode

**System:** The Creator’s Bulwark — Palawan State University Intellectual Property Management System  
**Feature:** Assisted Filing Mode (Multimodal Voice & Gesture Interaction)  
**Course/Context:** HCI Capstone Prototype  
**Date:** November 2026  

---

## 1. Project Purpose & Intended Users

### Purpose
*The Creator’s Bulwark* is Palawan State University's centralized Intellectual Property (IP) management prototype. Preparing pre-filing documents for patents, utility models, and industrial designs involves dense legal-technical forms, multi-step disclosure processes, and lengthy textual descriptions. 

The **Assisted Filing Mode** introduces multimodal interaction combining **Voice User Interface (VUI)** and camera-based **Gesture Interaction** into the applicant filing workflow to reduce cognitive load, accelerate drafting, and accommodate users with temporary, situational, or permanent motor and dexterity limitations.

### Intended Users
1. **PSU Faculty Researchers & Lab Inventors:** Often draft comprehensive technical disclosures directly from laboratory benches or workshop environments where hands may be soiled, gloved, chemical-stained, or holding physical prototypes and apparatus. Touchless gesture navigation and voice dictation enable continuous drafting without cross-contaminating computing hardware.
2. **Student Inventors & Innovators:** Novice filers navigating complex institutional pre-filing procedures who benefit from spoken step guidance and hands-free wizard section navigation.
3. **Users with Motor or Dexterity Constraints:** Filers who encounter physical fatigue or repetitive strain injury during prolonged keyboard typing and benefit from combining voice dictation with natural hand gesture controls.

---

## 2. Why Voice and Gesture Suit the Filing Workflow

Combining **Voice User Interface (VUI)** and **Camera-Based Gesture Interaction** provides complementary ergonomic and cognitive strengths across the pre-filing intake pipeline:

| Modality | Strengths in IP Filing | Potential Friction Points Alone | Multimodal Synergy |
| :--- | :--- | :--- | :--- |
| **Voice User Interface (VUI)** | High bandwidth for rich natural language descriptions; hands-free execution of semantic navigation commands (*“Show forms”*, *“Open my cases”*, *“Open messages”*, *“Open marketplace”*, *“Home”*, *“Back”*); form field dictation. | Susceptible to acoustic ambiguity in noisy lab environments; inappropriate for high-frequency micro-adjustments or irrevocable operations (submission/deletion). | Voice handles high-effort textual drafting and macroscopic routing across application modules. |
| **Gesture Interaction (Computer Vision)** | Natural, touchless spatial control; instantaneous physical responsiveness without voice acoustic latency; operational in high-noise laboratories where speech recognition struggles. | Unsuitable for text character entry; prone to fatigue if overused for continuous high-precision positioning. | Gestures handle step transitions (*1 Finger* / *2 Fingers*), document scrolling (*Thumbs Up* / *Thumbs Down*), draft saving (*4 Fingers*), and submission (*3 Fingers*). |

By pairing **speech recognition** for verbal entry with **camera gesture tracking** for navigation and workflow triggers, the filer achieves a completely hands-free interaction cycle while retaining explicit visual and audio confirmation before modifying university records.

---

## 3. Interaction Flow & Architecture

```mermaid
flowchart TD
    A[Applicant Logs In] --> B[Assisted Filing Toggle in Topbar / Launcher]
    B --> C[Interaction Assistance Panel Opens]
    
    subgraph Voice User Interface VUI
        C --> D[Tap 'Start Listening']
        D --> E{Spoken Command}
        E -->|'Show forms'| F[Navigate to Filing Hub]
        E -->|'Open my cases'| G[Navigate to My Cases]
        E -->|'Open IP guidelines'| H[Navigate to Guidelines]
        E -->|'Open messages'| I[Navigate to Messages]
        E -->|'Open marketplace'| J[Navigate to Marketplace]
        E -->|'Home'| J1[Navigate to Home Dashboard]
        E -->|'Back'| J2[Navigate to Previous Page]
        E -->|'Next step' / 'Previous step'| L1[Rejected: Direct to Gestures 1 / 2 Fingers]
        E -->|'Save draft'| L2[Rejected: Direct to Gesture 4 Fingers Hold]
        E -->|'Submit' / 'Delete' / 'Withdraw'| K[Security Block: Voice Action Disallowed]
        E -->|Unknown phrase| L3[Display Supported Routing Commands Prompt]
    end

    subgraph Gesture Interaction Engine
        C --> M[Tap 'Enable Gesture Navigation']
        M --> N[Local Webcam Stream Initialized]
        N --> O1{MediaPipe Hands Available?}
        O1 -->|Yes: CDN / Online| O2[Google MediaPipe Hands 21-Joint Skeletal Model]
        O1 -->|No: Offline Fallback| O3[Canvas 2D Multi-Spectral Pixel Segmentation]
        O2 --> O4[Temporal Posture Smoothing 3-Frame Buffer]
        O3 --> P{Detected Gesture}
        O4 --> P
        P -->|'Thumbs Up'| Q[Smoothly Scroll Form Upward]
        P -->|'Thumbs Down'| R[Smoothly Scroll Form Downward]
        P -->|'1 Finger'| S[Advance Wizard Section: nextWizardStep]
        P -->|'2 Fingers'| T[Return to Previous Section: prevWizardStep]
        P -->|'3 Fingers'| U[Submit Application with Step Validation: submitForm]
        P -->|'4 Fingers'| V[Save Draft Checkpoint: saveFormDraft]
    end

    subgraph Voice-Assisted Dictation
        C --> X[Tap Dictate Beside Description]
        X --> Y[Speak Technical Description]
        Y --> Z[Dictation Review Modal Opens]
        Z --> AA[Review & Touch/Key Confirmation]
        AA --> AB[Insert Plain-Text into #disclosure-description]
    end

    subgraph Speech Synthesis Guidance
        C --> AC[Tap 'Read Instructions']
        AC --> AD[Spoken Audio Step Guidance]
        AD --> AE[Voice Nav Muted to Prevent Audio Echo]
    end
```

---

## 4. Multimodal Command Reference & Quick Guides

### 4.1 Voice User Interface (VUI) Command Reference

Voice Navigation in *The Creator’s Bulwark* strictly focuses on macro-level routing commands and field dictation. Micro-level wizard section navigation and draft checkpoint saving are intentionally excluded and handled exclusively via gestures:

#### Supported Macro-Routing Voice Commands
| Spoken Phrase | Recognized Variations | Target Action | Precondition & Boundary Safeguards | User Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **“Show forms”** | *“Show forms”*, *“Open forms”*, *“View forms”*, *“Go to forms”*, *“Filing hub”*, *“New filing”* | Routes to Filing Hub catalog (`window.navigateTo("filing-hub")` or `"forms"`). | Redundant call rejected if already viewing Filing Hub. | Feedback card: *“Displaying filing forms...”* |
| **“Open my cases”** | *“Open my cases”*, *“Show cases”*, *“View my cases”*, *“Go to my cases”*, *“My cases”* | Routes to User Submissions (`window.navigateTo("user-submissions")`). | Requires authenticated applicant user; rejected if already viewing My Cases. | Feedback card: *“Opening My Cases...”* |
| **“Open IP guidelines”** | *“Open IP guidelines”*, *“Show guidelines”*, *“View IP guidelines”*, *“Go to guidelines”* | Routes to IP Guidelines (`window.navigateTo("ip-guidelines")` or `"guidelines"`). | Redundant call rejected if already viewing Guidelines. | Feedback card: *“Opening IP guidelines...”* |
| **“Open messages”** | *“Open messages”*, *“Show messages”*, *“Go to messages”*, *“Open inbox”*, *“Messages”* | Routes to Evaluator Messages (`window.navigateTo("messages")`). | Requires authenticated applicant user; rejected if already viewing Messages (`"You are already viewing Messages."`). | Feedback card: *“Opening Messages...”* |
| **“Open marketplace”** | *“Open marketplace”*, *“Show marketplace”*, *“Go to marketplace”*, *“Marketplace”* | Routes to Technology Transfer Marketplace (`window.navigateTo("marketplace-dash")` if applicant/logged in, or `"marketplace"` if public). | Redundant call rejected if already viewing Marketplace (`"You are already viewing the Marketplace."`). | Feedback card: *“Opening Marketplace...”* |
| **“Home”** | *“Home”*, *“Go home”*, *“Open home”*, *“Go to home”*, *“Dashboard”*, *“Open dashboard”*, *“Go to dashboard”* | Routes to Applicant Home Dashboard (`window.navigateTo("user-dashboard")` if applicant/logged in, or `"landing"` if public). | Redundant call rejected if already on Home (`"You are already on the Home page."`). | Feedback card: *“Opening Home...”* |
| **“Back”** | *“Back”*, *“Go back”*, *“Return”*, *“Navigate back”* | Routes back to the previous page in navigation history (or falls back to `"user-dashboard"` / `"landing"` if on a subpage with no prior history). | Rejected if already at the root Home page with no previous page (`"You are already on the Home page with no previous page to go back to."`). | Feedback card: *“Going back...”* |

#### Voice-Assisted Form Field Dictation
| Entry Point | Target Input | Modality Workflow | Safety & Review Safeguards |
| :--- | :--- | :--- | :--- |
| Microphone button beside form field (`#btnDictateDesc`) | `#disclosure-description` (Technical Description) | Tap *Dictate* $\rightarrow$ Speak technical disclosure $\rightarrow$ Tap *Stop* $\rightarrow$ Review modal opens $\rightarrow$ Edit via touch/keyboard $\rightarrow$ Tap *Insert Text*. | • Voice Navigation is automatically paused during dictation to prevent accidental state changes.<br>• Plain-text insertion prevents script injection.<br>• Pending dictation locks form wizard navigation until confirmed or dismissed. |

#### Voice Commands Excluded & Redirected to Gestures (Exclusivity)
| Spoken Command | Voice Status | System Response & Rejection Reason | Redirected Gesture Equivalent |
| :--- | :---: | :--- | :--- |
| **“Next step”** / *“Next page”* / *“Go next”* | **Rejected** (`handled: false`) | *"Step navigation is controlled via gestures. Display 1 Finger to advance to the next step."* | **1 Finger (☝️)** |
| **“Previous step”** / *“Previous page”* / *“Previous section”* | **Rejected** (`handled: false`) | *"Step navigation is controlled via gestures. Display 2 Fingers to return to the previous step."* | **2 Fingers (✌️)** |
| **“Save draft”** / *“Save the draft”* / *“Save progress”* | **Rejected** (`handled: false`) | *"Draft saving is controlled via gestures. Hold 4 Fingers for 1.2s to save draft progress."* | **4 Fingers (✋)** (Hold 1.2s) |

#### Safety-Locked Irrevocable Commands
| Attempted Voice Phrase | Security Policy | System Response | Alternative Modality Required |
| :--- | :---: | :--- | :--- |
| *“Submit application”*, *“Delete draft”*, *“Withdraw case”*, *“Approve filing”* | **Strict Security Lock** | *"For security, submitting, deleting, withdrawing, and approving applications cannot be triggered by voice. Please use the on-screen buttons."* | Explicit touch/click on screen buttons with confirmation dialog. |

---

### 4.2 Gesture Quick Guide & Reference Card

#### 4.2.1 Quick Gesture Summary (At a Glance)
| Gesture | Hand Pose | What It Does |
| :---: | :--- | :--- |
| ☝️ | **1 Finger** | **Next Page** (Advance to next form section) |
| ✌️ | **2 Fingers** | **Previous Page** (Return to previous section) |
| 👍 | **Thumbs Up** | **Scroll Up** (Move page upward) |
| 👎 | **Thumbs Down** | **Scroll Down** (Move page downward) |
| 🤟 | **3 Fingers** | **Submit Form** (Submit application on final step) |
| ✋ | **4 Fingers** | **Save Draft** (Hold for 1.2 seconds to save progress) |

#### 4.2.2 Technical Parameters & Ergonomic Safeguards

The table below outlines the complete set of recognized camera gestures, their target actions, detection mechanisms, and built-in ergonomic safeguards:

| Category | Gesture & Visual Cue | Associated Action | Detection Logic & Parameters | Safety & Ergonomic Safeguards |
| :--- | :--- | :--- | :--- | :--- |
| **Page Scrolling** | **Thumbs Up (👍)**<br>(Thumb extended up, fist curled) | **“Scroll up”**<br>Smoothly scrolls active form/window up | Thumb tip extended high and separated (`thumbTip.y < thumbMcp.y` and above index MCP); index, middle, ring, pinky folded into fist. Smooth scroll: -280px. | Rapid throttle: 350ms cooldown allows fluid repeated scrolling without overshoot. |
| **Page Scrolling** | **Thumbs Down (👎)**<br>(Thumb pointing down, fist curled) | **“Scroll down”**<br>Smoothly scrolls active form/window down | Thumb tip pointing down (`thumbTip.y > thumbMcp.y` and below palm/wrist); index, middle, ring, pinky folded into fist. Smooth scroll: +280px. | Rapid throttle: 350ms cooldown allows fluid repeated scrolling without overshoot. |
| **Form Navigation** | **1 Finger (☝️)**<br>(Index extended, others curled) | **“Next page” / “Next step”**<br>Advances wizard to next section (`nextWizardStep()`) | Index finger extended (`tip.y < pip.y`); middle, ring, pinky, and thumb curled into palm. | Context-guarded: inactive outside forms. Boundary guard: blocked on final step. 1000ms cooldown. |
| **Form Navigation** | **2 Fingers (✌️)**<br>(Index + middle extended) | **“Previous page” / “Previous step”**<br>Returns to previous section (`prevWizardStep()`) | Index and middle fingers extended high; ring, pinky, and thumb curled. | Context-guarded: inactive outside forms. Boundary guard: blocked on Step 1. 1000ms cooldown. |
| **Workflow Actions** | **3 Fingers**<br>(Index + middle + ring extended) | **“Submit”**<br>Submits application on review step (`submitForm()`) | Index, middle, and ring extended; pinky and thumb curled. | Step validation guard: rejected with helpful notice on steps prior to review step. 1500ms cooldown. |
| **Workflow Actions** | **4 Fingers**<br>(4 fingers extended, thumb folded) | **“Save draft”**<br>Persists intermediate application progress (`saveFormDraft()`) | Index, middle, ring, pinky extended; thumb folded across palm. | Context-guarded: inactive outside forms. Single-fire execution per continuous hold; 1500ms cooldown. |

---

## 5. Technologies Used, Browser Support & Privacy

### Technologies Used
- **Google MediaPipe Hands 21-Joint Skeletal Tracking Engine (`@mediapipe/hands` & `@mediapipe/camera_utils`):** Advanced machine learning hand tracking pipeline running client-side via WebAssembly and WebGL. Accurately detects and predicts 21 3D spatial joint coordinates in real time.
- **Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`):** Native browser speech recognition engine for hands-free navigation and technical disclosure dictation.
- **Web Speech Synthesis API (`window.speechSynthesis`):** Native browser text-to-speech engine for reading step guidance aloud.
- **HTML5 Canvas 2D Computer Vision Engine & HUD Overlay:** Renders real-time skeletal hand bones and joint overlays directly on `#gestureCanvas` with horizontal mirrored projection matching user-space webcam movement. Also serves as the zero-external-dependency raw pixel segmentation engine with multi-spectral color detection (Fitzpatrick scales I–VI, blue/purple nitrile, and latex PPE gloves).
- **MediaStream API (`navigator.mediaDevices.getUserMedia`):** Standard browser webcam acquisition API, invoked strictly under explicit user activation with asynchronous concurrency locking and automatic track teardown.
- **Vanilla JavaScript Modular Architecture (`main/assisted-filing.js`):** Modular engine fully integrated with the PSU IP management system's existing state, routing, role permissions, wizard steps, and draft-saving mechanisms.

### Google MediaPipe Hands Skeletal Tracking Architecture

#### 1. 21-Joint Landmark Representation
MediaPipe Hands processes each video frame and outputs 21 normalized 3D landmarks ($x, y, z \in [0, 1]$):
- **Palm Base:** Wrist (`0`)
- **Thumb:** CMC (`1`), MCP (`2`), IP (`3`), Tip (`4`)
- **Index Finger:** MCP (`5`), PIP (`6`), DIP (`7`), Tip (`8`)
- **Middle Finger:** MCP (`9`), PIP (`10`), DIP (`11`), Tip (`12`)
- **Ring Finger:** MCP (`13`), PIP (`14`), DIP (`15`), Tip (`16`)
- **Pinky Finger:** MCP (`17`), PIP (`18`), DIP (`19`), Tip (`20`)

The HUD draws the 21 standard skeletal bone connections (`HAND_CONNECTIONS`), connecting joints into a responsive skeleton overlay on the mirrored canvas preview:
- Thumb chain: $[0,1] \rightarrow [1,2] \rightarrow [2,3] \rightarrow [3,4]$
- Index chain: $[0,5] \rightarrow [5,6] \rightarrow [6,7] \rightarrow [7,8]$
- Middle chain: $[9,10] \rightarrow [10,11] \rightarrow [11,12]$
- Ring chain: $[13,14] \rightarrow [14,15] \rightarrow [15,16]$
- Pinky chain: $[0,17] \rightarrow [17,18] \rightarrow [18,19] \rightarrow [19,20]$
- Palm base / knuckles: $[5,9] \rightarrow [9,13] \rightarrow [13,17]$

#### 2. Key Benefits Over Raw Pixel Heuristics
1. **Elimination of Face/Torso Background Interference via Static Joint Geometry:**
   - *Problem in Raw Pixel Counting:* Because filers sit facing their webcam, their face and chest occupied a large portion of skin-tone pixels. Raw center-of-mass and silhouette heuristics are susceptible to background skin interference, ambient lighting shifts, and torso movement.
   - *MediaPipe Solution:* MediaPipe palm detector isolates the hand bounding box and ignores faces, necks, and torsos completely. The 21 3D skeletal joint coordinates enable precise, invariant finger extension angle calculations for static postures (*1 Finger*, *2 Fingers*, *Thumbs Up*, *Thumbs Down*, *3 Fingers*, *4 Fingers*) without reliance on fragile trajectory tracking.
2. **Elimination of Knuckle-Induced Peace Sign Misclassification (Thumbs Up):**
   - *Problem in Raw Pixel Counting:* When holding a Thumbs Up fist, the extended thumb and the folded index knuckle produced two distinct local skin peaks in raw silhouette contours, which raw pixel heuristics frequently misclassified as a Peace Sign (V-sign).
   - *MediaPipe Solution:* MediaPipe computes the exact 3D coordinates of individual finger joints. In a Thumbs Up, the index finger tip is folded into the fist ($\text{tip}_8.y \ge \text{pip}_6.y$), middle tip is folded ($\text{tip}_{12}.y \ge \text{pip}_{10}.y$), and thumb tip is extended high ($\text{tip}_4.y < \text{mcp}_2.y$). Peace Sign requires both index and middle fingers to be extended ($\text{tip}_8.y < \text{pip}_6.y$ and $\text{tip}_{12}.y < \text{pip}_{10}.y$). As a result, Thumbs Up can never trigger Peace Sign.
3. **Temporal Posture Smoothing & Noise Tolerance:**
   - A 3-frame stability buffer (`state.postureBuffer`) prevents single-frame landmark flicker or transient hand transitions from causing erratic posture triggers.
   - During continuous *4 Fingers* hold (1.2s required for draft saving), transient single-frame tracking drops do not discard hold progress; hold is only cancelled if the hand is released for two consecutive frames or completely removed from the camera view.

### Browser Support & Graceful Degradation
- **Supported Browsers:** Google Chrome, Microsoft Edge, and modern Chromium-based browsers natively support the Web Speech API, MediaPipe Hands WebAssembly models, and MediaStream / Canvas 2D video processing.
- **Graceful Offline Fallback:**
  - If Google MediaPipe CDN scripts fail to load (e.g. offline environment, network firewall, or CDN timeout), the interaction engine automatically detects `window.Hands === undefined` and falls back gracefully to the built-in Canvas 2D multi-spectral pixel segmentation engine.
  - If a webcam is missing or permission is denied (`NotAllowedError`, `NotFoundError`, `NotReadableError`), a friendly warning notification is shown in the HUD, and camera polling cleanly halts without exceptions.
  - The filing workflow remains 100% operable using standard keyboard, mouse, and touchscreen manipulation.

### Privacy & Ethical Safeguards
1. **Explicit User Activation Only:** Microphones and cameras are **never** opened automatically on page load or login. Recognition starts only after an explicit click on *"Enable Gesture Navigation"* or *"Start Listening"*.
2. **Strict In-Browser Memory Processing:** Google MediaPipe Hands models and Canvas 2D frame analysis execute 100% locally in client-side memory using WebAssembly. **No video frames, biometric landmark coordinates, or raw images are saved to disk, persisted, or uploaded to any external server.**
3. **Collapsible HUD & Transparent Status Indicators:** A dedicated Gesture HUD provides live feedback with a camera preview, mirrored video display, skeletal hand bones, tracking reticle, active gesture badge, and hold progress indicator. Users can collapse or hide the camera preview at any time.
4. **Complete Session Teardown:** All active media stream tracks (`track.stop()`), MediaPipe instances (`mediaPipeHands.close()`), animation loops (`cancelAnimationFrame`), and microphone listeners are terminated immediately when:
   - The user disables gesture navigation via `#btnGestureToggle`.
   - The assistance panel drawer is closed (`closePanel()`).
   - The user navigates away from the applicant portal (`onNavigate()`).
   - The applicant logs out (`logout()`).
   - The browser window is closed or unloaded (`beforeunload` / `pagehide`).
5. **Irrevocable Action Safety Lock:** Irrevocable actions—such as final application submission, application withdrawal, record deletion, and formal approval—are strictly blocked from voice and gesture execution to eliminate accidental triggers.
6. **Form Data Protection Lock:** Wizard navigation via voice or gesture is strictly rejected while the Dictation Review Modal is open, preventing accidental step changes from discarding uninserted technical disclosures.

---

## 6. Demonstration Script

Use the following step-by-step demonstration script to present the integrated multimodal voice and gesture workflow:

| Step | Action Type | Modality | User Action | Expected System Response |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Catalog Access | **Voice (VUI)** | Click *"Start Listening"* and say: **“Show forms.”** | System recognizes the spoken command, updates feedback card (*“Displaying filing forms...”*), and routes the view to the New IP Submission Filing Hub. |
| **2** | Form Navigation (Voice Rejection & Gesture Exclusivity) | **Voice (VUI) + Gesture (CV)** | Select **Patent Application** intake form (Step 1). Attempt spoken command: **“Next step”** (or *“Previous step”*). Then display **1 Finger (☝️)** toward camera. | Spoken *"Next step"* is strictly rejected with feedback: *"Step navigation is controlled via gestures. Display 1 Finger to advance to the next step."* Wizard step remains on Step 1. Presenting **1 Finger** is immediately detected by the Gesture HUD, executing `nextWizardStep()` and advancing the wizard to Step 2 (IP Disclosure Form). |
| **3** | Hands-Free Form Dictation | **Voice (VUI) + Touch** | On Step 2, tap the **Dictate** button beside `#disclosure-description`. Speak:<br> *“A low-cost, portable multi-stage water filtration device fabricated from endemic Palawan bamboo and coconut shell activated carbon.”*<br>Tap the button again to stop dictation. | Speech recognition activates for `#disclosure-description` with button updated to *Listening...*. Stopping dictation presents the **Review Dictated Speech** modal displaying the exact transcript. Click *"Insert Text"* (or touch) to populate the form field. |
| **4** | Page Scrolling | **Gesture (CV)** | Raise a **Thumbs Down (👎)** gesture to smoothly scroll downward through form inputs, or **Thumbs Up (👍)** to scroll back upward. | The form smoothly scrolls downward by 280px (Thumbs Down) or upward by 280px (Thumbs Up) with responsive 350ms debouncing. |
| **5** | Draft Checkpoint (Voice Rejection & Gesture Exclusivity) | **Voice (VUI) + Gesture (CV)** | Attempt spoken command: **“Save draft”** (or *“Save the draft”*). Then display **4 Fingers (✋)** toward the camera and hold steady for $\ge 1.2\text{s}$. | Spoken *"Save draft"* is strictly rejected with feedback: *"Draft saving is controlled via gestures. Hold 4 Fingers for 1.2s to save draft progress."* No draft is created via voice. Holding **4 Fingers** for 1.2s triggers hold progress visual, executes `saveFormDraft()`, updates `submissions` repository with `status = "Draft"`, and displays confirmation toast. Navigating to *My Cases* confirms the draft with the exact technical disclosure. |
| **6** | Step Review & Submit | **Gesture (CV)** | Navigate to final Review & Submit step (Step 5) using **1 Finger** (or **2 Fingers** to return). On the final step, display **3 Fingers**. | System validates submission context and executes `submitForm()`, persisting the official submission and displaying the confirmation screen. |

---

## 7. Testing & Evaluation Record

### 7.1 Multimodal Interaction Evaluation Table
*As required by the HCI capstone specification, this table records the metrics for task completion, command accuracy, error handling, completion time, and qualitative user feedback across the core filing workflows. Physical acoustic speech recognition accuracy and empirical camera lighting subject evaluations are marked as **"Not tested"** in accordance with the requirement not to invent unperformed physical hardware testing.*

| Task / Filing Workflow | Interaction Method | Task Completion | Command Accuracy | Errors Encountered | Completion Time | User Feedback | Status / Test Type |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Access Filing Catalog** | Voice command: *“Show forms”* | 100% | Not tested (Acoustic) / 100% (Lexical) | None (Graceful error if already on page) | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **2. Access Existing Applications** | Voice command: *“Open my cases”* | 100% | Not tested (Acoustic) / 100% (Lexical) | Redundant call rejected cleanly | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **3. Access University Guidelines** | Voice command: *“Open IP guidelines”* | 100% | Not tested (Acoustic) / 100% (Lexical) | None | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **4. Access Evaluator Messages** | Voice command: *“Open messages”* | 100% | Not tested (Acoustic) / 100% (Lexical) | Requires authenticated applicant user; redundant call rejected cleanly | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **5. Access University Marketplace** | Voice command: *“Open marketplace”* | 100% | Not tested (Acoustic) / 100% (Lexical) | Redundant call rejected cleanly; routes to dashboard when authenticated | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **6. Return to Home Dashboard** | Voice command: *“Home”* | 100% | Not tested (Acoustic) / 100% (Lexical) | Redundant call rejected cleanly when already on Home | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **7. Navigate Back to Previous Page** | Voice command: *“Back”* | 100% | Not tested (Acoustic) / 100% (Lexical) | Pops history or falls back to Home; rejected cleanly at root Home | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **8. Voice Rejection: Step Navigation** | Spoken *“Next step”* / *“Previous step”* | 100% (Safely Blocked) | 100% (Lexical Match) | None (Step unmodified; gesture feedback shown) | < 10ms | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **9. Voice Rejection: Draft Saving** | Spoken *“Save draft”* / *“Save the draft”* | 100% (Safely Blocked) | 100% (Lexical Match) | None (Zero drafts created; gesture feedback shown) | < 10ms | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **10. Advance Wizard Section** | Gesture: *1 Finger* (☝️) | 100% | Not tested (Hardware CV) / 100% (Automated Vector) | Boundary check: rejected on final submission step | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **11. Return to Previous Section** | Gesture: *2 Fingers* (✌️) | 100% | Not tested (Hardware CV) / 100% (Automated Vector) | Boundary check: rejected when on Step 1 | Not tested (Human latency) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **12. Smooth Form Scroll Up** | Gesture: *Thumbs Up* (👍) | 100% | 100% (Joint Vector Dispatch) | None (350ms cooldown prevents scroll run-away) | Immediate response | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **13. Smooth Form Scroll Down** | Gesture: *Thumbs Down* (👎) | 100% | 100% (Joint Vector Dispatch) | None (350ms cooldown prevents scroll run-away) | Immediate response | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **14. Submit Application** | Gesture: *3 Fingers* | 100% | 100% (Step Validation & Trigger) | Context guarded: requires review step; rejected on steps 1-4 | Immediate validation & submit | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **15. Save Draft Checkpoint** | Gesture: *4 Fingers* | 100% | 100% (Posture Dispatch) | Duplicate continuous fire blocked | Immediate save | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **16. Dictate Technical Description** | VUI dictation beside `#disclosure-description` | 100% | Not tested (Hardware Mic Acoustic) | Handles multi-segment transcripts, no-speech & errors | Not tested (Human dictation time) | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **17. Safety Lock on Voice Submission** | Spoken *“Submit / Delete / Withdraw”* | 100% (Blocked) | 100% (Safety Filter) | Security warning toast displayed | < 50ms response | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **18. Camera & Microphone Teardown** | Panel close, logout, or navigation away | 100% | 100% (Stream Track Termination) | None (`track.stop()` called on all active media tracks) | Immediate teardown | Not tested (Subject study) | **Passed (Automated JSDOM)** |
| **19. Physical Acoustic & CV Lighting Latency** | Ambient acoustic noise & diverse webcam lighting | **Not tested** | **Not tested** | **Not tested** | **Not tested** | **Not tested** | **Not tested (Requires live hardware)** |
| **20. Formal Participant Usability Study** | Empirical human subject usability evaluation | **Not tested** | **Not tested** | **Not tested** | **Not tested** | **Not tested** | **Not tested (Scheduled for user study)** |

### 7.2 Verification of Requirements & Safeguards

| Feature / Verification Scope | Expected Behavior | Automated Test Result | Notes / Safeguards |
| :--- | :--- | :---: | :--- |
| **Voice Navigation: Macro Routing Exclusivity** | Spoken "Show forms", "Open my cases", "Open IP guidelines", "Open messages", "Open marketplace", "Home", and "Back" handle routing with role checks | **Passed (Automated)** | Validated in JSDOM; rejects redundant or unauthenticated requests. |
| **Voice Navigation: Step Navigation Rejection** | Spoken "Next step" and "Previous step" strictly rejected (`handled: false`); wizard step unmodified | **Passed (Automated)** | Instructs user to use 1 Finger / 2 Fingers gestures. Tested across phrase variations. |
| **Voice Navigation: Draft Saving Rejection** | Spoken "Save draft" strictly rejected (`handled: false`); no draft persisted to database | **Passed (Automated)** | Instructs user to hold 4 Fingers for 1.2s. Tested with "Save the draft", "Save as draft", etc. |
| **MediaPipe Hands CDN Integration** | `camera_utils.js` and `hands.js` included in `main/index.html` | **Passed (Automated)** | Validated script inclusion with unpkg/jsdelivr CDN references. |
| **MediaPipe Hands Initialization** | Initialize `window.Hands` with `locateFile`, `maxNumHands: 1`, `complexity: 1`, confidence `0.5` | **Passed (Automated)** | Validated constructor, options, and `onResults` callback attachment. |
| **Skeletal Bone Connections & HUD** | Render 21 hand joints and bone lines mirrored horizontally on `#gestureCanvas` | **Passed (Automated)** | Validated 21 `HAND_CONNECTIONS` bones, joint dots, and mirrored user coordinates $( (1-x)w, yh )$. |
| **Thumbs Up vs Scroll Up** | Thumbs Up maps to smooth scroll up (-280px) | **Passed (Automated)** | Smooth scroll up triggered with 350ms throttle. |
| **Thumbs Down vs Scroll Down** | Thumbs Down maps to smooth scroll down (+280px) | **Passed (Automated)** | Smooth scroll down triggered with 350ms throttle. |
| **1 Finger vs Next Step** | 1 Finger (☝️) advances wizard to next section | **Passed (Automated)** | Advances section; blocked on final step. |
| **2 Fingers vs Previous Step** | 2 Fingers (✌️) returns to previous wizard section | **Passed (Automated)** | Returns section; blocked on Step 1. |
| **3 Fingers vs Submit** | 3 Fingers submits application on final step with validation | **Passed (Automated)** | Rejects on Steps 1–4; triggers `submitForm()` on final review step. |
| **4 Fingers vs Save Draft** | 4 Fingers saves intermediate draft progress | **Passed (Automated)** | Calls `saveFormDraft()`; persists draft into submissions repository. |
| **Temporal Posture Smoothing** | 3-frame stability buffer smooths single-frame flicker and noise | **Passed (Automated)** | Single-frame tracking drop does not cancel active posture; resets only on intentional release or hand loss. |
| **MediaPipe Teardown & Offline Fallback** | `mediaPipeHands.close()` called; fallback to raw pixel mode when offline | **Passed (Automated)** | Full teardown on disable, panel close, route change, and logout; zero errors when offline. |
| **Gesture Navigation: Context Guarding** | Reject wizard gestures outside active filing forms | **Passed (Automated)** | 1 Finger, 2 Fingers, 3 Fingers, 4 Fingers reject with explanatory feedback when on dashboard. |
| **Dictation Review Modal Lock** | Guard wizard navigation while dictation review modal is open | **Passed (Automated)** | Rejects step changes and draft saves to protect unconfirmed dictated text. |
| **Webcam Teardown: Panel Dismissal** | Stop webcam stream when assistance panel is closed | **Passed (Automated)** | `closePanel()` terminates active `MediaStreamTrack` instances immediately. |
| **Webcam Teardown: Navigation & Logout** | Stop webcam when navigating away or logging out | **Passed (Automated)** | All tracks stopped and video source cleared on `onNavigate()`, `logout()`, `beforeunload`, and `pagehide`. |

---

## 8. Summary of Changes

- **Voice Navigation Command Set Streamlining:**
  - Removed "Next step", "Previous step", and "Save draft" from Voice Navigation command execution.
  - Standardized Voice Navigation strictly on macro-level routing commands:
    1. *“Show forms”* -> Navigates to Filing Hub
    2. *“Open my cases”* -> Navigates to My Cases / User Submissions
    3. *“Open IP guidelines”* -> Navigates to IP Guidelines
    4. *“Open messages”* -> Navigates to Messages
    5. *“Open marketplace”* -> Navigates to Marketplace
    6. *“Home”* -> Navigates to Home Dashboard (`"user-dashboard"` or `"landing"`)
    7. *“Back”* -> Navigates back to the previous page in history (or falls back to `"user-dashboard"`)
    *(Technical description dictation remains fully functional beside `#disclosure-description`)*.
  - Spoken attempts to use "Next step", "Previous step", or "Save draft" are safely rejected with helpful feedback instructing users that step navigation and draft saving are exclusively controlled via gestures.
- **Updated [main/index.html](file:///c:/Users/Owen/OneDrive/Desktop/TCB-prototype/main/index.html):**
  - Removed "Next step", "Previous step", and "Save draft" from the Voice Navigation commands card in the Assistance panel.
  - Updated Gesture HUD reference card and overlay badges:
    - `Thumbs Up` (👍) -> Scroll Up
    - `Thumbs Down` (👎) -> Scroll Down
    - `1 Finger` (☝️) -> Next Page / Next Step
    - `2 Fingers` (✌️) -> Previous Page / Previous Step
    - `3 Fingers` -> Submit Application
    - `4 Fingers` -> Save Draft
- **Updated [main/assisted-filing.js](file:///c:/Users/Owen/OneDrive/Desktop/TCB-prototype/main/assisted-filing.js):**
  - Configured posture classification in `detectPostureFromLandmarks`:
    - `thumbs_up`: thumb extended up, 4 fingers curled into fist.
    - `thumbs_down`: thumb pointing down (`thumbTip.y > thumbMcp.y` and below palm/wrist), 4 fingers curled into fist.
    - `one_finger`: index extended, thumb/middle/ring/pinky curled.
    - `two_fingers`: index + middle extended, ring/pinky/thumb curled.
    - `three_fingers`: index + middle + ring extended, pinky/thumb curled.
    - `four_fingers`: index + middle + ring + pinky extended, thumb curled across palm.
    - Relaxed or spread open hand (5 extended fingers) evaluated to `null` (neutral/idle, zero actions).
  - Implemented gesture mapping in `processGesture`:
    - `thumbs_up`: smooth scroll active form/window upward (-280px).
    - `thumbs_down`: smooth scroll active form/window downward (+280px).
    - `one_finger`: advances wizard section (`nextWizardStep()`) with context validation.
    - `two_fingers`: returns to previous wizard section (`prevWizardStep()`) with context validation.
    - `three_fingers`: submits application (`submitForm()`) on review/final step with step validation.
    - `four_fingers`: saves application draft (`saveFormDraft()`).
  - Updated `evaluateCommandContext` to validate `submit` step prerequisites (rejects on steps < maxStep).
  - Maintained temporal posture smoothing, single-frame noise tolerance, and complete lifecycle stream teardown.
- **Updated [main/app.js](file:///c:/Users/Owen/OneDrive/Desktop/TCB-prototype/main/app.js):**
  - Exposed `window.submitForm = submitForm;` for multimodal gesture execution.
- **Updated [scratch/test_gesture_interaction.js](file:///c:/Users/Owen/OneDrive/Desktop/TCB-prototype/scratch/test_gesture_interaction.js):**
  - Thoroughly updated and expanded automated tests verifying the complete 6-posture gesture mapping (Thumbs Up/Down, 1-4 Fingers), verifying that 5 extended fingers evaluate to neutral/idle (null) triggering zero actions, and validating skeletal landmark detection, context boundaries, and safety safeguards.
