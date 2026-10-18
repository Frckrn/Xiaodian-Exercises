(function () {
  "use strict";

  const STORAGE_KEYS = {
    bank: "xiaodian.bank.v1",
    records: "xiaodian.records.v1",
  };

  const TYPE_META = {
    single: { label: "单选题", short: "单选", hint: "请选择一个正确答案" },
    multiple: { label: "多选题", short: "多选", hint: "请选择所有正确答案" },
    judge: { label: "判断题", short: "判断", hint: "请判断该说法是否正确" },
  };

  const MODE_META = {
    practice: {
      label: "做题模式",
      short: "做题",
      kicker: "PRACTICE",
      index: "01",
      icon: "pen",
      description: "逐题作答，提交后立刻揭晓对错与解析。把知识点一点点嚼碎。",
      tags: ["即时判题", "逐题解析"],
      action: "开始做题",
      time: "约 5–10 分钟",
    },
    memorize: {
      label: "背题模式",
      short: "背题",
      kicker: "MEMORIZE",
      index: "02",
      icon: "book",
      description: "答案与解析直接展开，左右翻页快速过题。适合考前记忆与建立印象。",
      tags: ["答案常显", "快速翻阅"],
      action: "开始背题",
      time: "自由浏览",
    },
    exam: {
      label: "考试模式",
      short: "考试",
      kicker: "EXAM",
      index: "03",
      icon: "clipboard",
      description: "限时或无限时完成整套试卷，交卷后统一评分，集中查看错题。",
      tags: ["限时 / 不限时", "交卷评分"],
      action: "进入考试",
      time: "完整试卷",
    },
  };

  const DEMO_QUESTIONS = [
    {
      type: "single",
      stem: "“学而不思则罔，思而不学则殆”出自下列哪部典籍？",
      options: [
        { key: "A", text: "《论语》" },
        { key: "B", text: "《孟子》" },
        { key: "C", text: "《大学》" },
        { key: "D", text: "《中庸》" },
      ],
      answer: ["A"],
      analysis: "这句话出自《论语·为政》，强调学习与思考必须相互结合。只读书不思考会迷惑，只空想不读书也会陷入疑惑。",
      score: 2,
      category: "传统文化",
      difficulty: "简单",
    },
    {
      type: "single",
      stem: "在 HTTP 状态码中，404 通常表示什么？",
      options: [
        { key: "A", text: "请求成功" },
        { key: "B", text: "服务器内部错误" },
        { key: "C", text: "请求的资源不存在" },
        { key: "D", text: "页面被永久重定向" },
      ],
      answer: ["C"],
      analysis: "404 Not Found 表示服务器找不到客户端请求的资源。500 才表示服务器内部错误，301/308 表示永久重定向。",
      score: 2,
      category: "计算机基础",
      difficulty: "简单",
    },
    {
      type: "single",
      stem: "太阳系中体积最大的行星是？",
      options: [
        { key: "A", text: "地球" },
        { key: "B", text: "木星" },
        { key: "C", text: "土星" },
        { key: "D", text: "海王星" },
      ],
      answer: ["B"],
      analysis: "木星是太阳系中体积和质量最大的行星，体积约为地球的 1,300 多倍。土星体积次之。",
      score: 2,
      category: "自然科学",
      difficulty: "简单",
    },
    {
      type: "multiple",
      stem: "下列哪些属于 Python 的内置数据类型？",
      options: [
        { key: "A", text: "list" },
        { key: "B", text: "dict" },
        { key: "C", text: "array" },
        { key: "D", text: "tuple" },
      ],
      answer: ["A", "B", "D"],
      analysis: "list、dict、tuple 都是 Python 的内置类型。array 不是内置类型，需要通过 array 模块或 NumPy 等第三方库使用。",
      score: 2,
      category: "计算机基础",
      difficulty: "中等",
    },
    {
      type: "multiple",
      stem: "下列能源中，属于可再生能源的有？",
      options: [
        { key: "A", text: "太阳能" },
        { key: "B", text: "风能" },
        { key: "C", text: "煤炭" },
        { key: "D", text: "水能" },
      ],
      answer: ["A", "B", "D"],
      analysis: "太阳能、风能和水能可以在自然循环中持续补充，属于可再生能源。煤炭属于化石能源，储量有限且不可再生。",
      score: 2,
      category: "自然科学",
      difficulty: "简单",
    },
    {
      type: "multiple",
      stem: "下列人物中，属于“唐宋八大家”的有？",
      options: [
        { key: "A", text: "韩愈" },
        { key: "B", text: "柳宗元" },
        { key: "C", text: "李白" },
        { key: "D", text: "苏轼" },
      ],
      answer: ["A", "B", "D"],
      analysis: "唐宋八大家指唐代的韩愈、柳宗元和宋代的欧阳修、苏洵、苏轼、苏辙、王安石、曾巩。李白以诗著称，不在其列。",
      score: 2,
      category: "传统文化",
      difficulty: "中等",
    },
    {
      type: "judge",
      stem: "在标准大气压下，纯水的沸点是 100°C。",
      options: [
        { key: "A", text: "正确" },
        { key: "B", text: "错误" },
      ],
      answer: ["A"],
      analysis: "在标准大气压（101.325 kPa）下，纯水的沸点为 100°C。气压降低时，沸点也会随之降低。",
      score: 2,
      category: "自然科学",
      difficulty: "简单",
    },
    {
      type: "judge",
      stem: "HTTP 协议本身是无状态协议。",
      options: [
        { key: "A", text: "正确" },
        { key: "B", text: "错误" },
      ],
      answer: ["A"],
      analysis: "HTTP 本身不会保存两次请求之间的状态。实际开发中通常使用 Cookie、Session 或 Token 等机制来维持登录态。",
      score: 2,
      category: "计算机基础",
      difficulty: "中等",
    },
    {
      type: "judge",
      stem: "《史记》的作者是班固。",
      options: [
        { key: "A", text: "正确" },
        { key: "B", text: "错误" },
      ],
      answer: ["B"],
      analysis: "《史记》的作者是西汉史学家司马迁；班固所著的是《汉书》，两者常并称“史汉”。",
      score: 2,
      category: "历史人文",
      difficulty: "中等",
    },
    {
      type: "single",
      stem: "一个不透明的袋子里有 3 个红球和 2 个蓝球，随机摸出一个球，摸到红球的概率是？",
      options: [
        { key: "A", text: "2/5" },
        { key: "B", text: "3/5" },
        { key: "C", text: "1/2" },
        { key: "D", text: "3/2" },
      ],
      answer: ["B"],
      analysis: "袋中共有 5 个球，其中红球 3 个。每个球被摸到的可能性相同，所以摸到红球的概率为 3 ÷ 5 = 3/5。",
      score: 2,
      category: "数学",
      difficulty: "简单",
    },
  ].map((question, index) => ({
    ...question,
    id: `demo-${index + 1}`,
    rowNumber: index + 2,
  }));

  const ICONS = {
    arrowLeft: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    check: '<path d="m5 12 4.2 4.2L19 6.5"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>',
    download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2"/><path d="m8.5 12 2 2 4.5-4.5"/><path d="M8.5 18h7"/>',
    sparkles: '<path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3z"/><path d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/><path d="m5 14 .7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    flag: '<path d="M5 21V4"/><path d="M5 5c4-2 7 2 11 0v8c-4 2-7-2-11 0"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    alert: '<path d="M10.3 3.6 2.4 17.2A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.8L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    award: '<circle cx="12" cy="8" r="5"/><path d="m8.2 12.6-1.2 8 5-2.4 5 2.4-1.2-8"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    timer: '<path d="M10 2h4"/><path d="M12 14v-4"/><circle cx="12" cy="14" r="8"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  };

  const state = {
    bank: null,
    records: [],
    route: "home",
    modal: null,
    session: null,
    result: null,
    storageOk: true,
  };

  let examClockTimer = null;
  let lastFocusedElement = null;

  const app = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toastRoot = document.getElementById("toast-root");

  function icon(name, size, extraClass) {
    const paths = ICONS[name] || ICONS.info;
    return `<svg class="icon${extraClass ? ` ${extraClass}` : ""}" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function readStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      state.storageOk = false;
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      state.storageOk = true;
      return true;
    } catch (error) {
      state.storageOk = false;
      toast("浏览器未能保存数据，导入的题库可能在刷新后丢失。", "warning");
      return false;
    }
  }

  function isQuestionShape(question) {
    if (!question || !TYPE_META[question.type]) return false;
    if (!Array.isArray(question.options) || !Array.isArray(question.answer) || !question.answer.length) return false;
    if (!question.stem || typeof question.stem !== "string") return false;
    const optionKeys = question.options.map((option) => option && option.key);
    return question.answer.every((key) => optionKeys.includes(key));
  }

  function normalizeStoredBank(value) {
    if (!value || !Array.isArray(value.questions)) return null;
    const questions = value.questions.filter(isQuestionShape);
    if (!questions.length) return null;
    return {
      name: String(value.name || "我的题库"),
      sourceFile: String(value.sourceFile || "本机题库.xlsx"),
      sheetName: String(value.sheetName || "题库"),
      importedAt: Number(value.importedAt) || Date.now(),
      questions,
    };
  }

  function makeDemoBank() {
    return {
      name: "小点入门题库",
      sourceFile: "示例题库.xlsx",
      sheetName: "题库",
      importedAt: Date.now(),
      questions: DEMO_QUESTIONS.map((question) => ({ ...question })),
    };
  }

  function loadRecords() {
    const stored = readStorage(STORAGE_KEYS.records);
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((record) => record && ["practice", "exam"].includes(record.mode))
      .slice(0, 30);
  }

  function saveRecords() {
    writeStorage(STORAGE_KEYS.records, state.records.slice(0, 30));
  }

  function totalScore(questions) {
    return questions.reduce((sum, question) => sum + (Number(question.score) || 0), 0);
  }

  function countByType(questions) {
    return questions.reduce(
      (counts, question) => {
        if (counts[question.type] !== undefined) counts[question.type] += 1;
        return counts;
      },
      { single: 0, multiple: 0, judge: 0 }
    );
  }

  function uniqueCategories(questions) {
    return Array.from(new Set(questions.map((question) => question.category || "未分类")));
  }

  function formatDate(timestamp, withTime) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "刚刚";
    const now = new Date();
    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    if (sameDay) return withTime ? `今天 ${time}` : "今天";
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日${withTime ? ` ${time}` : ""}`;
    }
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
    if (seconds < 60) return `${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    if (minutes < 60) return rest ? `${minutes} 分 ${rest} 秒` : `${minutes} 分钟`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小时 ${minutes % 60} 分`;
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const rest = safe % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function pad2(number) {
    return String(number).padStart(2, "0");
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function sameKeys(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    const left = [...a].sort();
    const right = [...b].sort();
    return left.every((value, index) => value === right[index]);
  }

  function optionText(question, key) {
    const option = question.options.find((item) => item.key === key);
    return option ? option.text : "";
  }

  function displayAnswer(question, keys) {
    if (!keys || !keys.length) return "未作答";
    if (question.type === "judge") {
      return keys.includes("A") ? "正确" : "错误";
    }
    return keys
      .slice()
      .sort()
      .map((key) => `${key}. ${optionText(question, key)}`)
      .join("；");
  }

  function shortAnswer(question, keys) {
    if (!keys || !keys.length) return "未作答";
    if (question.type === "judge") return keys.includes("A") ? "正确" : "错误";
    return keys.slice().sort().join("、");
  }

  function typeBadge(type) {
    return `<span class="type-badge type-${type}"><span class="type-dot"></span>${TYPE_META[type].label}</span>`;
  }

  function brandMark(extraClass) {
    return `<span class="brand-mark${extraClass ? ` ${extraClass}` : ""}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6.2 12.2 3.6 3.6L17.7 8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="brand-spark"></span></span>`;
  }

  function toast(message, type) {
    if (!toastRoot) return;
    const item = document.createElement("div");
    item.className = `toast toast-${type || "info"}`;
    item.innerHTML = `${icon(type === "warning" ? "alert" : type === "success" ? "check" : "info", 18)}<span>${escapeHtml(message)}</span>`;
    toastRoot.appendChild(item);
    window.setTimeout(() => {
      item.classList.add("is-leaving");
      window.setTimeout(() => item.remove(), 220);
    }, 3200);
  }

  function setBodyModal(open) {
    document.body.classList.toggle("modal-open", Boolean(open));
  }

  function init() {
    const storedBank = normalizeStoredBank(readStorage(STORAGE_KEYS.bank));
    state.bank = storedBank || makeDemoBank();
    state.records = loadRecords();
    bindEvents();
    render();
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!["http:", "https:"].includes(window.location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js", { scope: "./" }).catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }

  /* ----------------------------------------------------------------------- */
  /* Dashboard                                                               */
  /* ----------------------------------------------------------------------- */

  function viewHome() {
    const questions = state.bank.questions;
    const counts = countByType(questions);
    const categories = uniqueCategories(questions);
    const total = questions.length;
    const totalPoints = totalScore(questions);
    const recentRecords = state.records.slice(0, 3);
    const sourceFile = state.bank.sourceFile || "本机题库.xlsx";
    const storageLabel = state.storageOk ? "已保存在本机" : "仅本次有效";

    return `
      <div class="site-shell">
        <header class="site-header">
          <div class="site-header-inner">
            <a class="brand" href="#" data-action="go-home" aria-label="小点刷题首页">
              ${brandMark()}
              <span class="brand-copy">
                <strong>小点刷题</strong>
                <small>XIAODIAN PRACTICE</small>
              </span>
            </a>
            <div class="header-actions">
              <span class="save-status ${state.storageOk ? "" : "is-warning"}"><span class="save-dot"></span>${storageLabel}</span>
              <button type="button" class="text-button header-help" data-action="open-help">题库格式</button>
              <button type="button" class="button button-primary button-small" data-action="open-import">
                ${icon("upload", 17)}导入题库
              </button>
            </div>
          </div>
        </header>

        <main class="home-main">
          <section class="hero">
            <div class="hero-copy">
              <p class="eyebrow"><span class="eyebrow-line"></span>DAILY PRACTICE · 每日一练</p>
              <h1>把每一道题，<br>练成<span class="hero-underline">直觉</span>。</h1>
              <p class="hero-description">导入自己的 Excel 题库，在做题、背题与模拟考试之间自由切换。少一点焦虑，多一点确定的进步。</p>
              <div class="hero-actions">
                <button type="button" class="button button-primary button-large" data-action="open-setup" data-mode="practice">
                  ${icon("play", 18)}开始做题
                </button>
                <button type="button" class="button button-text button-large" data-action="open-help">
                  查看使用说明${icon("arrowRight", 18)}
                </button>
              </div>
              <div class="hero-facts">
                <span>${icon("shield", 15)}无需登录</span>
                <span>${icon("layers", 15)}支持单选 / 多选 / 判断</span>
                <span>${icon("file", 15)}Excel 一键导入</span>
              </div>
            </div>

            <aside class="deck-area" aria-label="当前题库概览">
              <div class="deck-paper" aria-hidden="true"></div>
              <article class="deck-card">
                <div class="deck-glow" aria-hidden="true"></div>
                <div class="deck-topline">
                  <span>当前题库 · CURRENT DECK</span>
                  <span class="deck-status"><i></i>READY</span>
                </div>
                <h2>${escapeHtml(state.bank.name)}</h2>
                <div class="deck-main">
                  <strong>${pad2(total)}</strong>
                  <span>道题<br>等你来练</span>
                </div>
                <p class="deck-motto">一点一点，把模糊练成确定。</p>
                <div class="deck-breakdown">
                  <div><span class="mini-dot dot-single"></span><b>${counts.single}</b><small>单选</small></div>
                  <div><span class="mini-dot dot-multiple"></span><b>${counts.multiple}</b><small>多选</small></div>
                  <div><span class="mini-dot dot-judge"></span><b>${counts.judge}</b><small>判断</small></div>
                </div>
                <div class="deck-footer">
                  <span class="deck-source">${icon("file", 15)}${escapeHtml(sourceFile)}</span>
                  <button type="button" class="deck-change" data-action="open-import">更换题库</button>
                </div>
                <div class="deck-stamp" aria-hidden="true"><span>点</span><small>READY</small></div>
              </article>
            </aside>
          </section>

          <section class="mode-section" id="mode-section">
            <div class="section-heading">
              <div>
                <p class="eyebrow">STUDY MODES</p>
                <h2>今天，怎么练？</h2>
              </div>
              <p>没有唯一正确的学习方式，<br>只有此刻适合你的那一种。</p>
            </div>
            <div class="mode-grid">
              ${["practice", "memorize", "exam"].map((mode) => modeCard(mode)).join("")}
            </div>
          </section>

          <section class="insight-grid">
            <article class="panel overview-panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">QUESTION MIX</p>
                  <h3>题库构成</h3>
                </div>
                <span class="panel-count">${total} 道题 · ${totalPoints} 分</span>
              </div>
              <div class="type-breakdown-list">
                ${["single", "multiple", "judge"]
                  .map((type) => {
                    const pct = total ? Math.round((counts[type] / total) * 100) : 0;
                    return `
                      <div class="type-breakdown-row">
                        <div class="type-breakdown-label"><span class="mini-dot dot-${type}"></span>${TYPE_META[type].label}<b>${counts[type]}</b></div>
                        <div class="type-track"><span class="type-fill fill-${type}" style="width:${pct}%"></span></div>
                        <span class="type-percent">${pct}%</span>
                      </div>`;
                  })
                  .join("")}
              </div>
              <div class="category-block">
                <span class="category-label">分类</span>
                <div class="category-chips">
                  ${
                    categories.length
                      ? categories
                          .slice(0, 7)
                          .map((category) => `<span class="tiny-chip">${escapeHtml(category)}</span>`)
                          .join("") +
                        (categories.length > 7 ? `<span class="tiny-chip tiny-chip-more">+${categories.length - 7}</span>` : "")
                      : `<span class="tiny-chip">未分类</span>`
                  }
                </div>
              </div>
            </article>

            <article class="panel records-panel">
              <div class="panel-heading">
                <div>
                  <p class="eyebrow">RECENT ACTIVITY</p>
                  <h3>最近记录</h3>
                </div>
                ${state.records.length ? `<span class="panel-count">共 ${state.records.length} 次</span>` : ""}
              </div>
              ${
                recentRecords.length
                  ? `<div class="record-list">${recentRecords.map(recordRow).join("")}</div>`
                  : `<div class="empty-records">
                      <span class="empty-records-icon">${icon("chart", 24)}</span>
                      <h4>还没有练习记录</h4>
                      <p>完成一次做题或考试后，成绩会留在这里。</p>
                      <button type="button" class="text-link" data-action="open-setup" data-mode="practice">从几道题开始${icon("arrowRight", 15)}</button>
                    </div>`
              }
            </article>
          </section>

          <section class="format-strip">
            <div class="format-icon">${icon("file", 25)}</div>
            <div class="format-copy">
              <h3>题库还没导入？Excel 结构很简单。</h3>
              <p>一行一道题，填写题型、题干、选项与正确答案即可。解析、分值和分类都是可选项。</p>
            </div>
            <div class="format-actions">
              <button type="button" class="button button-text" data-action="open-help">字段说明${icon("arrowRight", 16)}</button>
              <a class="button button-outline" href="assets/question-bank-template.xlsx" download="小点刷题_题库模板.xlsx">${icon("download", 17)}下载模板</a>
            </div>
          </section>
        </main>

        <footer class="site-footer">
          <span class="footer-brand">${brandMark("brand-mark-small")}小点刷题</span>
          <span>数据仅保存在本机浏览器，不会上传。</span>
          <span>用 Excel，整理你的知识。</span>
        </footer>
      </div>
    `;
  }

  function modeCard(mode) {
    const meta = MODE_META[mode];
    const total = state.bank.questions.length;
    return `
      <button type="button" class="mode-card mode-card-${mode}" data-action="open-setup" data-mode="${mode}">
        <span class="mode-corner">${meta.index}</span>
        <span class="mode-icon">${icon(meta.icon, 26)}</span>
        <span class="mode-content">
          <span class="mode-kicker">${meta.kicker}</span>
          <span class="mode-title">${meta.label}</span>
          <span class="mode-description">${meta.description}</span>
        </span>
        <span class="mode-tags">${meta.tags.map((tag) => `<span>${tag}</span>`).join("")}</span>
        <span class="mode-footer">
          <span class="mode-time">${mode === "exam" ? `${total} 道题 · 完整试卷` : mode === "memorize" ? `${total} 道题 · 答案常显` : `共 ${total} 道题 · 即时反馈`}</span>
          <span class="mode-go">${meta.action}${icon("arrowRight", 17)}</span>
        </span>
      </button>
    `;
  }

  function recordRow(record) {
    const isExam = record.mode === "exam";
    const meta = MODE_META[record.mode];
    const main = isExam ? `${record.score}<small> / ${record.totalScore} 分</small>` : `${record.accuracy}<small>%</small>`;
    const label = isExam ? "得分" : "正确率";
    return `
      <div class="record-row">
        <span class="record-icon record-icon-${record.mode}">${icon(isExam ? "clipboard" : "pen", 18)}</span>
        <div class="record-main">
          <strong>${meta.label}${record.isReview ? " · 错题重练" : ""}</strong>
          <span>${escapeHtml(record.bankName)} · ${formatDate(record.finishedAt, true)}</span>
        </div>
        <div class="record-stat">
          <strong>${main}</strong>
          <span>${label}</span>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------------------------- */
  /* Setup                                                                   */
  /* ----------------------------------------------------------------------- */

  function scopedQuestions(category) {
    return category === "all"
      ? state.bank.questions
      : state.bank.questions.filter((question) => (question.category || "未分类") === category);
  }

  function defaultCount(mode, total) {
    if (mode === "memorize") return "all";
    return total > 10 ? "10" : "all";
  }

  function countChoices(total, selected) {
    if (total <= 0) return "";
    const values = [];
    if (total > 50) values.push("50");
    if (total > 20) values.push("20");
    if (total > 10) values.push("10");
    if (total > 5) values.push("5");
    values.push("all");
    return values
      .map((value) => {
        const label = value === "all" ? `全部 ${total} 题` : `${value} 题`;
        return `<button type="button" class="segment ${selected === value ? "is-active" : ""}" data-action="set-count" data-value="${value}" aria-pressed="${selected === value}">${label}</button>`;
      })
      .join("");
  }

  function openSetup(mode) {
    if (!state.bank.questions.length) {
      toast("当前题库还没有题目，请先导入 Excel。", "warning");
      return;
    }
    const categories = uniqueCategories(state.bank.questions);
    const initialCategory = "all";
    const totalInScope = scopedQuestions(initialCategory).length;
    state.modal = {
      type: "setup",
      mode,
      category: initialCategory,
      count: defaultCount(mode, totalInScope),
      order: "sequential",
      timed: true,
      minutes: 30,
      categories,
    };
    openModal();
  }

  function setupQuestions(modal) {
    let questions = scopedQuestions(modal.category);
    if (modal.order === "random") questions = shuffle(questions);
    if (modal.mode !== "exam" && modal.count !== "all") {
      questions = questions.slice(0, Number(modal.count));
    }
    return questions;
  }

  function setupModal(modal) {
    const meta = MODE_META[modal.mode];
    const allQuestions = scopedQuestions(modal.category);
    const selectedQuestions = setupQuestions(modal);
    const allPoints = totalScore(selectedQuestions);
    const categories = modal.categories;
    const isExam = modal.mode === "exam";
    const startLabel = isExam ? "开始考试" : modal.mode === "memorize" ? "开始背题" : "开始做题";

    return `
      <div class="modal setup-modal" role="dialog" aria-modal="true" aria-labelledby="setup-title" tabindex="-1">
        <div class="modal-head">
          <div class="modal-heading">
            <span class="modal-mode-icon mode-tone-${modal.mode}">${icon(meta.icon, 24)}</span>
            <div>
              <p class="eyebrow">${meta.kicker} SETUP</p>
              <h2 id="setup-title">${meta.label}设置</h2>
            </div>
          </div>
          <button type="button" class="icon-button modal-close" data-action="close-modal" aria-label="关闭设置">${icon("close", 20)}</button>
        </div>
        <div class="modal-body">
          ${isExam ? examSetupBody(modal, selectedQuestions) : regularSetupBody(modal, allQuestions, categories)}
          <div class="setup-summary">
            <div>
              <span>本次${isExam ? "考试" : modal.mode === "memorize" ? "背题" : "练习"}</span>
              <strong>${selectedQuestions.length} 道题</strong>
            </div>
            <div class="summary-divider"></div>
            <div>
              <span>题库范围</span>
              <strong>${modal.category === "all" ? "全部分类" : escapeHtml(modal.category)}</strong>
            </div>
            ${isExam ? `<div class="summary-divider"></div><div><span>满分</span><strong>${allPoints} 分</strong></div>` : ""}
            <span class="summary-tip">${icon("info", 15)}${isExam ? (modal.timed ? "开始后计时，时间到自动交卷" : "不限时，按自己的节奏完成") : "答案与解析都来自题库内容"}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="button button-text" data-action="close-modal">取消</button>
          <button type="button" class="button button-primary button-large setup-start" data-action="start-session">
            ${startLabel}${icon("arrowRight", 18)}
          </button>
        </div>
      </div>
    `;
  }

  function regularSetupBody(modal, allQuestions, categories) {
    const countText = allQuestions.length;
    return `
      <div class="setup-section">
        <div class="field-heading"><label for="setupCategory">范围</label><span>只练一个分类，或是全部题目</span></div>
        <div class="select-wrap">
          <select id="setupCategory" class="field-select" data-setup-category>
            <option value="all"${modal.category === "all" ? " selected" : ""}>全部分类 · ${state.bank.questions.length} 题</option>
            ${categories
              .map((category) => {
                const count = scopedQuestions(category).length;
                return `<option value="${escapeHtml(category)}"${modal.category === category ? " selected" : ""}>${escapeHtml(category)} · ${count} 题</option>`;
              })
              .join("")}
          </select>
          ${icon("layers", 17, "select-icon")}
        </div>
      </div>
      <div class="setup-section">
        <div class="field-heading"><label>题目数量</label><span>范围内共 ${countText} 道题</span></div>
        <div class="segmented">${countChoices(countText, modal.count)}</div>
      </div>
      <div class="setup-section setup-section-last">
        <div class="field-heading"><label>出题顺序</label><span>随机顺序适合避免只记住题号</span></div>
        <div class="order-options">
          <button type="button" class="order-option ${modal.order === "sequential" ? "is-active" : ""}" data-action="set-order" data-value="sequential" aria-pressed="${modal.order === "sequential"}">
            <span class="order-icon">${icon("list", 19)}</span>
            <span><strong>顺序练习</strong><small>按题库原有顺序</small></span>
            <span class="radio-mark"></span>
          </button>
          <button type="button" class="order-option ${modal.order === "random" ? "is-active" : ""}" data-action="set-order" data-value="random" aria-pressed="${modal.order === "random"}">
            <span class="order-icon">${icon("rotate", 19)}</span>
            <span><strong>随机打乱</strong><small>每次顺序都不一样</small></span>
            <span class="radio-mark"></span>
          </button>
        </div>
      </div>
    `;
  }

  function examSetupBody(modal, questions) {
    const points = totalScore(questions);
    return `
      <div class="exam-setup-note">
        <span class="exam-note-icon">${icon("clipboard", 22)}</span>
        <div>
          <strong>完整试卷 · ${questions.length} 道题</strong>
          <p>考试覆盖题库全部题目，共 ${points} 分。作答过程中不显示对错，交卷后统一评分。</p>
        </div>
      </div>
      <div class="setup-section">
        <div class="field-heading"><label>计时方式</label><span>限时模式更接近真实考试</span></div>
        <div class="duration-options">
          <button type="button" class="duration-option ${modal.timed ? "is-active" : ""}" data-action="set-timed" data-value="true" aria-pressed="${modal.timed}">
            <span class="duration-icon">${icon("timer", 20)}</span>
            <span><strong>限时考试</strong><small>时间到自动交卷</small></span>
            <span class="radio-mark"></span>
          </button>
          <button type="button" class="duration-option ${!modal.timed ? "is-active" : ""}" data-action="set-timed" data-value="false" aria-pressed="${!modal.timed}">
            <span class="duration-icon">${icon("clock", 20)}</span>
            <span><strong>不限时</strong><small>只看总用时，不催促</small></span>
            <span class="radio-mark"></span>
          </button>
        </div>
      </div>
      ${
        modal.timed
          ? `<div class="setup-section setup-section-last time-setting">
              <div class="field-heading"><label for="setupMinutes">考试时长</label><span>1–300 分钟</span></div>
              <div class="time-choices">
                <div class="number-field">
                  <input id="setupMinutes" type="number" min="1" max="300" step="1" value="${escapeHtml(modal.minutes)}" inputmode="numeric" data-setup-minutes aria-label="考试时长（分钟）">
                  <span>分钟</span>
                </div>
                <div class="quick-times">
                  ${[15, 30, 45, 60, 90]
                    .map((minutes) => `<button type="button" class="time-chip ${Number(modal.minutes) === minutes ? "is-active" : ""}" data-action="set-minutes" data-value="${minutes}">${minutes} 分钟</button>`)
                    .join("")}
                </div>
              </div>
            </div>`
          : ""
      }
    `;
  }

  function updateSetupScope(value) {
    if (!state.modal || state.modal.type !== "setup") return;
    const questions = scopedQuestions(value);
    state.modal.category = value;
    state.modal.count = defaultCount(state.modal.mode, questions.length);
    renderModal("#setupCategory");
  }

  function startSession() {
    if (!state.modal || state.modal.type !== "setup") return;
    const setup = state.modal;
    if (setup.mode === "exam" && setup.timed) {
      const minutes = Number(setup.minutes);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 300) {
        toast("考试时长需要在 1–300 分钟之间。", "warning");
        const input = document.getElementById("setupMinutes");
        if (input) {
          input.focus();
          input.select();
        }
        return;
      }
      setup.minutes = Math.round(minutes);
    }
    const questions = setupQuestions(setup);
    if (!questions.length) {
      toast("当前范围没有题目，请更换范围。", "warning");
      return;
    }
    const now = Date.now();
    state.session = {
      mode: setup.mode,
      questions,
      index: 0,
      selections: questions.map(() => []),
      evaluations: questions.map(() => null),
      flags: questions.map(() => false),
      startedAt: now,
      finished: false,
      isReview: false,
      exam: setup.mode === "exam"
        ? {
            timed: Boolean(setup.timed),
            minutes: setup.timed ? Math.round(Number(setup.minutes)) : 0,
            deadline: setup.timed ? now + Math.round(Number(setup.minutes)) * 60 * 1000 : null,
            autoSubmitted: false,
          }
        : null,
      configLabel: setup.category === "all" ? "全部分类" : setup.category,
    };
    state.modal = null;
    modalRoot.innerHTML = "";
    setBodyModal(false);
    state.route = "session";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    if (state.session.mode === "exam") startExamClock();
  }

  /* ----------------------------------------------------------------------- */
  /* Session rendering                                                       */
  /* ----------------------------------------------------------------------- */

  function currentQuestion() {
    if (!state.session) return null;
    return state.session.questions[state.session.index];
  }

  function sessionProgress(session) {
    if (session.mode === "exam") {
      const answered = session.selections.filter((selection) => selection.length).length;
      return Math.round((answered / session.questions.length) * 100);
    }
    if (session.mode === "memorize") {
      return Math.round(((session.index + 1) / session.questions.length) * 100);
    }
    const completed = session.evaluations.filter(Boolean).length;
    return Math.round((completed / session.questions.length) * 100);
  }

  function sessionModeLabel(session) {
    return session.isReview ? "错题重练" : MODE_META[session.mode].label;
  }

  function viewSession() {
    const session = state.session;
    if (!session) return viewHome();
    const question = currentQuestion();
    const isExam = session.mode === "exam";
    const isMemo = session.mode === "memorize";
    const progress = sessionProgress(session);
    const answeredCount = isExam
      ? session.selections.filter((selection) => selection.length).length
      : isMemo
      ? session.index + 1
      : session.evaluations.filter(Boolean).length;
    const modeMeta = MODE_META[session.mode];
    const timerMarkup = isExam
      ? `<div class="exam-timer ${session.exam.timed ? "" : "is-untimed"}" id="examClock">
           ${icon("timer", 17)}<span id="examClockText">${session.exam.timed ? formatClock((session.exam.deadline - Date.now()) / 1000) : "不限时 · 00:00"}</span>
         </div>`
      : "";
    const modeClass = session.isReview ? "review" : session.mode;

    return `
      <div class="study-shell mode-${modeClass}">
        <header class="study-header">
          <div class="study-header-inner">
            <div class="study-header-left">
              <button type="button" class="icon-button study-exit" data-action="request-exit" aria-label="退出本轮学习">${icon("arrowLeft", 20)}</button>
              <span class="study-brand">${brandMark("brand-mark-small")}</span>
              <div class="study-title">
                <strong>${sessionModeLabel(session)}</strong>
                <span>${escapeHtml(state.bank.name)}</span>
              </div>
            </div>
            <div class="study-header-center">
              <span class="study-count">${isExam ? "已答" : "第"} <b>${isExam ? answeredCount : session.index + 1}</b> <span>/ ${session.questions.length}${isExam ? " 题" : ""}</span></span>
            </div>
            <div class="study-header-actions">
              ${!isExam ? `<span class="study-mobile-count">第 <b>${session.index + 1}</b> / ${session.questions.length}</span>` : ""}
              ${timerMarkup}
              ${isExam ? `<button type="button" class="button button-primary button-small study-submit" data-action="request-submit-exam">${icon("check", 16)}交卷</button>` : ""}
            </div>
          </div>
          <div class="study-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}" aria-label="本轮进度">
            <span style="width:${progress}%"></span>
          </div>
        </header>

        ${isExam ? mobileExamPalette(session) : ""}

        <main class="session-main">
          <section class="question-card ${isMemo ? "question-card-memo" : ""}" aria-labelledby="question-stem">
            ${questionTopline(session, question)}
            <h1 class="question-stem" id="question-stem">${escapeHtml(question.stem)}</h1>
            <p class="question-instruction">${
              isMemo
                ? "答案与解析已展开 · 按自己的节奏记忆"
                : `${TYPE_META[question.type].hint}${question.type === "multiple" ? (isExam ? " · 可随时修改" : " · 选好后提交") : ""}`
            }</p>
            ${renderOptions(session, question)}
            ${!isMemo && session.mode === "practice" ? renderPracticeFeedback(session, question) : ""}
            ${isMemo ? renderMemoAnswer(question) : ""}
            ${renderQuestionFooter(session, question)}
          </section>
          <aside class="session-aside">
            ${renderAside(session)}
          </aside>
        </main>
        <footer class="study-footnote">
          <span>${icon("shield", 14)}数据只保存在此浏览器</span>
          <span>${isExam ? "答题过程中不显示对错，交卷后统一评分" : isMemo ? "答案与解析当前可见，适合快速记忆" : "提交后立即显示答案与解析"}</span>
        </footer>
      </div>
    `;
  }

  function questionTopline(session, question) {
    const isExam = session.mode === "exam";
    const isMemo = session.mode === "memorize";
    const flagMarkup = isExam
      ? `<button type="button" class="flag-button ${session.flags[session.index] ? "is-active" : ""}" data-action="toggle-flag" aria-pressed="${session.flags[session.index]}" title="标记本题，稍后回看">${icon("flag", 16)}${session.flags[session.index] ? "已标记" : "标记"}</button>`
      : "";
    return `
      <div class="question-topline">
        <div class="question-meta">
          <span class="question-sequence">QUESTION ${pad2(session.index + 1)}</span>
          ${typeBadge(question.type)}
          ${question.category ? `<span class="meta-chip">${escapeHtml(question.category)}</span>` : ""}
          ${question.difficulty ? `<span class="meta-chip meta-chip-soft">${escapeHtml(question.difficulty)}</span>` : ""}
          ${isExam ? `<span class="meta-chip meta-chip-score">${Number(question.score) || 0} 分</span>` : ""}
          ${isMemo ? `<span class="meta-chip meta-chip-answer">${icon("eye", 13)}答案已展开</span>` : ""}
        </div>
        ${flagMarkup}
      </div>
    `;
  }

  function renderOptions(session, question) {
    const isMemo = session.mode === "memorize";
    const isExam = session.mode === "exam";
    const evaluation = session.evaluations[session.index];
    const selected = session.selections[session.index] || [];
    const submitted = Boolean(evaluation);
    return `
      <div class="option-list" role="group" aria-label="答案选项">
        ${question.options
          .map((option) => {
            const isSelected = selected.includes(option.key);
            const isAnswer = question.answer.includes(option.key);
            const showResult = submitted;
            const isCorrect = showResult && isAnswer;
            const isWrong = showResult && isSelected && !isAnswer;
            const classes = [
              "option",
              isMemo ? "is-readonly" : "",
              isAnswer && isMemo ? "is-answer" : "",
              isSelected && !showResult ? "is-selected" : "",
              isCorrect ? "is-correct" : "",
              isWrong ? "is-wrong" : "",
              showResult ? "is-locked" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const trailing = showResult
              ? isCorrect
                ? `<span class="option-status status-correct">${icon("check", 15)}正确答案</span>`
                : isWrong
                ? `<span class="option-status status-wrong">${icon("close", 14)}你的答案</span>`
                : isSelected
                ? `<span class="option-status status-wrong">${icon("close", 14)}你的答案</span>`
                : ""
              : isMemo && isAnswer
              ? `<span class="option-status status-correct">${icon("check", 15)}正确答案</span>`
              : isSelected
              ? `<span class="option-check">${icon("check", 14)}</span>`
              : "";

            if (isMemo) {
              return `
                <div class="${classes}">
                  <span class="option-key">${option.key}</span>
                  <span class="option-copy">${escapeHtml(option.text)}</span>
                  ${trailing}
                </div>`;
            }
            return `
              <button type="button" class="${classes}" data-action="select-option" data-key="${option.key}" aria-pressed="${isSelected}" ${showResult ? "disabled" : ""}>
                <span class="option-key">${option.key}</span>
                <span class="option-copy">${escapeHtml(option.text)}</span>
                ${trailing}
              </button>`;
          })
          .join("")}
      </div>
    `;
  }

  function renderPracticeFeedback(session, question) {
    const evaluation = session.evaluations[session.index];
    if (!evaluation) return "";
    const isCorrect = evaluation.isCorrect;
    return `
      <section class="feedback ${isCorrect ? "feedback-correct" : "feedback-wrong"}" aria-live="polite">
        <div class="feedback-heading">
          <span class="feedback-icon">${icon(isCorrect ? "check" : "close", 20)}</span>
          <div>
            <h3>${isCorrect ? "回答正确" : "这题答错了"}</h3>
            <p>${isCorrect ? "判断准确，继续下一题。" : "看一眼解析，把这一分捡回来。"}</p>
          </div>
          <span class="feedback-answer">正确答案 <b>${escapeHtml(shortAnswer(question, question.answer))}</b></span>
        </div>
        <div class="feedback-answer-line">
          <span>你的答案</span>
          <strong>${escapeHtml(displayAnswer(question, evaluation.selected))}</strong>
        </div>
        <div class="analysis-block">
          <span class="analysis-label">${icon("sparkles", 15)}解析</span>
          <p>${question.analysis ? escapeHtml(question.analysis) : "这道题暂时没有解析。"}</p>
        </div>
      </section>
    `;
  }

  function renderMemoAnswer(question) {
    return `
      <section class="memo-answer" aria-label="答案与解析">
        <div class="memo-answer-head">
          <span class="memo-label">${icon("book", 16)}答案与解析</span>
          <span class="memo-answer-value">正确答案 · ${escapeHtml(displayAnswer(question, question.answer))}</span>
        </div>
        <div class="analysis-block memo-analysis">
          <span class="analysis-label">${icon("sparkles", 15)}解析</span>
          <p>${question.analysis ? escapeHtml(question.analysis) : "这道题暂时没有解析。"}</p>
        </div>
      </section>
    `;
  }

  function renderQuestionFooter(session, question) {
    const isExam = session.mode === "exam";
    const isMemo = session.mode === "memorize";
    const isPractice = session.mode === "practice";
    const isLast = session.index === session.questions.length - 1;
    const evaluation = session.evaluations[session.index];
    const selected = session.selections[session.index] || [];

    if (isPractice) {
      if (evaluation) {
        return `
          <footer class="question-footer">
            <span class="footer-note">${evaluation.isCorrect ? "保持节奏，继续向前。" : "弄懂比做对更重要。"}</span>
            <button type="button" class="button button-primary" data-action="next-question">
              ${isLast ? "查看练习小结" : "下一题"}${icon("arrowRight", 18)}
            </button>
          </footer>`;
      }
      return `
        <footer class="question-footer">
          <span class="footer-note">${selected.length ? `已选择 ${shortAnswer(question, selected)}` : "选择答案后提交"}</span>
          <button type="button" class="button button-primary" data-action="submit-answer" ${selected.length ? "" : "disabled"}>
            提交答案${icon("arrowRight", 18)}
          </button>
        </footer>`;
    }

    if (isMemo) {
      return `
        <footer class="question-footer memo-footer">
          <button type="button" class="button button-outline" data-action="prev-question" ${session.index === 0 ? "disabled" : ""}>
            ${icon("arrowLeft", 17)}上一题
          </button>
          <span class="footer-position">${session.index + 1} / ${session.questions.length}</span>
          <button type="button" class="button button-primary" data-action="${isLast ? "finish-memorize" : "next-question"}">
            ${isLast ? "完成背题" : "下一题"}${icon("arrowRight", 18)}
          </button>
        </footer>`;
    }

    return `
      <footer class="question-footer exam-question-footer">
        <button type="button" class="button button-outline" data-action="prev-question" ${session.index === 0 ? "disabled" : ""}>
          ${icon("arrowLeft", 17)}上一题
        </button>
        <span class="footer-position">${isExam ? (selected.length ? `已选 ${shortAnswer(question, selected)}` : "本题尚未作答") : `${session.index + 1} / ${session.questions.length}`}</span>
        ${
          isLast
            ? `<button type="button" class="button button-primary" data-action="request-submit-exam">${icon("check", 17)}交卷</button>`
            : `<button type="button" class="button button-ink" data-action="next-question">下一题${icon("arrowRight", 18)}</button>`
        }
      </footer>
    `;
  }

  function renderAside(session) {
    if (session.mode === "exam") return renderExamAside(session);
    if (session.mode === "memorize") return renderMemoAside(session);
    return renderPracticeAside(session);
  }

  function progressRing(percent, label, value) {
    const angle = Math.max(0, Math.min(100, percent)) * 3.6;
    return `
      <div class="progress-ring" style="--ring-angle:${angle}deg">
        <div class="progress-ring-inner">
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      </div>`;
  }

  function renderPracticeAside(session) {
    const completed = session.evaluations.filter(Boolean).length;
    const correct = session.evaluations.filter((entry) => entry && entry.isCorrect).length;
    const wrong = completed - correct;
    const percent = Math.round((completed / session.questions.length) * 100);
    return `
      <div class="aside-card">
        <div class="aside-heading"><span>本轮进度</span><span class="aside-soft">${completed} / ${session.questions.length}</span></div>
        <div class="aside-progress-flex">
          ${progressRing(percent, "已完成", `${percent}%`)}
          <div class="aside-mini-stats">
            <div><span class="stat-dot stat-green"></span><strong>${correct}</strong><small>答对</small></div>
            <div><span class="stat-dot stat-red"></span><strong>${wrong}</strong><small>答错</small></div>
          </div>
        </div>
        <div class="aside-divider"></div>
        <div class="aside-heading"><span>答题轨迹</span><span class="aside-soft">即时反馈</span></div>
        <div class="mini-map" aria-label="答题进度">
          ${session.questions
            .map((_, index) => {
              const status = session.evaluations[index]
                ? session.evaluations[index].isCorrect
                  ? "is-correct"
                  : "is-wrong"
                : index === session.index
                ? "is-current"
                : "";
              return `<span class="mini-map-dot ${status}" title="第 ${index + 1} 题">${index + 1}</span>`;
            })
            .join("")}
        </div>
        <div class="aside-tip">${icon("info", 15)}<span>提交答案后立即显示对错与解析，不记录到考试成绩。</span></div>
      </div>
      <div class="shortcut-card">
        <span class="shortcut-title">键盘快捷键</span>
        <div><span>选择选项</span><kbd>1</kbd><kbd>–</kbd><kbd>4</kbd></div>
        <div><span>提交 / 下一题</span><kbd>Enter</kbd></div>
      </div>
    `;
  }

  function renderMemoAside(session) {
    const percent = Math.round(((session.index + 1) / session.questions.length) * 100);
    return `
      <div class="aside-card">
        <div class="aside-heading"><span>浏览进度</span><span class="aside-soft">${session.index + 1} / ${session.questions.length}</span></div>
        <div class="aside-progress-flex">
          ${progressRing(percent, "已浏览", `${percent}%`)}
          <div class="aside-memo-note">
            <strong>答案常显</strong>
            <span>先读题，再看选项与解析，建立完整印象。</span>
          </div>
        </div>
        <div class="aside-divider"></div>
        <div class="aside-heading"><span>题目列表</span><span class="aside-soft">点击跳转</span></div>
        <div class="mini-map is-clickable" aria-label="背题题目列表">
          ${session.questions
            .map(
              (_, index) =>
                `<button type="button" class="mini-map-dot ${index === session.index ? "is-current" : "is-visited"}" data-action="jump-question" data-index="${index}" aria-label="跳到第 ${index + 1} 题">${index + 1}</button>`
            )
            .join("")}
        </div>
        <div class="aside-tip">${icon("eye", 15)}<span>背题模式不判分，只记录完成进度。</span></div>
      </div>
      <div class="shortcut-card">
        <span class="shortcut-title">键盘快捷键</span>
        <div><span>上一题 / 下一题</span><kbd>←</kbd><kbd>→</kbd></div>
      </div>
    `;
  }

  function renderExamAside(session) {
    const answered = session.selections.filter((selection) => selection.length).length;
    const flagged = session.flags.filter(Boolean).length;
    return `
      <div class="aside-card exam-map-card">
        <div class="aside-heading"><span>答题卡</span><span class="aside-soft">${answered} / ${session.questions.length} 已答</span></div>
        <div class="exam-map" aria-label="考试答题卡">
          ${session.questions
            .map((_, index) => {
              const isAnswered = session.selections[index].length > 0;
              const classes = [
                "exam-map-dot",
                isAnswered ? "is-answered" : "",
                index === session.index ? "is-current" : "",
                session.flags[index] ? "is-flagged" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return `<button type="button" class="${classes}" data-action="jump-question" data-index="${index}" aria-label="第 ${index + 1} 题${isAnswered ? "，已作答" : "，未作答"}${session.flags[index] ? "，已标记" : ""}">${index + 1}</button>`;
            })
            .join("")}
        </div>
        <div class="map-legend">
          <span><i class="legend-dot legend-current"></i>当前</span>
          <span><i class="legend-dot legend-answered"></i>已答</span>
          <span><i class="legend-dot legend-empty"></i>未答</span>
          <span><i class="legend-flag">${icon("flag", 12)}</i>标记</span>
        </div>
        <div class="exam-aside-stats">
          <div><strong>${session.questions.length - answered}</strong><span>未作答</span></div>
          <div><strong>${flagged}</strong><span>已标记</span></div>
        </div>
        <button type="button" class="button button-primary button-wide" data-action="request-submit-exam">${icon("check", 17)}提交试卷</button>
        <div class="aside-tip">${icon("info", 15)}<span>${session.exam.timed ? "倒计时结束后会自动交卷，作答不会显示对错。" : "不限时考试会记录你的总用时，不显示对错。"}</span></div>
      </div>
      <div class="shortcut-card">
        <span class="shortcut-title">考试提示</span>
        <div><span>先答会的，标记不确定的题</span></div>
        <div><span>交卷前检查答题卡</span></div>
      </div>
    `;
  }

  function mobileExamPalette(session) {
    return `
      <div class="mobile-exam-palette">
        <div class="mobile-palette-head"><span>答题卡</span><span>已答 ${session.selections.filter((selection) => selection.length).length} / ${session.questions.length}</span></div>
        <div class="mobile-palette-scroll">
          ${session.questions
            .map((_, index) => {
              const classes = [
                "exam-map-dot",
                session.selections[index].length ? "is-answered" : "",
                index === session.index ? "is-current" : "",
                session.flags[index] ? "is-flagged" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return `<button type="button" class="${classes}" data-action="jump-question" data-index="${index}" aria-label="跳到第 ${index + 1} 题">${index + 1}</button>`;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function selectOption(key) {
    const session = state.session;
    if (!session || session.mode === "memorize") return;
    const question = currentQuestion();
    if (!question) return;
    if (session.mode === "practice" && session.evaluations[session.index]) return;

    const current = session.selections[session.index] || [];
    if (question.type === "multiple") {
      session.selections[session.index] = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key].sort();
    } else {
      session.selections[session.index] = [key];
    }
    render(true);
  }

  function submitPracticeAnswer() {
    const session = state.session;
    if (!session || session.mode !== "practice") return;
    const question = currentQuestion();
    const selected = session.selections[session.index] || [];
    if (!selected.length) {
      toast("先选择一个答案再提交。", "warning");
      return;
    }
    session.evaluations[session.index] = {
      selected: [...selected],
      isCorrect: sameKeys(selected, question.answer),
    };
    render(true);
    window.requestAnimationFrame(() => {
      const feedback = document.querySelector(".feedback");
      if (feedback) feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function goToQuestion(index) {
    const session = state.session;
    if (!session) return;
    const nextIndex = Math.max(0, Math.min(session.questions.length - 1, Number(index)));
    if (!Number.isFinite(nextIndex) || nextIndex === session.index) return;
    session.index = nextIndex;
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextQuestion() {
    const session = state.session;
    if (!session) return;
    if (session.mode === "practice" && !session.evaluations[session.index]) {
      toast("提交本题后再进入下一题。", "warning");
      return;
    }
    if (session.index >= session.questions.length - 1) {
      if (session.mode === "practice") finishPractice();
      if (session.mode === "memorize") finishMemorize();
      return;
    }
    session.index += 1;
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevQuestion() {
    const session = state.session;
    if (!session || session.index === 0) return;
    session.index -= 1;
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFlag() {
    const session = state.session;
    if (!session || session.mode !== "exam") return;
    session.flags[session.index] = !session.flags[session.index];
    render(true);
  }

  function finishPractice() {
    const session = state.session;
    if (!session) return;
    const questions = session.questions.map((question, index) => {
      const evaluation = session.evaluations[index] || { selected: [], isCorrect: false };
      return {
        question,
        selected: evaluation.selected,
        isCorrect: evaluation.isCorrect,
        earned: evaluation.isCorrect ? Number(question.score) || 0 : 0,
      };
    });
    const correctCount = questions.filter((entry) => entry.isCorrect).length;
    const result = {
      mode: "practice",
      bankName: state.bank.name,
      finishedAt: Date.now(),
      total: questions.length,
      correctCount,
      wrongCount: questions.length - correctCount,
      unansweredCount: 0,
      accuracy: Math.round((correctCount / questions.length) * 100),
      score: questions.reduce((sum, entry) => sum + entry.earned, 0),
      totalScore: totalScore(session.questions),
      durationSeconds: Math.round((Date.now() - session.startedAt) / 1000),
      questions,
      isReview: session.isReview,
    };
    finishWithResult(result);
  }

  function finishMemorize() {
    const session = state.session;
    if (!session) return;
    const result = {
      mode: "memorize",
      bankName: state.bank.name,
      finishedAt: Date.now(),
      total: session.questions.length,
      categories: uniqueCategories(session.questions),
      durationSeconds: Math.round((Date.now() - session.startedAt) / 1000),
      questions: session.questions.map((question) => ({ question })),
      isReview: session.isReview,
    };
    finishWithResult(result);
  }

  function finishWithResult(result) {
    if (examClockTimer) {
      window.clearInterval(examClockTimer);
      examClockTimer = null;
    }
    if (state.session) state.session.finished = true;
    if (result.mode !== "memorize" && !result.isReview) {
      state.records.unshift({
        id: `record-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        mode: result.mode,
        bankName: result.bankName,
        finishedAt: result.finishedAt,
        correctCount: result.correctCount,
        total: result.total,
        accuracy: result.accuracy,
        score: result.score,
        totalScore: result.totalScore,
        durationSeconds: result.durationSeconds,
        isReview: Boolean(result.isReview),
      });
      state.records = state.records.slice(0, 30);
      saveRecords();
    }
    state.result = result;
    state.session = null;
    state.modal = null;
    modalRoot.innerHTML = "";
    setBodyModal(false);
    state.route = "result";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ----------------------------------------------------------------------- */
  /* Exam clock & submission                                                 */
  /* ----------------------------------------------------------------------- */

  function updateExamClock() {
    const session = state.session;
    if (!session || session.mode !== "exam" || session.finished) return;
    const clock = document.getElementById("examClock");
    const text = document.getElementById("examClockText");
    if (!clock || !text) return;

    let content;
    let warning = false;
    if (session.exam.timed) {
      const remaining = Math.max(0, (session.exam.deadline - Date.now()) / 1000);
      content = formatClock(remaining);
      warning = remaining <= 300;
      clock.classList.toggle("is-warning", warning);
      clock.setAttribute("title", remaining <= 0 ? "考试时间到" : `剩余 ${formatDuration(remaining)}`);
      if (remaining <= 0) {
        text.textContent = "00:00";
        if (!session.exam.autoSubmitted) submitExam(true);
        return;
      }
    } else {
      const elapsed = Math.max(0, (Date.now() - session.startedAt) / 1000);
      content = `不限时 · ${formatClock(elapsed)}`;
      clock.classList.remove("is-warning");
    }
    text.textContent = content;
  }

  function startExamClock() {
    if (examClockTimer) window.clearInterval(examClockTimer);
    updateExamClock();
    examClockTimer = window.setInterval(updateExamClock, 1000);
  }

  function openSubmitExamModal() {
    if (!state.session || state.session.mode !== "exam") return;
    const answered = state.session.selections.filter((selection) => selection.length).length;
    const unanswered = state.session.questions.length - answered;
    const flagged = state.session.flags.filter(Boolean).length;
    state.modal = {
      type: "confirm",
      title: "现在交卷吗？",
      message: `已作答 ${answered} / ${state.session.questions.length} 题${unanswered ? `，还有 ${unanswered} 道题未作答` : "，所有题目都已作答"}。`,
      detail: flagged ? `你标记了 ${flagged} 道题，交卷后仍可在成绩页查看错题。` : "交卷后将统一评分，并展示成绩与错题解析。",
      confirmLabel: "确认交卷",
      cancelLabel: "继续答题",
      danger: unanswered > 0,
      callback: () => submitExam(false),
    };
    openModal();
  }

  function submitExam(autoSubmitted) {
    const session = state.session;
    if (!session || session.mode !== "exam" || session.finished) return;
    session.finished = true;
    if (examClockTimer) {
      window.clearInterval(examClockTimer);
      examClockTimer = null;
    }
    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - session.startedAt) / 1000)
    );
    const questions = session.questions.map((question, index) => {
      const selected = session.selections[index] || [];
      const isCorrect = selected.length > 0 && sameKeys(selected, question.answer);
      return {
        question,
        selected,
        isCorrect,
        unanswered: selected.length === 0,
        earned: isCorrect ? Number(question.score) || 0 : 0,
      };
    });
    const correctCount = questions.filter((entry) => entry.isCorrect).length;
    const unansweredCount = questions.filter((entry) => entry.unanswered).length;
    const score = questions.reduce((sum, entry) => sum + entry.earned, 0);
    const maxScore = totalScore(session.questions);
    const result = {
      mode: "exam",
      bankName: state.bank.name,
      finishedAt: Date.now(),
      total: questions.length,
      correctCount,
      wrongCount: questions.length - correctCount,
      unansweredCount,
      accuracy: Math.round((correctCount / questions.length) * 100),
      score,
      totalScore: maxScore,
      scorePercent: maxScore ? Math.round((score / maxScore) * 100) : 0,
      durationSeconds,
      questions,
      timed: session.exam.timed,
      autoSubmitted: Boolean(autoSubmitted) || (session.exam.timed && session.exam.deadline <= Date.now()),
      isReview: false,
    };
    if (autoSubmitted) {
      state.modal = null;
      modalRoot.innerHTML = "";
      setBodyModal(false);
    }
    finishWithResult(result);
    if (result.autoSubmitted) toast("考试时间到，已自动交卷。", "warning");
  }

  /* ----------------------------------------------------------------------- */
  /* Exit / restart                                                          */
  /* ----------------------------------------------------------------------- */

  function requestExit() {
    if (!state.session) return;
    const session = state.session;
    state.modal = {
      type: "confirm",
      title: session.mode === "exam" ? "确定退出考试？" : "结束本轮学习？",
      message:
        session.mode === "exam"
          ? "考试进行中。退出后本场考试不会计分，已作答的内容也会清空。"
          : session.mode === "memorize"
          ? "退出后将回到首页，本轮背题进度不会保留。"
          : "本轮答题进度将不会保留，确定返回首页吗？",
      detail: "你随时可以重新开始一轮。",
      confirmLabel: session.mode === "exam" ? "退出考试" : "退出本轮",
      cancelLabel: "继续学习",
      danger: true,
      callback: () => {
        if (examClockTimer) {
          window.clearInterval(examClockTimer);
          examClockTimer = null;
        }
        state.session = null;
        state.route = "home";
        state.modal = null;
        modalRoot.innerHTML = "";
        setBodyModal(false);
        render();
        window.scrollTo({ top: 0, behavior: "auto" });
        toast("已退出本轮学习。", "info");
      },
    };
    openModal();
  }

  function startWrongReview(result) {
    const wrongEntries = result.questions.filter((entry) => !entry.isCorrect);
    const questions = wrongEntries.map((entry) => entry.question);
    if (!questions.length) return;
    if (examClockTimer) {
      window.clearInterval(examClockTimer);
      examClockTimer = null;
    }
    state.session = {
      mode: "practice",
      questions,
      index: 0,
      selections: questions.map(() => []),
      evaluations: questions.map(() => null),
      flags: questions.map(() => false),
      startedAt: Date.now(),
      finished: false,
      isReview: true,
      exam: null,
      configLabel: "错题重练",
    };
    state.result = null;
    state.modal = null;
    modalRoot.innerHTML = "";
    setBodyModal(false);
    state.route = "session";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function restartMode(mode) {
    state.result = null;
    state.route = "home";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => openSetup(mode), 30);
  }

  /* ----------------------------------------------------------------------- */
  /* Result                                                                  */
  /* ----------------------------------------------------------------------- */

  function resultTitle(result) {
    if (result.mode === "memorize") return "这一轮，背完了。";
    if (result.mode === "practice") {
      const pct = result.accuracy;
      if (result.isReview) {
        if (pct === 100) return "错题都拿下了。";
        if (pct >= 60) return "比上次更清楚了。";
        return "错题，值得再看一遍。";
      }
      if (pct === 100) return "全对，漂亮。";
      if (pct >= 80) return "稳了，继续保持。";
      if (pct >= 60) return "有收获，再巩固一下。";
      return "别急，错题就是方向。";
    }
    const pct = result.scorePercent;
    if (pct === 100) return "满分交卷，漂亮。";
    if (pct >= 85) return "发挥出色，稳稳拿下。";
    if (pct >= 70) return "整体不错，再补短板。";
    if (pct >= 60) return "过线了，还能更好。";
    return "这次没考好，但错题会说话。";
  }

  function resultSubtitle(result) {
    if (result.mode === "memorize") {
      return `浏览了 ${result.total} 道题，用了 ${formatDuration(result.durationSeconds)}。背题不判分，记住就是收获。`;
    }
    if (result.mode === "practice" && result.isReview) {
      return `重练 ${result.total} 道错题，答对 ${result.correctCount} 道，正确率 ${result.accuracy}%。`;
    }
    if (result.mode === "practice") {
      return `完成 ${result.total} 道题，答对 ${result.correctCount} 道，用时 ${formatDuration(result.durationSeconds)}。`;
    }
    return `${result.bankName} 完整试卷 · ${result.timed ? "限时考试" : "不限时考试"}${result.autoSubmitted ? " · 时间到自动交卷" : ""}。`;
  }

  function resultHeroCard(result) {
    if (result.mode === "memorize") {
      return `
        <div class="result-score-card memo-score-card">
          <span class="result-card-kicker">MEMORIZE COMPLETE</span>
          <div class="memo-score-icon">${icon("book", 46)}</div>
          <strong class="memo-score-number">${result.total}<small> 道</small></strong>
          <span class="memo-score-label">完成浏览</span>
          <p>${icon("eye", 14)}无评分 · 答案常显</p>
        </div>`;
    }
    const isExam = result.mode === "exam";
    const percent = isExam ? result.scorePercent : result.accuracy;
    const angle = Math.max(0, Math.min(100, percent)) * 3.6;
    return `
      <div class="result-score-card">
        <span class="result-card-kicker">${isExam ? "FINAL SCORE" : "PRACTICE REPORT"}</span>
        <div class="score-ring" style="--ring-angle:${angle}deg">
          <div class="score-ring-inner">
            <span>${isExam ? "本次得分" : "正确率"}</span>
            <strong>${isExam ? result.score : result.accuracy}${isExam ? "<small>" : "<small>%"}${isExam ? ` <i>/ ${result.totalScore}</i></small>` : "</small>"}</strong>
            <small>${isExam ? `共 ${result.total} 题 · 满分 ${result.totalScore} 分` : `答对 ${result.correctCount} / ${result.total} 题`}</small>
          </div>
        </div>
        <div class="result-score-foot">
          <span><i class="legend-dot legend-answered"></i>${isExam ? `得分率 ${percent}%` : "每题即时判题"}</span>
          <span>${icon("clock", 14)}${formatDuration(result.durationSeconds)}</span>
        </div>
      </div>`;
  }

  function viewResult() {
    const result = state.result;
    if (!result) return viewHome();
    const isExam = result.mode === "exam";
    const isMemo = result.mode === "memorize";
    const wrongEntries = isMemo ? [] : result.questions.filter((entry) => !entry.isCorrect);
    const categories = isMemo ? result.categories : uniqueCategories(result.questions.map((entry) => entry.question));
    const totalCount = result.total;

    return `
      <div class="result-shell mode-${isMemo ? "memorize" : isExam ? "exam" : "practice"}">
        <header class="result-topbar">
          <a class="brand" href="#" data-action="go-home" aria-label="小点刷题首页">
            ${brandMark()} 
            <span class="brand-copy"><strong>小点刷题</strong><small>${isMemo ? "MEMORIZE REPORT" : isExam ? "EXAM REPORT" : "PRACTICE REPORT"}</small></span>
          </a>
          <button type="button" class="button button-outline button-small" data-action="go-home">${icon("home", 16)}返回首页</button>
        </header>

        <main class="result-main">
          <section class="result-hero">
            <div class="result-hero-copy">
              <p class="eyebrow"><span class="eyebrow-line"></span>${isMemo ? "MEMORIZE COMPLETE" : isExam ? "EXAM COMPLETE" : "PRACTICE COMPLETE"}</p>
              <h1>${resultTitle(result)}</h1>
              <p class="result-subtitle">${escapeHtml(resultSubtitle(result))}</p>
              <div class="result-actions">
                ${
                  wrongEntries.length
                    ? `<button type="button" class="button button-primary button-large" data-action="review-wrong">${icon("rotate", 18)}重练 ${wrongEntries.length} 道错题</button>`
                    : ""
                }
                <button type="button" class="button ${wrongEntries.length ? "button-outline" : "button-primary"} button-large" data-action="restart-mode" data-mode="${result.mode}">
                  ${icon("rotate", 18)}${isMemo ? "再背一轮" : isExam ? "再考一次" : "再练一轮"}
                </button>
                ${wrongEntries.length ? `<button type="button" class="button button-text" data-action="go-home">返回首页${icon("arrowRight", 16)}</button>` : ""}
              </div>
              <div class="result-meta-row">
                <span>${icon("file", 15)}${escapeHtml(result.bankName)}</span>
                <span>${icon("clock", 15)}${formatDate(result.finishedAt, true)}</span>
              </div>
            </div>
            ${resultHeroCard(result)}
          </section>

          <section class="result-metrics">
            ${
              isMemo
                ? `
                  <div class="metric-card"><span>浏览题目</span><strong>${result.total}<small> 道</small></strong><p>完整走完一轮</p></div>
                  <div class="metric-card"><span>覆盖分类</span><strong>${categories.length}<small> 个</small></strong><p>${escapeHtml(categories.slice(0, 2).join("、"))}${categories.length > 2 ? "…" : ""}</p></div>
                  <div class="metric-card"><span>学习用时</span><strong>${formatDuration(result.durationSeconds)}</strong><p>按自己的节奏</p></div>
                  <div class="metric-card metric-card-accent"><span>评分</span><strong>不判分</strong><p>记住比分数重要</p></div>`
                : `
                  <div class="metric-card"><span>答对</span><strong>${result.correctCount}<small> / ${totalCount}</small></strong><p>正确率 ${result.accuracy}%</p></div>
                  <div class="metric-card"><span>答错</span><strong>${result.wrongCount}<small> 道</small></strong><p>${isExam && result.unansweredCount ? `含 ${result.unansweredCount} 道未作答` : "已全部作答"}</p></div>
                  ${
                    isExam
                      ? `<div class="metric-card"><span>得分</span><strong>${result.score}<small> / ${result.totalScore}</small></strong><p>得分率 ${result.scorePercent}%</p></div>`
                      : `<div class="metric-card"><span>完成题数</span><strong>${result.total}<small> 道</small></strong><p>${result.isReview ? "错题已全部重练" : "本轮全部完成"}</p></div>`
                  }
                  <div class="metric-card"><span>用时</span><strong>${formatDuration(result.durationSeconds)}</strong><p>${isExam && result.timed ? "限时完成" : isExam ? "不限时" : "练习不计时"}</p></div>`
            }
          </section>

          ${
            !isMemo
              ? `<section class="wrong-section">
                  <div class="result-section-heading">
                    <div>
                      <p class="eyebrow">REVIEW & LEARN</p>
                      <h2>${wrongEntries.length ? "错题回顾" : "没有错题"}</h2>
                    </div>
                    <span class="result-section-count">${wrongEntries.length ? `${wrongEntries.length} 道待巩固` : "全部答对，满分表现"}</span>
                  </div>
                  ${
                    wrongEntries.length
                      ? `<div class="wrong-list">${wrongEntries.map((entry) => wrongCard(entry, result)).join("")}</div>`
                      : `<div class="perfect-state">
                          <span class="perfect-icon">${icon("award", 34)}</span>
                          <div><h3>漂亮，这一轮没有错题。</h3><p>可以再来一轮保持手感，或者换一个模式检验记忆。</p></div>
                          <button type="button" class="button button-primary" data-action="restart-mode" data-mode="${result.mode}">再来一轮${icon("arrowRight", 17)}</button>
                        </div>`
                  }
                </section>`
              : `<section class="memo-result-note">
                  <div class="memo-note-icon">${icon("sparkles", 25)}</div>
                  <div>
                    <h2>背题只是第一步。</h2>
                    <p>建议切换到做题模式，用即时反馈检验一下刚才的记忆。答错的题会自动进入成绩页，方便针对性复习。</p>
                  </div>
                  <button type="button" class="button button-primary" data-action="restart-mode" data-mode="practice">转去做题${icon("arrowRight", 17)}</button>
                </section>`
          }

          <section class="result-categories">
            <span>本轮覆盖</span>
            ${categories.map((category) => `<span class="tiny-chip">${escapeHtml(category)}</span>`).join("")}
          </section>
        </main>

        <footer class="site-footer result-footer">
          <span class="footer-brand">${brandMark("brand-mark-small")}小点刷题</span>
          <span>错题是路标，不是终点。</span>
          <button type="button" class="text-link" data-action="go-home">回到题库${icon("arrowRight", 14)}</button>
        </footer>
      </div>
    `;
  }

  function wrongCard(entry, result) {
    const question = entry.question;
    const isUnanswered = entry.unanswered;
    return `
      <article class="wrong-card">
        <div class="wrong-topline">
          <span class="wrong-number">${pad2(result.questions.indexOf(entry) + 1)}</span>
          ${typeBadge(question.type)}
          ${question.category ? `<span class="meta-chip">${escapeHtml(question.category)}</span>` : ""}
          <span class="wrong-status ${isUnanswered ? "is-empty" : ""}">${isUnanswered ? "未作答" : "答错"}</span>
        </div>
        <h3 class="wrong-stem">${escapeHtml(question.stem)}</h3>
        <div class="answer-compare">
          <div class="answer-box answer-box-wrong">
            <span>你的答案</span>
            <strong>${escapeHtml(displayAnswer(question, entry.selected))}</strong>
          </div>
          <div class="answer-box answer-box-right">
            <span>正确答案</span>
            <strong>${escapeHtml(displayAnswer(question, question.answer))}</strong>
          </div>
        </div>
        <div class="analysis-block wrong-analysis">
          <span class="analysis-label">${icon("sparkles", 15)}解析</span>
          <p>${question.analysis ? escapeHtml(question.analysis) : "这道题暂时没有解析。"}</p>
        </div>
      </article>
    `;
  }

  /* ----------------------------------------------------------------------- */
  /* Import                                                                  */
  /* ----------------------------------------------------------------------- */

  function openImport() {
    state.modal = {
      type: "import",
      phase: "idle",
      fileName: "",
      bankName: "",
      report: null,
      error: "",
    };
    openModal();
  }

  function importModal(modal) {
    const phaseTitles = {
      idle: ["导入题库", "把 Excel 变成你的练习场"],
      parsing: ["正在读取", "先看一眼这份题库"],
      error: ["读取失败", "别担心，检查一下文件"],
      preview: ["确认导入", "题库已经准备好了"],
    };
    const [title, subtitle] = phaseTitles[modal.phase] || phaseTitles.idle;
    return `
      <div class="modal import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title" tabindex="-1">
        <div class="modal-head">
          <div class="modal-heading">
            <span class="modal-mode-icon mode-tone-practice">${icon("file", 24)}</span>
            <div><p class="eyebrow">EXCEL IMPORT</p><h2 id="import-title">${title}</h2><span class="modal-subtitle">${subtitle}</span></div>
          </div>
          <button type="button" class="icon-button modal-close" data-action="close-modal" aria-label="关闭导入窗口" ${modal.phase === "parsing" ? "disabled" : ""}>${icon("close", 20)}</button>
        </div>
        <div class="modal-body">
          ${importBody(modal)}
        </div>
      </div>
    `;
  }

  function importBody(modal) {
    if (modal.phase === "parsing") {
      return `
        <div class="import-loading">
          <span class="loading-spinner" aria-hidden="true"></span>
          <h3>正在解析 ${escapeHtml(modal.fileName)}</h3>
          <p>读取工作表、检查字段与答案格式…</p>
        </div>`;
    }
    if (modal.phase === "error") {
      return `
        <div class="import-error">
          <span class="import-error-icon">${icon("alert", 28)}</span>
          <h3>这份文件暂时无法导入</h3>
          <p>${escapeHtml(modal.error)}</p>
          <div class="import-error-tips">
            <span>建议检查：</span>
            <ul>
              <li>文件是否为 .xlsx 格式，而不是 .xls 或 .csv；</li>
              <li>第一张工作表是否包含正确表头；</li>
              <li>题型、题干和正确答案是否填写完整。</li>
            </ul>
          </div>
        </div>
        <div class="import-actions">
          <button type="button" class="button button-outline" data-action="download-template">${icon("download", 17)}下载模板</button>
          <button type="button" class="button button-primary" data-action="restart-import">重新选择文件${icon("upload", 17)}</button>
        </div>`;
    }
    if (modal.phase === "preview" && modal.report) {
      return importPreview(modal);
    }
    return `
      <div class="dropzone" id="importDropzone">
        <input type="file" id="bankFileInput" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
        <span class="dropzone-icon">${icon("upload", 28)}</span>
        <h3>把 Excel 拖到这里</h3>
        <p>或者 <button type="button" class="inline-link" data-action="pick-file">选择文件</button></p>
        <span class="dropzone-note">支持 .xlsx，最大 20MB · 只读取第一张工作表</span>
      </div>
      <div class="import-guide">
        <div class="import-guide-head">
          <span>${icon("info", 16)}必填：题型、题干、正确答案 · 单选/多选还需选项 A、B</span>
          <button type="button" class="inline-link" data-action="open-help">查看完整格式</button>
        </div>
        <div class="field-chips">
          <span>题型<small>必填</small></span>
          <span>题干<small>必填</small></span>
          <span>选项A / B<small>必填</small></span>
          <span>正确答案<small>必填</small></span>
          <span>解析<small>可选</small></span>
          <span>分值 / 分类<small>可选</small></span>
        </div>
        <div class="import-guide-foot">
          <p>导入后会替换当前题库，现有练习记录仍会保留。</p>
          <a class="inline-link" href="assets/question-bank-template.xlsx" download="小点刷题_题库模板.xlsx">${icon("download", 15)}下载 Excel 模板</a>
        </div>
      </div>`;
  }

  function importPreview(modal) {
    const report = modal.report;
    const counts = countByType(report.questions);
    const sheetNotice = report.sheetNames.length > 1
      ? `已读取第一张工作表「${escapeHtml(report.sheetName)}」`
      : `工作表「${escapeHtml(report.sheetName)}」`;
    const warnings = report.warnings || [];
    const errors = report.errors || [];
    const issueTotal = errors.length + warnings.length;
    const shownIssues = errors.slice(0, 8).concat(warnings.slice(0, 8));
    const hiddenIssues = issueTotal - shownIssues.length;
    return `
      <div class="import-file-banner">
        <span class="import-file-icon">${icon("file", 24)}</span>
        <div>
          <strong>${escapeHtml(modal.fileName)}</strong>
          <span>${sheetNotice} · 表头位于第 ${report.headerRow} 行</span>
        </div>
        <span class="import-success-mark">${icon("check", 16)}读取成功</span>
      </div>

      <div class="import-name-field">
        <label for="bankNameInput">题库名称</label>
        <input id="bankNameInput" type="text" maxlength="80" value="${escapeHtml(modal.bankName)}" placeholder="给这份题库起个名字">
      </div>

      <div class="import-preview-stats">
        <div><strong>${report.questions.length}</strong><span>道可导入题目</span></div>
        <div><strong>${counts.single}</strong><span>单选</span></div>
        <div><strong>${counts.multiple}</strong><span>多选</span></div>
        <div><strong>${counts.judge}</strong><span>判断</span></div>
      </div>

      ${issueTotal ? `<div class="import-issues">
        <div class="import-issues-head">${icon("alert", 16)}<strong>有 ${issueTotal} 条提示</strong><span>不会影响可用的题目</span></div>
        <ul>
          ${errors.slice(0, 8).map((item) => `<li class="issue-error"><b>第 ${item.row} 行</b>${escapeHtml(item.message)}（已跳过）</li>`).join("")}
          ${warnings.slice(0, 8).map((item) => `<li class="issue-warning"><b>第 ${item.row} 行</b>${escapeHtml(item.message)}</li>`).join("")}
          ${hiddenIssues > 0 ? `<li class="issue-more">还有 ${hiddenIssues} 条提示未展示</li>` : ""}
        </ul>
      </div>` : ""}

      <div class="import-preview-list">
        <div class="import-preview-head"><span>题目预览</span><span>前 ${Math.min(3, report.questions.length)} 道</span></div>
        ${report.questions.slice(0, 3).map((question, index) => `
          <div class="preview-question">
            <span class="preview-number">${pad2(index + 1)}</span>
            ${typeBadge(question.type)}
            <p>${escapeHtml(question.stem)}</p>
            <span class="preview-answer">答案 ${escapeHtml(shortAnswer(question, question.answer))}</span>
          </div>
        `).join("")}
      </div>

      <div class="import-replace-note">${icon("alert", 15)}确认后会替换当前题库「${escapeHtml(state.bank.name)}」，练习记录不受影响。</div>

      <div class="import-actions">
        <button type="button" class="button button-text" data-action="restart-import">重新选择</button>
        <button type="button" class="button button-primary button-large" data-action="confirm-import">${icon("check", 17)}导入 ${report.questions.length} 道题</button>
      </div>
    `;
  }

  function pickFile() {
    const input = document.getElementById("bankFileInput");
    if (input) input.click();
  }

  function downloadTemplate() {
    const anchor = document.createElement("a");
    anchor.href = "assets/question-bank-template.xlsx";
    anchor.download = "小点刷题_题库模板.xlsx";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function handleImportFile(file) {
    if (!file) return;
    if (!state.modal || state.modal.type !== "import") return;
    if (!/\.xlsx$/i.test(file.name || "")) {
      state.modal.phase = "error";
      state.modal.error = "目前支持 .xlsx 格式。若文件是 .xls，请在 Excel 中另存为 .xlsx 后再导入。";
      renderModal();
      return;
    }
    state.modal.phase = "parsing";
    state.modal.fileName = file.name;
    state.modal.error = "";
    renderModal();
    try {
      const workbook = await XlsxReader.readFile(file);
      const report = parseRows(workbook.rows);
      if (!report.questions.length) {
        const firstError = report.errors[0];
        throw new Error(
          firstError
            ? `没有找到可导入的题目。第 ${firstError.row} 行：${firstError.message}`
            : "没有找到可导入的题目，请检查表格内容和表头。"
        );
      }
      report.sheetName = workbook.sheetName;
      report.sheetNames = workbook.sheetNames || [workbook.sheetName];
      state.modal.report = report;
      state.modal.bankName = file.name.replace(/\.xlsx$/i, "").trim() || "我的题库";
      state.modal.phase = "preview";
      renderModal();
    } catch (error) {
      state.modal.phase = "error";
      state.modal.error = error && error.message ? error.message : "读取文件时出现未知错误，请重试。";
      renderModal();
    }
  }

  function confirmImport() {
    if (!state.modal || state.modal.type !== "import" || !state.modal.report) return;
    const nameInput = document.getElementById("bankNameInput");
    const name = (nameInput ? nameInput.value : state.modal.bankName).trim() || "我的题库";
    const report = state.modal.report;
    const bank = {
      name,
      sourceFile: state.modal.fileName,
      sheetName: report.sheetName,
      importedAt: Date.now(),
      questions: report.questions,
    };
    state.bank = bank;
    writeStorage(STORAGE_KEYS.bank, bank);
    state.modal = null;
    modalRoot.innerHTML = "";
    setBodyModal(false);
    state.route = "home";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast(`题库导入成功，共 ${bank.questions.length} 道题。`, "success");
  }

  function openHelp() {
    state.modal = { type: "help" };
    openModal();
  }

  function helpModal() {
    return `
      <div class="modal help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" tabindex="-1">
        <div class="modal-head">
          <div class="modal-heading">
            <span class="modal-mode-icon mode-tone-help">${icon("info", 24)}</span>
            <div><p class="eyebrow">GUIDE & FORMAT</p><h2 id="help-title">题库格式与使用说明</h2><span class="modal-subtitle">Excel 怎么写，三种模式怎么用，一次说清。</span></div>
          </div>
          <button type="button" class="icon-button modal-close" data-action="close-modal" aria-label="关闭说明">${icon("close", 20)}</button>
        </div>
        <div class="modal-body help-body">
          <section class="help-section">
            <div class="help-section-heading">
              <span class="help-number">01</span>
              <div><h3>Excel 题库字段约定</h3><p>读取第一张工作表，表头放在前 15 行内即可（上方可以有标题）。列的顺序不限，列名需要与下表一致。</p></div>
            </div>
            <div class="table-scroll">
              <table class="guide-table">
                <thead><tr><th>字段</th><th>是否必填</th><th>填写规则</th><th>示例</th></tr></thead>
                <tbody>
                  <tr><td><b>题型</b></td><td><span class="required-badge">必填</span></td><td>单选题、多选题、判断题</td><td>单选</td></tr>
                  <tr><td><b>题干</b></td><td><span class="required-badge">必填</span></td><td>题目正文，支持换行</td><td>HTTP 404 表示什么？</td></tr>
                  <tr><td><b>选项A</b><br><b>选项B</b></td><td><span class="required-badge">必填*</span></td><td>每列一个选项，至少 A、B 两项；判断题可留空</td><td>请求成功</td></tr>
                  <tr><td><b>选项C…Z</b></td><td><span class="optional-badge">可选</span></td><td>按顺序增加 C、D 等列；至少保留两个非空选项</td><td>资源不存在</td></tr>
                  <tr><td><b>正确答案</b></td><td><span class="required-badge">必填</span></td><td>单选填一个字母；多选填多个字母；判断题填“正确 / 错误”</td><td>ABC 或 正确</td></tr>
                  <tr><td><b>解析</b></td><td><span class="optional-badge">可选</span></td><td>交卷或提交后展示，支持换行</td><td>404 表示资源未找到…</td></tr>
                  <tr><td><b>分值</b></td><td><span class="optional-badge">可选</span></td><td>正数，缺省按 1 分计；考试按此累加总分</td><td>5</td></tr>
                  <tr><td><b>分类</b></td><td><span class="optional-badge">可选</span></td><td>章节或知识分类，缺省归入“未分类”</td><td>计算机基础</td></tr>
                  <tr><td><b>难度</b></td><td><span class="optional-badge">可选</span></td><td>如简单 / 中等 / 困难，仅作展示</td><td>简单</td></tr>
                </tbody>
              </table>
            </div>
            <p class="help-footnote">* 判断题的选项内容可留空，系统会自动生成“正确 / 错误”；只有判断题的题库也可直接省略选项列。单选/多选题至少要保留 A、B 两列并填写内容。表头须位于前 15 行内，第一个工作表为导入对象。</p>
          </section>

          <section class="help-section">
            <div class="help-section-heading">
              <span class="help-number">02</span>
              <div><h3>三种模式的区别</h3><p>同一份题库，三种不同的学习节奏。</p></div>
            </div>
            <div class="table-scroll">
              <table class="guide-table compare-table">
                <thead><tr><th>维度</th><th>做题模式</th><th>背题模式</th><th>考试模式</th></tr></thead>
                <tbody>
                  <tr><td>交互流程</td><td>逐题选择 → 提交 → 下一题</td><td>直接查看题目、答案与解析，可自由翻页</td><td>连续作答，可跳题、标记，交卷后统一评分</td></tr>
                  <tr><td>答题反馈</td><td><b class="text-green">每题即时</b>显示对错、正确答案与解析</td><td><b class="text-gold">答案常显</b>，不隐藏解析</td><td><b class="text-red">交卷后</b>才显示对错，过程中无提示</td></tr>
                  <tr><td>计时方式</td><td>不计时，记录总用时</td><td>不计时</td><td>可选限时（1–300 分钟）或无限时</td></tr>
                  <tr><td>结果统计</td><td>正确率、答对/错数量、错题解析</td><td>不评分，只记录浏览数量与用时</td><td>总分、得分率、正确率、用时、未答题与错题解析</td></tr>
                  <tr><td>适合场景</td><td>边学边练，及时纠错</td><td>考前记忆，快速建立印象</td><td>模拟真实考试，检验整体掌握程度</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="help-section help-tips-section">
            <div class="help-section-heading">
              <span class="help-number">03</span>
              <div><h3>导入小贴士</h3></div>
            </div>
            <div class="help-tips">
              <div>${icon("check", 17)}<p><b>支持 .xlsx</b><br>旧版 .xls 请先在 Excel 中另存为 .xlsx。</p></div>
              <div>${icon("check", 17)}<p><b>答案用字母</b><br>单选写 A，多选写 ABC 或 A,B,C，顺序不限。</p></div>
              <div>${icon("check", 17)}<p><b>判断题写文字</b><br>填“正确/错误”即可，也兼容 对/错、√/×。</p></div>
              <div>${icon("check", 17)}<p><b>跳过无效行</b><br>导入前会展示错误行，不影响其他题目。</p></div>
            </div>
          </section>
        </div>
        <div class="modal-footer help-footer">
          <span class="help-local-note">${icon("shield", 15)}题库只保存在本机浏览器</span>
          <div>
            <a class="button button-outline" href="assets/question-bank-template.xlsx" download="小点刷题_题库模板.xlsx">${icon("download", 17)}下载 Excel 模板</a>
            <button type="button" class="button button-primary" data-action="close-modal">知道了</button>
          </div>
        </div>
      </div>
    `;
  }

  function parseRows(rows) {
    const ALIASES = {
      type: ["题型", "类型", "题目类型", "questiontype", "type"],
      stem: ["题干", "题目", "问题", "题目内容", "question", "content", "title"],
      answer: ["正确答案", "答案", "标准答案", "answer", "correctanswer", "correct"],
      analysis: ["解析", "答案解析", "分析", "题目解析", "explanation", "analysis", "solution"],
      score: ["分值", "分数", "score", "points", "point"],
      category: ["分类", "章节", "类别", "知识点", "category", "chapter", "topic"],
      difficulty: ["难度", "difficulty", "level"],
    };

    const normalizeHeader = (value) =>
      String(value == null ? "" : value)
        .replace(/^\uFEFF/, "")
        .replace(/[\s\u3000]+/g, "")
        .replace(/[：:]/g, "")
        .toLowerCase();

    const aliasLookup = {};
    Object.keys(ALIASES).forEach((field) => {
      ALIASES[field].forEach((alias) => {
        aliasLookup[normalizeHeader(alias)] = field;
      });
    });

    let headerRow = null;
    let columns = null;
    let optionColumns = null;

    for (let rowIndex = 0; rowIndex < Math.min(rows.length, 15); rowIndex += 1) {
      const row = rows[rowIndex];
      const mapping = {};
      const options = {};
      row.cells.forEach((cell, columnIndex) => {
        const normalized = normalizeHeader(cell);
        if (!normalized) return;
        if (aliasLookup[normalized] && mapping[aliasLookup[normalized]] === undefined) {
          mapping[aliasLookup[normalized]] = columnIndex;
          return;
        }
        const optionMatch = /^(?:选项)?([a-z])$/i.exec(normalized);
        if (optionMatch && options[optionMatch[1].toUpperCase()] === undefined) {
          options[optionMatch[1].toUpperCase()] = columnIndex;
        }
      });
      if (mapping.type !== undefined && mapping.stem !== undefined && mapping.answer !== undefined) {
        headerRow = row;
        columns = mapping;
        optionColumns = options;
        break;
      }
    }

    if (!headerRow || !columns) {
      throw new Error("没有找到表头。请确保前 15 行内至少包含「题型」「题干」「正确答案」三列。");
    }
    if (!optionColumns) optionColumns = {};

    const errors = [];
    const warnings = [];
    const questions = [];
    const seenStems = new Map();

    const getCell = (row, field) => {
      const columnIndex = columns[field];
      if (columnIndex === undefined) return "";
      return String(row.cells[columnIndex] == null ? "" : row.cells[columnIndex]).trim();
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      if (row.number <= headerRow.number) continue;

      const typeRaw = getCell(row, "type");
      const stem = getCell(row, "stem");
      const answerRaw = getCell(row, "answer");
      const hasOptions = Object.values(optionColumns).some((columnIndex) =>
        String(row.cells[columnIndex] == null ? "" : row.cells[columnIndex]).trim()
      );
      if (!typeRaw && !stem && !answerRaw && !hasOptions) continue;

      try {
        if (!typeRaw) throw new Error("缺少题型（单选 / 多选 / 判断）");
        const type = normalizeType(typeRaw);
        if (!type) throw new Error(`无法识别的题型「${typeRaw}」`);
        if (!stem) throw new Error("缺少题干");
        if (!answerRaw) throw new Error("缺少正确答案");

        let options = [];
        if (type === "judge") {
          options = [
            { key: "A", text: "正确" },
            { key: "B", text: "错误" },
          ];
        } else {
          const available = [];
          Object.keys(optionColumns)
            .sort()
            .forEach((key) => {
              const text = String(row.cells[optionColumns[key]] == null ? "" : row.cells[optionColumns[key]]).trim();
              if (text) available.push({ key, text });
            });
          if (!available.some((option) => option.key === "A") || !available.some((option) => option.key === "B")) {
            throw new Error("单选题 / 多选题至少需要填写选项 A 和选项 B");
          }
          if (available.length < 2) throw new Error("至少需要两个非空选项");
          options = available;
        }

        const keys = type === "judge" ? parseJudgeAnswer(answerRaw) : parseLetterAnswer(answerRaw);
        if (!keys || !keys.length) {
          throw new Error(
            type === "judge"
              ? "判断题答案请填写“正确”或“错误”"
              : "答案须为选项字母，例如 A 或 ABC"
          );
        }
        if (type === "single" && keys.length !== 1) throw new Error("单选题只能有一个正确答案");
        if (type === "multiple" && keys.length < 2) {
          warnings.push({
            row: row.number,
            message: "多选题只有一个正确答案，已按原数据导入，请确认。",
          });
        }

        const validKeys = new Set(options.map((option) => option.key));
        const invalidKeys = keys.filter((key) => !validKeys.has(key));
        if (invalidKeys.length) {
          throw new Error(`答案 ${invalidKeys.join("、")} 不在已填写的选项范围内`);
        }

        let score = 1;
        const scoreRaw = getCell(row, "score");
        if (scoreRaw) {
          const parsedScore = Number(String(scoreRaw).replace(/[^\d.-]/g, ""));
          if (!Number.isFinite(parsedScore) || parsedScore <= 0) {
            warnings.push({ row: row.number, message: "分值无效，已按 1 分处理。" });
          } else {
            score = Math.round(parsedScore * 100) / 100;
          }
        }

        const category = getCell(row, "category") || "未分类";
        const difficulty = getCell(row, "difficulty");
        const stemKey = `${stem.replace(/\s+/g, "")}::${options.map((option) => option.text).join("|")}`;
        if (seenStems.has(stemKey)) {
          warnings.push({
            row: row.number,
            message: `与第 ${seenStems.get(stemKey)} 行题目重复，已保留两行。`,
          });
        } else {
          seenStems.set(stemKey, row.number);
        }

        questions.push({
          id: `import-${row.number}-${questions.length + 1}`,
          type,
          stem,
          options,
          answer: keys,
          analysis: getCell(row, "analysis"),
          score,
          category,
          difficulty,
          rowNumber: row.number,
        });
      } catch (error) {
        errors.push({
          row: row.number,
          message: error && error.message ? error.message : "该行数据无法解析",
        });
      }
    }

    if (!questions.length) {
      throw new Error(
        errors.length
          ? `表格中没有可导入的题目。第一处问题在第 ${errors[0].row} 行：${errors[0].message}`
          : "表格数据为空，请填写至少一道题目。"
      );
    }

    return {
      questions,
      errors,
      warnings,
      headerRow: headerRow.number,
      sheetName: "",
      sheetNames: [],
    };
  }

  function normalizeType(raw) {
    const value = String(raw || "")
      .replace(/[\s\u3000]+/g, "")
      .replace(/题目|题型/g, "")
      .toLowerCase();
    if (["单选", "单选题", "单项选择", "单项选择题", "single", "singlechoice", "radio"].includes(value)) {
      return "single";
    }
    if (["多选", "多选题", "多项选择", "多项选择题", "不定项选择", "不定项选择题", "multiple", "multiplechoice", "multi"].includes(value)) {
      return "multiple";
    }
    if (["判断", "判断题", "是非题", "正误题", "对错题", "judge", "truefalse", "boolean"].includes(value)) {
      return "judge";
    }
    return "";
  }

  function parseLetterAnswer(raw) {
    const normalized = String(raw || "")
      .toUpperCase()
      .replace(/[Ａ-Ｚ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
      .replace(/[\s\u3000，,、;；/|]/g, "")
      .replace(/[。.]+$/g, "");
    if (!/^[A-Z]+$/.test(normalized)) return [];
    return Array.from(new Set(normalized.split(""))).sort();
  }

  function parseJudgeAnswer(raw) {
    const value = String(raw || "")
      .replace(/[\s\u3000。.！!]/g, "")
      .toUpperCase();
    if (["正确", "对", "是", "真", "√", "✓", "T", "TRUE", "A", "1", "Y", "YES"].includes(value)) return ["A"];
    if (["错误", "错", "否", "假", "×", "X", "✗", "F", "FALSE", "B", "0", "N", "NO"].includes(value)) return ["B"];
    return [];
  }

  /* ----------------------------------------------------------------------- */
  /* Modal infrastructure                                                    */
  /* ----------------------------------------------------------------------- */

  function openModal() {
    lastFocusedElement = document.activeElement;
    setBodyModal(true);
    renderModal();
  }

  function closeModal() {
    if (!state.modal) return;
    if (state.modal.type === "import" && state.modal.phase === "parsing") return;
    state.modal = null;
    modalRoot.innerHTML = "";
    setBodyModal(false);
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function" && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus({ preventScroll: true });
    }
    lastFocusedElement = null;
  }

  function confirmModal(modal) {
    return `
      <div class="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
        <div class="confirm-icon ${modal.danger ? "is-danger" : ""}">${icon(modal.danger ? "alert" : "info", 26)}</div>
        <h2 id="confirm-title">${escapeHtml(modal.title)}</h2>
        <p class="confirm-message">${escapeHtml(modal.message)}</p>
        ${modal.detail ? `<p class="confirm-detail">${escapeHtml(modal.detail)}</p>` : ""}
        <div class="confirm-actions">
          <button type="button" class="button button-text" data-action="cancel-modal">${escapeHtml(modal.cancelLabel || "取消")}</button>
          <button type="button" class="button ${modal.danger ? "button-danger" : "button-primary"}" data-action="confirm-action">${escapeHtml(modal.confirmLabel || "确认")}</button>
        </div>
      </div>
    `;
  }

  function renderModal(focusSelector) {
    if (!state.modal) {
      modalRoot.innerHTML = "";
      return;
    }
    let markup = "";
    if (state.modal.type === "setup") markup = setupModal(state.modal);
    else if (state.modal.type === "import") markup = importModal(state.modal);
    else if (state.modal.type === "help") markup = helpModal();
    else if (state.modal.type === "confirm") markup = confirmModal(state.modal);

    modalRoot.innerHTML = `<div class="modal-backdrop">${markup}</div>`;
    setBodyModal(true);
    window.requestAnimationFrame(() => {
      const target = focusSelector ? modalRoot.querySelector(focusSelector) : modalRoot.querySelector(".modal");
      if (target && typeof target.focus === "function") target.focus({ preventScroll: true });
    });
  }

  function executeConfirm() {
    if (!state.modal || state.modal.type !== "confirm") return;
    const callback = state.modal.callback;
    closeModal();
    if (typeof callback === "function") callback();
  }

  function trapFocus(event) {
    if (!state.modal || event.key !== "Tab") return;
    const focusable = Array.from(
      modalRoot.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ----------------------------------------------------------------------- */
  /* Main render & events                                                    */
  /* ----------------------------------------------------------------------- */

  function render(preserveScroll) {
    const scrollY = window.scrollY;
    if (state.route === "session" && state.session) {
      app.innerHTML = viewSession();
      if (preserveScroll) window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
    } else if (state.route === "result" && state.result) {
      app.innerHTML = viewResult();
    } else {
      app.innerHTML = viewHome();
    }
    renderModal();
  }

  function handleAction(action, target) {
    switch (action) {
      case "go-home":
        if (examClockTimer) {
          window.clearInterval(examClockTimer);
          examClockTimer = null;
        }
        state.session = null;
        state.result = null;
        state.modal = null;
        modalRoot.innerHTML = "";
        setBodyModal(false);
        state.route = "home";
        render();
        window.scrollTo({ top: 0, behavior: "auto" });
        break;
      case "open-import":
        openImport();
        break;
      case "open-help":
        openHelp();
        break;
      case "close-modal":
        closeModal();
        break;
      case "cancel-modal":
        closeModal();
        break;
      case "open-setup":
        openSetup(target.dataset.mode);
        break;
      case "set-count":
        if (!state.modal || state.modal.type !== "setup") return;
        state.modal.count = target.dataset.value;
        renderModal(`[data-action="set-count"][data-value="${target.dataset.value}"]`);
        break;
      case "set-order":
        if (!state.modal || state.modal.type !== "setup") return;
        state.modal.order = target.dataset.value;
        renderModal(`[data-action="set-order"][data-value="${target.dataset.value}"]`);
        break;
      case "set-timed":
        if (!state.modal || state.modal.type !== "setup") return;
        state.modal.timed = target.dataset.value === "true";
        renderModal(`[data-action="set-timed"][data-value="${target.dataset.value}"]`);
        break;
      case "set-minutes":
        if (!state.modal || state.modal.type !== "setup") return;
        state.modal.minutes = Number(target.dataset.value);
        renderModal(`[data-action="set-minutes"][data-value="${target.dataset.value}"]`);
        break;
      case "start-session":
        startSession();
        break;
      case "select-option":
        selectOption(target.dataset.key);
        break;
      case "submit-answer":
        submitPracticeAnswer();
        break;
      case "next-question":
        nextQuestion();
        break;
      case "prev-question":
        prevQuestion();
        break;
      case "jump-question":
        goToQuestion(target.dataset.index);
        break;
      case "toggle-flag":
        toggleFlag();
        break;
      case "finish-memorize":
        finishMemorize();
        break;
      case "request-submit-exam":
        openSubmitExamModal();
        break;
      case "confirm-action":
        executeConfirm();
        break;
      case "request-exit":
        requestExit();
        break;
      case "review-wrong":
        if (state.result) startWrongReview(state.result);
        break;
      case "restart-mode":
        restartMode(target.dataset.mode);
        break;
      case "pick-file":
        pickFile();
        break;
      case "restart-import":
        state.modal = {
          type: "import",
          phase: "idle",
          fileName: "",
          bankName: "",
          report: null,
          error: "",
        };
        renderModal();
        window.setTimeout(pickFile, 60);
        break;
      case "confirm-import":
        confirmImport();
        break;
      case "download-template":
        downloadTemplate();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (actionTarget) {
        const action = actionTarget.dataset.action;
        if (action === "go-home") event.preventDefault();
        handleAction(action, actionTarget);
        return;
      }
      if (event.target.classList && event.target.classList.contains("modal-backdrop")) {
        if (state.modal && state.modal.type !== "confirm" && !(state.modal.type === "import" && state.modal.phase === "parsing")) {
          closeModal();
        }
      }
      const dropzone = event.target.closest && event.target.closest("#importDropzone");
      if (dropzone && !event.target.closest("button, input, a")) pickFile();
    });

    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-setup-category]")) {
        updateSetupScope(event.target.value);
      }
      if (event.target.matches("[data-setup-minutes]")) {
        if (!state.modal || state.modal.type !== "setup") return;
        const parsed = Number(event.target.value);
        if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 300) state.modal.minutes = Math.round(parsed);
      }
      if (event.target.id === "bankFileInput") {
        const file = event.target.files && event.target.files[0];
        handleImportFile(file);
      }
    });

    document.addEventListener("input", (event) => {
      if (event.target.matches("[data-setup-minutes]") && state.modal && state.modal.type === "setup") {
        state.modal.minutes = event.target.value;
      }
      if (event.target.id === "bankNameInput" && state.modal && state.modal.type === "import") {
        state.modal.bankName = event.target.value;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (state.modal) {
        if (event.key === "Escape") {
          if (state.modal.type === "import" && state.modal.phase === "parsing") return;
          event.preventDefault();
          closeModal();
          return;
        }
        trapFocus(event);
        return;
      }
      if (state.route !== "session" || !state.session) return;
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(activeTag)) return;
      if (document.activeElement && document.activeElement.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (/^[1-9]$/.test(event.key) && state.session.mode !== "memorize") {
        const option = currentQuestion().options[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          selectOption(option.key);
        }
        return;
      }
      if (event.key === "Enter") {
        if (state.session.mode === "practice") {
          const evaluated = state.session.evaluations[state.session.index];
          if (evaluated) nextQuestion();
          else submitPracticeAnswer();
          event.preventDefault();
        }
        return;
      }
      if (state.session.mode === "memorize") {
        if (event.key === "ArrowRight" || event.key === " ") {
          event.preventDefault();
          if (state.session.index < state.session.questions.length - 1) nextQuestion();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevQuestion();
        }
      }
    });

    document.addEventListener("dragover", (event) => {
      const zone = document.getElementById("importDropzone");
      if (!zone) return;
      event.preventDefault();
      zone.classList.add("is-dragging");
    });

    document.addEventListener("dragleave", (event) => {
      const zone = document.getElementById("importDropzone");
      if (zone && event.target === zone) zone.classList.remove("is-dragging");
    });

    document.addEventListener("drop", (event) => {
      const zone = document.getElementById("importDropzone");
      if (!zone) return;
      event.preventDefault();
      zone.classList.remove("is-dragging");
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) handleImportFile(file);
    });

    window.addEventListener("beforeunload", (event) => {
      if (state.route === "session" && state.session && !state.session.finished) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  init();
})();
