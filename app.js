const MEMBERS = [{"group": "aespa", "name": "Karina", "zh": "Karina", "slugs": ["Karina2"]}, {"group": "aespa", "name": "Giselle", "zh": "Giselle", "slugs": ["Giselle"]}, {"group": "aespa", "name": "Winter", "zh": "Winter", "slugs": ["Winter"]}, {"group": "aespa", "name": "Ningning", "zh": "Ningning", "slugs": ["Ningning"]}, {"group": "IVE", "name": "Gaeul", "zh": "秋天 Gaeul", "slugs": ["Gaeul"]}, {"group": "IVE", "name": "Yujin", "zh": "安兪真 Yujin", "slugs": ["Yujin", "An-Yujin"]}, {"group": "IVE", "name": "Rei", "zh": "怜 Rei", "slugs": ["Rei"]}, {"group": "IVE", "name": "Wonyoung", "zh": "張員瑛 Wonyoung", "slugs": ["Wonyoung"]}, {"group": "IVE", "name": "Liz", "zh": "Liz", "slugs": ["Liz"]}, {"group": "IVE", "name": "Leeseo", "zh": "李瑞 Leeseo", "slugs": ["Leeseo"]}, {"group": "LE SSERAFIM", "name": "Sakura", "zh": "宮脇咲良 Sakura", "slugs": ["Sakura", "Miyawaki-Sakura"]}, {"group": "LE SSERAFIM", "name": "Kim Chaewon", "zh": "金采源 Chaewon", "slugs": ["Kim-Chaewon", "Chaewon"]}, {"group": "LE SSERAFIM", "name": "Huh Yunjin", "zh": "許允真 Yunjin", "slugs": ["Huh-Yunjin", "Yunjin"]}, {"group": "LE SSERAFIM", "name": "Kazuha", "zh": "中村一葉 Kazuha", "slugs": ["Kazuha"]}, {"group": "LE SSERAFIM", "name": "Hong Eunchae", "zh": "洪恩採 Eunchae", "slugs": ["Hong-Eunchae", "Eunchae"]}, {"group": "TWICE", "name": "Nayeon", "zh": "娜璉 Nayeon", "slugs": ["Nayeon"]}, {"group": "TWICE", "name": "Jeongyeon", "zh": "定延 Jeongyeon", "slugs": ["Jeongyeon"]}, {"group": "TWICE", "name": "Momo", "zh": "Momo", "slugs": ["Momo"]}, {"group": "TWICE", "name": "Sana", "zh": "Sana", "slugs": ["Sana"]}, {"group": "TWICE", "name": "Jihyo", "zh": "志效 Jihyo", "slugs": ["Jihyo"]}, {"group": "TWICE", "name": "Mina", "zh": "Mina", "slugs": ["Mina"]}, {"group": "TWICE", "name": "Dahyun", "zh": "多賢 Dahyun", "slugs": ["Dahyun"]}, {"group": "TWICE", "name": "Chaeyoung", "zh": "彩瑛 Chaeyoung", "slugs": ["Chaeyoung"]}, {"group": "TWICE", "name": "Tzuyu", "zh": "周子瑜 Tzuyu", "slugs": ["Tzuyu"]}];
const GROUPS = [...new Set(MEMBERS.map(m => m.group))];
const $ = id => document.getElementById(id);
const pages = ["settingsPage", "gamePage", "resultPage"];

const state = {
  members: [],
  selectedMembers: [],
  playerMode: "single",
  quizType: "name",
  totalQuestions: 12,
  questionIndex: 0,
  penaltyEnabled: true,
  scores: { player1: 0 },
  active: false,
  pool: [],
  options: [],
  correct: null,
  correctIndex: -1
};

function showPage(id) {
  pages.forEach(page => $(page).classList.toggle("active", page === id));
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function placeholder(name) {
  const safe = name.replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#f1ddff"/><stop offset="1" stop-color="#dcecff"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="48%" text-anchor="middle" font-family="Arial" font-size="54" fill="#5b4b75">${safe}</text>
    <text x="50%" y="56%" text-anchor="middle" font-family="Arial" font-size="30" fill="#7c7190">圖片暫時無法載入</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

$("groupList").innerHTML = GROUPS.map(group => `
  <label class="group-choice">
    <input type="checkbox" name="group" value="${group}" checked>
    ${group}
  </label>
`).join("");

async function resolveMember(member) {
  try {
    const params = new URLSearchParams({ slugs: member.slugs.join(",") });
    const response = await fetch(`/.netlify/functions/kpopping-image?${params}`);
    if (!response.ok) throw new Error("圖片 API 失敗");
    const data = await response.json();
    return {
      ...member,
      image: data.image || placeholder(member.zh),
      source: data.source || `https://kpopping.com/idols`
    };
  } catch {
    return {
      ...member,
      image: placeholder(member.zh),
      source: `https://kpopping.com/idols`
    };
  }
}

$("startButton").addEventListener("click", startGame);
$("homeButton").addEventListener("click", () => showPage("settingsPage"));
$("restartButton").addEventListener("click", startGame);

async function startGame() {
  const selectedGroups = [...document.querySelectorAll('input[name="group"]:checked')].map(el => el.value);
  const selected = MEMBERS.filter(member => selectedGroups.includes(member.group));

  if (selected.length < 4) {
    $("loadStatus").textContent = "請至少選擇能提供 4 位成員的女團。";
    return;
  }

  $("startButton").disabled = true;
  $("startButton").textContent = "載入圖片中…";
  $("loadStatus").textContent = "正在從 Kpopping 取得成員照片…";

  state.members = await Promise.all(selected.map(resolveMember));
  state.selectedMembers = state.members.filter(m => !m.image.startsWith("data:"));

  if (state.selectedMembers.length < 4) {
    $("loadStatus").textContent = "可用照片不足 4 張。可能是 Kpopping 阻擋請求或頁面網址已變更。";
    $("startButton").disabled = false;
    $("startButton").textContent = "重新嘗試";
    return;
  }

  state.playerMode = document.querySelector('input[name="playerMode"]:checked').value;
  state.quizType = document.querySelector('input[name="quizType"]:checked').value;
  state.totalQuestions = Math.min(
    Number(document.querySelector('input[name="questionCount"]:checked').value),
    state.selectedMembers.length
  );
  state.penaltyEnabled = $("penaltyEnabled").checked;
  state.questionIndex = 0;
  state.scores = state.playerMode === "single" ? { player1: 0 } : { player1: 0, player2: 0 };
  state.pool = shuffle(state.selectedMembers);

  $("startButton").disabled = false;
  $("startButton").textContent = "開始遊戲";
  $("loadStatus").textContent = `已取得 ${state.selectedMembers.length} 位成員照片`;
  $("multiHelp").classList.toggle("hidden", state.playerMode !== "multi");
  showPage("gamePage");
  nextQuestion();
}

function updateHeader(extra = "") {
  const shown = Math.min(state.questionIndex, state.totalQuestions);
  $("progressText").textContent = `第 ${shown} / ${state.totalQuestions} 題${extra ? `　${extra}` : ""}`;
  $("progressBar").style.width = `${shown / state.totalQuestions * 100}%`;
  $("scoreText").textContent = Object.entries(state.scores).map(([player, score]) =>
    `${player === "player1" ? "玩家 1" : "玩家 2"}：${score}`
  ).join("　");
}

function nextQuestion() {
  if (state.questionIndex >= state.totalQuestions) {
    showResults();
    return;
  }
  state.questionIndex++;
  state.active = true;
  $("answerStamp").textContent = "";
  $("centerMessage").classList.add("hidden");
  $("nameOptions").innerHTML = "";
  $("photoOptions").innerHTML = "";

  state.correct = state.pool.pop();
  const wrongs = shuffle(state.selectedMembers.filter(m => m.name !== state.correct.name)).slice(0, 3);
  state.options = shuffle([state.correct, ...wrongs]);
  state.correctIndex = state.options.findIndex(m => m.name === state.correct.name);

  state.quizType === "name" ? renderNameQuestion() : renderPhotoQuestion();
  updateHeader();
}

function renderNameQuestion() {
  $("nameModeArea").classList.remove("hidden");
  $("photoModeArea").classList.add("hidden");
  $("questionTitle").textContent = `這位 ${state.correct.group} 成員是誰？`;
  $("mainImage").src = state.correct.image;
  $("mainImage").onerror = () => { $("mainImage").src = placeholder(state.correct.zh); };
  $("mainSource").href = state.correct.source;

  state.options.forEach((member, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.textContent = `${index + 1}. ${member.zh}`;
    button.addEventListener("click", () => {
      if (state.playerMode === "single") answer(index, "player1");
    });
    $("nameOptions").appendChild(button);
  });
}

function renderPhotoQuestion() {
  $("nameModeArea").classList.add("hidden");
  $("photoModeArea").classList.remove("hidden");
  $("questionTitle").textContent = `請找出：${state.correct.group}－${state.correct.zh}`;

  state.options.forEach((member, index) => {
    const card = document.createElement("button");
    card.className = "photo-card";
    card.innerHTML = `
      <img src="${member.image}" alt="選項 ${index + 1}">
      <span class="photo-number">${index + 1}</span>
      <a class="image-source" href="${member.source}" target="_blank" rel="noopener">Kpopping 來源</a>
    `;
    card.querySelector("img").onerror = e => { e.target.src = placeholder(member.zh); };
    card.addEventListener("click", event => {
      if (event.target.closest(".image-source")) return;
      if (state.playerMode === "single") answer(index, "player1");
    });
    $("photoOptions").appendChild(card);
  });
}

function answer(index, player) {
  if (!state.active) return;
  state.active = false;
  const correct = index === state.correctIndex;
  if (correct) state.scores[player]++;
  else if (state.penaltyEnabled) state.scores[player] = Math.max(0, state.scores[player] - 1);

  reveal(index, correct);
  const delta = correct ? "+1" : (state.penaltyEnabled ? "-1" : "0");
  const message = $("centerMessage");
  message.textContent = `${player === "player1" ? "玩家 1" : "玩家 2"} ${delta}`;
  message.style.color = correct ? "#4ade80" : (state.penaltyEnabled ? "#fb7185" : "#fde047");
  message.classList.remove("hidden");
  updateHeader(correct ? "答對了！" : `正解：${state.correct.zh}`);
  setTimeout(nextQuestion, 1900);
}

function reveal(selected, correct) {
  const children = state.quizType === "name" ? [...$("nameOptions").children] : [...$("photoOptions").children];
  children.forEach((element, index) => {
    if (index === state.correctIndex) element.classList.add("correct");
    if (index === selected && !correct) element.classList.add("wrong");
    element.disabled = true;
  });
  if (state.quizType === "name") {
    $("answerStamp").textContent = correct ? "✓" : "✕";
    $("answerStamp").style.color = correct ? "#22c55e" : "#ef4444";
  }
}

window.addEventListener("keydown", event => {
  if (state.playerMode !== "multi" || !state.active) return;
  const maps = { player1: ["z","x","c","v"], player2: ["/","1","2","3"] };
  for (const [player, keys] of Object.entries(maps)) {
    const index = keys.indexOf(event.key.toLowerCase());
    if (index !== -1) {
      event.preventDefault();
      answer(index, player);
      return;
    }
  }
});

function showResults() {
  state.active = false;
  showPage("resultPage");
  if (state.playerMode === "multi") {
    const p1 = state.scores.player1, p2 = state.scores.player2;
    $("resultEmoji").textContent = p1 === p2 ? "🤝" : "🏆";
    $("resultTitle").textContent = p1 === p2 ? "平手！" : (p1 > p2 ? "玩家 1 獲勝！" : "玩家 2 獲勝！");
    $("resultScore").textContent = `玩家 1：${p1}　｜　玩家 2：${p2}`;
    $("resultComment").textContent = "再比一場，看誰是真正的女團百科！";
    return;
  }
  const score = state.scores.player1;
  const percent = Math.round(score / state.totalQuestions * 100);
  let result = ["😵","還要多認識一下","從喜歡的團開始複習，很快就會進步！"];
  if (percent >= 90) result = ["👑","女團百科全書","幾乎沒有成員能逃過你的眼睛！"];
  else if (percent >= 80) result = ["🔥","資深女團粉","辨識力非常強，只差一點就滿分！"];
  else if (percent >= 60) result = ["✨","女團達人","大部分成員都難不倒你。"];
  else if (percent >= 40) result = ["🎧","正在入坑","已經認得不少成員，再接再厲！"];
  else if (percent >= 20) result = ["🌱","女團新手","還有很多寶藏成員等你認識。"];
  $("resultEmoji").textContent = result[0];
  $("resultTitle").textContent = result[1];
  $("resultScore").textContent = `得分：${score} / ${state.totalQuestions}（${percent}%）`;
  $("resultComment").textContent = result[2];
}
