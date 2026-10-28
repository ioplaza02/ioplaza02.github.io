// ===== カード右下の透かしイラスト（商品カテゴリーのイメージ） =====
// currentColor（各セレクターのイメージカラー）で描画。濃さは CSS の .card-wm で調整
const WATERMARKS = {
  // NAS：HDL4-LX風（縦置きドライブが横に4列並ぶデスクトップ型）
  nas: `<svg viewBox="0 0 120 120"><rect x="8" y="14" width="104" height="96" rx="9" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <rect x="16" y="22" width="88" height="10" rx="3" fill="currentColor"/>
    <circle cx="24" cy="27" r="2.2" fill="#fff"/><circle cx="32" cy="27" r="2.2" fill="#fff"/><circle cx="40" cy="27" r="2.2" fill="#fff"/><circle cx="48" cy="27" r="2.2" fill="#fff"/>
    <circle cx="96" cy="27" r="3" fill="none" stroke="#fff" stroke-width="1.6"/>
    <g fill="currentColor"><rect x="16" y="38" width="19" height="64" rx="3"/><rect x="39" y="38" width="19" height="64" rx="3"/><rect x="62" y="38" width="19" height="64" rx="3"/><rect x="85" y="38" width="19" height="64" rx="3"/></g>
    <g stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M21 46h9M44 46h9M67 46h9M90 46h9"/><path d="M25.5 90v6M48.5 90v6M71.5 90v6M94.5 90v6"/></g>
    <path d="M18 110v4M102 110v4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
  // ISS：保証（盾＋チェック＋リボン）
  iss: `<svg viewBox="0 0 120 120"><path d="M60 6l40 15v28c0 27-17 50-40 59-23-9-40-32-40-59V21z" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>
    <path d="M40 56l14 14 28-30" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 92h92l-8 10 8 10H14l8-10z" fill="currentColor"/>
    <text x="60" y="107" text-anchor="middle" font-size="13" font-weight="900" fill="#fff" font-family="sans-serif">保 証</text></svg>`,
  // DAS：HDJA風（縦置きの外付けHDD）＋USBケーブル
  das: `<svg viewBox="0 0 120 120"><rect x="30" y="16" width="44" height="88" rx="10" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <rect x="38" y="26" width="28" height="64" rx="5" fill="currentColor"/>
    <circle cx="52" cy="82" r="3" fill="#fff"/>
    <path d="M42 36h20" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    <path d="M24 106h56" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    <path d="M74 74c12 0 12 22 24 22" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <rect x="94" y="90" width="12" height="10" rx="2" fill="currentColor"/></svg>`,
  // UPS：縦型UPS＋稲妻＋コンセント
  ups: `<svg viewBox="0 0 120 120"><rect x="28" y="6" width="64" height="108" rx="8" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <path d="M66 18L46 54h16l-8 30 22-38H60z" fill="currentColor"/>
    <rect x="38" y="92" width="18" height="14" rx="3" fill="currentColor"/><rect x="64" y="92" width="18" height="14" rx="3" fill="currentColor"/>
    <path d="M44 97v4M50 97v4M70 97v4M76 97v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`,
  // B社比較：vs B（丸なし）
  compare: `<svg viewBox="0 0 120 120"><text x="2" y="96" font-size="32" font-weight="900" font-style="italic" fill="currentColor" font-family="sans-serif">vs</text>
    <text x="42" y="102" font-size="76" font-weight="900" fill="currentColor" font-family="sans-serif">B</text></svg>`,
  // HDD／SSD：ポータブルHDD＋ポータブルSSD
  hddssd: `<svg viewBox="0 0 120 120"><rect x="8" y="14" width="64" height="92" rx="10" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <circle cx="40" cy="52" r="20" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="40" cy="52" r="5" fill="currentColor"/>
    <path d="M24 92h20" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <rect x="66" y="50" width="46" height="62" rx="8" fill="currentColor" stroke="currentColor" stroke-width="4"/>
    <text x="89" y="86" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" font-family="sans-serif">SSD</text></svg>`,
  // USBメモリー
  usb: `<svg viewBox="0 0 120 120"><g transform="rotate(-35 60 60)"><rect x="40" y="34" width="40" height="80" rx="8" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <rect x="46" y="6" width="28" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="5"/>
    <rect x="52" y="14" width="6" height="6" fill="currentColor"/><rect x="62" y="14" width="6" height="6" fill="currentColor"/>
    <circle cx="60" cy="100" r="5" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="50" width="20" height="30" rx="3" fill="currentColor"/></g></svg>`,
  // 増設メモリー（DIMM）
  memory: `<svg viewBox="0 0 120 120"><g transform="rotate(-12 60 60)"><rect x="4" y="34" width="112" height="44" rx="4" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <rect x="12" y="42" width="16" height="22" rx="2" fill="currentColor"/><rect x="34" y="42" width="16" height="22" rx="2" fill="currentColor"/>
    <rect x="70" y="42" width="16" height="22" rx="2" fill="currentColor"/><rect x="92" y="42" width="16" height="22" rx="2" fill="currentColor"/>
    <path d="M10 78v8M18 78v8M26 78v8M34 78v8M42 78v8M50 78v8M70 78v8M78 78v8M86 78v8M94 78v8M102 78v8M110 78v8" stroke="currentColor" stroke-width="4"/></g></svg>`,
  // スイッチングハブ
  switch: `<svg viewBox="0 0 120 120"><rect x="4" y="40" width="112" height="44" rx="6" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="4"/>
    <g fill="currentColor"><rect x="12" y="52" width="14" height="12" rx="1"/><rect x="30" y="52" width="14" height="12" rx="1"/><rect x="48" y="52" width="14" height="12" rx="1"/><rect x="66" y="52" width="14" height="12" rx="1"/><rect x="84" y="52" width="14" height="12" rx="1"/></g>
    <g fill="currentColor"><circle cx="19" cy="72" r="2.5"/><circle cx="37" cy="72" r="2.5"/><circle cx="55" cy="72" r="2.5"/><circle cx="73" cy="72" r="2.5"/><circle cx="91" cy="72" r="2.5"/></g>
    <path d="M19 40V22M55 40V14M91 40V22" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="19" cy="18" r="5" fill="currentColor"/><circle cx="55" cy="10" r="5" fill="currentColor"/><circle cx="91" cy="18" r="5" fill="currentColor"/></svg>`,
  // サイネージ：大型ディスプレイ＋スタンド
  signage: `<svg viewBox="0 0 120 120"><rect x="6" y="10" width="108" height="68" rx="5" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="5"/>
    <path d="M50 30l24 14-24 14z" fill="currentColor"/>
    <path d="M60 78v22M36 112l24-12 24 12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // セキュリティ：南京錠
  security: `<svg viewBox="0 0 120 120"><path d="M36 52V36a24 24 0 0 1 48 0v16" fill="none" stroke="currentColor" stroke-width="9"/>
    <rect x="22" y="50" width="76" height="62" rx="10" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="5"/>
    <circle cx="60" cy="76" r="8" fill="currentColor"/><path d="M60 80v16" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>`
};
