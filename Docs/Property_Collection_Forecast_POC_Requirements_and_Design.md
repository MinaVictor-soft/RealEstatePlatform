# Property Collection & Payment Forecast POC

## Requirements and Technical Design

This document describes the implementation currently available in the repository. It separates implemented POC capabilities from future product capabilities.

## 1. Objective

The POC converts contract and payment configuration data into an automatically calculated installment schedule. It then records actual payments and calculates paid amount, outstanding balance, collection percentage, and future collection forecasts.

Core flow:

`Contract -> Payment Configuration -> Installments -> Payments -> Forecast`

## 2. Current POC Scope

### Implemented

- Select customers and units from seeded reference data.
- Create contracts manually with validation.
- Equal installment type.
- Monthly, quarterly, and yearly payment frequencies.
- Down payment entered as a percentage or amount.
- Generate payment schedules.
- View contract details and installments.
- Record payments and allocate them across installments in sequence.
- Calculate total paid, outstanding balance, and collection percentage.
- View contract-level and portfolio-level forecasts.
- Select 3, 6, or 12 months, or enter any custom positive month count.
- Loading, success, empty, and error states.
- English and Arabic languages with LTR/RTL layout support.
- Swagger/OpenAPI endpoint discovery.
- SQLite database for current local and production/demo deployment.
- EF Core migrations and automatic startup seeding.

### Not implemented in the current POC

- Excel import.
- Contract editing after creation.
- Regenerating an existing schedule.
- Detailed monthly time-series data from the API.
- Authentication, authorization, and user roles.
- Customer and unit CRUD screens.
- Notifications, reminders, or audit logging.
- Banking or accounting integrations.

## 3. Main Screens and User Flows

### 3.1 Dashboard

The dashboard displays:

- Total contracts.
- Total contract value.
- Total paid.
- Total outstanding.
- Expected collection for the selected period.
- Projected collected amount.
- Projected collection percentage.
- Contract table with customer, unit, status, financial values, forecast values, details, forecast, and delete actions.

The forecast period supports quick options of 3, 6, and 12 months, plus any custom positive integer.

### 3.2 Create Contract

Inputs:

- Customer.
- Unit.
- Contract date.
- Contract value.
- Down payment percentage or amount.
- Installment type.
- Frequency.
- Number of installments.
- First installment date.

A newly created contract has status `Draft` and no installments.

### 3.3 Contract Details

Displays:

- Customer, unit, and project.
- Contract date and value.
- Payment configuration.
- Calculated down payment amount.
- Total paid.
- Outstanding amount.
- Collection percentage.
- Contract status.

Available actions:

- Generate payment schedule.
- Open installments.
- Record payment.
- Open forecast.
- Return to the dashboard.
- Delete contract.

### 3.4 Installments

Each installment displays:

- Sequence number.
- Due date.
- Expected amount.
- Paid amount.
- Remaining amount.
- Installment status.

### 3.5 Record Payment

Inputs:

- Payment amount.
- Optional payment date.
- Optional reference.

The service allocates the payment to the earliest installments with a remaining balance.

### 3.6 Forecast

Displays:

- Contract value.
- Current total paid.
- Outstanding amount.
- Expected collection for the selected period.
- Projected collected amount: current paid plus expected collection.
- Projected collection percentage.

The period must be a positive integer. The UI provides 3, 6, and 12 month shortcuts and a custom period input.

## 4. Contract and Installment Statuses

### Contract statuses

- `Draft`: The contract exists but its payment schedule has not been generated.
- `Active`: The payment schedule has been generated.
- `Completed`: Reserved for a fully collected contract when the completion rule is applied by business logic.

### Installment statuses

- `Pending`: No amount has been paid.
- `PartiallyPaid`: A payment was recorded, but the installment is not fully paid.
- `Paid`: The installment remaining amount is zero.

## 5. Current Calculation Rules

- Remaining amount after down payment = contract value minus down payment.
- Equal installment amount = remaining amount divided by number of installments.
- Total paid = sum of payments recorded for the contract.
- Outstanding amount = contract value minus total paid.
- Collection percentage = total paid divided by contract value multiplied by 100.
- Expected collection = sum of scheduled installments whose due dates are within the selected forecast period.
- Projected collected = current paid plus expected collection.
- Projected collection percentage = projected collected divided by contract value multiplied by 100.
- Monthly frequency advances installment dates by one month.
- Quarterly frequency advances installment dates by three months.
- Yearly frequency advances installment dates by one year.
- Payment amount must be greater than zero.
- Payment amount cannot exceed the remaining contract amount.
- A payment cannot be recorded before the schedule is generated.
- A second schedule cannot be generated for the same contract.

## 6. Current Architecture

### 6.1 Backend technology

- ASP.NET Core 8.
- REST controllers.
- Application services and abstractions.
- Domain entities and enums.
- Entity Framework Core 8.
- SQLite for current local and production/demo use.
- EF Core migrations.
- Database seeding.
- Swagger/OpenAPI.
- Exception-handling middleware.
- JSON string enum serialization.

### 6.2 Frontend technology

- React 18.
- TypeScript.
- Vite.
- React Router.
- Shared API client.
- Internationalization provider with `en.json` and `ar.json`.
- Shared responsive CSS.
- Loading, error, and success feedback components.

### 6.3 Backend layers

1. **API layer**: controllers, application startup, Swagger, CORS, static files, SPA fallback, and middleware.
2. **Application layer**: request/response DTOs, service interfaces, calculation interface, and domain validation exceptions.
3. **Domain layer**: entities, enums, and core model definitions.
4. **Infrastructure layer**: EF Core DbContext, SQLite registration, migrations, seeding, and `ContractService`.

### 6.4 Request flow

1. A frontend page calls the shared API client.
2. An API controller binds the request and applies request validation.
3. `ContractService` executes the business operation.
4. `ForecastDbContext` reads or persists data through EF Core.
5. `ContractCalculationService` validates configuration and performs calculations.
6. The service maps domain objects to response DTOs.
7. The API returns JSON.
8. Exception middleware converts known errors into client-readable Problem Details responses.

### 6.5 Startup and deployment behavior

- The API applies pending EF Core migrations on startup.
- The database seeder creates required demo customers and units.
- The API registers controllers, services, DbContext, CORS, and Swagger.
- The Replit deployment builds the backend into `dist`.
- The frontend build outputs static assets into `dist/wwwroot`.
- Production runs the published API from `dist` and serves the frontend through ASP.NET Core static files and SPA fallback.
- The SQLite connection uses `Data Source=forecast.db`, so the database file is resolved relative to the running application working directory.

## 7. Database Design

### 7.1 Database provider

The current production/demo database provider is SQLite through EF Core:

```text
Data Source=forecast.db
```

The database is created and migrated automatically when the API starts. The SQLite file is suitable for the current POC and low-traffic deployment. A server database should be considered before multi-instance or high-concurrency production usage.

### 7.2 Customer table/entity

| Field | Type/meaning |
| --- | --- |
| Id | GUID primary key |
| Name | Customer name |
| Phone | Optional phone number |
| Email | Optional email address |
| Contracts | One-to-many relationship to contracts |

### 7.3 Unit table/entity

| Field | Type/meaning |
| --- | --- |
| Id | GUID primary key |
| ProjectName | Project or development name |
| Code | Unit code |
| Contracts | One-to-many relationship to contracts |

### 7.4 Contract table/entity

| Field | Type/meaning |
| --- | --- |
| Id | GUID primary key |
| CustomerId | Required foreign key to Customer |
| UnitId | Required foreign key to Unit |
| ContractDate | Contract date |
| ContractValue | Total contract value |
| DownPaymentPercentage | Optional percentage from 0 to 100 |
| DownPaymentAmount | Optional fixed down payment amount |
| InstallmentType | Currently `Equal` |
| Frequency | `Monthly`, `Quarterly`, or `Yearly` |
| NumberOfInstallments | Positive installment count |
| FirstInstallmentDate | First scheduled due date |
| Status | `Draft`, `Active`, or `Completed` |
| Installments | One-to-many relationship to Installment |
| Payments | One-to-many relationship to Payment |

### 7.5 Installment table/entity

| Field | Type/meaning |
| --- | --- |
| Id | GUID primary key |
| ContractId | Required foreign key to Contract |
| SequenceNumber | Installment order |
| DueDate | Expected payment date |
| ExpectedAmount | Calculated installment amount |
| PaidAmount | Amount allocated to the installment |
| RemainingAmount | Expected amount minus paid amount |
| Status | `Pending`, `PartiallyPaid`, or `Paid` |

### 7.6 Payment table/entity

| Field | Type/meaning |
| --- | --- |
| Id | GUID primary key |
| ContractId | Required foreign key to Contract |
| PaymentDate | Actual payment date |
| Amount | Recorded payment amount |
| Reference | Optional payment reference |

Payments currently relate to installments indirectly. The application service allocates each payment across installments in sequence. There is no separate Payment-to-Installment allocation table in the current POC.

### 7.7 Relationships

- Customer has many Contracts.
- Unit has many Contracts.
- Contract has many Installments.
- Contract has many Payments.
- Payments are allocated to Installments in application logic.

## 8. Current API Design

Base URL:

```text
/api/contracts
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/contracts` | List contracts with customer, unit, and payment totals |
| GET | `/api/contracts/dashboard?months=3` | Portfolio KPIs, contract rows, and forecasts |
| POST | `/api/contracts` | Create a contract |
| GET | `/api/contracts/{id}` | Return contract details and calculated financial values |
| GET | `/api/contracts/{id}/summary` | Return the current contract summary |
| DELETE | `/api/contracts/{id}` | Delete a contract and its related data |
| POST | `/api/contracts/{id}/generate-schedule` | Generate installments from payment configuration |
| GET | `/api/contracts/{id}/installments` | Return the contract payment schedule |
| POST | `/api/contracts/{id}/payments` | Record and allocate an actual payment |
| GET | `/api/contracts/{id}/forecast?months=3` | Return a contract forecast |

The `months` query value must be a positive integer. The value `3` is an example, not a fixed limitation.

There is currently no `/api/import/excel` endpoint.

### 8.1 Create contract request

```json
{
  "customerId": "guid",
  "unitId": "guid",
  "contractDate": "2026-08-18",
  "contractValue": 3600000,
  "downPaymentPercentage": 20,
  "downPaymentAmount": null,
  "installmentType": "Equal",
  "frequency": "Monthly",
  "numberOfInstallments": 24,
  "firstInstallmentDate": "2026-09-01"
}
```

### 8.2 Record payment request

```json
{
  "amount": 120000,
  "paymentDate": "2026-08-18",
  "reference": "PAY-001"
}
```

### 8.3 Forecast response concepts

- `Months`
- `ContractValue`
- `CurrentPaid`
- `ExpectedCollection`
- `ProjectedCollected`
- `Outstanding`
- `ProjectedCollectionPercentage`

## 9. Validation and Error Handling

- Contract value must be greater than zero.
- Number of installments must be greater than zero.
- First installment date is required.
- Down payment percentage must be between 0 and 100.
- Customer and unit must exist.
- Payment amount must be greater than zero.
- Payment amount cannot exceed the remaining contract amount.
- Schedule generation requires no existing schedule and no recorded payments.
- A missing contract returns Not Found.
- Validation failures are returned as Problem Details.
- The frontend exposes loading, error, retry, success, and empty states.

## 10. Configuration and Deployment

### Local development

- Backend project: `Backend/PropertyCollectionForecast.Api`.
- Frontend project: `Frontend`.
- SQLite database: `forecast.db`.
- Frontend development server proxies `/api` to the backend URL.
- `BACKEND_URL` can override the default local backend URL.

### Replit deployment

The `.replit` deployment build performs:

```bash
dotnet publish Backend/PropertyCollectionForecast.Api/PropertyCollectionForecast.Api.csproj -c Release -o dist
cd Frontend
npm ci
npm run build
```

The deployment command runs:

```bash
cd dist
ASPNETCORE_URLS=http://0.0.0.0:5238 dotnet PropertyCollectionForecast.Api.dll
```

The frontend is emitted to `dist/wwwroot`, and ASP.NET Core serves it through static files and fallback routing.

## 11. Testing and Verification

Automated tests cover:

- Contract creation.
- Down payment calculation.
- Schedule generation.
- Monthly, quarterly, and yearly frequencies.
- Paid, outstanding, and collection percentage calculations.
- Partial and complete payments.
- Invalid payment rejection.
- Forecast calculations and custom periods.
- Core contract states.

End-to-end demo verification covers:

- English and Arabic.
- LTR and RTL.
- Dashboard loading and empty state.
- Contract creation.
- Schedule generation.
- Installment table.
- Partial payment.
- Forecast periods 3, 6, 12, and custom periods.
- Contract deletion and test-data cleanup.

## 12. Future Scope

- Excel import with mapping, validation, preview, and import results.
- Milestone and handover payment plans.
- Discounts, grace periods, late fees, and payment penalties.
- OCR or AI contract extraction.
- Full project, building, and unit management.
- CRM, sales, and broker commission management.
- Email and messaging notifications.
- Users, roles, permissions, and audit logging.
- Banking and accounting integrations.
- Advanced reports and monthly time-series charts.
- Migration from SQLite to SQL Server or PostgreSQL for high-concurrency production.

## 13. POC Completion Criteria

- A contract can be created manually.
- A schedule can be generated from payment configuration.
- Monthly, quarterly, and yearly frequencies work.
- Payments can be recorded and allocated.
- Balances and statuses update correctly.
- Forecasts work for quick and custom periods.
- The dashboard shows portfolio collection KPIs.
- English, Arabic, LTR, and RTL work.
- Loading, error, empty, and success states exist.
- The complete demo can be presented in approximately 5 to 10 minutes.

## 14. Product Direction

The current calculation engine provides the foundation for a broader real-estate financial platform. Future versions can add configurable payment milestones, delivery events, discounts, penalties, commissions, integrations, permissions, auditability, and advanced reporting after the client confirms the detailed business rules.
