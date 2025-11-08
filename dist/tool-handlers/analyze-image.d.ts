import OpenAI from 'openai';
export interface AnalyzeImageToolRequest {
    image_path: string;
    question?: string;
    model?: string;
}
/**
 * Handler for analyzing a single image
 */
export declare function handleAnalyzeImage(request: {
    params: {
        arguments: AnalyzeImageToolRequest;
    };
}, openai: OpenAI, defaultModel?: string): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    metadata: {
        model: string;
        usage: OpenAI.Completions.CompletionUsage | undefined;
        error_type?: undefined;
        error_message?: undefined;
    };
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
    metadata: {
        error_type: string;
        error_message: string;
        model?: undefined;
        usage?: undefined;
    };
}>;
