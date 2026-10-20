// ===== セレクター ポータル（社内用） =====
// セレクター一覧（URL・パスワード）は vault.js に暗号化して入っています。
// 入力されたパスワードを鍵にして復号するので、パスワードを知らない人はソースを見ても中身を読めません。
// 一覧を変更するときは encrypt.html（手元用ツール）で vault.js を作り直してください。
const UNLOCK_KEY = 'selector-portal-tools';

// ---- アイコン（線画SVG） ----
const ICONS = {
  nas: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h3"/><circle cx="15.5" cy="17" r=".8"/>',
  iss: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  das: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14h4"/><circle cx="17" cy="12" r="1.2"/>',
  ups: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M13 7l-3 5h4l-3 5"/>',
  compare: '<path d="M4 7h11M4 7l3-3M4 7l3 3"/><path d="M20 17H9M20 17l-3-3M20 17l-3 3"/>',
  hddssd: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="11" r="4"/><circle cx="12" cy="11" r=".8"/><path d="M8 18h3"/>',
  usb: '<rect x="8" y="9" width="8" height="12" rx="1.5"/><path d="M9.5 9V4h5v5"/><path d="M11 6h.01M13 6h.01"/>',
  memory: '<rect x="3" y="7" width="18" height="9" rx="1"/><path d="M6 10v3M9 10v3M12 10v3M15 10v3M18 10v3"/><path d="M5 16v2M9 16v2M15 16v2M19 16v2"/>',
  switch: '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M6 11v2M9 11v2M12 11v2M15 11v2"/><circle cx="18.5" cy="12" r=".8"/>',
  signage: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/><path d="M10 8l4 2-4 2z"/>',
  security: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2"/>'
};

// ---- カテゴリ ----
const GROUPS = [
  { id: 'nas',     name: 'NAS（LAN DISK）関連',   sub: 'LAN DISK本体と、組み合わせる保守・バックアップ・UPS' },
  { id: 'storage', name: '外付けストレージ',       sub: 'パソコン・スマホ・テレビにつなぐもの' },
  { id: 'pc',      name: 'パソコン・ネットワーク', sub: '' },
  { id: 'signage', name: 'サイネージ',             sub: '' },
  { id: 'security',name: 'セキュリティ',           sub: '' }
];

// ---- セレクター一覧 ----
// status: 'live'（公開中） / 'soon'（準備中）　internal: true で「社内用」表示
// 中身は vault.js に暗号化して保存（パスワードで復号して読み込む）
let TOOLS = [];

// ===== パスワード画面 =====
const $ = (s) => document.querySelector(s);

function storageGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
function storageSet(key, v) { try { sessionStorage.setItem(key, v); } catch (e) { /* 無視 */ } }

// ---- 復号（AES-GCM／鍵はPBKDF2-SHA256で生成） ----
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function decryptVault(password) {
  const v = window.VAULT;
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(v.salt), iterations: v.iterations, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(v.iv) }, key, b64ToBytes(v.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

function unlock(tools) {
  TOOLS = tools;
  $('#lock').hidden = true;
  $('#app').hidden = false;
  render();
}

$('#lockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = $('#lockInput').value.trim();
  const btn = $('#lockForm button');
  if (!v) return;
  btn.disabled = true;
  btn.textContent = '確認中…';
  $('#lockError').hidden = true;
  try {
    const tools = await decryptVault(v);
    storageSet(UNLOCK_KEY, JSON.stringify(tools));
    unlock(tools);
  } catch (err) {
    // パスワード違いのときは復号に失敗する
    $('#lockError').hidden = false;
    const card = $('#lockForm');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    $('#lockInput').select();
  } finally {
    btn.disabled = false;
    btn.textContent = 'ひらく';
  }
});

// ===== 一覧表示 =====
let currentGroup = 'all';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderChips() {
  const items = [{ id: 'all', name: 'すべて' }, ...GROUPS];
  $('#chips').innerHTML = items.map((g) => {
    const n = g.id === 'all' ? TOOLS.length : TOOLS.filter((t) => t.group === g.id).length;
    return `<button class="chip" role="tab" data-group="${g.id}" aria-selected="${g.id === currentGroup}">${escapeHtml(g.name)}（${n}）</button>`;
  }).join('');
}

function matches(t) {
  return currentGroup === 'all' || t.group === currentGroup;
}

function cardHtml(t) {
  const soon = t.status === 'soon';
  const style = `--c:${t.color};${t.band ? `--band:${t.band};` : ''}`;
  const flag = t.internal ? '<span class="flag flag-internal">社内用</span>'
             : soon ? '<span class="flag flag-soon">準備中</span>' : '';
  const pw = soon ? '' : `
      <div class="pw">
        <span class="pw-label">パスワード</span>
        <span class="pw-value">${escapeHtml(t.pw)}</span>
        <button class="btn-mini" data-copy-pw="${t.id}" type="button">コピー</button>
      </div>`;
  const actions = soon
    ? `<div class="actions"><button class="btn btn-primary" type="button" disabled>準備中です</button></div>`
    : `<div class="actions">
        <button class="btn btn-primary" data-open="${t.id}" type="button">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></svg>
          パスワードをコピーして開く
        </button>
        <button class="btn btn-ghost" data-copy-url="${t.id}" type="button" title="URLをコピー" aria-label="URLをコピー">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>URL
        </button>
      </div>`;
  return `
    <article class="card${soon ? ' is-soon' : ''}" style="${style}">
      <div class="card-band"></div>
      ${flag}
      <div class="card-body">
        <div class="card-top">
          <div class="card-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[t.icon]}</svg></div>
          <div>
            <h3 class="card-title">${escapeHtml(t.name)}</h3>
            ${soon ? '' : `<div class="card-url">${escapeHtml(t.url.replace('https://', ''))}</div>`}
          </div>
        </div>
        <p class="card-desc">${escapeHtml(t.desc)}</p>
        <div class="tags">${t.tags.map((x) => `<span class="tag">${escapeHtml(x)}</span>`).join('')}</div>
        ${pw}
        ${actions}
      </div>
    </article>`;
}

function render() {
  renderChips();
  let html = '';
  let total = 0;
  GROUPS.forEach((g) => {
    const list = TOOLS.filter((t) => t.group === g.id && matches(t));
    if (!list.length) return;
    total += list.length;
    html += `
      <section class="group">
        <div class="group-head"><h2>${escapeHtml(g.name)}</h2>${g.sub ? `<span>${escapeHtml(g.sub)}</span>` : ''}</div>
        <div class="grid">${list.map(cardHtml).join('')}</div>
      </section>`;
  });
  $('#groups').innerHTML = html;
  $('#empty').hidden = total > 0;
}

// ===== コピー =====
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // クリップボードAPIが使えない環境向けの予備
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

const byId = (id) => TOOLS.find((t) => t.id === id);

document.addEventListener('click', async (e) => {
  const chip = e.target.closest('[data-group]');
  if (chip) { currentGroup = chip.dataset.group; render(); return; }

  const openBtn = e.target.closest('[data-open]');
  if (openBtn) {
    const t = byId(openBtn.dataset.open);
    // ポップアップブロック対策：先にタブを開いてからコピー
    window.open(t.url, '_blank', 'noopener');
    const ok = await copyText(t.pw);
    toast(ok ? `パスワード「${t.pw}」をコピーしました。開いた画面で貼り付けてください`
             : `パスワードは「${t.pw}」です`);
    return;
  }

  const pwBtn = e.target.closest('[data-copy-pw]');
  if (pwBtn) {
    const t = byId(pwBtn.dataset.copyPw);
    const ok = await copyText(t.pw);
    toast(ok ? `パスワード「${t.pw}」をコピーしました` : `パスワードは「${t.pw}」です`);
    return;
  }

  const urlBtn = e.target.closest('[data-copy-url]');
  if (urlBtn) {
    const t = byId(urlBtn.dataset.copyUrl);
    const ok = await copyText(t.url);
    toast(ok ? 'URLをコピーしました' : t.url);
  }
});


// 同じタブで一度開けたら、タブを閉じるまでは再入力不要
(function restore() {
  const saved = storageGet(UNLOCK_KEY);
  if (saved) {
    try { unlock(JSON.parse(saved)); return; } catch (e) { /* 壊れていたら入力し直し */ }
  }
  setTimeout(() => $('#lockInput').focus(), 50);
})();
