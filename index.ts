import { EventData, LineEvent, OpenAIResponse } from "./types";

export function doPost(e: EventData): void {
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

  const requestOptions = {
    "method": "post",
    "headers": {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${props.getProperty("OPENAI_API_KEY")}`
    },
    "payload": JSON.stringify({
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
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${lineApiKey}`,
    },
    "method": "post",
    "payload": JSON.stringify({
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
