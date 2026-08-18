# Property Collection Forecast

A real-estate property collection forecast POC. Tracks contracts, installment schedules, payments, and collection forecasts for property units.

## Stack

- **Backend**: ASP.NET Core 8 Web API (clean architecture — Domain / Application / Infrastructure / Api)
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: SQLite (via EF Core 8, auto-migrated on startup)

## Running locally on Replit

Two workflows are configured:

| Workflow | Command | Port |
|----------|---------|------|
| Backend API | `cd Backend && dotnet run --project PropertyCollectionForecast.Api --urls http://0.0.0.0:5238` | 5238 |
| Frontend | `cd Frontend && npm run dev` | 5173 |

Start **Backend API** first — it runs EF Core migrations and seeds demo data on startup.  
The Frontend Vite dev server proxies `/api/*` requests to `http://localhost:5238`.

## API

Swagger UI available at `http://localhost:5238/swagger` when the backend is running.

## Database

SQLite — no external service required.

- **Development**: `forecast.db` is created next to the API project at `Backend/PropertyCollectionForecast.Api/forecast.db`. The path is resolved from `ContentRootPath` at startup so it is predictable regardless of the working directory. Setting configured in `appsettings.json`.
- **Production**: absolute path `/tmp/forecast.db` (always writable in containers). Configured in `appsettings.Production.json`.

In both environments the schema is applied via EF Core migrations and demo seed data (2 customers, 2 units, 1 active contract with 24 monthly installments) is inserted automatically if the database is empty. Deleting or moving the file is safe — the app recreates and reseeds it on the next startup.

## Project structure

```
Backend/
  PropertyCollectionForecast.Api/           # ASP.NET Core entry point
  PropertyCollectionForecast.Application/   # Use cases, DTOs, interfaces
  PropertyCollectionForecast.Domain/        # Entities, enums
  PropertyCollectionForecast.Infrastructure/# EF Core, migrations, seeding, services
  PropertyCollectionForecast.Tests/         # xUnit tests
Frontend/
  src/
    pages/      # Dashboard, Contracts, Forecast, Installments, etc.
    api/        # Typed API client
    i18n/       # Arabic + English translations
Docs/           # Requirements and demo walkthrough
```

## User preferences

- Use free Replit tools only (no paid module upgrades).
