// LINE翻訳ボット
// 型定義はグローバルスコープで使用

interface EventData {
  postData: {
      contents: string;
  };
}

interface LineEvent {
  message: {
      text?: string;
      mention?: {
          mentionees: Array<{
              userId: string;
          }>;
      };
  };
  replyToken: string;
}

interface OpenAIResponse {
  choices: Array<{
      message: {
          content: string;
      };
  }>;
}

function doPost(e: EventData): void {
  const props = PropertiesService.getScriptProperties();
  const parsedContents = JSON.parse(e.postData.contents);
  const event = parsedContents.events[0] as LineEvent;
  const botUserId = props.getProperty("BOT_USER_ID");
  let userMessage = event.message.text;
  const mentions = event.message.mention
    ? event.message.mention.mentionees
    : [];
  const isMentioned = mentions.some((m) => m.userId === botUserId);

  if (!isMentioned || !botUserId) {
    return;
  }

  if (userMessage === undefined) {
    userMessage = "こんにちは";
  }

  const prompt = `Extract the language of the message passed from the user and translate it into English if it is in Japanese, or into Japanese if it is in English. Output only the translated text, omitting the explanation and conclusion at the beginning. Also, exclude mentions such as @Translate from the output.`;

  const requestOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${props.getProperty("OPENAI_API_KEY")}`
    },
    payload: JSON.stringify({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": userMessage}
        ]
    })
  };  
  
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", requestOptions);
  const responseText = response.getContentText();
  const json = JSON.parse(responseText) as OpenAIResponse;
  const text = json.choices[0].message.content.trim();

  const lineApiKey = props.getProperty("LINE_ACCESS_TOKEN");
  if (!lineApiKey) {
    console.error('INE_ACCESS_TOKEN is not set');
    return;
  }

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lineApiKey}`,
    },
    method: "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
    payload: JSON.stringify({
        "replyToken": event.replyToken,
        "messages": [
            {
                "type": "text",
                "text": text
            }
        ]
    })
  });
}

// テスト用関数
function testTranslation() {
  // ボットのユーザーIDを取得
  const props = PropertiesService.getScriptProperties();
  const botUserId = props.getProperty("BOT_USER_ID");
  
  // 日本語テスト
  const japaneseTest = {
    postData: {
      contents: JSON.stringify({
        events: [{
          message: {
            text: `@翻訳ボット こんにちは、元気ですか？`,
            mention: {
              mentionees: [{
                userId: botUserId
              }]
            }
          },
          replyToken: "test-reply-token"
        }]
      })
    }
  };
  
  // 英語テスト
  const englishTest = {
    postData: {
      contents: JSON.stringify({
        events: [{
          message: {
            text: `@Translate Hello, how are you?`,
            mention: {
              mentionees: [{
                userId: botUserId
              }]
            }
          },
          replyToken: "test-reply-token"
        }]
      })
    }
  };
  
  // ログ出力用のモック関数
  const originalFetch = UrlFetchApp.fetch;
  
  // モックによるログ出力
  UrlFetchApp.fetch = function(url: string, options?: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) {
    if (url.includes("api.openai.com")) {
      // OpenAI APIリクエストの場合は実際に呼び出す
      return originalFetch(url, options || {});
    } else if (url.includes("api.line.me")) {
      // LINE APIリクエストの場合はログに出力して実行はスキップ
      console.log("LINE APIへのリクエスト:");
      if (options?.payload) {
        console.log(options.payload);
      }
      
      // レスポンスをモック
      return {
        getContentText: function() {
          return JSON.stringify({ success: true });
        }
      } as GoogleAppsScript.URL_Fetch.HTTPResponse;
    }
    
    // その他のAPIリクエストはそのまま実行
    return originalFetch(url, options || {});
  };
  
  try {
    console.log("===== 日本語テスト =====");
    doPost(japaneseTest as EventData);
    
    console.log("\n===== 英語テスト =====");
    doPost(englishTest as EventData);
  } finally {
    // 元の関数に戻す
    UrlFetchApp.fetch = originalFetch;
  }
}
