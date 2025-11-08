import OpenAI from 'openai';
export interface MultiImageAnalysisToolRequest {
    images: Array<{
        url: string;
        alt?: string;
    }>;
    prompt: string;
    markdown_response?: boolean;
    model?: string;
}
/**
 * Find a suitable free model with vision capabilities, defaulting to Qwen
 */
export declare function findSuitableFreeModel(openai: OpenAI): Promise<string>;
/**
 * Main handler for multi-image analysis
 */
export declare function handleMultiImageAnalysis(request: {
    params: {
        arguments: MultiImageAnalysisToolRequest;
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
        error_type: any;
        error_message: any;
        model?: undefined;
        usage?: undefined;
    };
}>;
