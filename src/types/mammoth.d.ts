declare module "mammoth" {
    interface ExtractResult {
        value: string;
        messages: unknown[];
    }

    interface Options {
        path?: string;
    }

    export function extractRawText(
        options: Options
    ): Promise<ExtractResult>;
}