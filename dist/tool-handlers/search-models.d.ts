import { ModelCache } from '../model-cache.js';
import { OpenRouterAPIClient } from '../openrouter-api.js';
export interface SearchModelsToolRequest {
    query?: string;
    provider?: string;
    minContextLength?: number | string;
    maxContextLength?: number | string;
    maxPromptPrice?: number | string;
    maxCompletionPrice?: number | string;
    capabilities?: {
        functions?: boolean;
        tools?: boolean;
        vision?: boolean;
        json_mode?: boolean;
    };
    limit?: number | string;
}
export declare function handleSearchModels(request: {
    params: {
        arguments: SearchModelsToolRequest;
    };
}, apiClient: OpenRouterAPIClient, modelCache: ModelCache): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
}>;
