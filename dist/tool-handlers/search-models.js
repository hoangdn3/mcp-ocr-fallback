export async function handleSearchModels(request, apiClient, modelCache) {
    const args = request.params.arguments;
    try {
        // Refresh the cache if needed
        if (!modelCache.isCacheValid()) {
            const models = await apiClient.getModels();
            modelCache.setModels(models);
        }
        // Search models based on criteria
        const results = modelCache.searchModels({
            query: args.query,
            provider: args.provider,
            minContextLength: args.minContextLength,
            maxContextLength: args.maxContextLength,
            maxPromptPrice: args.maxPromptPrice,
            maxCompletionPrice: args.maxCompletionPrice,
            capabilities: args.capabilities,
            limit: args.limit || 10,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(results, null, 2),
                },
            ],
        };
    }
    catch (error) {
        if (error instanceof Error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error searching models: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
        throw error;
    }
}
//# sourceMappingURL=search-models.js.map