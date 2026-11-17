const fs = require('fs');
const { JSDOM } = require('jsdom');
const vm = require('vm');

const html = fs.readFileSync('main/index.html', 'utf8')
  .replace(/<script[^>]*src=["']http[^"']*["']><\/script>/gi, '')
  .replace(/<script[^>]*src=["']app\.js[^"']*["']><\/script>/gi, '');
const code = fs.readFileSync('main/app.js', 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'http://localhost/main/index.html'
});
const { window } = dom;

// Polyfill minimal browser APIs
window.scrollTo = () => {};
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

vm.runInContext(code, dom.getInternalVMContext());

console.log('Logging in as applicant...');
const emailInput = window.document.getElementById('loginEmail');
if (emailInput) emailInput.value = 'juan@psu.palawan.edu.ph';
window.handleLogin({ preventDefault: () => {} });
const otpInput = window.document.getElementById('loginOtpCode');
if (otpInput) otpInput.value = '123456';
window.verifyLoginOtp();

console.log('After login:');
console.log('Current page:', window.currentPage || 'check DOM');
console.log('Dashboard layout active?', window.document.getElementById('dashboard-layout')?.classList.contains('active'));
console.log('Main content preview:', window.document.getElementById('main-content')?.innerHTML.slice(0, 150));

console.log('--- Testing navigateTo("patent-form") ---');
window.navigateTo('patent-form');
console.log('Main content includes "Patent Fill-Up Forms"?', window.document.getElementById('main-content')?.innerHTML.includes('Patent Fill-Up Forms'));

console.log('--- Testing nextWizardStep() ---');
window.nextWizardStep();
console.log('After nextWizardStep, step is 2? Has "Technical Disclosure"?', window.document.getElementById('main-content')?.innerHTML.includes('Technical Disclosure'));
console.log('Has disclosure-description textarea?', !!window.document.getElementById('disclosure-description'));

console.log('--- Testing saveFormDraft() ---');
const descEl = window.document.getElementById('disclosure-description');
if (descEl) descEl.value = 'Test invention description via script.';
window.saveFormDraft();
console.log('Submissions count:', window.submissions ? window.submissions.length : 'unknown');
console.log('Latest submission draft title:', window.submissions ? window.submissions[0]?.formData?.disclosureDescription : 'none');
process.exit(0);
