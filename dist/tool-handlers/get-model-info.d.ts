import { ModelCache } from '../model-cache.js';
export interface GetModelInfoToolRequest {
    model: string;
}
export declare function handleGetModelInfo(request: {
    params: {
        arguments: GetModelInfoToolRequest;
    };
}, modelCache: ModelCache): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
}>;
