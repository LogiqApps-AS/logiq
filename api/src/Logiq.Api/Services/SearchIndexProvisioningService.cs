using Azure;
using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;
using Logiq.Api.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Logiq.Api.Services;

public interface ISearchIndexProvisioningService
{
    Task ProvisionAsync(CancellationToken cancellationToken = default);
}

public sealed class SearchIndexProvisioningService(
    IOptions<AzureSearchOptions> options,
    ILogger<SearchIndexProvisioningService> logger) : ISearchIndexProvisioningService
{
    private static readonly IReadOnlyList<SearchDocument> SeedDocuments =
    [
        new SearchDocument { ["id"] = "hr-1", ["title"] = "1:1 Best Practices", ["content"] = "Hold regular 1:1s at a consistent time. Start with wellbeing, then goals and blockers. Take notes and follow up on commitments. Avoid cancelling; reschedule if needed. Share agenda in advance so the report can prepare." },
        new SearchDocument { ["id"] = "hr-2", ["title"] = "Churn Risk Mitigation", ["content"] = "Early signs of churn include disengagement, fewer voluntary contributions, and withdrawal from collaboration. Mitigate by: timely recognition, career conversations, workload balance, and addressing burnout. Use data from pulse surveys and delivery metrics." },
        new SearchDocument { ["id"] = "hr-3", ["title"] = "Psychological Safety", ["content"] = "Psychological safety means people can speak up, ask questions, and admit mistakes without fear. Build it by: modelling vulnerability, thanking people for raising issues, avoiding blame, and running blameless retrospectives. Measure via team surveys." },
        new SearchDocument { ["id"] = "hr-4", ["title"] = "IDP and Development Goals", ["content"] = "Individual Development Plans (IDPs) should align with team and company goals. Set 2–4 goals per cycle with clear success criteria. Review progress in 1:1s. Support with learning budget, mentoring, and stretch assignments. Track skills coverage and gaps." },
        new SearchDocument { ["id"] = "hr-5", ["title"] = "Workload and Burnout", ["content"] = "Sustained overtime, high meeting load, and declining wellbeing scores indicate burnout risk. Address by: rebalancing assignments, protecting focus time, clarifying priorities, and offering flexibility. Escalate if someone is at risk." },
        new SearchDocument { ["id"] = "hr-6", ["title"] = "Career Conversations", ["content"] = "Career conversations help retain talent. Discuss aspirations, growth opportunities, and possible paths (technical, leadership, domain). Link to IDP and internal mobility. Document outcomes and follow up with concrete steps." },
        new SearchDocument { ["id"] = "hr-7", ["title"] = "Feedback and Recognition", ["content"] = "Give timely, specific feedback. Recognise effort and results in team settings. Use 360 feedback for development, not performance scoring alone. Balance constructive feedback with recognition to maintain motivation." },
        new SearchDocument { ["id"] = "hr-8", ["title"] = "Preparing for Difficult Conversations", ["content"] = "Before a difficult conversation: gather facts, plan what you will say, choose a private setting, and allow time. Listen first. Focus on behaviour and impact, not character. Agree next steps and follow up in writing." }
    ];

    public async Task ProvisionAsync(CancellationToken cancellationToken = default)
    {
        var opts = options.Value;
        if (string.IsNullOrEmpty(opts.Endpoint) || string.IsNullOrEmpty(opts.ApiKey) || string.IsNullOrEmpty(opts.IndexName))
        {
            logger.LogInformation("Azure AI Search not configured — skipping index provisioning");
            return;
        }

        try
        {
            var indexClient = new SearchIndexClient(new Uri(opts.Endpoint), new Azure.AzureKeyCredential(opts.ApiKey));
            var indexName = opts.IndexName;

            try
            {
                await indexClient.GetIndexAsync(indexName, cancellationToken).ConfigureAwait(false);
                logger.LogInformation("Search index {IndexName} already exists", indexName);
            }
            catch (RequestFailedException ex) when (ex.Status == 404)
            {
                var index = new SearchIndex(indexName)
                {
                    Fields =
                    {
                        new SimpleField("id", SearchFieldDataType.String) { IsKey = true },
                        new SearchableField("title") { IsFilterable = false, IsSortable = false },
                        new SearchableField("content") { IsFilterable = false, IsSortable = false }
                    }
                };
                await indexClient.CreateIndexAsync(index, cancellationToken).ConfigureAwait(false);
                logger.LogInformation("Created search index {IndexName}", indexName);
            }

            var searchClient = new SearchClient(new Uri(opts.Endpoint), indexName, new Azure.AzureKeyCredential(opts.ApiKey));
            await searchClient.IndexDocumentsAsync(IndexDocumentsBatch.MergeOrUpload(SeedDocuments), cancellationToken: cancellationToken).ConfigureAwait(false);
            logger.LogInformation("Ensured {Count} seed documents in index {IndexName} (merge-or-upload)", SeedDocuments.Count, indexName);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Search index provisioning failed");
        }
    }
}
