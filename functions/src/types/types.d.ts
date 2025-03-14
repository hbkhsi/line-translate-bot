declare module "axios";
declare module "dotenv";
declare module "firebase-functions/v2/https" {
  export function onRequest(
    handler: (request: unknown, response: unknown) => void | Promise<void>
  ): unknown;
}
declare module "firebase-functions/logger" {
  export function info(message: string, data?: unknown): void;
  export function error(message: string, error?: unknown): void;
}
declare namespace NodeJS {
  interface Process {
    env: {
      [key: string]: string | undefined;
      LINE_ACCESS_TOKEN?: string;
      OPENAI_API_KEY?: string;
      BOT_USER_ID?: string;
    }
  }
}
