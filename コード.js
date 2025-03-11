/**
 * LINE Bot (翻訳Bot) のメイン処理
 * グループにメッセージが投稿された時に呼び出される (Webhook)
 */
function doPost(e) {
  // ---------------------------------------------------------
  // 1. WebhookのJSONをパース
  // ---------------------------------------------------------
  const data = JSON.parse(e.postData.contents);
  
  // ---------------------------------------------------------
  // 2. 署名検証(必要な場合)
  // ---------------------------------------------------------
  // ※Basic認証やHMAC署名による検証が必要であれば実装する
  // const signature = e.parameter.signature;
  // if (!validateSignature(e.postData.contents, signature)) {
  //   return ContentService.createTextOutput('Invalid Signature');
  // }

  // ---------------------------------------------------------
  // 3. イベントごとに処理
  // ---------------------------------------------------------
  if (!data.events) {
    return ContentService.createTextOutput(JSON.stringify({ success: true }));
  }

  const events = data.events;
  events.forEach(function(event) {
    // メッセージでなければ終了
    if (event.type !== 'message' || event.message.type !== 'text') {
      return;
    }

    // 返信用トークン
    const replyToken = event.replyToken;

    // ---------------------------------------------------------
    // 4. メンション情報をチェックし、Botに対するメンションか確認
    // ---------------------------------------------------------
    // LINE Messaging APIのJSONの中に mention オブジェクトがあるかどうかチェックし、
    // さらに mentionees に BOT_USER_ID が含まれるかを判定します。
    const botUserId = PropertiesService.getScriptProperties().getProperty('BOT_USER_ID');
    
    // イベントからメンション情報を取得
    const mentions = event.message.mention ? event.message.mention.mentionees : [];
    const isMentioned = mentions.some(function(m) {
      return m.userId === botUserId;
    });

    // Botにメンションされていない場合は何もしない
    // if (!isMentioned) {
    //   return;
    // }

    // ---------------------------------------------------------
    // 5. メッセージ本文 (翻訳したいテキスト) を取得
    //    → メンション部分を除外したい場合は適宜テキスト整形
    // ---------------------------------------------------------
    const originalText = event.message.text;

    // ---------------------------------------------------------
    // 6. Gemini APIを呼び出して翻訳
    // ---------------------------------------------------------
    const translatedText = callGeminiApi(originalText);

    // ---------------------------------------------------------
    // 7. 翻訳結果を返信メッセージとして送信
    // ---------------------------------------------------------
    replyMessage(replyToken, translatedText);
  });

  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}

/**
 * Gemini APIにテキストを投げて翻訳結果を取得する関数の例
 * @param {string} text 翻訳対象のテキスト
 * @return {string} 翻訳されたテキスト
 */
/**
 * Gemini APIにテキストを投げて翻訳結果を取得する関数の例
 * @param {string} text 翻訳対象のテキスト
 * @return {string} 翻訳されたテキスト
 */
function callGeminiApi(text) {
  // Script Propertiesから取得（環境に合わせて変更）
  const geminiApiKey   = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const geminiEndpoint = PropertiesService.getScriptProperties().getProperty('GEMINI_ENDPOINT') + geminiApiKey;

  // リクエストペイロードを修正：引数 text を使用
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": `以下のメッセージの言語を抽出して、日本語なら英語へ、英語なら日本語へ翻訳して。冒頭の説明や結びは省略して翻訳文のみを出力して。\n\n ${text}`
          }
        ]
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(geminiEndpoint, options);

    // HTTPステータスコードが 200 以外の場合はエラーとする
    if (response.getResponseCode() !== 200) {
      const errorMessage = `Gemini APIエラー (HTTPステータスコード: ${response.getResponseCode()})`;
      console.error(errorMessage);
      console.error("レスポンス内容:", response.getContentText()); // レスポンス内容をログに出力
      return "翻訳に失敗しました (HTTPエラー)"; // ユーザー向けには簡略化したエラーメッセージ
    }

    const json = JSON.parse(response.getContentText());

    // レスポンスから翻訳されたテキストを取得 (プロパティ名は Gemini API のレスポンス形式に合わせてください)
    const translatedText = json.candidates?.[0]?.content?.parts?.[0]?.text; // 例: Gemini API レスポンス構造を想定

    if (translatedText) {
      console.log(translatedText)
      return translatedText;
    } else {
      console.error("Gemini APIレスポンスエラー: 翻訳テキストが見つかりません", json); // レスポンス全体をログ出力
      return "翻訳に失敗しました (レスポンス形式エラー)"; // ユーザー向けには簡略化したエラーメッセージ
    }

  } catch (error) {
    console.error("Gemini APIエラー (API呼び出しエラー): " + error);
    return "翻訳に失敗しました (APIエラー)"; // ユーザー向けには簡略化したエラーメッセージ
  }
}



/**
 * 返信メッセージをLINEに送る関数
 * @param {string} replyToken 
 * @param {string} message 
 */
function replyMessage(replyToken, message) {
  const channelAccessToken = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN');
  const url = 'https://api.line.me/v2/bot/message/reply';

  const payload = {
    replyToken: replyToken,
    messages: [{
      type: 'text',
      text: message
    }]
  };

  const params = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelAccessToken
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, params);
}

/**
 * 署名検証例 (必要な場合のみ使用)
 * @param {string} content リクエストボディ
 * @param {string} signature X-Line-Signature
 * @return {boolean} 検証OKならtrue
 */
function validateSignature(content, signature) {
  const channelSecret = PropertiesService.getScriptProperties().getProperty('CHANNEL_SECRET');
  const crypto = CryptoApp.computeHmacSha256Signature(content, channelSecret);
  const calcSignature = Utilities.base64Encode(crypto);
  return calcSignature === signature;
}