using System.Text.Json;
using System.Text.Json.Serialization;
using Logiq.Api;
using Logiq.Api.Agents;
using Logiq.Api.Agents.Abstracts;
using Logiq.Api.Configuration;
using Logiq.Api.Mcp;
using Logiq.Api.Rag;
using Logiq.Api.Rag.Abstracts;
using Logiq.Api.Storage.Repositories;
using Logiq.Api.Storage.Repositories.Abstracts;
using Scalar.AspNetCore;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddOpenApi();
builder.Services.Configure<AzureOpenAiOptions>(builder.Configuration.GetSection("Azure:OpenAI"));
builder.Services.Configure<AzureSearchOptions>(builder.Configuration.GetSection("Azure:Search"));
builder.Services.Configure<StorageOptions>(builder.Configuration.GetSection("Azure:Storage"));

string[] corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()));

builder.Services.AddSingleton<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddSingleton<ISignalRepository, SignalRepository>();
builder.Services.AddSingleton<IMeetingRepository, MeetingRepository>();
builder.Services.AddSingleton<ITeamKpiRepository, TeamKpiRepository>();
builder.Services.AddSingleton<IMemberRepository, MemberRepository>();

builder.Services.AddScoped<HrDataGatewayTools>();
builder.Services.AddScoped<DeliveryMetricsTools>();
builder.Services.AddScoped<LearningSkillsTools>();
builder.Services.AddScoped<WellbeingSignalsTools>();

builder.Services.AddScoped<IAgentKernelFactory, AgentKernelFactory>();
builder.Services.AddScoped<IWellbeingRiskAnalyzer, WellbeingRiskAnalyzer>();
builder.Services.AddScoped<ISkillsGrowthAnalyzer, SkillsGrowthAnalyzer>();
builder.Services.AddScoped<IDeliveryWorkloadAnalyzer, DeliveryWorkloadAnalyzer>();
builder.Services.AddScoped<IConversationPrepAgent, ConversationPrepAgent>();
builder.Services.AddScoped<IPeoplePartnerCopilot, PeoplePartnerCopilot>();
builder.Services.AddScoped<IDevelopmentCoach, DevelopmentCoach>();
builder.Services.AddScoped<IAnalyzerOrchestrator, AnalyzerOrchestrator>();

builder.Services.AddSingleton<DataSeeder>();
builder.Services.AddSingleton<IEmbeddingService, EmbeddingService>();
builder.Services.AddSingleton<IRagRetriever, RagRetriever>();
builder.Services.AddSingleton<IRagIngester, RagIngester>();

builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<HrDataGatewayTools>()
    .WithTools<DeliveryMetricsTools>()
    .WithTools<LearningSkillsTools>()
    .WithTools<WellbeingSignalsTools>();

WebApplication app = builder.Build();

app.MapOpenApi();
app.MapScalarApiReference();
app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();
app.MapMcp("/mcp");

using (IServiceScope scope = app.Services.CreateScope())
{
    DataSeeder seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    await seeder.SeedIfEmptyAsync();
    IRagIngester searchProvisioning = scope.ServiceProvider.GetRequiredService<IRagIngester>();
    await searchProvisioning.IngestAsync();
}

app.Run();