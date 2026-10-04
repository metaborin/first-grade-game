(() => {
  'use strict';
  const status = document.getElementById('pwa-status');
  const detail = document.getElementById('pwa-detail');
  const dialog = document.getElementById('pwa-dialog');
  const installButton = document.getElementById('pwa-install');
  const update = document.getElementById('pwa-update');
  let registration;
  let prompt;
  let pausedScenes = [];
  let checkId = 0;

  function show(text, explanation) { status.textContent = text; detail.textContent = explanation; }
  document.getElementById('pwa-help').addEventListener('click', () => {
    try {
      if (typeof game !== 'undefined') {
        pausedScenes = game.scene.getScenes(true).filter(scene => !scene.scene.isPaused());
        pausedScenes.forEach(scene => scene.scene.pause());
      }
    } catch { pausedScenes = []; } // Guidance still works if game startup failed.
    dialog.showModal();
    document.getElementById('pwa-dialog-title').focus({ preventScroll: true });
    dialog.scrollTop = 0;
  });
  document.getElementById('pwa-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { pausedScenes.forEach(scene => scene.scene.resume()); pausedScenes = []; });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event; installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!prompt) return;
    const choice = prompt; prompt = null; installButton.hidden = true;
    try { await choice.prompt(); await choice.userChoice; } catch { /* Menu guidance remains available. */ }
  });
  window.addEventListener('appinstalled', () => {
    prompt = null; installButton.hidden = true;
    document.getElementById('pwa-install-help').textContent = 'アプリとして追加されました。ホーム画面やアプリ一覧から開けます。';
  });

  function ask(worker) {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); reject(new Error('status timeout')); }, 5000);
      channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
      worker.postMessage({ type: 'GET_OFFLINE_STATUS' }, [channel.port2]);
    });
  }
  async function check(installedWorker) {
    if (!registration) return;
    const requestId = ++checkId;
    const pending = registration.waiting || (installedWorker?.state === 'installed' && registration.active ? installedWorker : null);
    update.hidden = !pending;
    try {
      const worker = pending || registration.active;
      if (!worker) { show('オフラインの じゅんび中', 'ゲームと書体をこの端末へ保存しています。インターネットにつないだままお待ちください。'); return; }
      const answer = await ask(worker);
      if (requestId !== checkId) return;
      if (answer.type !== 'OFFLINE_STATUS' || !answer.ready) throw new Error('cache incomplete');
      if (pending) {
        show('あたらしい版の じゅんび OK', '更新はまだ適用されていません。学習を終えて記録を保存してから、このゲームのタブとアプリをすべて閉じ、開き直してください。');
      } else {
        show(navigator.onLine ? 'オフラインの じゅんび OK' : 'オフラインで あそべます', 'ゲーム・問題・書体の保存を確認しました。通信なしでも起動できます。端末の空き容量不足やブラウザのデータ削除で、再準備が必要になる場合があります。');
      }
    } catch {
      if (requestId !== checkId) return;
      show('オフラインの じゅんびは 未かくにん', '必要なファイルをすべて保存できたことを確認できませんでした。通信がある間はそのまま遊べます。通信と空き容量を確認して「じゅんびを かくにん」を押してください。');
    }
  }
  function watch(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant') show('オフラインの じゅんびが できませんでした', '通信と端末の空き容量を確認して、もう一度お試しください。保存済みの学習記録は変更していません。');
      if (worker.state === 'installed' || worker.state === 'activated') check(worker);
    });
  }
  document.getElementById('pwa-retry').addEventListener('click', async () => {
    if (!registration) return start();
    show('オフラインの じゅんびを かくにん中', '通信と保存済みのファイルを確認しています。ゲーム画面は更新しません。');
    try { await registration.update(); } catch { /* check() reports the actual stored state. */ }
    await check();
  });
  async function start() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      show('このブラウザでは オンラインで あそんでね', 'この環境ではオフライン準備を利用できません。インターネットにつないで遊んでください。'); return;
    }
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      registration.addEventListener('updatefound', () => watch(registration.installing));
      watch(registration.installing);
      await check();
    } catch { show('オフラインの じゅんびが できませんでした', '通信やブラウザの設定を確認してください。通信がある間は、このページで遊べます。'); }
  }
  navigator.serviceWorker?.addEventListener('controllerchange', () => check());
  window.addEventListener('online', check);
  window.addEventListener('offline', check);
  start();
})();
