/**
 * ModelCache - Caches OpenRouter model data to reduce API calls
 */
export declare class ModelCache {
    private static instance;
    private models;
    private lastFetchTime;
    private cacheExpiryTime;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): ModelCache;
    /**
     * Check if the cache is valid
     */
    isCacheValid(): boolean;
    /**
     * Store all models
     */
    setModels(models: any[]): void;
    /**
     * Get all cached models
     */
    getAllModels(): any[];
    /**
     * Get a specific model by ID
     */
    getModel(modelId: string): any | null;
    /**
     * Check if a model exists
     */
    hasModel(modelId: string): boolean;
    /**
     * Search models based on criteria
     */
    searchModels(params: {
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
    }): any[];
    /**
     * Reset the cache
     */
    resetCache(): void;
}
