// Надстройка над app.js: бегунок "не больше N продуктов", бегунок количества в рецепте,
// кнопка "Поставить на телефон", регистрация офлайн-кэша.
// Основной app.js не менялся: здесь только обёртки над его функциями.

/* ---------- пересчёт количества продуктов (чистая логика) ---------- */
const GV_NUM = '(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?)';
const GV_GROUP = new RegExp(GV_NUM + '(?:\\s*[–-]\\s*' + GV_NUM + ')?');
const GV_RU_FORMS = [
  [/^зубчик[а-яё]*/i, ['зубчик', 'зубчика', 'зубчиков']],
  [/^луковиц[а-яё]*/i, ['луковица', 'луковицы', 'луковиц']],
  [/^яйц[а-яё]*/i, ['яйцо', 'яйца', 'яиц']],
  [/^(перо|пера|перьев)(?![а-яё])/i, ['перо', 'пера', 'перьев']],
  [/^картофелин[а-яё]*/i, ['картофелина', 'картофелины', 'картофелин']],
  [/^стакан[а-яё]*/i, ['стакан', 'стакана', 'стаканов']],
  [/^морков[а-яё]*/i, ['морковь', 'моркови', 'морковей']],
  [/^банан[а-яё]*/i, ['банан', 'банана', 'бананов']],
  [/^персик[а-яё]*/i, ['персик', 'персика', 'персиков']],
  [/^яблок[а-яё]*/i, ['яблоко', 'яблока', 'яблок']],
  [/^помидор[а-яё]*/i, ['помидор', 'помидора', 'помидоров']]
];
const GV_SAFE = {
  ru: /^(г|мл|л|шт\.?|ст\. ?л\.|ч\. ?л\.)(?![а-яё])/i,
  en: /^(g|kg|ml|l|litres?|tbsp|tsp)(?![a-z])/i,
  fr: /^(g|kg|ml|l|litres?|c\. ?à ?[sc]\.?)(?![a-zà-ÿ])/i
};

function gvValue(tok) {
  tok = tok.trim();
  let m = tok.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + m[2] / m[3];
  m = tok.match(/^(\d+)\/(\d+)$/);
  if (m) return m[1] / m[2];
  return parseFloat(tok.replace(',', '.'));
}

function gvFormat(x) {
  if (x >= 50) x = Math.round(x / 5) * 5;
  else if (x >= 10) x = Math.round(x);
  else {
    const w = Math.floor(x), f = x - w;
    if (Math.abs(f - 1 / 3) < 0.05) return (w ? w + ' ' : '') + '1/3';
    if (Math.abs(f - 2 / 3) < 0.05) return (w ? w + ' ' : '') + '2/3';
    x = Math.round(x * 4) / 4;
    if (x < 0.25) x = 0.25;
  }
  const w = Math.floor(x), f = x - w;
  const fr = { 0.25: '1/4', 0.5: '1/2', 0.75: '3/4' }[f];
  return fr ? (w ? w + ' ' : '') + fr : String(x);
}

function gvPickForm(forms, n) {
  if (n !== Math.floor(n)) return forms[1];
  const a = n % 100, b = n % 10;
  if (a >= 11 && a <= 14) return forms[2];
  if (b === 1) return forms[0];
  if (b >= 2 && b <= 4) return forms[1];
  return forms[2];
}

function gvMultLabel(m, lang) {
  const t = gvFormat(m);
  return lang === 'en' && t.includes('1/') ? t : t;
}

function gvScaleLine(s, m, lang) {
  if (m === 1) return s;
  const mark = () => s + ' (×' + gvMultLabel(m, lang) + ')';
  const sep = s.match(/\s[—–-]\s/);
  const start = sep ? sep.index + sep[0].length : 0;
  const q = s.slice(start);
  const g = q.match(GV_GROUP);
  if (!g) return s; // нет числа: "по вкусу" и т.п.
  if (!sep && lang !== 'ru' && q.slice(0, g.index).trim()) return mark();
  const after = q.slice(g.index + g[0].length);
  if (/\d/.test(after)) return mark();

  const a = gvValue(g[1]) * m;
  const b = g[2] ? gvValue(g[2]) * m : null;
  const last = b !== null ? b : a;
  const numText = gvFormat(a) + (b !== null ? '–' + gvFormat(b) : '');
  const rest = after.replace(/^\s+/, '');
  const gap = after.slice(0, after.length - rest.length) || ' ';
  const pre = s.slice(0, start) + q.slice(0, g.index);

  if (GV_SAFE[lang] && GV_SAFE[lang].test(rest)) return pre + numText + after;

  if (lang === 'ru') {
    for (const [re, forms] of GV_RU_FORMS) {
      const w = rest.match(re);
      if (w && rest[w[0].length] !== '-') return pre + numText + gap + gvPickForm(forms, Math.round(last * 100) / 100) + rest.slice(w[0].length);
    }
    const adj = rest.match(/^(небольш|средн)[а-яё]*/i);
    if (adj && /^[s,.;:]*$|^[,.;:]/.test(rest.slice(adj[0].length)) && g[1].trim() === '1' && !g[2] && Number.isInteger(a) && a >= 2) {
      const word = /^небольш/i.test(adj[0]) ? 'небольших' : 'средних';
      return pre + numText + gap + word + rest.slice(adj[0].length);
    }
  }
  return mark();
}

if (typeof module !== 'undefined') module.exports = { gvScaleLine, gvFormat };

/* ---------- всё остальное работает только в браузере ---------- */
if (typeof document !== 'undefined' && typeof render === 'function') (function () {
  const GV_MULTS = [0.5, 1, 1.5, 2, 3, 4, 5, 6];
  const TXT = {
    ru: {
      ingLabel: 'Продуктов не больше', ingAny: 'любое количество',
      ingHint: 'Двигай бегунок вправо или влево: останутся рецепты, где продуктов не больше этого числа.',
      none: 'Такого простого рецепта пока нет. Подвинь бегунок вправо.',
      amountLabel: 'Сколько приготовить',
      amountHint: 'Двигай бегунок: количество продуктов пересчитается. Время и шаги остаются как в рецепте.',
      mult: ['Половина', 'Как в рецепте', 'В полтора раза больше', 'В 2 раза больше', 'В 3 раза больше', 'В 4 раза больше', 'В 5 раз больше', 'В 6 раз больше'],
      install: 'Поставить на телефон',
      help: {
        ios: 'Нажми кнопку «Поделиться» (квадратик со стрелкой) внизу экрана, потом «На экран Домой».',
        android: 'Нажми три точки справа вверху, потом «Установить приложение» или «Добавить на главный экран».',
        desktop: 'В адресной строке браузера справа есть значок установки. Нажми на него и выбери «Установить».'
      }
    },
    en: {
      ingLabel: 'Ingredients, at most', ingAny: 'any number',
      ingHint: 'Move the slider: only recipes with this many ingredients or fewer stay.',
      none: 'No recipe that simple yet. Move the slider to the right.',
      amountLabel: 'How much to cook',
      amountHint: 'Move the slider: the ingredient amounts are recalculated. Time and steps stay as in the recipe.',
      mult: ['Half', 'As in the recipe', '1.5 times as much', '2 times as much', '3 times as much', '4 times as much', '5 times as much', '6 times as much'],
      install: 'Install on your phone',
      help: {
        ios: 'Tap the Share button (a square with an arrow) at the bottom of the screen, then "Add to Home Screen".',
        android: 'Tap the three dots at the top right, then "Install app" or "Add to Home screen".',
        desktop: 'There is an install icon at the right of the browser address bar. Click it and choose "Install".'
      }
    },
    fr: {
      ingLabel: "Pas plus d'ingrédients que", ingAny: "peu importe",
      ingHint: "Déplace le curseur : il ne reste que les recettes avec ce nombre d'ingrédients ou moins.",
      none: "Pas encore de recette aussi simple. Déplace le curseur vers la droite.",
      amountLabel: 'Quelle quantité préparer',
      amountHint: "Déplace le curseur : les quantités sont recalculées. Le temps et les étapes restent ceux de la recette.",
      mult: ['La moitié', 'Comme dans la recette', '1,5 fois plus', '2 fois plus', '3 fois plus', '4 fois plus', '5 fois plus', '6 fois plus'],
      install: 'Installer sur le téléphone',
      help: {
        ios: "Appuie sur le bouton Partager (un carré avec une flèche) en bas de l'écran, puis sur « Sur l'écran d'accueil ».",
        android: "Appuie sur les trois points en haut à droite, puis sur « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
        desktop: "À droite de la barre d'adresse, il y a une icône d'installation. Clique dessus et choisis « Installer »."
      }
    }
  };
  const T = () => TXT[lang] || TXT.ru;

  let mult = 1;

  /* --- пересчёт: подменяем translated(), чтобы карточка, копирование и скачивание брали готовые цифры --- */
  const baseTranslated = translated;
  translated = function (r) {
    const v = baseTranslated(r);
    if (mult !== 1 && currentRecipe && r && r.id === currentRecipe.id && Array.isArray(v.ingredients)) {
      return { ...v, ingredients: v.ingredients.map(s => gvScaleLine(s, mult, lang)) };
    }
    return v;
  };

  /* --- бегунок "не больше N продуктов" --- */
  let ingMax = null;
  function ingBounds() {
    const c = RECIPES.map(r => (r.ingredients || []).length);
    return { min: Math.min(...c), max: Math.max(...c) };
  }
  function initIngFilter() {
    if (!RECIPES.length) return;
    const { min, max } = ingBounds();
    let box = document.getElementById('ingFilter');
    if (!box) {
      box = document.createElement('div');
      box.id = 'ingFilter';
      box.className = 'sliderBox';
      box.innerHTML = '<label><span id="ingLabel"></span><em id="ingValue"></em></label>' +
        '<input type="range" id="ingRange" aria-labelledby="ingLabel"><p class="sliderHint" id="ingHint"></p>';
      const controls = document.querySelector('.controls');
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.id = 'filterToggle'; toggle.className = 'filterToggle';
      toggle.addEventListener('click', () => { controls.classList.toggle('openFilter'); paintIng(); });
      controls.append(toggle, box);
      document.getElementById('ingRange').addEventListener('input', e => { ingMax = +e.target.value; paintIng(); render(); });
    }
    const r = document.getElementById('ingRange');
    r.min = min; r.max = max;
    if (ingMax === null || ingMax > max) ingMax = max;
    r.value = ingMax;
    paintIng();
  }
  function paintIng() {
    const { max } = ingBounds();
    document.getElementById('ingLabel').textContent = T().ingLabel;
    document.getElementById('ingValue').textContent = ingMax >= max ? T().ingAny : ingMax;
    document.getElementById('ingHint').textContent = T().ingHint;
    const open = document.querySelector('.controls').classList.contains('openFilter');
    const name = { ru: 'Фильтр по числу продуктов', en: 'Filter by number of ingredients', fr: "Filtre par nombre d'ingrédients" }[lang] || 'Фильтр';
    const t = document.getElementById('filterToggle');
    if (t) t.textContent = (open ? '▴ ' : '▾ ') + name + (ingMax < max ? ': ' + ingMax : '');
  }
  function applyIngFilter() {
    if (ingMax === null) return;
    const { max } = ingBounds();
    if (ingMax >= max) return;
    const byId = new Map(RECIPES.map(r => [r.id, r]));
    let shown = 0;
    grid.querySelectorAll('.card').forEach(el => {
      const r = byId.get(el.dataset.recipeId);
      const ok = r && (r.ingredients || []).length <= ingMax;
      el.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    if (!shown && !grid.querySelector('.empty')) grid.insertAdjacentHTML('afterbegin', `<div class="empty">${esc(T().none)}</div>`);
  }

  const baseRender = render;
  render = function () { baseRender(); applyIngFilter(); };

  const baseRenderChips = renderChips;
  renderChips = function () { baseRenderChips(); initIngFilter(); };

  /* --- бегунок количества внутри рецепта --- */
  function ensureScaleBox() {
    let box = document.getElementById('scaleBox');
    if (box) return box;
    box = document.createElement('div');
    box.id = 'scaleBox';
    box.className = 'sliderBox scaleBox';
    box.innerHTML = '<label><span id="scaleLabel"></span><em id="scaleValue"></em></label>' +
      `<input type="range" id="scaleRange" min="0" max="${GV_MULTS.length - 1}" step="1" value="1" aria-labelledby="scaleLabel"><p class="sliderHint" id="scaleHint"></p>`;
    document.querySelector('#modal .cols').before(box);
    document.getElementById('scaleRange').addEventListener('input', e => {
      mult = GV_MULTS[+e.target.value];
      paintScale();
      repaintIngredients();
    });
    return box;
  }
  function paintScale() {
    const i = GV_MULTS.indexOf(mult);
    document.getElementById('scaleLabel').textContent = T().amountLabel;
    document.getElementById('scaleValue').textContent = T().mult[i];
    document.getElementById('scaleHint').textContent = T().amountHint;
    document.getElementById('scaleRange').value = i;
  }
  function repaintIngredients() {
    if (!currentRecipe) return;
    document.getElementById('mIng').innerHTML = translated(currentRecipe).ingredients.map(s => `<li>${esc(s)}</li>`).join('');
  }

  const baseOpenModal = openModal;
  openModal = function (raw) {
    mult = 1;
    baseOpenModal(raw);
    ensureScaleBox();
    paintScale();
  };
  const baseCloseModal = closeModal;
  closeModal = function () { mult = 1; baseCloseModal(); };

  const baseSetLanguage = setLanguage;
  setLanguage = function (next) {
    baseSetLanguage(next);
    if (document.getElementById('ingLabel')) paintIng();
    if (document.getElementById('scaleLabel')) { paintScale(); repaintIngredients(); }
    paintInstall();
  };

  /* --- кнопка "Поставить на телефон" --- */
  let deferredPrompt = null;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function platform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
  }
  function paintInstall() {
    const b = document.getElementById('installBtn');
    if (!b) return;
    b.textContent = '📲 ' + T().install;
    const h = document.getElementById('installHelp');
    h.textContent = T().help[platform()];
  }
  function initInstall() {
    if (standalone) return;
    const host = document.querySelector('.heroText');
    const b = document.createElement('button');
    b.id = 'installBtn'; b.className = 'installBtn'; b.type = 'button';
    const h = document.createElement('div');
    h.id = 'installHelp'; h.className = 'installHelp';
    host.append(b, h);
    b.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => {});
        deferredPrompt = null;
      } else {
        h.classList.toggle('open');
      }
    });
    paintInstall();
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
  initInstall();

  /* --- офлайн-кэш (только на https и на localhost) --- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // на случай, если рецепты уже успели загрузиться до подключения этого файла
  if (RECIPES.length) { renderChips(); render(); }
})();
