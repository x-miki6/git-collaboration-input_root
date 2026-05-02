window.onload = function () {

  // =========================
  // Canvas（手書き）
  // =========================
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let drawing = false;

  canvas.addEventListener("mousedown", () => {
    drawing = true;
  });

  canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();

    // 描き終わったら候補表示（仮）
    showCandidates();
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  // スマホ対応
  canvas.addEventListener("touchstart", () => {
    drawing = true;
  });

  canvas.addEventListener("touchend", () => {
    drawing = false;
    ctx.beginPath();

    showCandidates();
  });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (!drawing) return;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  // クリア
  window.clearCanvas = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // =========================
  // テキスト検索（DB連携）
  // =========================
  const input = document.getElementById("searchInput");

  input.addEventListener("input", searchSymbol);

  input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      searchSymbol();
    }
  });

};


// =========================
// DB検索（Flask API）
// =========================
function searchSymbol() {
  const input = document.getElementById("searchInput").value;

  fetch(`/search?q=${input}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("candidates");

      if (data.length === 0) {
        container.innerHTML = "<p>見つかりませんでした</p>";
        return;
      }

      container.innerHTML = data.map(item => `
        <button onclick="showResult('${item.name}', '${item.meanings}')">
          ${item.name}
        </button>
      `).join("");
    });
}


// =========================
// 結果表示
// =========================
function showResult(name, meanings) {
  document.getElementById("result").innerHTML =
    `<h2>${name}</h2><p>${meanings}</p>`;
}


// =========================
// 手書き候補（仮）
// =========================
function showCandidates() {
  const container = document.getElementById("candidates");

  const candidates = ["Σ", "σ", "π"];

  container.innerHTML = `
    <p>これですか？</p>
    ${candidates.map(c =>
      `<button onclick="searchFromCandidate('${c}')">${c}</button>`
    ).join("")}
  `;
}


// =========================
// 候補クリック → DB検索
// =========================
function searchFromCandidate(symbol) {
  fetch(`/search?q=${symbol}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        showResult(data[0].name, data[0].meanings);
      }
    });
}