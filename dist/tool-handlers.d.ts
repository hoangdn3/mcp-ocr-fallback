import { Server } from '@modelcontextprotocol/sdk/server/index.js';
export declare class ToolHandlers {
    private server;
    private openai;
    private modelCache;
    private apiClient;
    private defaultModel?;
    constructor(server: Server, apiKey: string, defaultModel?: string);
    private setupToolHandlers;
    /**
     * Get the default model configured for this server
     */
    getDefaultModel(): string | undefined;
}
