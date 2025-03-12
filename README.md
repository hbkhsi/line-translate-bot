# LINE翻訳ボット

LINE Messaging APIとOpenAI APIを使用して、日本語と英語の翻訳を行うLINEボットです。LINEのメッセージでボットをメンションすると、メッセージを自動的に翻訳して返信します。

## 機能

- 日本語を英語に翻訳
- 英語を日本語に翻訳
- ボットのメンション検出
- シンプルで使いやすいインターフェース

## 技術スタック

- Google Apps Script (GAS)
- TypeScript
- LINE Messaging API
- OpenAI API (GPT-4o-mini)
- clasp (GASのローカル開発ツール)

## セットアップ方法

### 前提条件

- Node.jsとnpmがインストールされていること
- [LINE Developersアカウント](https://developers.line.biz/ja/)
- [OpenAIアカウント](https://platform.openai.com/)とAPIキー
- Google アカウント

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/line-translate-bot.git
cd line-translate-bot
```

2. 依存パッケージをインストール
```bash
npm install
```

3. claspでGoogleにログイン
```bash
npx clasp login
```

4. 新しいGASプロジェクトを作成（既存のプロジェクトを使用する場合はスキップ）
```bash
npx clasp create --title "LINE翻訳ボット" --type webapp
```

5. スクリプトプロパティの設定
   - GASエディタで「プロジェクトの設定」→「スクリプトプロパティ」を開く
   - 以下のプロパティを追加:
     - `BOT_USER_ID`: LINEボットのユーザーID
     - `OPENAI_API_KEY`: OpenAI APIキー
     - `LINE_ACCESS_TOKEN`: LINE Messaging APIのアクセストークン

6. TypeScriptのコンパイルとデプロイ
```bash
npm run deploy
```

7. LINEボットのWebhook URLを設定
   - GASプロジェクトをデプロイしてWeb アプリケーションURLを取得
   - LINE DevelopersコンソールでWebhook URLを設定

## 使用方法

1. LINEアプリでボットを友達に追加
2. チャットで以下のように使用：
   - 日本語→英語: `@ボット名 こんにちは、元気ですか？`
   - 英語→日本語: `@ボット名 Hello, how are you?`

## 開発方法

### コマンド

- `npm run build`: TypeScriptをコンパイル
- `npm run deploy`: ビルドしてGASにデプロイ
- `npm run watch`: ファイル変更を監視して自動コンパイル
- `npm run push`: ビルド済みコードをデプロイ
- `npm run open`: GASエディタをブラウザで開く

### テスト

GASエディタで`testTranslation`関数を実行すると、翻訳機能のテストが行われます。

## ライセンス

MITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献方法

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 作者

あなたの名前 - [@yourTwitter](https://twitter.com/yourTwitter) - your.email@example.com 