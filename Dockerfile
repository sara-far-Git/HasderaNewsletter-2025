# ---------- BUILD STAGE ----------
    FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
    WORKDIR /src
    
    # Copy only the API project files first
    COPY HasderaApi/*.csproj HasderaApi/
    
    # Restore dependencies
    RUN dotnet restore HasderaApi/HasderaApi.csproj
    
    # Copy full API source code
    COPY HasderaApi/ HasderaApi/
    
    # Publish
    RUN dotnet publish HasderaApi/HasderaApi.csproj -c Release -o /app/publish
    
    
    # ---------- RUNTIME STAGE ----------
    FROM mcr.microsoft.com/dotnet/aspnet:8.0
    WORKDIR /app
    
    # Copy published files
    COPY --from=build /app/publish .
    
    # Render sets $PORT automatically
    ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
    
    # Default PORT for local runs
    ENV PORT=8080
    
    EXPOSE 8080
    
    ENTRYPOINT ["dotnet", "HasderaApi.dll"]
    