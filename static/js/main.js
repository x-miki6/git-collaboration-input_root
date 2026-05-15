console.log("JS loaded");

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

    // 🔥 ここが重要：手書き認識
    recognizeHandwriting(canvas);
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

    recognizeHandwriting(canvas);
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
  // テキスト検索
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
// 手書き → 画像
// =========================
function getCanvasImage(canvas) {
  return canvas.toDataURL("image/png");
}


// =========================
// 手書き認識（Flaskへ）
// =========================
function recognizeHandwriting(canvas) {
  const image = getCanvasImage(canvas);

  fetch("/recognize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ image: image })
  })
  .then(res => res.json())
  .then(data => {
    showSymbols(data.symbols);
  });
}


// =========================
// 認識結果表示
// =========================
function showSymbols(symbols) {
  const container = document.getElementById("candidates");

  if (!symbols || symbols.length === 0) {
    container.innerHTML = "<p>認識できませんでした</p>";
    return;
  }

  container.innerHTML = `
    <p>これですか？</p>
    ${symbols.map(s =>
      `<button onclick="searchFromCandidate('${s}')">${s}</button>`
    ).join("")}
  `;
}


// =========================
// DB検索（テキスト）
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


// =========================
// 結果表示
// =========================
function showResult(name, meanings) {
  document.getElementById("result").innerHTML =
    `<h2>${name}</h2><p>${meanings}</p>`;
}
