import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';
export interface ChatCompletionToolRequest {
    model?: string;
    messages: ChatCompletionMessageParam[];
    temperature?: number;
}
export declare function handleChatCompletion(request: {
    params: {
        arguments: ChatCompletionToolRequest;
    };
}, openai: OpenAI, defaultModel?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    metadata: {
        model: string;
        usage: OpenAI.Completions.CompletionUsage | undefined;
    };
    isError?: undefined;
}>;
