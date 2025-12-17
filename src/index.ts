#!/usr/bin/env node
// OpenRouter Multimodal MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { ToolHandlers } from './tool-handlers.js';

// Define the default model to use when none is specified
const DEFAULT_MODEL = 'qwen/qwen2.5-vl-32b-instruct';
const DEFAULT_AUDIO_MODEL = 'mistralai/voxtral-small-24b-2507';

interface ServerOptions {
  apiKey?: string;
  defaultModel?: string;
  defaultAudioModel?: string;
}

class OpenRouterMultimodalServer {
  private server: Server;
  private toolHandlers!: ToolHandlers; // Using definite assignment assertion

  constructor(options?: ServerOptions) {
    // Retrieve API key from options or environment variables
    const apiKey = options?.apiKey || process.env.OPENROUTER_API_KEY;
    const defaultModel = options?.defaultModel || process.env.OPENROUTER_DEFAULT_MODEL_IMG || process.env.OPENROUTER_DEFAULT_MODEL_IMG_BACKUP || DEFAULT_MODEL;
    const defaultAudioModel = options?.defaultAudioModel || process.env.OPENROUTER_DEFAULT_MODEL_AUDIO || process.env.OPENROUTER_DEFAULT_MODEL_AUDIO_BACKUP || DEFAULT_AUDIO_MODEL;
    
    // Check if API key is provided
    if (!apiKey) {
      throw new Error('OpenRouter API key is required. Provide it via options or OPENROUTER_API_KEY environment variable');
    }

    // Initialize the server
    this.server = new Server(
      {
        name: 'openrouter-multimodal-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    // Set up error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    
    // Initialize tool handlers
    this.toolHandlers = new ToolHandlers(
      this.server,
      apiKey,
      defaultModel,
      defaultAudioModel
    );
    
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OpenRouter Multimodal MCP server running on stdio');
    console.error('Server is ready to process tool calls. Waiting for input...');
  }
}

// Get MCP configuration if provided
let mcpOptions: ServerOptions | undefined;

// Check if we're being run as an MCP server with configuration
if (process.argv.length > 2) {
  try {
    const configArg = process.argv.find(arg => arg.startsWith('--config='));
    if (configArg) {
      const configPath = configArg.split('=')[1];
      const configData = require(configPath);
      
      // Extract configuration
      mcpOptions = {
        apiKey: configData.OPENROUTER_API_KEY || configData.apiKey,
        defaultModel: configData.OPENROUTER_DEFAULT_MODEL || configData.defaultModel
      };
      
      if (mcpOptions.apiKey) {
        console.error('Using API key from MCP configuration');
      }
    }
  } catch (error) {
    console.error('Error parsing MCP configuration:', error);
  }
}

// Attempt to parse JSON from stdin to check for MCP server parameters
if (!mcpOptions?.apiKey) {
  process.stdin.once('data', (data) => {
    try {
      const firstMessage = JSON.parse(data.toString());
      if (firstMessage.params && typeof firstMessage.params === 'object') {
        mcpOptions = {
          apiKey: firstMessage.params.OPENROUTER_API_KEY || firstMessage.params.apiKey,
          defaultModel: firstMessage.params.OPENROUTER_DEFAULT_MODEL || firstMessage.params.defaultModel
        };
      }
    } catch (error) {
      // Not a valid JSON message or no parameters, continue with environment variables
    }
  });
}

const server = new OpenRouterMultimodalServer(mcpOptions);
server.run().catch(console.error); 
