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
    { id: 'sergey', ru: 'От Сергея', en: 'From Sergey', fr: 'De Sergueï', letter: 'С' },
    { id: 'emil', ru: 'От Эмиля', en: 'From Emil', fr: 'D’Émile', letter: 'Э' }
  ];
  const SR_LANG = { ru: 'ru-RU', en: 'en-US', fr: 'fr-FR' };

  const TX = {
    ru: {
      title: 'Наша семья готовит',
      intro: 'Здесь свои рецепты добавляют Ян, Мами, Сергей и Эмиль. Открой рубрику и посмотри.',
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
      deleted: 'Рецепт убран.',
      imgLabel: 'Картинка к рецепту',
      imgAi: 'Нарисовать нейросетью',
      imgPhoto: 'Своё фото',
      imgNone: 'Без картинки (будет общая)',
      imgHint: 'Нейросеть рисует картинку за минуту, в день можно две.',
      photoPick: 'Выбрать фото',
      photoChosen: 'Фото выбрано',
      errPhoto: 'Выбери фото или другой вариант картинки.',
      okPhoto: 'Готово! Рецепт добавлен с твоим фото.',
      okImg: 'Готово! Рецепт добавлен. Картинка рисуется, появится через минуту.',
      okNoImg: 'Рецепт добавлен. Картинку сегодня рисовать не получится, стоит общая.',
      drawing: 'Картинка рисуется…',
      lookLabel: 'Как выглядит готовое блюдо (необязательно)',
      lookHint: 'Цвет и форма в двух словах. Так нейросеть нарисует картинку похожей.',
      lookPh: 'Например: тёмный шоколадный рулет, нарезан кружочками',
      imgLimit: 'Сегодня картинку рисовать уже не получится, лимит. Можно загрузить своё фото.',
      imgFail: 'Не получилось нарисовать. Попробуй позже или загрузи своё фото.',
      ingPh: 'Орео - 16 шт.\nМолоко - 30 мл'
    },
    en: {
      title: 'Our family cooks',
      intro: 'Yan, Mami, Sergey and Emil add their own recipes here. Open a section and take a look.',
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
      deleted: 'Recipe removed.',
      imgLabel: 'Picture for the recipe',
      imgAi: 'Draw with AI',
      imgPhoto: 'My own photo',
      imgNone: 'No picture (the common one)',
      imgHint: 'An AI draws the picture in about a minute, two per day.',
      photoPick: 'Choose a photo',
      photoChosen: 'Photo chosen',
      errPhoto: 'Choose a photo or another picture option.',
      okPhoto: 'Done! The recipe is added with your photo.',
      okImg: 'Done! The recipe is added. The picture is being drawn and will appear in a minute.',
      okNoImg: 'The recipe is added. No picture can be drawn today, the common one is used.',
      drawing: 'Drawing the picture…',
      lookLabel: 'How the finished dish looks (optional)',
      lookHint: 'Colour and shape in a few words, so the AI draws it right.',
      lookPh: 'For example: dark chocolate roll cut in slices',
      imgLimit: 'No more pictures can be drawn today. You can upload your own photo.',
      imgFail: 'Could not draw it. Try later or upload your own photo.',
      ingPh: 'Oreo - 16\nMilk - 30 ml'
    },
    fr: {
      title: 'Notre famille cuisine',
      intro: 'Yan, Mami, Sergueï et Émile ajoutent ici leurs propres recettes. Ouvre une rubrique et regarde.',
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
      deleted: 'Recette retirée.',
      imgLabel: 'Image de la recette',
      imgAi: 'Dessiner avec une IA',
      imgPhoto: 'Ma propre photo',
      imgNone: 'Sans image (l’image commune)',
      imgHint: 'Une IA dessine l’image en environ une minute, deux par jour.',
      photoPick: 'Choisir une photo',
      photoChosen: 'Photo choisie',
      errPhoto: 'Choisis une photo ou une autre option.',
      okPhoto: 'C’est fait ! La recette est ajoutée avec ta photo.',
      okImg: 'C’est fait ! La recette est ajoutée. L’image est en cours de dessin, elle apparaîtra dans une minute.',
      okNoImg: 'La recette est ajoutée. Pas d’image aujourd’hui, l’image commune est utilisée.',
      drawing: 'L’image est en cours de dessin…',
      lookLabel: 'À quoi ressemble le plat fini (facultatif)',
      lookHint: 'Couleur et forme en quelques mots, pour que l’IA dessine juste.',
      lookPh: 'Par exemple : rouleau au chocolat noir coupé en rondelles',
      imgLimit: 'Plus d’image à dessiner aujourd’hui. Tu peux ajouter ta propre photo.',
      imgFail: 'Impossible de dessiner. Réessaie plus tard ou ajoute ta photo.',
      ingPh: 'Oreo - 16\nLait - 30 ml'
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

  let pollTimer = null, pollCount = 0;
  async function load(id, quiet) {
    if (!GV_RUBRICS_URL && !DEMO) { loadState[id] = 'off'; paintBody(); return; }
    if (!quiet) { loadState[id] = 'loading'; paintBody(); }
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
    // пока картинка рисуется, тихо обновляем список раз в 15 секунд (не дольше 5 минут)
    clearTimeout(pollTimer);
    if (!quiet) pollCount = 0;
    if (openId === id && (lists[id] || []).some(r => r.pending) && pollCount++ < 20) pollTimer = setTimeout(() => load(id, true), 15000);
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
    else inner = `<div class="grid">${list.map(r0 => { const r = { ...r0, ...(TRANSLATIONS[lang] && TRANSLATIONS[lang][r0.id] ? { title: TRANSLATIONS[lang][r0.id].title || r0.title, time: TRANSLATIONS[lang][r0.id].time !== undefined ? TRANSLATIONS[lang][r0.id].time : r0.time } : {}) }; return `<article class="card"><img src="${esc(pic(r.image, 700) || 'assets/quick-recipes.png')}" alt="${esc(r.title)}" onerror="this.onerror=null;this.src='assets/quick-recipes.png'"><div class="cardBody"><div class="badge">${esc(aName(r.author))}</div>${r.pending ? `<div class="rubDrawing">${esc(x.drawing)}</div>` : ''}<h2>${esc(r.title)}</h2><div class="meta">${esc(r.time || '')}</div><div class="actions"><button class="primary" data-r="${esc(r.id)}">${esc(x.open)}</button></div></div></article>`; }).join('')}</div>`;
    box.innerHTML = `<div class="rubHead"><h3>${esc(aName(openId))}</h3><button type="button" class="primary rubAdd" id="rubAddBtn">${esc(x.add)}</button></div>${inner}`;
    document.getElementById('rubAddBtn').onclick = () => openForm(openId);
    box.querySelectorAll('button[data-r]').forEach(b => b.onclick = () => {
      const r = list.find(q => q.id === b.dataset.r); if (r) openModal(asRecipe(r));
    });
  }

  // картинки с Диска просим уменьшенными: так быстрее и Google не ограничивает открытие
  const pic = (u, w) => (u && u.indexOf('lh3.googleusercontent.com/d/') > -1 && u.indexOf('=') < 0) ? u + '=w' + w + '-rj' : u;

  function asRecipe(r) {
    return { id: r.id, user: true, author: r.author, category: aName(r.author), title: r.title, time: r.time || '',
      description: r.description || '', ingredients: r.ingredients || [], steps: r.steps || [], tip: r.tip || '',
      image: pic(r.image, 1100) || 'assets/quick-recipes.png' };
  }

  /* ---------- открытие рецепта автора в обычном окне ---------- */
  const baseOpen = openModal;
  openModal = function (raw) {
    baseOpen(raw);
    viewing = raw && raw.user ? raw : null;
    if (viewing) {
      document.getElementById('mCat').textContent = aName(viewing.author);
      document.getElementById('translationNotice').textContent = lang !== 'ru' && !(TRANSLATIONS[lang] && TRANSLATIONS[lang][viewing.id]) ? t('pending') : '';
    }
    paintDel();
  };
  function paintDel() {
    let b = document.getElementById('rubDelBtn');
    const show = viewing && store.get('gv-code-' + viewing.author);
    paintImgRow(!!show);
    if (!show) { if (b) b.hidden = true; return; }
    if (!b) {
      b = document.createElement('button');
      b.type = 'button'; b.id = 'rubDelBtn'; b.className = 'rubDel';
      b.onclick = removeViewing;
      document.querySelector('#modal .modalBody').append(b);
    }
    b.hidden = false; b.textContent = X().del;
  }
  function paintImgRow(show) {
    let row = document.getElementById('rubImgRow');
    if (!row) {
      row = document.createElement('div');
      row.id = 'rubImgRow'; row.className = 'rubImgRow';
      row.innerHTML = '<div class="fLabel" id="rubImgTitle"></div><div class="row"><button type="button" id="rubImgAi"></button><button type="button" id="rubImgPhoto"></button></div><input type="file" id="rubImgFile" accept="image/*" hidden>';
      document.querySelector('#modal .modalBody').append(row);
      document.getElementById('rubImgAi').onclick = () => changeImage('ai');
      document.getElementById('rubImgPhoto').onclick = () => document.getElementById('rubImgFile').click();
      document.getElementById('rubImgFile').onchange = async e => {
        const f = e.target.files && e.target.files[0]; e.target.value = '';
        if (!f) return;
        try { changeImage('photo', await shrink(f)); } catch { alert(X().errNet); }
      };
    }
    row.hidden = !show;
    document.getElementById('rubImgTitle').textContent = X().imgLabel;
    document.getElementById('rubImgAi').textContent = X().imgAi;
    document.getElementById('rubImgPhoto').textContent = X().imgPhoto;
  }
  async function changeImage(mode, photo) {
    if (!viewing) return;
    const v = viewing, x = X();
    try {
      const r = await api({ action: 'image', author: v.author, code: store.get('gv-code-' + v.author), id: v.id, photo: photo || '' });
      if (!r.ok) { alert(r.error === 'code' ? x.errCode : x.errNet); return; }
      closeModal();
      alert(r.image === 'pending' ? x.okImg : r.image === 'photo' ? x.okPhoto : r.image === 'limit' ? x.imgLimit : x.imgFail);
    } catch { alert(x.errNet); return; }
    await load(v.author);
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
      ${field('fLook', x.lookLabel, x.lookHint, 'textarea', 2)}
      ${field('fIng', x.ing, x.ingHint, 'textarea', 5)}
      ${field('fSteps', x.steps, x.stepsHint, 'textarea', 6)}
      ${field('fTip', x.tip, '', 'textarea', 2)}
      <div class="fLabel">${esc(x.imgLabel)}</div>
      <label class="fCheck"><input type="radio" name="fImgMode" value="ai" checked> <span>${esc(x.imgAi)}</span></label>
      <div class="fHint">${esc(x.imgHint)}</div>
      <label class="fCheck"><input type="radio" name="fImgMode" value="photo"> <span>${esc(x.imgPhoto)}</span></label>
      <div id="fPhotoBox" class="fPhotoBox" hidden><button type="button" id="fPhotoBtn">${esc(x.photoPick)}</button> <span id="fPhotoName" class="fHint"></span><input type="file" id="fPhoto" accept="image/*" hidden><img id="fPhotoPrev" class="fPhotoPrev" alt="" hidden></div>
      <label class="fCheck"><input type="radio" name="fImgMode" value="none"> <span>${esc(x.imgNone)}</span></label>
      <p class="fHint">${esc(x.micTip)}</p>
      <div id="fMsg" class="fMsg" role="status"></div>
      <div class="fButtons"><button type="button" class="primary" id="fSend">${esc(x.send)}</button><button type="button" id="fClose">${esc(x.cancel)}</button></div>`;
    const code = store.get('gv-code-' + authorId);
    document.getElementById('fCode').value = code;
    document.getElementById('fIng').placeholder = x.ingPh;
    document.getElementById('fLook').placeholder = x.lookPh;
    const modeOf = () => (m.querySelector('input[name="fImgMode"]:checked') || {}).value;
    m.querySelectorAll('input[name="fImgMode"]').forEach(r => r.onchange = () => { document.getElementById('fPhotoBox').hidden = modeOf() !== 'photo'; });
    document.getElementById('fPhotoBtn').onclick = () => document.getElementById('fPhoto').click();
    photoData = '';
    document.getElementById('fPhoto').onchange = async e => {
      const f = e.target.files && e.target.files[0];
      photoData = ''; const prev = document.getElementById('fPhotoPrev'); prev.hidden = true;
      if (!f) { document.getElementById('fPhotoName').textContent = ''; return; }
      try { photoData = await shrink(f); prev.src = photoData; prev.hidden = false; document.getElementById('fPhotoName').textContent = X().photoChosen; } catch { document.getElementById('fPhotoName').textContent = X().errNet; }
    };
    document.getElementById('fWho').onchange = e => { document.getElementById('fCode').value = store.get('gv-code-' + e.target.value); };
    m.querySelectorAll('.micRow').forEach(row => attachMic(row, document.getElementById(row.dataset.for)));
    document.getElementById('fClose').onclick = closeForm;
    document.getElementById('fSend').onclick = send;
    m.classList.add('open');
    m.querySelector('.modalBox').scrollTop = 0;
  }
  function closeForm() { stopMic(); const m = document.getElementById('addModal'); if (m) m.classList.remove('open'); }

  let photoData = '';
  // уменьшаем фото до 1000 px по длинной стороне, чтобы быстро отправлялось с телефона
  function shrink(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      img.src = url;
    });
  }

  const lines = id => document.getElementById(id).value.split('\n').map(s => s.trim()).filter(Boolean);

  async function send() {
    const x = X(), msg = document.getElementById('fMsg'), btn = document.getElementById('fSend');
    const author = document.getElementById('fWho').value, code = document.getElementById('fCode').value.trim();
    const recipe = {
      title: document.getElementById('fTitle').value.trim(), time: document.getElementById('fTime').value.trim(),
      description: document.getElementById('fLook').value.trim(),
      ingredients: lines('fIng'), steps: lines('fSteps'), tip: document.getElementById('fTip').value.trim(),
      makeImage: false
    };
    const mode = (document.querySelector('#addModal input[name="fImgMode"]:checked') || {}).value;
    if (mode === 'ai') recipe.makeImage = true;
    if (mode === 'photo') recipe.photo = photoData;
    msg.className = 'fMsg';
    if (!code) { msg.textContent = x.errCode; msg.classList.add('bad'); return; }
    if (!recipe.title || !recipe.ingredients.length || !recipe.steps.length) { msg.textContent = x.errInvalid; msg.classList.add('bad'); return; }
    if (mode === 'photo' && !photoData) { msg.textContent = x.errPhoto; msg.classList.add('bad'); return; }
    btn.disabled = true; btn.textContent = x.sending;
    try {
      const r = await api({ action: 'add', author, code, recipe });
      if (r.ok) {
        store.set('gv-code-' + author, code);
        msg.textContent = r.image === 'pending' ? x.okImg : (r.image === 'limit' ? x.okNoImg : (r.image === 'photo' ? x.okPhoto : x.okMsg)); msg.classList.add('good');
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
    if (lang && viewing && UI[next]) { const keep = lang; lang = next; viewing.category = aName(viewing.author); lang = keep; }
    baseSetLanguage(next);
    paint();
    if (viewing) paintDel();
  };
  paint();
})();
