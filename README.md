# MATRIX TYPER
Matrix風ローマ字タイピングゲーム

## リンク
- GitHub Pages: https://itoseiy.github.io/ai-typing-game/
- ※ ESモジュール使用のため `file://` では動作しません。上記URLまたはローカルHTTPサーバーで遊んでください。

## 遊び方
- ブラウザでアクセス → `START` → ローマ字入力 → スコア確認
- 制限時間は**60秒**、表示されたお題を次々入力します
- `Settings`画面でSE音量を調整できます

## 特徴
- Matrix風演出（緑文字レイン背景、グロー効果）
- 複数ローマ字パターン対応（し→`shi`/`si`、ち→`chi`/`ti`、などどの打ち方でもOK）
- 漢字・カタカナ・ひらがな全お題対応
- Web Audio API効果音（タイプ音、正解、ミス、開始、終了、カウントダウン）
- CSVドリブンレベルデザイン（お題追加はCSV編集だけ）
- 60問収録

## ディレクトリ構成
- `index.html`
- `styles.css`
- `src/main.js`
- `assets/`
  - `assets/config.js`
  - `assets/images/` — お題画像
  - `assets/levels/` — レベルCSV
- `src/core/` — ゲームエンジン
- `src/ui/` — UI画面、Matrix演出
- `src/audio/` — サウンド
- `src/loader/` — CSVパーサー、レベルローダー
- `tests/` — ユニットテスト

## CSV設計
- 列: `id`, `text_display`, `text_kana`, `image_path`
- `text_display`: 画面に表示するテキスト（漢字・カタカナ・ひらがな）
- `text_kana`: ひらがな読み（入力判定に使用）
- カスタマイズ: `assets/levels/normal.csv` を編集するだけでお題追加可能

## 技術スタック
- Vanilla JavaScript (ES Modules)
- Web Audio API（プログラム生成音、外部ファイル不要）
- Canvas API（Matrix rain演出）
- HTML5 / CSS3

## ローカル実行
```bash
npx serve .
# http://localhost:3000 でアクセス
```

## テスト
```bash
node --test tests/test_*.js
```

現在155テスト全PASS。

## 開発体制
Shogunマルチエージェントシステムで開発:
- 将軍: プロジェクト統括
- 家老: タスク分解・指揮
- 足軽7名: 並行実装
- 軍師: 品質管理

## ライセンス
MIT
