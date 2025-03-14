# LINE翻訳ボット

LINE Messaging APIとOpenAI APIを使用して、日本語と英語の翻訳を行うLINEボットです。LINEのメッセージでボットをメンションすると、メッセージを自動的に翻訳して返信します。

## 機能

- 日本語を英語に翻訳
- 英語を日本語に翻訳
- ボットのメンション検出
- シンプルで使いやすいインターフェイス

## 技術スタック

- Firebase Functions
- TypeScript
- LINE Messaging API
- OpenAI API (GPT-4o-mini)
- axios

## セットアップ方法

### 前提条件

- Node.jsとnpmがインストールされていること
- [Firebase CLI](https://firebase.google.com/docs/cli)のインストール
- [LINE Developersアカウント](https://developers.line.biz/ja/)
- [OpenAIアカウント](https://platform.openai.com/)とAPIキー
- Firebaseアカウント

### インストール手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/line-translate-bot.git
cd line-translate-bot
```

2. Firebase CLIにログイン

```bash
firebase login
```

3. プロジェクトを初期化（既存のFirebaseプロジェクトを使用する場合）

```bash
firebase use --add
```

4. 依存パッケージをインストール

```bash
cd functions
npm install
```

5. 環境変数の設定
   - `.env.example`をコピーして`.env`ファイルを作成
   - 以下の変数を設定:
     - `BOT_USER_ID`: LINEボットのユーザーID
     - `OPENAI_API_KEY`: OpenAI APIキー
     - `LINE_ACCESS_TOKEN`: LINE Messaging APIのアクセストークン

6. デプロイ

```bash
firebase deploy --only functions:lineTranslateBot
```

7. LINE Webhook URLの設定
   - デプロイ後に表示されるURLをコピー
   - LINE DevelopersコンソールでWebhook URLとして設定

## 環境変数

以下の環境変数をfunctionsディレクトリの`.env`ファイルに設定してください：

```
LINE_ACCESS_TOKEN=XXX
OPENAI_API_KEY=XXX
BOT_USER_ID=XXX
```

## GitHub Actionsを使った自動デプロイ

GitHubにプッシュした際に自動的にFirebase Functionsをデプロイするように設定されています。以下の手順で設定を完了させてください：

1. Firebase CLIトークンを取得する
   ```
   firebase login:ci
   ```
   
2. 表示されたトークンをコピーする

3. GitHubリポジトリの **Settings > Secrets > Actions > New repository secret** で以下のシークレットを追加する
   - `FIREBASE_TOKEN`: 手順1で取得したトークン
   - `LINE_ACCESS_TOKEN`: LINE Messaging APIのアクセストークン
   - `OPENAI_API_KEY`: OpenAI APIのアクセスキー
   - `BOT_USER_ID`: LINEボットのユーザーID

これで、`functions`ディレクトリ内のファイルを変更してGitHubにプッシュすると、自動的にFirebase Functionsがデプロイされます。

## 使用方法

1. LINEアプリでボットを友達に追加
2. チャットで以下のように使用：
   - 日本語→英語: `@ボット名 こんにちは、元気ですか？`
   - 英語→日本語: `@ボット名 Hello, how are you?`

## 開発方法

### ローカルでのテスト

```bash
cd functions
npm run serve
```

Firebaseエミュレータが起動し、ローカルでFunctionsをテストできます。

### コマンド

- `npm run build`: TypeScriptをコンパイル
- `npm run serve`: ローカルでエミュレータを起動
- `npm run deploy`: Firebase Functionsにデプロイ
- `npm run logs`: デプロイされたFunctionsのログを表示

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