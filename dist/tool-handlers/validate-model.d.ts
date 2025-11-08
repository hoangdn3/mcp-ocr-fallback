import { ModelCache } from '../model-cache.js';
export interface ValidateModelToolRequest {
    model: string;
}
export declare function handleValidateModel(request: {
    params: {
        arguments: ValidateModelToolRequest;
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
