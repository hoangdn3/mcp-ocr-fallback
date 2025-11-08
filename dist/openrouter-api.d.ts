/**
 * Client for interacting with the OpenRouter API
 */
export declare class OpenRouterAPIClient {
    private apiKey;
    private axiosInstance;
    private retryCount;
    private retryDelay;
    constructor(apiKey: string);
    /**
     * Get all available models from OpenRouter
     */
    getModels(): Promise<any[]>;
    /**
     * Send a request to the OpenRouter API with retry functionality
     */
    request(endpoint: string, method: string, data?: any): Promise<any>;
    /**
     * Handle retryable errors
     */
    private handleRetryableError;
    /**
     * Handle request errors
     */
    private handleRequestError;
}
