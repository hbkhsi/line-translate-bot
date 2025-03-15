/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import * as dotenv from "dotenv";

// 環境変数の読み込み
dotenv.config();

// 型定義
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

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// LINE翻訳ボットの実装
export const lineTranslateBot = onRequest(async (request, response) => {
  try {
    // LINEからのリクエストをパース
    const parsedContents = request.body;

    // リクエストの検証
    if (!parsedContents || !parsedContents.events ||
        !Array.isArray(parsedContents.events) ||
        parsedContents.events.length === 0) {
      // 検証イベントの場合はOKを返す
      logger.info(
        "Received validation request or empty events array",
        {body: JSON.stringify(request.body)}
      );
      response.status(200).send("OK");
      return;
    }

    const event = parsedContents.events[0] as LineEvent;

    // メッセージが存在するか確認
    if (!event.message) {
      logger.info(
        "Received event with no message",
        {event: JSON.stringify(event)}
      );
      response.status(200).send("OK");
      return;
    }

    const botUserId = process.env.BOT_USER_ID;
    let userMessage = event.message.text;

    // メッセージテキストがない場合
    if (!userMessage) {
      logger.info(
        "Received event with no message text",
        {event: JSON.stringify(event)}
      );
      response.status(200).send("OK");
      return;
    }

    const mentions = event.message.mention ?
      event.message.mention.mentionees :
      [];
    const isMentioned = mentions.some((m) => m.userId === botUserId);

    if (!isMentioned || !botUserId) {
      logger.info("Bot was not mentioned or BOT_USER_ID is not set");
      response.status(200).send("OK");
      return;
    }

    if (userMessage === undefined) {
      userMessage = "こんにちは";
    }

    // OpenAI APIリクエスト用のプロンプト
    const prompt =
      "Extract the language of the message passed from the user and " +
      "translate it into English if it is in Japanese, or into Japanese " +
      "if it is in English. Output only the translated text, omitting the " +
      "explanation and conclusion at the beginning. Also, exclude mentions " +
      "such as @Translate from the output.";

    // OpenAI APIリクエスト
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {role: "system", content: prompt},
          {role: "user", content: userMessage},
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const json = openaiResponse.data as OpenAIResponse;
    const text = json.choices[0].message.content.trim();

    // LINE Messaging APIにメッセージを送信
    const lineApiKey = process.env.LINE_ACCESS_TOKEN;
    if (!lineApiKey) {
      logger.error("LINE_ACCESS_TOKEN is not set");
      response.status(200).send("OK"); // エラーでも200を返す
      return;
    }

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: text,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lineApiKey}`,
        },
      }
    );

    logger.info("Successfully processed message", {
      original: userMessage,
      translated: text,
    });
    response.status(200).send("OK");
  } catch (error) {
    // エラーをログに記録するが、200 OKを返す
    logger.error("Error processing request", error);
    response.status(200).send("OK"); // LINEプラットフォームには常に200を返す
  }
});
