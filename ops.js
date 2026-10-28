// ===== 運用ページ（暗号化された本文を開く） =====
// 本文は ops-vault.js に暗号化して入っています（AES-GCM／鍵はPBKDF2-SHA256）。
// ポータルで開いたタブなら、ポータルが持っている運用ページのパスワードで自動的に開きます。
// URLを直接開いた場合は、パスワードの入力が必要です。
(function () {
  const PORTAL_KEY = 'selector-portal-tools'; // ポータルが同じタブに保存している一覧（運用ページのパスワードを含む）
  const OPS_KEY = 'selector-ops-pw';           // このタブで一度入力したパスワード
  const $ = (s) => document.querySelector(s);

  function storageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* 無視 */ } }

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function decrypt(password) {
    const v = window.OPS_VAULT;
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64ToBytes(v.salt), iterations: v.iterations, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
    );
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(v.iv) }, key, b64ToBytes(v.data));
    return new TextDecoder().decode(plain);
  }

  function show(html) {
    const main = $('#ops-main');
    main.innerHTML = html;
    main.hidden = false;
    main.classList.add('show');
    $('#lock').hidden = true;
    $('#ops-footer').hidden = false;
    // URLに #test などが付いていたら、その場所へ
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  // ポータルが保存しているパスワード → このタブで入力済みのパスワード の順に試す
  function savedPasswords() {
    const list = [];
    try {
      const tools = JSON.parse(storageGet(PORTAL_KEY) || '[]');
      const ops = Array.isArray(tools) ? tools.find((t) => t.id === 'ops') : null;
      if (ops && ops.pw) list.push(ops.pw);
    } catch (e) { /* 無視 */ }
    const own = storageGet(OPS_KEY);
    if (own) list.push(own);
    return list;
  }

  (async function tryAuto() {
    for (const pw of savedPasswords()) {
      try { show(await decrypt(pw)); return; } catch (e) { /* 次を試す */ }
    }
    setTimeout(() => $('#lockInput').focus(), 50);
  })();

  $('#lockForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = $('#lockInput').value.trim();
    if (!v) return;
    const btn = $('#lockForm button');
    btn.disabled = true; btn.textContent = '確認中…';
    $('#lockError').hidden = true;
    try {
      const html = await decrypt(v);
      storageSet(OPS_KEY, v);
      show(html);
    } catch (err) {
      $('#lockError').hidden = false;
      const card = $('#lockForm');
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      $('#lockInput').select();
    } finally {
      btn.disabled = false; btn.textContent = 'ひらく';
    }
  });
})();
