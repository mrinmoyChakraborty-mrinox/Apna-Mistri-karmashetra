// ===================== UI HELPERS =====================

function showMessage(message, type) {
  const box = document.getElementById("messageBox");
  if (!box) return;
  box.textContent = message;
  box.className = `message ${type} active`;
  setTimeout(() => box.classList.remove("active"), 4000);
}

// ===================== EMAIL TABS =====================

const tabs = document.querySelectorAll(".tab");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");

// Default: Sign Up active (HTML already sets this, but we enforce)
if (signupForm) signupForm.classList.add("active");
if (signinForm) signinForm.classList.remove("active");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.getAttribute("data-tab");

    if (target === "signin") {
      signinForm.classList.add("active");
      signupForm.classList.remove("active");
    } else {
      signupForm.classList.add("active");
      signinForm.classList.remove("active");
    }
  });
});

// ===================== PHONE (UI ONLY FOR NOW) =====================

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

const sendOtpBtn = document.getElementById("sendOtp");
const verifyOtpBtn = document.getElementById("verifyOtp");
const phoneInput = document.getElementById("phoneInput");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");

if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", () => {
    const phone = phoneInput?.value || "";

    if (!validatePhone(phone)) {
      showMessage("Enter a valid 10-digit phone number", "error");
      return;
    }

    // UI only (Firebase will handle later in auth.js)
    otpSection?.classList.add("active");
    showMessage("OTP requested. Firebase will handle sending.", "success");
  });
}

if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", () => {
    const otp = otpInput?.value || "";

    if (otp.length !== 6) {
      showMessage("Please enter 6-digit OTP", "error");
      return;
    }

    // UI only — no fake verification
    showMessage("OTP entered. Firebase will verify.", "success");
  });
}

// ===================== EMAIL FORMS (UI VALIDATION ONLY) =====================

// Sign In
const emailSignInForm = document.getElementById("emailSignInForm");
if (emailSignInForm) {
  emailSignInForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("emailSignInInput")?.value;
    const password = document.getElementById("passwordSignInInput")?.value;

    if (!email || !password) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    // auth.js handles real login
    showMessage("Signing in…", "success");
  });
}

// Sign Up
const emailSignUpForm = document.getElementById("emailSignUpForm");
if (emailSignUpForm) {
  emailSignUpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("nameSignUpInput")?.value;
    const email = document.getElementById("emailSignUpInput")?.value;
    const password = document.getElementById("passwordSignUpInput")?.value;
    const confirm = document.getElementById("confirmPasswordSignUpInput")?.value;

    if (!name || !email || !password || !confirm) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (password !== confirm) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }

    // auth.js handles real signup
    showMessage("Creating account…", "success");
  });
}
// ================= PHONE TOGGLE =================

const openPhoneBtn = document.getElementById("openPhoneAuth");
const backBtn = document.getElementById("backToDefault");

const defaultSection = document.getElementById("defaultAuthSection");
const phoneSection = document.getElementById("phoneAuthSection");

if (openPhoneBtn) {
    openPhoneBtn.addEventListener("click", () => {
        defaultSection.style.display = "none";
        phoneSection.style.display = "block";
    });
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        phoneSection.style.display = "none";
        defaultSection.style.display = "block";
        document.getElementById("otpSection").classList.remove("active");
    });
}
