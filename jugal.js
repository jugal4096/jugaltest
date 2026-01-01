import { auth, db } from "./firebase.js";
import { doc, getDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= STATE ================= */
let currentBranch = null;

/* ================= GOOGLE SHEET ================= */
const SHEET_CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQbu6XLHVIEHULa1bRWT87qvcTVXsdpqDwHFgKq7R-mRRjg24EVXOrGlX1C2ZoBURCj18Qp5GkjHHQ4/pub?output=csv";

/* ================= CREATE ROW ================= */
function createRow(sub) {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${sub.name}</td>
    <td>${sub.credits}</td>
    <td>
      <select ${sub.credits === 0 ? "disabled" : ""}>
        <option value="10">A++</option>
        <option value="9">A+</option>
        <option value="8">A</option>
        <option value="7">B+</option>
        <option value="6">B</option>
        <option value="5">C+</option>
        <option value="4">C</option>
        <option value="0">D</option>
      </select>
    </td>
    <td><button class="drop-btn">❌</button></td>
  `;

  document.querySelector("#subjects tbody").appendChild(tr);
}

/* ================= LOAD SUBJECTS ================= */
function loadSubjects() {
  if (!currentBranch) return;

  const scheme = schemeSelect.value.toUpperCase();
  const semester = semesterSelect.value;
  const tbody = document.querySelector("#subjects tbody");

  tbody.innerHTML = "";

  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      let found = false;

      results.data.forEach(row => {
        if (
          row.Branch?.trim().toUpperCase() === currentBranch &&
          row.Scheme?.trim().toUpperCase() === scheme &&
          String(row.semester).trim() === semester
        ) {
          found = true;
          createRow({
            name: row.Subject,
            credits: Number(row.credits)
          });
        }
      });

      // CBCS exists only for IT → graceful UX
      if (!found) {
        if (scheme === "CBCS" && currentBranch !== "IT") {
          alert("CBCS scheme is currently available only for IT branch.");
        }
      }

      calculateSGPA();
    }
  });
}

/* ================= ADD MANUAL SUBJECT ================= */
function addAdditionalSubject() {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td><input placeholder="Subject Name"></td>
    <td><input type="number" min="0"></td>
    <td>
      <select>
        <option value="10">A++</option>
        <option value="9">A+</option>
        <option value="8">A</option>
        <option value="7">B+</option>
        <option value="6">B</option>
        <option value="5">C+</option>
        <option value="4">C</option>
        <option value="0">D</option>
      </select>
    </td>
    <td><button class="drop-btn">❌</button></td>
  `;

  document.querySelector("#subjects tbody").appendChild(tr);
  calculateSGPA();
}

/* ================= CALCULATE SGPA ================= */
function calculateSGPA() {
  let totalCredits = 0;
  let totalPoints = 0;

  document.querySelectorAll("#subjects tbody tr").forEach(row => {
    const credits = parseFloat(
      row.children[1].querySelector("input")?.value ||
      row.children[1].textContent
    );
    const grade = parseFloat(row.querySelector("select")?.value);

    if (!isNaN(credits) && credits > 0 && !isNaN(grade)) {
      totalCredits += credits;
      totalPoints += credits * grade;
    }
  });

  document.getElementById("results").textContent =
    "SGPA: " +
    (totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00");
}

/* ================= EVENTS ================= */
const schemeSelect = document.getElementById("scheme");
const semesterSelect = document.getElementById("semester");

schemeSelect.addEventListener("change", loadSubjects);
semesterSelect.addEventListener("change", loadSubjects);

document.getElementById("add-subject")
  .addEventListener("click", addAdditionalSubject);

document.getElementById("subjects")
  .addEventListener("change", calculateSGPA);

document.getElementById("subjects")
  .addEventListener("click", e => {
    if (e.target.classList.contains("drop-btn")) {
      e.target.closest("tr").remove();
      calculateSGPA();
    }
  });

/* ================= BRANCH LOGIC ================= */
auth.onAuthStateChanged(async user => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  currentBranch = snap.data().branch?.trim().toUpperCase();
  loadSubjects();
});

/* ================= PROFILE PANEL ================= */
const profileBadge = document.getElementById("profileBadge");
const profilePanel = document.getElementById("profilePanel");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

profileBadge.addEventListener("click", e => {
  e.stopPropagation();
  profilePanel.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  profilePanel.classList.add("hidden");
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

editProfileBtn.addEventListener("click", () => {
  window.location.href = "form.html";
});
