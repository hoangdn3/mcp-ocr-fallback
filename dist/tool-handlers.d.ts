import { Server } from '@modelcontextprotocol/sdk/server/index.js';
export declare class ToolHandlers {
    private server;
    private openai;
    private modelCache;
    private apiClient;
    private defaultModel?;
    private defaultAudioModel?;
    constructor(server: Server, apiKey: string, defaultModel?: string, defaultAudioModel?: string);
    private setupToolHandlers;
    /**
     * Get the default model configured for this server
     */
    getDefaultModel(): string | undefined;
    /**
     * Get the default audio model configured for this server
     */
    getDefaultAudioModel(): string | undefined;
}
