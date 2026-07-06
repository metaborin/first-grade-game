# まなびのくに RPG 🧙

小学1年生向けの国語と算数を楽しく学べる、2Dドットスタイルの学習RPGゲームです。

## 🎮 ゲームURL（GitHub Pages）

> デプロイ後に更新予定

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

- **Phaser 3.80.1** (CDN)
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
