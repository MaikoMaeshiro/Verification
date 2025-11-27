let idols = [];

const yearInput = document.getElementById("yearInput");
const searchBtn = document.getElementById("searchBtn");
const resultDiv = document.getElementById("result");
const tabs = document.getElementById("tabs");
const tabButtons = tabs.querySelectorAll(".tab");
const loading = document.getElementById("loading");

let filtered = [];

//==============================
// JSONデータ読み込み
//==============================
fetch("idolData.json")
  .then(res => res.json())
  .then(data => {
    // ネスト構造 → 平坦に変換
    idols = data.flatMap(group =>
      group.members.map(m => ({
        name: m.name,
        group: group.group,
        birth: m.birth,
        debutYear: group.debutYear
      }))
    );
  })

//==============================
// 検索ボタンクリック
//==============================
searchBtn.addEventListener("click", (e) => {
  // 波紋アニメーション
  searchBtn.classList.add("ripple");
  setTimeout(() => searchBtn.classList.remove("ripple"), 500);

  const year = yearInput.value.trim();
  resultDiv.innerHTML = "";
  resultDiv.classList.remove("show");
  loading.style.display = "block";

  if (year === "") {
    resultDiv.textContent = "年を入力してください。";
    loading.style.display = "none";
    return;
  }

  setTimeout(() => { // 読み込み演出
    filtered = idols.filter(idol => idol.birth.startsWith(year));
    loading.style.display = "none";

    if (filtered.length === 0) {
      resultDiv.textContent = `${year}年生まれのアイドルは見つかりません。`;
      tabs.style.display = "none";
      resultDiv.classList.add("show");
      return;
    }

    tabs.style.display = "flex";

    tabButtons.forEach(t => t.classList.remove("active"));
    const allTab = [...tabButtons].find(t => t.dataset.tab === "all");
    allTab.classList.add("active");

    showAllView();
  }, 400);
});

//==============================
// タブ切り替え
//==============================
tabButtons.forEach(tab => {
  tab.addEventListener("click", () => {
    tabButtons.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const mode = tab.dataset.tab;
    resultDiv.classList.remove("show");

    setTimeout(() => {
      resultDiv.innerHTML = "";

      if (mode === "all") showAllView();
      else if (mode === "group") showGroupView();
      else if (mode === "month") showMonthView();

    }, 200);
  });
});

//==============================
// フェードイン補助関数
//==============================
function fadeInElement(el) {
  el.classList.add("fade-in");
  requestAnimationFrame(() => {
    el.classList.add("show");
  });
}

//==============================
// 全員表示
//==============================
function showAllView() {
  const sorted = filtered.sort((a, b) => new Date(a.birth) - new Date(b.birth));
  sorted.forEach(idol => {
    const p = document.createElement("p");
    p.textContent = `${idol.name} (${idol.birth}) - ${idol.group}`;
    resultDiv.appendChild(p);
  });
  resultDiv.classList.add("show");
  fadeInElement(resultDiv);
}

//==============================
// グループ別表示
//==============================
function showGroupView() {
  const grouped = {};

  filtered.forEach(idol => {
    if (!grouped[idol.group]) grouped[idol.group] = [];
    grouped[idol.group].push(idol);
  });

  for (const group in grouped) {
    const h2 = document.createElement("h2");
    h2.textContent = group;
    resultDiv.appendChild(h2);

    grouped[group]
      .sort((a, b) => new Date(a.birth) - new Date(b.birth))
      .forEach(idol => {
        const p = document.createElement("p");
        p.textContent = `${idol.name} (${idol.birth})`;
        resultDiv.appendChild(p);
      });
  }
  resultDiv.classList.add("show");
  fadeInElement(resultDiv);
}

//==============================
// 誕生月別表示
//==============================
function showMonthView() {
  // 12ヶ月分を準備
  const months = {};
  for (let i = 1; i <= 12; i++) {
    const key = i.toString().padStart(2, "0");
    months[key] = [];
  }

  filtered.forEach(idol => {
    const month = idol.birth.slice(5, 7);
    if (months[month]) months[month].push(idol);
  });

  for (let i = 1; i <= 12; i++) {
    const key = i.toString().padStart(2, "0");
    const list = months[key];

    const section = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = `${i}月`;
    section.appendChild(h2);

    if (list.length > 0) {
      list.sort((a, b) => new Date(a.birth) - new Date(b.birth));
      list.forEach(idol => {
        const p = document.createElement("p");
        p.textContent = `${idol.name} (${idol.birth}) - ${idol.group}`;
        section.appendChild(p);
      });
    }

    resultDiv.appendChild(section);
  }

  resultDiv.classList.add("show");
  fadeInElement(resultDiv);
}
