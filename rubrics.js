// Рубрики "Рецепты от них": От Яна, От Мами, От Сергея.
// Автор открывает свою рубрику, вводит свой код и добавляет рецепт сам (голосом или текстом).
// Рецепты хранятся в Google Таблице, к которой подключён скрипт apps-script/Code.gs.
// Основные app.js и extras.js не менялись: здесь только надстройка.

// Сюда вставляется адрес опубликованного скрипта (заканчивается на /exec).
// Пока адрес пустой, рубрики видны, но добавление выключено.
const GV_RUBRICS_URL = 'https://script.google.com/macros/s/AKfycbw_zQgshwX7G2_jL2AEZsXygkfPDARlYqg1EsVOgBVDZ_c0ZKhAx2QHGcasT0zLXVa-/exec';

(function () {
  if (typeof document === 'undefined' || typeof render !== 'function') return;

  const DEMO = !GV_RUBRICS_URL && /[?&]demo=1/.test(location.search); // пробный режим без сервера, только для проверки
  const AUTHORS = [
    { id: 'yan', ru: 'От Яна', en: 'From Yan', fr: 'De Yan', letter: 'Я' },
    { id: 'mami', ru: 'От Мами', en: 'From Mami', fr: 'De Mami', letter: 'М' },
    { id: 'sergey', ru: 'От Сергея', en: 'From Sergey', fr: 'De Sergueï', letter: 'С' }
  ];
  const SR_LANG = { ru: 'ru-RU', en: 'en-US', fr: 'fr-FR' };

  const TX = {
    ru: {
      title: 'Рецепты от них',
      intro: 'Здесь свои рецепты добавляют Ян, Мами и Сергей. Открой рубрику и посмотри.',
      empty: 'Пока здесь нет рецептов. Скоро появятся.',
      soon: 'Рубрика скоро откроется.',
      loading: 'Загружаю…',
      loadError: 'Не удалось загрузить рецепты. Попробуй позже.',
      add: '+ Добавить рецепт',
      open: 'Открыть рецепт',
      byLine: 'Автор:',
      formTitle: 'Новый рецепт',
      who: 'Кто добавляет',
      code: 'Твой код',
      codeHint: 'Код тебе дала Люда. Он нужен только один раз, телефон запомнит.',
      name: 'Название блюда',
      time: 'Сколько по времени (необязательно)',
      timePh: 'Например, 20 минут',
      desc: 'Коротко о блюде (необязательно)',
      ing: 'Что понадобится',
      ingHint: 'Каждый продукт с новой строки. Например: яйца - 2 шт.',
      steps: 'Как готовить',
      stepsHint: 'Каждый шаг с новой строки.',
      tip: 'Совет (необязательно)',
      mic: '🎤 Наговорить',
      micStop: '⏹ Хватит',
      micTip: 'Можно не печатать: нажми значок микрофона на клавиатуре телефона и наговори.',
      send: 'Отправить рецепт',
      sending: 'Отправляю…',
      cancel: 'Закрыть',
      okMsg: 'Готово! Рецепт уже в твоей рубрике.',
      errCode: 'Код не подошёл. Проверь код или спроси у Люды.',
      errInvalid: 'Заполни название, продукты и шаги.',
      errLimit: 'На сегодня достаточно рецептов. Продолжим завтра.',
      errNet: 'Не получилось отправить. Проверь интернет и нажми ещё раз.',
      del: 'Убрать мой рецепт',
      delAsk: 'Убрать этот рецепт из рубрики?',
      deleted: 'Рецепт убран.'
    },
    en: {
      title: 'Recipes from them',
      intro: 'Yan, Mami and Sergey add their own recipes here. Open a section and take a look.',
      empty: 'No recipes here yet. They will appear soon.',
      soon: 'This section opens soon.',
      loading: 'Loading…',
      loadError: 'Could not load the recipes. Try again later.',
      add: '+ Add a recipe',
      open: 'Open recipe',
      byLine: 'Author:',
      formTitle: 'New recipe',
      who: 'Who is adding',
      code: 'Your code',
      codeHint: 'Lyuda gave you the code. You only need it once, the phone remembers it.',
      name: 'Name of the dish',
      time: 'How long it takes (optional)',
      timePh: 'For example, 20 minutes',
      desc: 'A few words about the dish (optional)',
      ing: 'Ingredients',
      ingHint: 'One ingredient per line. For example: eggs - 2',
      steps: 'Method',
      stepsHint: 'One step per line.',
      tip: 'Tip (optional)',
      mic: '🎤 Dictate',
      micStop: '⏹ Stop',
      micTip: 'No need to type: tap the microphone on your phone keyboard and speak.',
      send: 'Send the recipe',
      sending: 'Sending…',
      cancel: 'Close',
      okMsg: 'Done! The recipe is in your section.',
      errCode: 'The code did not match. Check it or ask Lyuda.',
      errInvalid: 'Fill in the name, ingredients and steps.',
      errLimit: 'That is enough recipes for today. Let us continue tomorrow.',
      errNet: 'Could not send. Check the internet and tap again.',
      del: 'Remove my recipe',
      delAsk: 'Remove this recipe from the section?',
      deleted: 'Recipe removed.'
    },
    fr: {
      title: 'Recettes de la famille',
      intro: 'Yan, Mami et Sergueï ajoutent ici leurs propres recettes. Ouvre une rubrique et regarde.',
      empty: 'Pas encore de recettes ici. Elles arrivent bientôt.',
      soon: 'Cette rubrique ouvre bientôt.',
      loading: 'Chargement…',
      loadError: 'Impossible de charger les recettes. Réessaie plus tard.',
      add: '+ Ajouter une recette',
      open: 'Voir la recette',
      byLine: 'Auteur :',
      formTitle: 'Nouvelle recette',
      who: 'Qui ajoute',
      code: 'Ton code',
      codeHint: "Lyuda t'a donné le code. Il ne sert qu'une fois, le téléphone s'en souvient.",
      name: 'Nom du plat',
      time: 'Durée (facultatif)',
      timePh: 'Par exemple, 20 minutes',
      desc: 'Quelques mots sur le plat (facultatif)',
      ing: 'Ingrédients',
      ingHint: 'Un ingrédient par ligne. Par exemple : œufs - 2',
      steps: 'Préparation',
      stepsHint: 'Une étape par ligne.',
      tip: 'Conseil (facultatif)',
      mic: '🎤 Dicter',
      micStop: '⏹ Stop',
      micTip: 'Pas besoin de taper : appuie sur le micro du clavier du téléphone et parle.',
      send: 'Envoyer la recette',
      sending: 'Envoi…',
      cancel: 'Fermer',
      okMsg: 'C’est fait ! La recette est dans ta rubrique.',
      errCode: "Le code ne correspond pas. Vérifie-le ou demande à Lyuda.",
      errInvalid: 'Remplis le nom, les ingrédients et les étapes.',
      errLimit: "Assez de recettes pour aujourd'hui. On continue demain.",
      errNet: "Envoi impossible. Vérifie internet et appuie encore.",
      del: 'Retirer ma recette',
      delAsk: 'Retirer cette recette de la rubrique ?',
      deleted: 'Recette retirée.'
    }
  };
  const X = () => TX[lang] || TX.ru;
  const authorOf = id => AUTHORS.find(a => a.id === id);
  const aName = id => { const a = authorOf(id); return a ? (a[lang] || a.ru) : ''; };

  let openId = '';          // какая рубрика развёрнута
  let lists = {};           // author -> массив рецептов
  let loadState = {};       // author -> 'loading' | 'ok' | 'error'
  let viewing = null;       // открытый пользовательский рецепт

  const store = {
    get(k) { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  /* ---------- обмен с таблицей ---------- */
  function demoDb() { try { return JSON.parse(store.get('gv-demo-db') || '[]'); } catch { return []; } }
  async function api(payload) {
    if (DEMO) {
      const db = demoDb();
      if (payload.action === 'list') return { ok: true, recipes: db.filter(r => r.author === payload.author && r.status !== 'hidden') };
      if (payload.code !== '1234') return { ok: false, error: 'code' };
      if (payload.action === 'add') {
        const r = { ...payload.recipe, id: 'u-' + Date.now(), author: payload.author, created: new Date().toISOString() };
        db.unshift(r); store.set('gv-demo-db', JSON.stringify(db)); return { ok: true, id: r.id };
      }
      if (payload.action === 'delete') {
        store.set('gv-demo-db', JSON.stringify(db.filter(r => r.id !== payload.id))); return { ok: true };
      }
    }
    if (!GV_RUBRICS_URL) return { ok: false, error: 'off' };
    if (payload.action === 'list') {
      const res = await fetch(GV_RUBRICS_URL + '?action=list&author=' + encodeURIComponent(payload.author), { cache: 'no-store' });
      return res.json();
    }
    const res = await fetch(GV_RUBRICS_URL, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    return res.json();
  }

  /* ---------- блок на странице ---------- */
  function ensureSection() {
    let s = document.getElementById('rubrics');
    if (s) return s;
    s = document.createElement('section');
    s.id = 'rubrics'; s.className = 'rubrics';
    document.querySelector('main').before(s);
    return s;
  }

  function paint() {
    const s = ensureSection(), x = X();
    s.innerHTML = `<h2 class="rubTitle">${esc(x.title)}</h2><p class="rubIntro">${esc(x.intro)}</p>
      <div class="rubTiles" role="group" aria-label="${esc(x.title)}">${AUTHORS.map(a =>
        `<button type="button" class="rubTile${openId === a.id ? ' active' : ''}" data-a="${a.id}" aria-pressed="${openId === a.id}"><span class="rubLetter">${a.letter}</span><span>${esc(a[lang] || a.ru)}</span></button>`).join('')}</div>
      <div id="rubBody" class="rubBody"></div>`;
    s.querySelectorAll('.rubTile').forEach(b => b.onclick = () => toggle(b.dataset.a));
    paintBody();
  }

  function toggle(id) {
    openId = openId === id ? '' : id;
    paint();
    if (openId) load(openId);
  }

  async function load(id) {
    if (!GV_RUBRICS_URL && !DEMO) { loadState[id] = 'off'; paintBody(); return; }
    loadState[id] = 'loading'; paintBody();
    try {
      const r = await api({ action: 'list', author: id });
      if (!r.ok) throw Error('x');
      lists[id] = r.recipes || [];
      loadState[id] = 'ok';
      store.set('gv-rub-' + id, JSON.stringify(lists[id]));
    } catch {
      try { lists[id] = JSON.parse(store.get('gv-rub-' + id) || 'null'); } catch { lists[id] = null; }
      loadState[id] = lists[id] ? 'ok' : 'error';
    }
    if (openId === id) paintBody();
  }

  function paintBody() {
    const box = document.getElementById('rubBody'), x = X();
    if (!box) return;
    if (!openId) { box.innerHTML = ''; return; }
    const st = loadState[openId], list = lists[openId] || [];
    let inner = '';
    if (st === 'off') inner = `<div class="rubNote">${esc(x.soon)}</div>`;
    else if (st === 'loading' || !st) inner = `<div class="rubNote">${esc(x.loading)}</div>`;
    else if (st === 'error') inner = `<div class="rubNote">${esc(x.loadError)}</div>`;
    else if (!list.length) inner = `<div class="rubNote">${esc(x.empty)}</div>`;
    else inner = `<div class="grid">${list.map(r => `<article class="card"><img src="${esc(r.image || 'assets/quick-recipes.png')}" alt="${esc(r.title)}"><div class="cardBody"><div class="badge">${esc(aName(r.author))}</div><h2>${esc(r.title)}</h2><div class="meta">${esc(r.time || '')}</div><div class="actions"><button class="primary" data-r="${esc(r.id)}">${esc(x.open)}</button></div></div></article>`).join('')}</div>`;
    box.innerHTML = `<div class="rubHead"><h3>${esc(aName(openId))}</h3><button type="button" class="primary rubAdd" id="rubAddBtn">${esc(x.add)}</button></div>${inner}`;
    document.getElementById('rubAddBtn').onclick = () => openForm(openId);
    box.querySelectorAll('button[data-r]').forEach(b => b.onclick = () => {
      const r = list.find(q => q.id === b.dataset.r); if (r) openModal(asRecipe(r));
    });
  }

  function asRecipe(r) {
    return { id: r.id, user: true, author: r.author, category: aName(r.author), title: r.title, time: r.time || '',
      description: r.description || '', ingredients: r.ingredients || [], steps: r.steps || [], tip: r.tip || '',
      image: r.image || 'assets/quick-recipes.png' };
  }

  /* ---------- открытие рецепта автора в обычном окне ---------- */
  const baseOpen = openModal;
  openModal = function (raw) {
    baseOpen(raw);
    viewing = raw && raw.user ? raw : null;
    if (viewing) {
      document.getElementById('mCat').textContent = aName(viewing.author);
      document.getElementById('translationNotice').textContent = '';
    }
    paintDel();
  };
  function paintDel() {
    let b = document.getElementById('rubDelBtn');
    const show = viewing && store.get('gv-code-' + viewing.author);
    if (!show) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement('button');
      b.type = 'button'; b.id = 'rubDelBtn'; b.className = 'rubDel';
      b.onclick = removeViewing;
      document.querySelector('#modal .modalBody').append(b);
    }
    b.hidden = false; b.textContent = X().del;
  }
  async function removeViewing() {
    if (!viewing || !confirm(X().delAsk)) return;
    const v = viewing;
    try {
      const r = await api({ action: 'delete', author: v.author, code: store.get('gv-code-' + v.author), id: v.id });
      if (!r.ok) { alert(r.error === 'code' ? X().errCode : X().errNet); return; }
    } catch { alert(X().errNet); return; }
    lists[v.author] = (lists[v.author] || []).filter(q => q.id !== v.id);
    store.set('gv-rub-' + v.author, JSON.stringify(lists[v.author]));
    closeModal();
    paintBody();
    alert(X().deleted);
  }

  /* ---------- форма нового рецепта ---------- */
  function ensureForm() {
    let m = document.getElementById('addModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'addModal'; m.className = 'modal';
    m.innerHTML = '<div class="modalBox"><div class="modalBody" id="addBody"></div></div>';
    document.body.append(m);
    return m;
  }

  function field(id, label, hint, tag, extra) {
    return `<label class="fLabel" for="${id}">${esc(label)}</label>${hint ? `<div class="fHint">${esc(hint)}</div>` : ''}` +
      (tag === 'textarea'
        ? `<textarea id="${id}" rows="${extra || 4}"></textarea><div class="micRow" data-for="${id}"></div>`
        : `<input id="${id}" type="text" ${extra || ''}>`);
  }

  function openForm(authorId) {
    const m = ensureForm(), x = X();
    m.querySelector('#addBody').innerHTML =
      `<h2>${esc(x.formTitle)}</h2>
      <label class="fLabel" for="fWho">${esc(x.who)}</label>
      <select id="fWho">${AUTHORS.map(a => `<option value="${a.id}"${a.id === authorId ? ' selected' : ''}>${esc(a[lang] || a.ru)}</option>`).join('')}</select>
      ${field('fCode', x.code, x.codeHint, 'input', 'inputmode="numeric" autocomplete="off"')}
      ${field('fTitle', x.name, '', 'input', 'maxlength="120"')}
      ${field('fTime', x.time, '', 'input', `maxlength="60" placeholder="${esc(x.timePh)}"`)}
      ${field('fIng', x.ing, x.ingHint, 'textarea', 5)}
      ${field('fSteps', x.steps, x.stepsHint, 'textarea', 6)}
      ${field('fTip', x.tip, '', 'textarea', 2)}
      <p class="fHint">${esc(x.micTip)}</p>
      <div id="fMsg" class="fMsg" role="status"></div>
      <div class="fButtons"><button type="button" class="primary" id="fSend">${esc(x.send)}</button><button type="button" id="fClose">${esc(x.cancel)}</button></div>`;
    const code = store.get('gv-code-' + authorId);
    document.getElementById('fCode').value = code;
    document.getElementById('fWho').onchange = e => { document.getElementById('fCode').value = store.get('gv-code-' + e.target.value); };
    m.querySelectorAll('.micRow').forEach(row => attachMic(row, document.getElementById(row.dataset.for)));
    document.getElementById('fClose').onclick = closeForm;
    document.getElementById('fSend').onclick = send;
    m.classList.add('open');
    m.querySelector('.modalBox').scrollTop = 0;
  }
  function closeForm() { stopMic(); const m = document.getElementById('addModal'); if (m) m.classList.remove('open'); }

  const lines = id => document.getElementById(id).value.split('\n').map(s => s.trim()).filter(Boolean);

  async function send() {
    const x = X(), msg = document.getElementById('fMsg'), btn = document.getElementById('fSend');
    const author = document.getElementById('fWho').value, code = document.getElementById('fCode').value.trim();
    const recipe = {
      title: document.getElementById('fTitle').value.trim(), time: document.getElementById('fTime').value.trim(),
      ingredients: lines('fIng'), steps: lines('fSteps'), tip: document.getElementById('fTip').value.trim()
    };
    msg.className = 'fMsg';
    if (!code) { msg.textContent = x.errCode; msg.classList.add('bad'); return; }
    if (!recipe.title || !recipe.ingredients.length || !recipe.steps.length) { msg.textContent = x.errInvalid; msg.classList.add('bad'); return; }
    btn.disabled = true; btn.textContent = x.sending;
    try {
      const r = await api({ action: 'add', author, code, recipe });
      if (r.ok) {
        store.set('gv-code-' + author, code);
        msg.textContent = x.okMsg; msg.classList.add('good');
        openId = author; paint(); await load(author);
        setTimeout(closeForm, 1400);
      } else {
        msg.textContent = r.error === 'code' ? x.errCode : r.error === 'limit' ? x.errLimit : r.error === 'invalid' ? x.errInvalid : r.error === 'off' ? x.soon : x.errNet;
        msg.classList.add('bad');
      }
    } catch { msg.textContent = x.errNet; msg.classList.add('bad'); }
    btn.disabled = false; btn.textContent = x.send;
  }

  /* ---------- голосовой ввод (там, где браузер умеет) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, recBtn = null;
  function stopMic() { if (rec) { try { rec.stop(); } catch {} } rec = null; if (recBtn) { recBtn.textContent = X().mic; recBtn = null; } }
  function attachMic(row, ta) {
    if (!SR) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'micBtn'; b.textContent = X().mic;
    b.onclick = () => {
      if (recBtn === b) { stopMic(); return; }
      stopMic();
      rec = new SR(); rec.lang = SR_LANG[lang] || 'ru-RU'; rec.continuous = true; rec.interimResults = false;
      rec.onresult = e => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (!e.results[i].isFinal) continue;
          const t = e.results[i][0].transcript.trim();
          if (t) ta.value = (ta.value && !ta.value.endsWith('\n') ? ta.value + '\n' : ta.value) + t.charAt(0).toUpperCase() + t.slice(1) + '\n';
        }
      };
      rec.onend = () => { if (recBtn === b) { recBtn = null; rec = null; b.textContent = X().mic; } };
      rec.onerror = () => { stopMic(); };
      recBtn = b; b.textContent = X().micStop;
      try { rec.start(); } catch { stopMic(); }
    };
    row.append(b);
  }

  /* ---------- язык и запуск ---------- */
  const baseSetLanguage = setLanguage;
  setLanguage = function (next) {
    baseSetLanguage(next);
    paint();
    if (viewing) paintDel();
  };
  paint();
})();
