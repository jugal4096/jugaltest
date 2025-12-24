// login.js
import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();
const btn = document.getElementById("startBtn");

btn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    // ✅ login is complete immediately
    window.location.replace("ikndex.html");
  } catch (err) {
    console.error("Login failed:", err);
  }
});
