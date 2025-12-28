// authgard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  try {
    // 🔒 Not logged in → login
    if (!user) {
      window.location.replace("login.html");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    // 🧱 User doc missing → back to login
    if (!snap.exists()) {
      window.location.replace("login.html");
      return;
    }

    // 🧭 Profile incomplete → onboarding
    if (!snap.data().branch) {
      window.location.replace("form.html");
      return;
    }

    // ✅ Auth OK → stay on page
  } catch (err) {
    console.error("Auth guard error:", err);
    window.location.replace("login.html");
  }
});


