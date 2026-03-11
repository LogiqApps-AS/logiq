FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Logiq.Api.sln .
COPY src/Logiq.Api/Logiq.Api.csproj src/Logiq.Api/

RUN dotnet restore src/Logiq.Api/Logiq.Api.csproj

COPY src/ src/

WORKDIR /src/src/Logiq.Api
RUN dotnet publish Logiq.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN groupadd -r logiq && useradd -r -g logiq logiq

COPY --from=build /app/publish .

RUN chown -R logiq:logiq /app

USER logiq

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Logiq.Api.dll"]
