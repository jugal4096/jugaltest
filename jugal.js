/* ================= FIREBASE ================= */
import { auth, db } from "./firebase.js";
import { doc, getDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= STATE ================= */
let isITBranch = false;

/* ================= SUBJECT DATA (IT ONLY) ================= */
const schemeSubjects = {
  cbc3: [
    { name: "Engineering Mathematics III", credits: 3 },
    { name: "Discrete Mathematical Structures", credits: 3 },
    { name: "Data Structures", credits: 3 },
    { name: "Computer Networks", credits: 3 },
    { name: "Object Oriented Programming", credits: 3 },
    { name: "Digital Electronics and Microprocessors", credits: 3 },
    { name: "Lab- Data Structures", credits: 1 },
    { name: "Lab- Computer Networks", credits: 1 },
    { name: "Lab- Object Oriented Programming", credits: 1 },
    { name: "Lab- Digital Electronics and Microprocessors", credits: 1 }
  ],
  cbc4: [
    { name: "Engineering Mathematics IV", credits: 4 },
    { name: "Design and Analysis of Algorithms", credits: 3 },
    { name: "Database Management Systems", credits: 3 },
    { name: "Operating System", credits: 3 },
    { name: "Internet of Things", credits: 3 },
    { name: "Open Elective-I", credits: 3 },
    { name: "Environmental Science", credits: 0 },
    { name: "Lab- Design and Analysis of Algorithms", credits: 1 },
    { name: "Lab- Database Management Systems", credits: 1 },
    { name: "Lab- Operating System", credits: 1 },
    { name: "Lab- Internet of Things", credits: 1 },
    { name: "Universal Human Values II", credits: 3 }
  ],
  cbc5: [
    { name: "Theory of Computation", credits: 4 },
    { name: "Artificial Intelligence", credits: 3 },
    { name: "Machine Learning", credits: 3 },
    { name: "Software Engineering", credits: 3 },
    { name: "Professional Ethics and Cyber Laws", credits: 3 },
    { name: "Data Structures and Algorithms (OEC)", credits: 3 },
    { name: "Lab- Machine Learning", credits: 1 },
    { name: "Lab- Software Engineering", credits: 1 },
    { name: "Computer Programming Lab I", credits: 2 },
    { name: "Mini Project I", credits: 2 }
  ],
  cbc6: [
    { name: "Professional Elective I", credits: 3 },
    { name: "Professional Elective II", credits: 3 },
    { name: "Professional Elective III", credits: 3 },
    { name: "Business Intelligence", credits: 3 },
    { name: "Introduction to Artificial Intelligence", credits: 3 },
    { name: "Computer Programming Lab II", credits: 1 },
    { name: "Lab- Professional Elective I", credits: 1 },
    { name: "Lab- Professional Elective II", credits: 1 },
    { name: "Mini Project II", credits: 2 }
  ],
  cbc7: [
    { name: "Advanced Java", credits: 1 },
    { name: "Advanced Java Lab", credits: 2 },
    { name: "Professional Elective IV", credits: 3 },
    { name: "Professional Elective V", credits: 3 },
    { name: "Lab- Professional Elective IV", credits: 1 },
    { name: "HSMC IV", credits: 3 },
    { name: "Introduction to Machine Learning", credits: 3 },
    { name: "Open Elective V", credits: 3 },
    { name: "Project I", credits: 6 }
  ],
  cbc8: [
    { name: "Project II / Internship / On Job Training", credits: 6 }
  ]
};

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
  if (!isITBranch) return;

  const scheme = schemeSelect.value;
  const semester = semesterSelect.value;
  const tbody = document.querySelector("#subjects tbody");

  tbody.innerHTML = "";
  schemeSubjects[scheme + semester]?.forEach(createRow);

  calculateSGPA();
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
    const creditCell = row.children[1];
    const credits = parseFloat(
      creditCell.querySelector("input")?.value ||
      creditCell.textContent
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

  const branch = snap.data().branch;

  if (branch !== "IT") {
    isITBranch = false;
    schemeSelect.disabled = true;
    semesterSelect.disabled = true;

    if (!sessionStorage.getItem("branchNoticeShown")) {
      alert(
        "Your branch subjects will be introduced soon.\n\n" +
        "Please add subjects manually for now."
      );
      sessionStorage.setItem("branchNoticeShown", "true");
    }
  } else {
    isITBranch = true;
    schemeSelect.disabled = false;
    semesterSelect.disabled = false;
    loadSubjects();
  }
});
/* ================= PROFILE BADGE LOGIC ================= */
const profileBadge = document.getElementById("profileBadge");
const profilePanel = document.getElementById("profilePanel");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

/* Toggle panel on badge click */
profileBadge.addEventListener("click", (e) => {
  e.stopPropagation(); // prevent immediate close
  profilePanel.classList.toggle("hidden");
});

/* Close panel when clicking outside */
document.addEventListener("click", () => {
  profilePanel.classList.add("hidden");
});

/* ================= LOGOUT ================= */
import { signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});

/* ================= EDIT PROFILE ================= */
editProfileBtn.addEventListener("click", () => {
  window.location.href = "form.html";
});
