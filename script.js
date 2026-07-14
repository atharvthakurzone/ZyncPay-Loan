// Encapsulating Architecture in IIFE Block to preserve global scope safety
(function() {
  // --- INITIALIZE ICONS ---
  lucide.createIcons();

  // --- SCROLL HEADER EFFECT ---
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) { header.classList.add('scrolled'); } 
    else { header.classList.remove('scrolled'); }
  });

  // --- MOBILE MENU TOGGLE LOGIC (WITH BODY SCROLL TRAP FIX) ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  const menuIcon = document.getElementById('menuIcon');

  function toggleMobileMenu() {
      mainNav.classList.toggle('open');
      if (mainNav.classList.contains('open')) {
          menuIcon.setAttribute('data-lucide', 'x');
          document.body.classList.add('menu-open');
      } else {
          menuIcon.setAttribute('data-lucide', 'menu');
          document.body.classList.remove('menu-open');
      }
      lucide.createIcons();
  }

  function closeMobileMenu() {
      mainNav.classList.remove('open');
      menuIcon.setAttribute('data-lucide', 'menu');
      document.body.classList.remove('menu-open');
      lucide.createIcons();
  }

  if(mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }

  // --- INTERSECTION OBSERVER ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if(entry.target.querySelectorAll('.counter').length > 0) {
          entry.target.querySelectorAll('.counter').forEach(el => animateValue(el));
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  function animateValue(obj) {
    if(obj.dataset.animated) return; 
    obj.dataset.animated = "true";
    
    const target = parseFloat(obj.getAttribute('data-target'));
    const prefix = obj.getAttribute('data-prefix') || '';
    const suffix = obj.getAttribute('data-suffix') || '';
    const duration = 2000;
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = easeProgress * target;
      
      const formatted = current % 1 === 0 ? Math.floor(current) : current.toFixed(1);
      obj.innerHTML = prefix + formatted + suffix;
      
      if (progress < 1) { window.requestAnimationFrame(step); }
      else { obj.innerHTML = prefix + target + suffix; } 
    };
    window.requestAnimationFrame(step);
  }

  // --- ACCESSIBLE SPA CLIENT-SIDE ROUTING ---
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); 
      const viewId = this.getAttribute('data-target');
      
      closeMobileMenu();
      
      document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active-view'));
      document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
      
      const targetView = document.getElementById(`view-${viewId}`);
      if(targetView) targetView.classList.add('active-view');
      
      document.querySelectorAll(`.nav-link[data-target="${viewId}"]`).forEach(nav => nav.classList.add('active'));
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  function scrollToForm() {
    const section = document.getElementById('applySection');
    if(section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  const dCta = document.getElementById('desktopApplyNow');
  const mCta = document.getElementById('mobileApplyNow');
  if(dCta) dCta.onclick = scrollToForm;
  if(mCta) mCta.onclick = () => { scrollToForm(); closeMobileMenu(); };

  const bElgBtn = document.getElementById('businessEligibilityBtn');
  if(bElgBtn) { bElgBtn.onclick = () => alert('Business Loan engine currently in maintenance. Contact support@zyncpay.com'); }

  // --- EMI CALCULATOR WITH TWO-WAY SLIDER & BOX SYNC ---
  const emiSliderAmount = document.getElementById('emiSliderAmount');
  const emiSliderRate = document.getElementById('emiSliderRate');
  const emiSliderTenure = document.getElementById('emiSliderTenure');
  
  const emiInputAmount = document.getElementById('emiInputAmount');
  const emiInputRate = document.getElementById('emiInputRate');
  const emiInputTenure = document.getElementById('emiInputTenure');

  let emiTargets = { amount: 50000, rate: 10.5, tenure: 12, emi: 4408, principal: 50000, interest: 2894, total: 52894 };
  let emiCurrent = { ...emiTargets };

  function updateEMIDisplays() {
     let updated = false;
     for(let key in emiTargets) {
         if(Math.abs(emiTargets[key] - emiCurrent[key]) > 0.1) {
             emiCurrent[key] += (emiTargets[key] - emiCurrent[key]) * 0.25; 
             if(Math.abs(emiTargets[key] - emiCurrent[key]) < 0.5) emiCurrent[key] = emiTargets[key];
             updated = true;
         }
     }
     
     document.getElementById('emiResultBox').textContent = '₹' + Math.round(emiCurrent.emi).toLocaleString('en-IN');
     document.getElementById('breakdownPrincipal').textContent = '₹' + Math.round(emiCurrent.principal).toLocaleString('en-IN');
     document.getElementById('breakdownInterest').textContent = '₹' + Math.round(emiCurrent.interest).toLocaleString('en-IN');
     document.getElementById('breakdownTotal').textContent = '₹' + Math.round(emiCurrent.total).toLocaleString('en-IN');
     
     if(updated) requestAnimationFrame(updateEMIDisplays);
  }

  function calculateEMI() {
    const P = Number(emiSliderAmount.value);
    const annualR = Number(emiSliderRate.value);
    const N = Number(emiSliderTenure.value);
    const R = (annualR / 12) / 100;
    
    let emi = (R > 0) ? (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1) : P / N;
    const monthlyEMI = Math.round(emi);
    const totalPayment = monthlyEMI * N;
    const totalInterest = totalPayment - P;

    emiTargets.amount = P;
    emiTargets.rate = annualR;
    emiTargets.tenure = N;
    emiTargets.emi = monthlyEMI;
    emiTargets.principal = P;
    emiTargets.interest = totalInterest < 0 ? 0 : totalInterest;
    emiTargets.total = totalPayment;

    requestAnimationFrame(updateEMIDisplays);
    
    const interestPercent = (totalInterest / totalPayment) * 100;
    const principalPercent = 100 - interestPercent;
    document.getElementById('emiPieChart').style.background = `conic-gradient(var(--blue-500) 0% ${principalPercent}%, var(--gold) ${principalPercent}% 100%)`;
  }

  // Dual-Binding Event Orchestration Logic
  function syncSlidersFromInputs() {
    emiSliderAmount.value = emiInputAmount.value;
    emiSliderRate.value = emiInputRate.value;
    emiSliderTenure.value = emiInputTenure.value;
    calculateEMI();
  }

  function syncInputsFromSliders() {
    emiInputAmount.value = emiSliderAmount.value;
    emiInputRate.value = emiSliderRate.value;
    emiInputTenure.value = emiSliderTenure.value;
    calculateEMI();
  }

  if(emiSliderAmount) {
    emiSliderAmount.oninput = syncInputsFromSliders;
    emiSliderRate.oninput = syncInputsFromSliders;
    emiSliderTenure.oninput = syncInputsFromSliders;
    
    emiInputAmount.oninput = syncSlidersFromInputs;
    emiInputRate.oninput = syncSlidersFromInputs;
    emiInputTenure.oninput = syncSlidersFromInputs;
    
    calculateEMI(); 
  }

  // --- LOAN FORM WIZARD ENGINE WITH METADATA PERSISTENCE ---
  const defaultState = { name:'', phone:'', idType:'Aadhaar', idNumber:'', selfie:null, loanAmount:50000 };
  const savedState = sessionStorage.getItem('zyncpay_state');

  const state = savedState ? { ...defaultState, ...JSON.parse(savedState), selfie: null } : defaultState;

  let current = Number(sessionStorage.getItem('zyncpay_step')) || 1;
  const TOTAL = 4;

  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase().trim());
  const validateAadhaar = (aadhaar) => {
      const rawDigits = aadhaar.replace(/\D/g, '');
      return /^[2-9]{1}[0-9]{11}$/.test(rawDigits);
  };

  function persistData() {
    const { selfie, ...safeState } = state; 
    sessionStorage.setItem('zyncpay_state', JSON.stringify(safeState));
    sessionStorage.setItem('zyncpay_step', current);
  }

  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 800;
        let width = img.width; let height = img.height;
        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7)); 
      }
    }
  }

  function renderProgress(){
    const el = document.getElementById('progress');
    if (!el) return;
    if (current > TOTAL) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    let html = '';
    for (let i=1; i<=TOTAL; i++){ html += `<div class="dot ${i <= current ? 'done':''}"></div>`; }
    el.innerHTML = html;
  }

  function screens(){
    return {
      1: () => `
        <p class="form-card-title">Check your eligibility</p>
        <p class="form-card-sub">Takes under a minute. No impact on your credit score.</p>
        <div class="field"><label for="nameInput">Full name</label><input type="text" id="nameInput" placeholder="As per your ID" value="${state.name}"></div>
        <div class="error-note" id="err1" style="display:none;"><i data-lucide="alert-circle" class="icon-small"></i> Enter your full name to continue.</div>
        <button class="btn btn-primary" id="nextBtn">Continue <i data-lucide="arrow-right" class="icon-med"></i></button>
        <p class="consent-fine">By continuing, you agree to ZyncPay's <a href="#">Credit Report Terms</a>, <a href="#">Terms &amp; Conditions</a>.</p>
      `,
      2: () => `
        <p class="form-card-title">What's your mobile number?</p>
        <p class="form-card-sub">Required to establish digital lending identity parameters.</p>
        <div class="field"><label for="phoneInput">Mobile number</label><input type="tel" id="phoneInput" placeholder="98765 43210" value="${state.phone}" maxlength="10"></div>
        <div class="error-note" id="err2" style="display:none;"><i data-lucide="alert-circle" class="icon-small"></i> Enter a valid 10-digit mobile number.</div>
        <button class="btn btn-primary" id="nextBtn">Continue <i data-lucide="arrow-right" class="icon-med"></i></button>
        <button class="btn btn-ghost" id="backBtn">Back</button>
      `,
      3: () => `
        <p class="form-card-title">Verify your identity</p>
        <p class="form-card-sub">Choose an ID and enter the number exactly as printed.</p>
        
        <div class="pill-group" role="radiogroup" aria-label="Identity Document Type Selector">
          <label class="pill-label">
            <input type="radio" name="idDocType" value="Aadhaar" class="pill-radio" ${state.idType==='Aadhaar'?'checked':''}>
            <span class="pill">Aadhaar card</span>
          </label>
          <label class="pill-label">
            <input type="radio" name="idDocType" value="PAN" class="pill-radio" ${state.idType==='PAN'?'checked':''}>
            <span class="pill">PAN card</span>
          </label>
        </div>
        
        <div class="field"><label for="idInput">${state.idType} number</label><input type="text" id="idInput" placeholder="${state.idType==='Aadhaar' ? 'XXXX XXXX XXXX' : 'ABCDE1234F'}" value="${state.idNumber}"></div>
        <div class="error-note" id="err3" style="display:none;"></div>
        <button class="btn btn-primary" id="nextBtn">Continue <i data-lucide="arrow-right" class="icon-med"></i></button>
        <button class="btn btn-ghost" id="backBtn">Back</button>
      `,
      4: () => `
        <p class="form-card-title">Take a quick selfie</p>
        <p class="form-card-sub">Confirms it's really you — required for digital lending.</p>
        <label for="selfieInput">
          <div class="selfie-box ${state.selfie ? 'filled':''}" tabindex="0" role="button" aria-label="Camera Upload Window Box">
            ${state.selfie
              ? `<img class="selfie-preview" src="${state.selfie}" alt="Selfie preview upload image"><div class="selfie-title">Looking good</div><div class="selfie-sub">Tap to retake</div>`
              : `<div class="selfie-icon"><i data-lucide="camera"></i></div><div class="selfie-title">Tap to open camera</div><div class="selfie-sub">Make sure your face is clearly visible</div>`}
          </div>
        </label>
        <input type="file" id="selfieInput" accept="image/*" capture="user">
        <div class="error-note" id="err4" style="display:none;"><i data-lucide="alert-circle" class="icon-small"></i> Take a selfie to see your eligibility.</div>
        <button class="btn btn-primary" id="nextBtn">See my eligibility <i data-lucide="sparkles" class="icon-med"></i></button>
        <button class="btn btn-ghost" id="backBtn">Back</button>
      `,
      4.5: () => `
        <div class="verify-wrap">
          <p class="form-card-title text-center">Verifying Profile</p>
          <p class="form-card-sub text-center mb-8">Running secure KYC match with lending partners.</p>
          <div class="verify-item active" id="vi-pan">
            <span>Checking Identity Records</span>
            <div class="verify-status" id="vs-pan"><div class="loader-spinner"></div></div>
          </div>
          <div class="verify-item" id="vi-aadhaar">
            <span>Verifying CIBIL Score</span>
            <div class="verify-status" id="vs-aadhaar"></div>
          </div>
          <div class="verify-item" id="vi-mobile">
            <span>Fetching Pre-Approved Offers</span>
            <div class="verify-status" id="vs-mobile"></div>
          </div>
        </div>
      `
    };
  }

  function renderCard(){
    const card = document.getElementById('card');
    if(!card) return;
    
    if (current === 4.5) {
      card.innerHTML = screens()[4.5]();
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if(step === 1) {
          document.getElementById('vi-pan').classList.replace('active', 'done');
          document.getElementById('vs-pan').innerHTML = '<i data-lucide="check-circle-2" class="icon-pop icon-large" style="color:var(--success);"></i>';
          document.getElementById('vi-aadhaar').classList.add('active');
          document.getElementById('vs-aadhaar').innerHTML = '<div class="loader-spinner"></div>';
          lucide.createIcons();
        }
        if(step === 2) {
          document.getElementById('vi-aadhaar').classList.replace('active', 'done');
          document.getElementById('vs-aadhaar').innerHTML = '<i data-lucide="check-circle-2" class="icon-pop icon-large" style="color:var(--success);"></i>';
          document.getElementById('vi-mobile').classList.add('active');
          document.getElementById('vs-mobile').innerHTML = '<div class="loader-spinner"></div>';
          lucide.createIcons();
        }
        if(step === 3) {
          document.getElementById('vi-mobile').classList.replace('active', 'done');
          document.getElementById('vs-mobile').innerHTML = '<i data-lucide="check-circle-2" class="icon-pop icon-large" style="color:var(--success);"></i>';
          lucide.createIcons();
        }
        if(step === 4) { 
          clearInterval(interval); 
          if(typeof fbq !== "undefined"){ fbq('track', 'CompleteRegistration'); }
          current = 5; 
          persistData();
          render(); 
        }
      }, 1800);
      return;
    }

    if (current === 5){
      const displayFName = state.name ? state.name.split(' ')[0] : 'there';
      card.innerHTML = `
        <div class="text-center">
          <div class="mb-12" style="font-size:48px; animation: fadeView 0.5s ease;">🎉</div>
          <p class="form-card-title" style="font-size:24px; margin-bottom:8px;">Congratulations, ${displayFName}!</p>
          <p class="mb-8" style="font-size:15px; color:var(--slate); font-weight:500;">Pre-approved Loan Limit</p>
          <div id="eligibilityAmount" class="mb-28" style="font-size:38px; line-height:1.2; font-weight:900; color:var(--blue-900); letter-spacing:-1px;">upto ₹0</div>
          
          <div class="text-left mb-32" style="background:var(--paper); border:1px solid var(--border); border-radius:16px; padding:20px;">
            <div class="mb-16 flex items-center gap-12" style="font-size:14.5px; color:var(--ink); font-weight:600;">
              <i data-lucide="check-circle-2" class="icon-large" style="color:var(--success);"></i> Instant verification completed
            </div>
            <div class="mb-16 flex items-center gap-12" style="font-size:14.5px; color:var(--ink); font-weight:600;">
              <i data-lucide="check-circle-2" class="icon-large" style="color:var(--success);"></i> Your profile matches our lending partners
            </div>
            <div class="flex items-center gap-12" style="font-size:14.5px; color:var(--ink); font-weight:600;">
              <i data-lucide="check-circle-2" class="icon-large" style="color:var(--success);"></i> Unlock your personalized offers below
            </div>
          </div>

          <button class="btn btn-primary h-56" id="continueBtn" style="font-size:16px;">Continue to Secure My Offer <i data-lucide="arrow-right" class="icon-med"></i></button>
        </div>
      `;
      
      setTimeout(() => {
        const amountEl = document.getElementById('eligibilityAmount');
        let start = null; const duration = 800; const target = 100000;
        
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); 
          const currentVal = Math.floor(ease * target);
          if(amountEl) amountEl.textContent = 'upto ₹' + currentVal.toLocaleString('en-IN');
          if (progress < 1) { window.requestAnimationFrame(step); } 
          else { if(amountEl) amountEl.textContent = 'upto ₹1,00,000'; }
        };
        window.requestAnimationFrame(step);
      }, 400);

      document.getElementById('continueBtn').onclick = () => { current = 5.5; persistData(); render(); };
      lucide.createIcons();
      return;
    }
    
    if(current === 5.5) {
      card.innerHTML = `
        <div class="text-center" style="padding: 40px 0;">
          <div class="loader-spinner" style="width:40px; height:40px; border-width:4px; margin: 0 auto 24px;"></div>
          <p id="loadingText5" style="font-size:18px; font-weight:700; color:var(--blue-900);">Preparing Personalized Offers...</p>
        </div>
      `;
      setTimeout(() => {
          const txt = document.getElementById('loadingText5');
          if(txt) txt.innerText = "Matching 15+ Lending Partners...";
          setTimeout(() => {
              if(txt) txt.innerHTML = "<span class='pulse-text'>✓ Personalized Offer Ready</span>";
              setTimeout(() => { current = 6; persistData(); render(); }, 800); 
          }, 1600); 
      }, 1100); 
      return;
    }

    if (current === 6){
      card.innerHTML = `
        <p class="form-card-title">Customize your loan</p>
        <p class="form-card-sub">Slide or type exactly how much you need.</p>
        <div class="flex justify-center items-center gap-12 mb-24">
          <input type="number" id="wizardInputAmount" class="input-sync-box text-center" min="5000" max="100000" step="500" value="${state.loanAmount}" style="width: 180px; font-size: 24px; height: 48px;" aria-label="Target Wizard Amount Input Value Box">
        </div>
        <input type="range" id="amountSliderWizard" min="5000" max="100000" step="500" value="${state.loanAmount}" class="w-full mb-8" style="height:8px; accent-color:var(--blue-700); cursor:pointer;" aria-label="Target Wizard Amount Slider Control">
        <div class="flex justify-between mb-24" style="font-size:12px; font-weight:600; color:var(--slate-light);">
          <span>₹5,000</span><span>₹1,00,000</span>
        </div>
        <button class="btn btn-primary" id="confirmAmountBtn">Confirm & View Summary</button>
        <button class="btn btn-ghost" id="backBtn6">Back</button>
      `;
      
      const slider = document.getElementById('amountSliderWizard');
      const box = document.getElementById('wizardInputAmount');

      slider.oninput = e => {
        state.loanAmount = Number(e.target.value);
        box.value = state.loanAmount;
        persistData();
      };
      box.oninput = e => {
        let val = Number(e.target.value);
        if(val > 100000) val = 100000;
        slider.value = val;
        state.loanAmount = val;
        persistData();
      };

      document.getElementById('backBtn6').onclick = () => { current = 5; persistData(); render(); };
      document.getElementById('confirmAmountBtn').onclick = () => { current = 6.5; persistData(); render(); };
      return;
    }

    if(current === 6.5) {
      card.innerHTML = `
        <div class="text-center" style="padding: 40px 0;">
          <div class="loader-spinner" style="width:40px; height:40px; border-width:4px; margin: 0 auto 24px;"></div>
          <p id="loadingText6" style="font-size:18px; font-weight:700; color:var(--blue-900);">Locking Selected Amount...</p>
        </div>
      `;
      setTimeout(() => {
          const txt = document.getElementById('loadingText6');
          if(txt) txt.innerText = "Checking lender availability...";
          setTimeout(() => {
              if(txt) txt.innerText = "Generating Loan Summary...";
              setTimeout(() => {
                  if(txt) txt.innerText = "Preparing Agreement...";
                  setTimeout(() => { current = 7; persistData(); render(); }, 700);
              }, 900);
          }, 1100);
      }, 700);
      return;
    }

    if (current === 7){
      if(typeof fbq !== "undefined"){ fbq('track', 'InitiateCheckout', { value: 299, currency: 'INR' }); }

      const fee = getProcessingFee(state.loanAmount);
      card.innerHTML = `
        <div class="text-center mb-24">
          <p style="margin-bottom:6px; font-weight:700; color:var(--success); text-transform:uppercase; letter-spacing:1.5px; font-size:12px;">Loan Approved</p>
          <p class="m-0" style="font-size:40px; font-weight:900; color:var(--blue-900); letter-spacing:-1px;">₹${state.loanAmount.toLocaleString('en-IN')}</p>
          <div class="mt-16">
            <div class="stagger-item" style="animation-delay: 0.1s;"><i data-lucide="check" style="width:14px; stroke-width:3px;"></i> 15 lenders matched</div>
            <div class="stagger-item" style="animation-delay: 0.3s;"><i data-lucide="check" style="width:14px; stroke-width:3px;"></i> Best lender selected</div>
            <div class="stagger-item" style="animation-delay: 0.5s;"><i data-lucide="check" style="width:14px; stroke-width:3px;"></i> Ready for agreement</div>
          </div>
        </div>
        
        <div class="mb-28" style="border-top:1px dashed var(--border); border-bottom:1px dashed var(--border); padding:24px 0;">
          <div class="flex justify-between items-center mb-16" style="font-size:14.5px; font-weight:600; color:var(--slate);">
            <span>Verification Completed</span> <i data-lucide="check" class="icon-med" style="color:var(--success); stroke-width:3px;"></i>
          </div>
          <div class="flex justify-between items-center mb-16" style="font-size:14.5px; font-weight:600; color:var(--slate);">
            <span>Identity Matched</span> <i data-lucide="check" class="icon-med" style="color:var(--success); stroke-width:3px;"></i>
          </div>
          <div class="flex justify-between items-center mb-16" style="font-size:14.5px; font-weight:600; color:var(--slate);">
            <span>Mobile Verified</span> <i data-lucide="check" class="icon-med" style="color:var(--success); stroke-width:3px;"></i>
          </div>
          <div class="flex justify-between items-center" style="font-size:14.5px; font-weight:600; color:var(--slate);">
            <span>Partner Offers Ready</span> <i data-lucide="check" class="icon-med" style="color:var(--success); stroke-width:3px;"></i>
          </div>
        </div>

        <div class="mb-28">
          <p class="mb-16" style="font-size:16px; font-weight:800; color:var(--ink);">What happens next?</p>
          <div class="flex items-start gap-12" style="font-size:14.5px; color:var(--slate); font-weight:500;">
            <i data-lucide="arrow-right-circle" class="icon-med" style="color:var(--blue-600); flex-shrink:0;"></i> <span>Loan agreement preparation</span>
          </div>
        </div>

        <div class="mb-28" style="background:var(--blue-50); border-radius:16px; padding:20px; border:1px solid #D6E4FF;">
          <div class="flex justify-between items-center mb-8">
            <span style="font-size:15px; font-weight:700; color:var(--blue-900);">Platform Processing Fee</span>
            <span style="font-size:20px; font-weight:900; color:var(--blue-900);">₹${fee.total}</span>
          </div>
          <p class="m-0" style="font-size:13px; color:var(--blue-900); opacity:0.85; line-height:1.5;">This one-time platform fee covers identity verification, lender matching, and generation of your personalized loan offers.</p>
          <div class="flex gap-16 mt-12" style="font-size:12.5px; font-weight:600; color:var(--blue-700);">
            <span class="flex items-center gap-4"><i data-lucide="check" class="icon-small"></i> GST Included</span>
            <span class="flex items-center gap-4"><i data-lucide="check" class="icon-small"></i> One Time Fee</span>
          </div>
        </div>
        
        <button class="btn btn-primary h-56" id="payBtn" style="font-size:16px;">Unlock My Offer <i data-lucide="lock" class="icon-med"></i></button>
        <p class="text-center m-0" style="font-size:12px; color:var(--slate-light); font-weight:500; margin-top:16px; display:flex; justify-content:center; align-items:center; gap:6px;">
          <i data-lucide="shield-check" class="icon-small"></i> Secure payment via Cashfree Gateways
        </p>
        <button class="btn btn-ghost" id="backBtn7">Edit Amount</button>
      `;
      
      document.getElementById('payBtn').onclick = () => { 
        if(typeof fbq !== "undefined"){ fbq('trackCustom', 'UnlockMyOffer'); }
        current = 7.5; persistData(); render(); 
      };
      
      document.getElementById('backBtn7').onclick = () => { current = 6; persistData(); render(); };
      lucide.createIcons();
      return;
    }

    if(current === 7.5) {
      card.innerHTML = `
        <div class="text-center" style="padding: 40px 0;">
          <div class="loader-spinner" style="width:40px; height:40px; border-width:4px; margin: 0 auto 24px;"></div>
          <p id="loadingText7" style="font-size:18px; font-weight:700; color:var(--blue-900);">Preparing Secure Payment...</p>
        </div>
      `;
      setTimeout(() => {
          const txt = document.getElementById('loadingText7');
          if(txt) txt.innerText = "Encrypting Transaction...";
          setTimeout(() => {
              if(txt) txt.innerText = "Connecting to Cashfree...";
              setTimeout(() => {
                  if(txt) txt.innerText = "Redirecting Securely...";
                  setTimeout(() => {
                      sessionStorage.clear();
                      window.location.href = 'https://payments.cashfree.com/forms/ZyncPay-299';
                  }, 600);
              }, 1000);
          }, 1200);
      }, 900);
      return;
    }
    
    card.innerHTML = screens()[current]();
    attachHandlers();
    lucide.createIcons();
  }

  function attachHandlers(){
    const nameInput = document.getElementById('nameInput'); 
    if (nameInput) nameInput.oninput = e => { 
      document.getElementById('err1').style.display = 'none'; 
      state.name = e.target.value; 
      persistData(); 
    };
    
    const phoneInput = document.getElementById('phoneInput'); 
    if (phoneInput) phoneInput.oninput = e => { 
      document.getElementById('err2').style.display = 'none'; 
      state.phone = e.target.value.replace(/\D/g,'').slice(0,10); 
      persistData(); 
    };

    // Native Hidden Radio Group Dynamic Selection Engine
    document.querySelectorAll('.pill-radio').forEach(el => { 
      el.onchange = () => { 
        state.idType = el.value; 
        state.idNumber = ''; 
        persistData();
        renderCard(); 
      }; 
    });

    const idInput = document.getElementById('idInput'); 
    if (idInput) {
      idInput.oninput = e => {
        document.getElementById('err3').style.display = 'none';
        let value = e.target.value;
        if (state.idType === 'Aadhaar') {
          let digits = value.replace(/\D/g, '').slice(0, 12);
          let chunks = digits.match(/.{1,4}/g);
          state.idNumber = chunks ? chunks.join(' ') : digits;
          e.target.value = state.idNumber;
        } else {
          state.idNumber = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase();
          e.target.value = state.idNumber;
        }
        persistData();
      };
    }

    const selfieInput = document.getElementById('selfieInput');
    if (selfieInput) selfieInput.onchange = e => {
      const file = e.target.files[0];
      if (file){ 
        compressImage(file, (compressedDataUrl) => {
          state.selfie = compressedDataUrl; 
          renderCard();
        });
      }
    };

    // Keyboard Space & Enter Key Support Activation for Selfie Box Element
    const sBox = document.querySelector('.selfie-box');
    if(sBox) {
      sBox.onkeydown = e => {
        if(e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          selfieInput.click();
        }
      };
    }

    const backBtn = document.getElementById('backBtn'); 
    if (backBtn) backBtn.onclick = () => { 
      current--; 
      persistData(); 
      render(); 
    };

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.onclick = () => {
      if (current === 1) {
        if (!state.name.trim()){ document.getElementById('err1').style.display='flex'; return; }
        if (typeof fbq !== "undefined") { fbq('track', 'Lead'); }
      }
      
      if (current === 2 && state.phone.length !== 10){ document.getElementById('err2').style.display='flex'; return; }
      
      if (current === 3) {
        const err3 = document.getElementById('err3');
        if (state.idType === 'PAN' && !validatePAN(state.idNumber)) { err3.innerHTML = '<i data-lucide="alert-circle" class="icon-small"></i> Please enter a valid 10-character PAN.'; err3.style.display = 'flex'; lucide.createIcons(); return; }
        if (state.idType === 'Aadhaar' && !validateAadhaar(state.idNumber)) { err3.innerHTML = '<i data-lucide="alert-circle" class="icon-small"></i> Please enter a valid 12-digit Aadhaar number.'; err3.style.display = 'flex'; lucide.createIcons(); return; }
      }
      
      if (current === 4) {
        if (!state.selfie){ document.getElementById('err4').style.display='flex'; return; }
        if (typeof fbq !== "undefined") { fbq('trackCustom', 'IdentitySubmitted'); }
      }
      
      current = (current === 4) ? 4.5 : current + 1; 
      persistData(); 
      render();
    };
  }

  function getProcessingFee(amount){ return { total: 299 }; }
  function render(){ renderProgress(); renderCard(); }
  render();

  // --- FAQ AGGREGATOR MODULE ---
  const faqs = [
    { q:"What is the minimum credit score required?", a:"We partner with various lenders. While a score of 700+ gets you the best rates, we have NBFC partners that cater to users with no credit history or lower scores." },
    { q:"How long does approval take?", a:"Eligibility checks are instant. Once you select an offer, final approval and disbursal usually happen within 2-24 hours depending on the bank." },
    { q:"Is the ₹299 processing fee refundable?", a:"The flat ₹299 fee is a one-time platform service fee for KYC verification and credit pull. It is non-refundable once the process begins." },
    { q:"Can I foreclose my loan early?", a:"Yes, most of our lending partners allow foreclosure after a lock-in period of 3 to 6 months. Foreclosure charges may apply depending on the lender." },
    { q:"Do I need to submit physical documents?", a:"No, the entire process is 100% digital. We use CKYC and Aadhaar OTP for verification." },
    { q:"What happens if I miss an EMI?", a:"Missing an EMI will attract late payment charges from the lender and will negatively impact your CIBIL score." },
    { q:"Can I get a loan if I am self-employed?", a:"Yes! We have specialized personal loan products for self-employed professionals based on your banking transactions." },
    { q:"How is my data protected?", a:"We use 256-bit bank-grade encryption. We are RBI-compliant and do not share your data with unauthorized third parties." },
    { q:"Are there any hidden charges?", a:"No. You will see all processing fees, interest rates, and EMI amounts clearly on your screen before you sign the digital loan agreement." },
    { q:"Can I use this loan for business purposes?", a:"Yes, personal loans are unsecured and can be used for any legitimate purpose including business, medical, or travel." }
  ];

  const faqEl = document.getElementById('faqList');
  if(faqEl) {
    faqEl.innerHTML = faqs.map((f,i) => `
      <div class="faq-item" data-i="${i}">
        <div class="faq-q">${f.q}<i data-lucide="plus" class="faq-toggle" style="width:20px;"></i></div>
        <div class="faq-a">${f.a}</div>
      </div>
    `).join('');
    document.querySelectorAll('.faq-item').forEach(el => {
      el.querySelector('.faq-q').onclick = () => {
        const isOpen = el.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(x => { 
          x.classList.remove('open'); 
          x.querySelector('.faq-toggle').setAttribute('data-lucide', 'plus');
        });
        if (!isOpen){ 
          el.classList.add('open'); 
          el.querySelector('.faq-toggle').setAttribute('data-lucide', 'x');
        }
        lucide.createIcons();
      };
    });
  }
})();
