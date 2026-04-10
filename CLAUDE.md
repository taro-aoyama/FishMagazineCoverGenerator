# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

釣果（ブツ持ち）写真から釣り雑誌の表紙風画像を生成するクライアントサイドSPA。AIによる背景除去、Canvas APIによる画像合成、テーマ切り替え・ドラッグ＆ドロップ操作を完全にブラウザ内で処理する（サーバーコスト0円）。

## 開発コマンド

```bash
npm install        # 依存パッケージインストール
npm run dev        # 開発サーバー起動 (http://localhost:5173)
npm run build      # TypeScript型チェック + Viteプロダクションビルド (tsc && vite build)
npm run preview    # ビルド成果物のプレビュー
```

テストフレームワークは未導入。ビルド (`npm run build`) の型チェック通過が品質ゲート。

## 技術スタック

- **React 19** + **TypeScript** (strict: false) + **Vite 5**
- **Tailwind CSS v4** (カスタムユーティリティ: `.glass-panel`, `.thumb-glow`)
- **@imgly/background-removal** — ONNXモデルによるブラウザ内AI背景除去
- **lucide-react** — アイコン
- **Canvas API** — 画像合成・テキスト描画・DPR対応レンダリング

## アーキテクチャ

`index.html` → `src/main.tsx` → `src/App.tsx` のシンプルな構成。

**App.tsx** が全機能を持つ単一コンポーネント（約900行）:
- **THEMES[]** — 5種の雑誌テーマ定義（配色・タイトル）
- **HEADLINES[]** — 30個の雑誌見出しデータ
- **startExtraction()** — `@imgly/background-removal`で被写体抽出
- **shuffleLayout()** — ランダムな雑誌レイアウト生成（年・巻・月・見出し・パターン）
- **drawCanvas()** — Canvas APIによる雑誌風画像の描画（ノイズテクスチャ、テーマ色、テキスト配置、5種のレイアウトパターン）
- **ドラッグ操作** — PointerEvents APIで被写体のリサイズ・移動
- **handleDownload()** — Canvas→Blob→ファイルダウンロード

## 開発ルール

- **言語**: コード・ドキュメント・チャットすべて日本語
- **ドキュメント保管**: `docs/YYYY-MM-DD/` 配下に日付フォルダで管理
- **サーバーコスト0円維持**: 新機能はクライアントサイドアプローチ最優先（Transformers.js等）
- **README.md更新**: 主要機能・要件・起動方法に変更があれば必ず更新

## 注意事項

- 初回AI処理時に数十MBのモデルファイルがダウンロードされる（ブラウザキャッシュ後は即時）
- Canvas描画はDPR（devicePixelRatio）対応済み
- ビルド成果物は `dist/` に出力（静的ホスティング用）
