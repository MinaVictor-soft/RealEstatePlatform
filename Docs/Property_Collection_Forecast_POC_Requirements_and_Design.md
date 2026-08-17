Property Collection & Payment Forecast POC

Requirements & Technical Design — Client Demo

Focused POC: Contract → Configurable Payment Plan → Installments → Payments → Collection Forecast

## 1. POC Objective

The purpose of this POC is to demonstrate a focused solution to the client's core collection-management problem: turning contract and payment-plan information into an automatically calculated installment schedule, tracking actual payments, and forecasting how much will be collected over the next 1, 3, 6, or 12 months.

The POC is intentionally limited in scope. It is a convincing business demonstration, not the full property-management product.

## 2. Business Problem

- Contracts contain payment obligations that must be tracked over time.
- Management needs to know what is due in a given month and what is expected to be collected in future periods.
- Actual payments need to be compared with scheduled amounts.
- The system should calculate outstanding balances and collection percentages automatically.
- Different contracts may use different payment configurations; the calculation should not depend on hard-coded installment amounts.
## 3. POC Scope

## 4. Client Contract Reference

The supplied contract shows a payment schedule containing a down-payment amount followed by periodic installments and a later payment. For example, the visible schedule includes a 1,000,000 EGP down payment, recurring 147,121 EGP quarterly installments, and a 372,660 EGP later payment. The contract also contains clauses related to payment deadlines and consequences of delayed payment.

This contract is used as a real-world reference for the POC's payment-schedule concept. The exact business rules should be confirmed with the client before production implementation.

## 5. Main User Journey

1. Open the dashboard and see the overall collection position.

2. Open a contract and review contract value, paid amount, outstanding amount and collection percentage.

3. Review the generated payment schedule.

4. Record an actual payment.

5. The system recalculates paid, remaining and collection percentage.

6. Open Forecast and choose 1, 3, 6 or 12 months.

7. The system calculates expected future collections from the scheduled installments.

## 6. Core Screens

### 6.1 Dashboard

- Total Contract Value
- Total Collected
- Total Outstanding
- Expected This Month
- Expected Next 3 Months
- Overall Collection %
- Monthly Expected Collection chart
### 6.2 Contracts

A simple list containing:

- Customer
- Unit
- Contract Value
- Paid
- Outstanding
- Collection %
- Status
### 6.3 Contract Details

- Customer and unit information
- Contract date and contract value
- Current paid amount
- Outstanding amount
- Collection percentage
- Payment configuration
- Payment schedule
- Actual payments
### 6.4 Create Contract

- Customer
- Project
- Unit
- Contract Date
- Contract Value
- Down Payment
- Installment Type
- Frequency
- Number of Installments
- First Installment Date
### 6.5 Forecast

Forecast period options: Next Month, Next 3 Months, Next 6 Months, Next 12 Months.

- Expected Collection
- Projected Collected
- Outstanding
- Projected Collection %
- Monthly forecast chart
## 7. Generic Payment Configuration

The POC must calculate installments from configuration. Installment amounts must not be hard-coded.

Example:

- Contract Value = 3,600,000 EGP
- Down Payment = 20%
- Installment Type = Equal
- Frequency = Monthly
- Number of Installments = 24
- Start Date = 01/09/2026
The engine calculates the down payment, remaining balance, installment amount and due dates, then generates the schedule.

## 8. Calculation Rules

Important: the production version should support more complex plans such as milestone-based payments, quarterly payments, handover payments, discounts and other client-specific rules. Those are intentionally not required for the first POC.

## 9. Core Data Model

## 10. Backend Design

Recommended stack: ASP.NET Core 8 + EF Core + PostgreSQL + REST APIs + Swagger.

Simple POC architecture:

- API Layer
- Application Layer
- Domain Layer
- Infrastructure / Persistence
Avoid unnecessary complexity for the POC: no full CQRS/MediatR/DDD implementation is required unless it becomes useful for a specific calculation or extension.

## 11. Key API Endpoints

## 12. Excel Import — POC Approach

For the first demo, the import can target the client's current Excel structure rather than building a full generic mapping engine.

- Upload Excel
- Validate required columns
- Preview records
- Import supported records
- Show imported contracts on the dashboard
The supplied workbook was available, but its indexed content was not readable in the file extraction layer; therefore no unverified Excel column names are assumed in this document. The contract PDF is the current verified source for the example payment schedule.

## 13. Frontend Technology

Recommended: Angular with a simple component-based UI and a chart library. The POC should prioritize clarity and demo flow over visual complexity.

## 14. Demo Story

1. Start with the client's imported contract data.
1. Open a contract and show its financial position.
1. Show how the payment configuration generates the schedule.
1. Record a payment and show the live balance update.
1. Open Forecast and select Next 3 Months.
1. Show the expected collection figure and monthly chart.
1. Change the payment configuration and regenerate the schedule to demonstrate that the system is configurable rather than hard-coded.
## 15. Out of Scope for This POC

- Full property/land/building management
- Construction cost management
- Iron/steel/material cost tracking
- Broker commission management
- Full sales workflow
- CRM
- Contract OCR / AI extraction
- Notifications and reminders
- Advanced role/permission management
- Bank integration
- Production-grade multi-tenant architecture
## 16. Future Product Direction

The POC should be implemented so that the calculation concept can later expand into a generic property financial platform. Future configuration may cover different payment frequencies, milestone payments, handover percentages, discounts, grace periods, broker commissions, project costs and other configurable business rules.

## 17. Definition of Done for the POC

- Client Excel data can be loaded into the demo.
- A contract can be created manually.
- Payment configuration generates a schedule.
- Actual payments can be recorded.
- Paid and outstanding amounts update correctly.
- Forecast can be viewed for 1/3/6/12 months.
- Dashboard shows portfolio collection KPIs.
- The demo is published and accessible through a shareable URL.
- The complete demo can be presented in approximately 5–10 minutes.
## 18. Recommended Implementation Sequence

1. Create ASP.NET Core solution and database model.

2. Implement Payment Configuration and Calculation Engine.

3. Generate Installment Schedule.

4. Implement Payments and balance calculations.

5. Implement Forecast APIs.

6. Build Angular Contract and Schedule screens.

7. Build Forecast and Dashboard screens.

8. Add simplified Excel import.

9. Seed the demo with client-relevant data.

10. Publish the POC for the client.

POC principle: Keep it simple, demonstrate real client value, and make the payment calculation configurable.


| Area | Included | Purpose |
| --- | --- | --- |
| Dashboard | Yes | Portfolio-level collection overview and monthly forecast |
| Contracts | Yes | View contracts and open contract details |
| Manual Contract | Yes | Create a new contract with configurable payment terms |
| Payment Configuration | Yes | Generate installments from rules, not fixed amounts |
| Payment Schedule | Yes | Show expected, paid, remaining and status |
| Actual Payments | Yes | Record payments and update balances |
| Forecast | Yes | Estimate collections for 1/3/6/12 months |
| Excel Import | Yes — simplified | Load the client's available data for the demo |
| Contract PDF OCR/AI extraction | No | Potential future enhancement |
| Full CRM / Broker / Construction Cost modules | No | Outside this focused POC |


| Rule | Formula |
| --- | --- |
| Remaining after down payment | Contract Value − Down Payment |
| Equal installment | Remaining Amount ÷ Number of Installments |
| Paid amount | Sum of recorded payments allocated to the contract/installment |
| Outstanding | Contract Value − Total Paid |
| Collection % | (Total Paid ÷ Contract Value) × 100 |
| Expected collection for a period | Sum of scheduled installment amounts whose due dates fall inside the selected period |
| Projected collected | Current Paid + Expected Future Collection |
| Projected collection % | (Projected Collected ÷ Contract Value) × 100 |


| Entity | Key Fields | Relationship | Purpose |
| --- | --- | --- | --- |
| Customer | Id, Name, Phone, Email | Has many Contracts | Customer identity |
| Unit | Id, Project, Code, Area, Price, Status | Has many Contracts over time | Sold property unit |
| Contract | Id, CustomerId, UnitId, Date, TotalValue, Status, Payment Configuration | Belongs to Customer and Unit | Commercial agreement |
| Installment | Id, ContractId, DueDate, ExpectedAmount, PaidAmount, Status | Belongs to Contract | Expected payment obligation |
| Payment | Id, ContractId, PaymentDate, Amount, Type, Reference | Belongs to Contract | Actual collection |


| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/contracts | List contracts |
| GET | /api/contracts/{id} | Get contract details |
| POST | /api/contracts | Create contract |
| POST | /api/contracts/{id}/generate-schedule | Generate installments from configuration |
| GET | /api/contracts/{id}/installments | Get payment schedule |
| POST | /api/contracts/{id}/payments | Record actual payment |
| GET | /api/contracts/{id}/summary | Get financial summary |
| GET | /api/contracts/{id}/forecast?months=3 | Get collection forecast |
| POST | /api/import/excel | Simplified client-data import |
