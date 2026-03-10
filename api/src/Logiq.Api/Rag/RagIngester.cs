using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;
using Logiq.Api.Configuration;
using Logiq.Api.Rag.Abstracts;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Rag;

public sealed class RagIngester(
    IOptions<AzureSearchOptions> options,
    IEmbeddingService embeddingService,
    ILogger<RagIngester> logger) : IRagIngester
{
    private static readonly IReadOnlyList<SearchDocument> SeedDocuments =
    [
        new()
        {
            ["id"] = "hr-1", ["title"] = "1:1 Best Practices",
            ["content"] =
                "Hold regular 1:1s at a consistent time. Start with wellbeing, then goals and blockers. Take notes and follow up on commitments. Avoid cancelling; reschedule if needed. Share agenda in advance so the report can prepare."
        },
        new()
        {
            ["id"] = "hr-2", ["title"] = "Churn Risk Mitigation",
            ["content"] =
                "Early signs of churn include disengagement, fewer voluntary contributions, and withdrawal from collaboration. Mitigate by: timely recognition, career conversations, workload balance, and addressing burnout. Use data from pulse surveys and delivery metrics."
        },
        new()
        {
            ["id"] = "hr-3", ["title"] = "Psychological Safety",
            ["content"] =
                "Psychological safety means people can speak up, ask questions, and admit mistakes without fear. Build it by: modelling vulnerability, thanking people for raising issues, avoiding blame, and running blameless retrospectives. Measure via team surveys."
        },
        new()
        {
            ["id"] = "hr-4", ["title"] = "IDP and Development Goals",
            ["content"] =
                "Individual Development Plans (IDPs) should align with team and company goals. Set 2–4 goals per cycle with clear success criteria. Review progress in 1:1s. Support with learning budget, mentoring, and stretch assignments. Track skills coverage and gaps."
        },
        new()
        {
            ["id"] = "hr-5", ["title"] = "Workload and Burnout",
            ["content"] =
                "Sustained overtime, high meeting load, and declining wellbeing scores indicate burnout risk. Address by: rebalancing assignments, protecting focus time, clarifying priorities, and offering flexibility. Escalate if someone is at risk."
        },
        new()
        {
            ["id"] = "hr-6", ["title"] = "Career Conversations",
            ["content"] =
                "Career conversations help retain talent. Discuss aspirations, growth opportunities, and possible paths (technical, leadership, domain). Link to IDP and internal mobility. Document outcomes and follow up with concrete steps."
        },
        new()
        {
            ["id"] = "hr-7", ["title"] = "Feedback and Recognition",
            ["content"] =
                "Give timely, specific feedback. Recognise effort and results in team settings. Use 360 feedback for development, not performance scoring alone. Balance constructive feedback with recognition to maintain motivation."
        },
        new()
        {
            ["id"] = "hr-8", ["title"] = "Preparing for Difficult Conversations",
            ["content"] =
                "Before a difficult conversation: gather facts, plan what you will say, choose a private setting, and allow time. Listen first. Focus on behaviour and impact, not character. Agree next steps and follow up in writing."
        }
    ];

    public async Task IngestAsync(CancellationToken cancellationToken = default)
    {
        AzureSearchOptions opts = options.Value;
        List<string> missing = [];
        if (string.IsNullOrWhiteSpace(opts.Endpoint)) missing.Add("Endpoint");
        if (string.IsNullOrWhiteSpace(opts.ApiKey)) missing.Add("ApiKey");
        if (string.IsNullOrWhiteSpace(opts.IndexName)) missing.Add("IndexName");
        if (missing.Count > 0)
        {
            logger.LogWarning(
                "Azure AI Search not configured — skipping RAG document ingest. Set Azure:Search:{Missing} (e.g. in appsettings or env). Index will remain at 0 documents until configured.",
                string.Join(", ", missing));
            return;
        }

        try
        {
            SearchIndexClient indexClient = new(new Uri(opts.Endpoint), new AzureKeyCredential(opts.ApiKey));
            string indexName = opts.IndexName;
            bool indexHasVectorField;

            try
            {
                SearchIndex existingIndex =
                    await indexClient.GetIndexAsync(indexName, cancellationToken).ConfigureAwait(false);
                indexHasVectorField = existingIndex.Fields?.Any(f => f.Name == opts.VectorFieldName) ?? false;
                logger.LogInformation("Search index {IndexName} already exists (vector field: {HasVector})", indexName,
                    indexHasVectorField);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                const string vectorProfileName = "default-vector-profile";
                const string vectorConfigName = "default-hnsw-config";
                int dimensions = opts.VectorSearchDimensions > 0 ? opts.VectorSearchDimensions : 1536;
                SearchIndex index = new(indexName)
                {
                    Fields =
                    {
                        new SimpleField("id", SearchFieldDataType.String) {IsKey = true},
                        new SearchableField("title") {IsFilterable = false, IsSortable = false},
                        new SearchableField("content") {IsFilterable = false, IsSortable = false},
                        new VectorSearchField(opts.VectorFieldName, dimensions, vectorProfileName)
                    },
                    VectorSearch = new VectorSearch
                    {
                        Profiles = {new VectorSearchProfile(vectorProfileName, vectorConfigName)},
                        Algorithms = {new HnswAlgorithmConfiguration(vectorConfigName)}
                    }
                };
                await indexClient.CreateIndexAsync(index, cancellationToken).ConfigureAwait(false);
                indexHasVectorField = true;
                logger.LogInformation("Created search index {IndexName} with vector field {VectorField}", indexName,
                    opts.VectorFieldName);
            }

            SearchClient searchClient = new(new Uri(opts.Endpoint), indexName, new AzureKeyCredential(opts.ApiKey));
            IReadOnlyList<SearchDocument> keywordOnlyDocs =
                await BuildDocumentsWithVectorsAsync(SeedDocuments, opts.VectorFieldName, false, cancellationToken)
                    .ConfigureAwait(false);
            IndexDocumentsResult firstResult = await searchClient
                .IndexDocumentsAsync(IndexDocumentsBatch.MergeOrUpload(keywordOnlyDocs),
                    cancellationToken: cancellationToken).ConfigureAwait(false);
            int firstFailed = firstResult.Results.Count(r => !r.Succeeded);
            if (firstFailed > 0)
                logger.LogWarning("Seed document upload: {Succeeded} succeeded, {Failed} failed",
                    firstResult.Results.Count - firstFailed, firstFailed);
            else
                logger.LogInformation("Ensured {Count} seed documents in index {IndexName}", keywordOnlyDocs.Count,
                    indexName);

            if (indexHasVectorField)
            {
                IReadOnlyList<SearchDocument> docsWithVectors =
                    await BuildDocumentsWithVectorsAsync(SeedDocuments, opts.VectorFieldName, true, cancellationToken)
                        .ConfigureAwait(false);
                try
                {
                    IndexDocumentsResult vectorResult = await searchClient
                        .IndexDocumentsAsync(IndexDocumentsBatch.MergeOrUpload(docsWithVectors),
                            cancellationToken: cancellationToken).ConfigureAwait(false);
                    int vFailed = vectorResult.Results.Count(r => !r.Succeeded);
                    if (vFailed == 0)
                        logger.LogInformation("Updated index {IndexName} with vector embeddings", indexName);
                    else
                        logger.LogWarning("Vector merge: {Succeeded} succeeded, {Failed} failed",
                            vectorResult.Results.Count - vFailed, vFailed);
                }
                catch (RequestFailedException ex) when (ex.Status == 400)
                {
                    logger.LogWarning(ex,
                        "Vector merge failed (index may not support vector field); keyword search will still work");
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Search index provisioning failed: {Message}", ex.Message);
        }
    }

    private async Task<IReadOnlyList<SearchDocument>> BuildDocumentsWithVectorsAsync(
        IReadOnlyList<SearchDocument> seedDocs,
        string vectorFieldName,
        bool includeVectorField,
        CancellationToken cancellationToken)
    {
        List<SearchDocument> result = new(seedDocs.Count);
        foreach (SearchDocument doc in seedDocs)
        {
            SearchDocument next = new(doc);
            if (includeVectorField)
            {
                string? title = doc["title"]?.ToString();
                string? content = doc["content"]?.ToString();
                string textToEmbed = string.Concat(title ?? string.Empty, "\n", content ?? string.Empty).Trim();
                if (!string.IsNullOrWhiteSpace(textToEmbed))
                {
                    ReadOnlyMemory<float>? vector = await embeddingService
                        .GetEmbeddingAsync(textToEmbed, cancellationToken).ConfigureAwait(false);
                    if (vector is {IsEmpty: false})
                        next[vectorFieldName] = vector.Value.ToArray();
                }
            }

            result.Add(next);
        }

        return result;
    }
}