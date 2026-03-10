# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Logiq.Api.sln .
COPY src/Logiq.Api/Logiq.Api.csproj src/Logiq.Api/

# Restore dependencies
RUN dotnet restore src/Logiq.Api/Logiq.Api.csproj

# Copy source code
COPY src/ src/

# Build and publish
WORKDIR /src/src/Logiq.Api
RUN dotnet publish Logiq.Api.csproj -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r logiq && useradd -r -g logiq logiq

# Copy published app from build stage
COPY --from=build /app/publish .

# Set ownership
RUN chown -R logiq:logiq /app

# Switch to non-root user
USER logiq

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Entry point
ENTRYPOINT ["dotnet", "Logiq.Api.dll"]
