// GASで使用するための型定義
// exportキーワードを削除してグローバルスコープで型を定義

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

interface Properties {
    getProperty(key: string): string | null;
}

interface PropertiesServiceStatic {
    getScriptProperties(): Properties;
}

