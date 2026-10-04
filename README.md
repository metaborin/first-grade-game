# まなびのくに RPG 🧙

小学1年生向けの国語と算数を楽しく学べる、2Dドットスタイルの学習RPGゲームです。

## 🎮 ゲームURL（GitHub Pages）

https://metaborin.github.io/first-grade-game/

## アプリ・オフライン・更新

- 上部の「アプリの あんない」からインストール方法と準備状態を確認できます。
- 初回は通信が必要です。「オフラインの じゅんび OK」は、ゲーム・問題・書体など必須29 URLが実際に保存できたときだけ表示します。
- Phaser 3.80.1とDotGothic16はライセンスとともに`vendor/`へ同梱しています。ゲーム起動に外部CDNは不要です。
- 更新は学習中に強制適用しません。結果画面まで進んで記録を保存し、このゲームの全タブ・アプリを閉じて、開き直してください。問題の途中の状態は保存されません。
- 記録は従来どおり`manabiRPG_save_1`と`manabiRPG_save_2`に保存します。更新処理はlocalStorageやIndexedDBへ書き込みません。
- 必須ファイルの取得失敗時は新Service Workerのインストールを完了せず、旧キャッシュを保持します。更新待機中も旧版のキャッシュを保持し、新版の全ファイルを再確認した後に、履歴で確認した自アプリの旧キャッシュ名だけ削除します。
- ブラウザによる保存領域の削除・空き容量不足時は再準備が必要です。インストール項目がない環境でもブラウザで利用できます。

開発時はファイルを変更するリリースごとに`sw.js`の`CACHE_NAME`を更新し、所有済みの旧名だけを`OWNED_CACHE_NAMES`に残してください。`skipWaiting()`や学習中の自動reloadを追加しないでください。

回帰検証: `node --test tests/sw-cache-isolation.test.mjs`（Node.js 18以降）。ビルド・npmインストールは不要です。

## ✨ 特徴

- **レトロドット風デザイン**: Phaser 3 の `pixelArt: true` モードと CSS `image-rendering: pixelated` でにじみのないピクセルアートを実現
- **PWA対応**: オフラインでも遊べる（Service Worker実装済み）
- **2スロットセーブ**: 2人分のデータを localStorage に保存可能
- **難易度切替**: 手動選択（やさしい/ふつう/むずかしい）と自動調整モード
- **名前入力**: ひらがなキーボードでプレイヤー名を自由設定

## 📚 ゲーム内容

| ゲーム | 内容 |
|---|---|
| ひらがな並び替え | バラバラな文字をタップして正しい順に並べる |
| カタカナモンスター | モンスターに書かれたカタカナを3択で選んで倒す |
| たし算レース | 正解するとキャラが前進、全5問でゴールイン |
| ひき算レース | たし算と同じ形式でひき算に挑戦 |

## 🏆 演出システム

- ✅ **正解時**: 白フラッシュ → 星パーティクル → 紙吹雪 → 褒め言葉テキスト + 効果音
- ❌ **不正解時**: 画面シェイク → 正解表示
- 🎉 **全問正解**: ファンファーレ + 大紙吹雪

## 🛠️ 技術スタック

- **Phaser 3.80.1**（MITライセンスで同梱）
- **HTML5 / Vanilla JavaScript**
- **Web Audio API** (効果音プロシージャル生成・外部ファイル不要)
- **Canvas API** (アセットプロシージャル生成・外部画像不要)
- **PWA** (manifest.json + Service Worker)

## 🚀 ローカルで起動

```bash
# このリポジトリをクローン
git clone https://github.com/metaborin/first-grade-game.git
cd first-grade-game

# ローカルサーバーを起動
npx serve . --listen 8080

# ブラウザで開く
# http://localhost:8080
```

## 📁 ファイル構成

```
first-grade-game/
├── index.html              # エントリーポイント
├── manifest.json           # PWAマニフェスト
├── sw.js                   # Service Worker
├── css/style.css           # グローバルスタイル
├── js/
│   ├── main.js             # Phaser設定・初期化
│   ├── data/               # 問題データ・セーブ管理
│   ├── utils/              # 音声・エフェクトユーティリティ
│   └── scenes/             # 11個のゲームシーン
└── icons/                  # PWAアイコン
```

## 📄 ライセンス

MIT License
