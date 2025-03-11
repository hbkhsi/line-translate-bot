function doPost(e) { 
  const props = PropertiesService.getScriptProperties()
  const event = JSON.parse(e.postData.contents).events[0]
  const botUserId = props.getProperty(`BOT_USER_ID`)
  let userMessage = event.message.text
  const mentions = event.message.mention ? event.message.mention.mentionees : []
  const isMentioned = mentions.some(m => m.userId === botUserId);

  if(!isMentioned){
    return;
  }

  if (userMessage === undefined) {
    // スタンプが送られてきた時のメッセージ
    userMessage = 'こんにちは'
  }

  //const sheet = SpreadsheetApp.getActive().getSheetByName('シート1');
  const prompt = `Extract the language of the message passed from the user and translate it into English if it is in Japanese, or into Japanese if it is in English. Output only the translated text, omitting the explanation and conclusion at the beginning. Also, exclude mentions such as @Translate from the output.`;

  const requestOptions = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+ props.getProperty('OPENAI_APIKEY')
    },
    "payload": JSON.stringify({
      "model": "gpt-4o-mini",
      "messages": [
        {"role": "system", "content": prompt},
        {"role": "user", "content": userMessage}
       ]
    })
  }
  const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", requestOptions)
  const responseText = response.getContentText();
  const json = JSON.parse(responseText);
  const text = json['choices'][0]['message']['content'].trim();

  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + props.getProperty('LINE_ACCESS_TOKEN'),
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': event.replyToken,
      'messages': [{
        'type': 'text',
        'text': text,
      }]
    })
  })
}