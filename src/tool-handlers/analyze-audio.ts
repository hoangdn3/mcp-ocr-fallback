import path from 'path';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';

// Default model for audio analysis
const DEFAULT_AUDIO_MODEL = 'mistralai/voxtral-small-24b-2507';

export interface AnalyzeAudioToolRequest {
  audio_url: string;
  model?: string;
}

/**
 * Normalizes a file path to be OS-neutral
 */
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Checks if the path is a remote URL
 */
function isUrl(path: string): boolean {
  try {
    new URL(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches audio from URL or local path and returns buffer
 */
async function fetchAudio(audioPath: string): Promise<Buffer> {
  if (isUrl(audioPath)) {
    // Fetch from URL
    const response = await fetch(audioPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else {
    // Read from local file
    const normalizedPath = normalizePath(audioPath);
    let resolvedPath = normalizedPath;

    if (!path.isAbsolute(resolvedPath)) {
      resolvedPath = path.resolve(process.cwd(), resolvedPath);
    }

    return await fs.readFile(resolvedPath);
  }
}

/**
 * Detects audio format from buffer or filename
 */
function detectAudioFormat(buffer: Buffer, filename: string): 'wav' | 'mp3' {
  // Check magic numbers
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return 'wav';
  }
  if (buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0) {
    return 'mp3';
  }

  // Fallback to filename extension
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.wav') return 'wav';
  if (ext === '.mp3') return 'mp3';

  // Default to wav
  return 'wav';
}

/**
 * Find suitable free audio model
 */
async function findSuitableFreeAudioModel(openai: OpenAI): Promise<string> {
  const fallbackModel = process.env.OPENROUTER_DEFAULT_MODEL_AUDIO_BACKUP || DEFAULT_AUDIO_MODEL;

  try {
    const modelsResponse = await openai.models.list();
    if (!modelsResponse?.data || modelsResponse.data.length === 0) {
      return fallbackModel;
    }

    // Search for free audio models
    const freeAudioModels = modelsResponse.data
      .filter(model => {
        const modelId = model.id.toLowerCase();
        return modelId.includes('free') &&
          (modelId.includes('audio') || modelId.includes('voxtral') || modelId.includes('whisper'));
      })
      .map(model => ({ id: model.id }));

    if (freeAudioModels.length > 0) {
      return freeAudioModels[0].id;
    }

    return fallbackModel;
  } catch (error) {
    return fallbackModel;
  }
}

/**
 * Main handler for audio analysis
 */
export async function handleAnalyzeAudio(
  request: { params: { arguments: AnalyzeAudioToolRequest } },
  openai: OpenAI,
  defaultModel?: string
): Promise<any> {
  try {
    const args = request.params.arguments;

    // Validate input
    if (!args.audio_url) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'audio_url parameter is required'
      );
    }

    // Fetch audio
    const buffer = await fetchAudio(args.audio_url);
    const format = detectAudioFormat(buffer, args.audio_url);
    const base64 = buffer.toString('base64');

    // Build content array
    const content: Array<{
      type: string;
      text?: string;
      input_audio?: {
        data: string;
        format: string;
      };
    }> = [];

    // Add fixed transcription instruction
    content.push({
      type: 'text',
      text: 'Please transcribe and provide me the raw content of this audio.'
    });

    // Add audio
    content.push({
      type: 'input_audio',
      input_audio: {
        data: base64,
        format: format
      }
    });

    // Select model
    let model = args.model || defaultModel || DEFAULT_AUDIO_MODEL;
    console.error(`[Audio Tool] Using AUDIO model: ${model}`);

    // Try primary model first
    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [{
          role: 'user',
          content
        }] as any
      });

      const response = completion as any;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: response.id,
              analysis: completion.choices[0].message.content || '',
              model: response.model,
              usage: response.usage
            }),
          },
        ],
      };
    } catch (primaryError: any) {
      // Try backup model
      const backupModel = process.env.OPENROUTER_DEFAULT_MODEL_AUDIO_BACKUP;
      if (backupModel && backupModel !== model) {
        try {
          const completion = await openai.chat.completions.create({
            model: backupModel,
            messages: [{
              role: 'user',
              content
            }] as any
          });

          const resp = completion as any;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  id: resp.id,
                  analysis: completion.choices[0].message.content || '',
                  model: resp.model,
                  usage: resp.usage
                }),
              },
            ],
          };
        } catch (backupError: any) {
          // Try free audio model
          const freeModel = await findSuitableFreeAudioModel(openai);
          if (freeModel && freeModel !== model && freeModel !== backupModel) {
            const completion = await openai.chat.completions.create({
              model: freeModel,
              messages: [{
                role: 'user',
                content
              }] as any
            });

            const resp = completion as any;
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    id: resp.id,
                    analysis: completion.choices[0].message.content || '',
                    model: resp.model,
                    usage: resp.usage
                  }),
                },
              ],
            };
          } else {
            throw backupError;
          }
        }
      } else {
        // No backup, try free model directly
        const freeModel = await findSuitableFreeAudioModel(openai);
        if (freeModel && freeModel !== model) {
          const completion = await openai.chat.completions.create({
            model: freeModel,
            messages: [{
              role: 'user',
              content
            }] as any
          });

          const resp = completion as any;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  id: resp.id,
                  analysis: completion.choices[0].message.content || '',
                  model: resp.model,
                  usage: resp.usage
                }),
              },
            ],
          };
        } else {
          throw primaryError;
        }
      }
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            model: request.params.arguments.model || defaultModel || DEFAULT_AUDIO_MODEL,
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          }),
        },
      ],
      isError: true,
    };
  }
}
