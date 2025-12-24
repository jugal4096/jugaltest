/* ================= ADD SEMESTER ================= */
function addSemester() {
    const table = document.getElementById("cgpa-table");
    const tr = document.createElement("tr");
  
    tr.innerHTML = `
      <td><input placeholder="Sem (e.g. 5)"></td>
      <td><input type="number" min="0"></td>
      <td><input type="number" min="0" max="10" step="0.01"></td>
      <td><button class="drop-btn">❌</button></td>
    `;
  
    table.appendChild(tr);
  }
  
  /* ================= CALCULATE CGPA ================= */
  function calculateCGPA() {
    const rows = document.querySelectorAll("#cgpa-table tr");
    let totalCredits = 0;
    let weightedSum = 0;
  
    for (let i = 1; i < rows.length; i++) {
      const inputs = rows[i].querySelectorAll("input");
  
      const credits = parseFloat(inputs[1].value);
      const sgpa = parseFloat(inputs[2].value);
  
      if (!isNaN(credits) && !isNaN(sgpa)) {
        totalCredits += credits;
        weightedSum += credits * sgpa;
      }
    }
  
    const cgpa = totalCredits ? weightedSum / totalCredits : 0;
    document.getElementById("cgpa-result").textContent = `CGPA: ${cgpa.toFixed(2)}`;
  }
  
  /* ================= EVENTS ================= */
  document.getElementById("add-sem").addEventListener("click", addSemester);
  
  document.getElementById("cgpa-table").addEventListener("input", calculateCGPA);
  
  document.getElementById("cgpa-table").addEventListener("click", e => {
    if (e.target.classList.contains("drop-btn")) {
      e.target.closest("tr").remove();
      calculateCGPA();
    }
  });