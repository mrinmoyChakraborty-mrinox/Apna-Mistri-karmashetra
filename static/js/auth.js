import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
async function fetchFirebaseConfig() {
  const response = await fetch('/api/get_firebase_config');
  return await response.json();
}
const app = initializeApp(await fetchFirebaseConfig());
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
async function sendTokenToBackend(user) {

    const idToken = await user.getIdToken();

    const res = await fetch("/firebase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    
    const data = await res.json();
    if (data.redirect) {
    window.location.href = data.redirect;
    return;
    }

    if (data.status === "new") {
      window.location.href = "/select-role";
    }
    else if (data.role === "worker") {
      window.location.href = "/worker/dashboard";
    }
    else {
      window.location.href = "/customer/dashboard";
    }
  }

  // ---------------- Google Login ----------------

  const googleBtn = document.getElementById("google-login-btn");

  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        await sendTokenToBackend(result.user);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ---------------- Email Signup ----------------

  const signupForm = document.getElementById("emailSignUpForm");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("emailSignUpInput").value;
      const password = document.getElementById("passwordSignUpInput").value;

      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendTokenToBackend(cred.user);
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // ---------------- Email Login ----------------

  const loginForm = document.getElementById("emailSignInForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("emailSignInInput").value;
      const password = document.getElementById("passwordSignInInput").value;

      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await sendTokenToBackend(cred.user);
      } catch (err) {
        alert(err.message);
      }
    });
  }
