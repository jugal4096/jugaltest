// login.js
import { auth, db } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();
const btn = document.getElementById("startBtn");

btn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // 🆕 First-time user
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "",
        email: user.email || "",
        branch: null,
        createdAt: new Date()
      });

      // 👉 GO TO FORM
      window.location.replace("form.html");
      return;
    }

    // 🧭 Existing user but profile incomplete
    if (!snap.data().branch) {
      window.location.replace("form.html");
      return;
    }

    // ✅ Fully onboarded user
    window.location.replace("index.html");

  } catch (err) {
    console.error("Login failed:", err);
  }
});
