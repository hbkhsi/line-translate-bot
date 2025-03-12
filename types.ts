export interface EventData {
    postData: {
        contents: string;
    };
}

export interface LineEvent {
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

export interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export interface Properties {
    getProperty(key: string): string | null;
}

export interface PropertiesServiceStatic {
    getScriptProperties(): Properties;
}

declare global {
    const PropertiesService: PropertiesServiceStatic;
    const UrlFetchApp: {
        fetch(url: string, options?: any): {
            getContentText(): string;
        };
    };
}

