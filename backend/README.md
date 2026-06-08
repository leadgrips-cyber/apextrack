# ApexTrack Backend Architecture Blueprint

This backend folder structure defines the Node.js + Express.js + TypeScript + PostgreSQL architecture for ApexTrack.

## Folder structure

backend/
  src/
    config/
      - Database and environment configuration
    routes/
      - Express router definitions grouping endpoints by resource
    controllers/
      - Request handlers that parse input, call services, and send responses
    services/
      - Business logic layer coordinating data operations and application rules
    repositories/
      - Data access layer for PostgreSQL queries, migrations, and repository interfaces
    models/
      - TypeScript definitions or ORM models for each database entity
    db/
      migrations/
        - Database migration scripts for schema changes
      seeds/
        - Seed data scripts for initial environment setup or development
    middlewares/
      - Express middleware for auth, validation, error handling, and logging
    utils/
      - Shared utility functions, constants, and response helpers
    types/
      - Shared TypeScript types and interface declarations

## Route structure

Routes follow resource boundaries aligned with the database schema.

- `routes/publishers.ts`
- `routes/offers.ts`
- `routes/offerApplications.ts`
- `routes/clicks.ts`
- `routes/conversions.ts`
- `routes/wallets.ts`
- `routes/walletTransactions.ts`
- `routes/postbacks.ts`
- `routes/apiTokens.ts`
- `routes/admins.ts`
- `routes/index.ts`

## Controller structure

Controllers act as the HTTP layer for each resource.

- `controllers/publisher.controller.ts`
- `controllers/offer.controller.ts`
- `controllers/offerApplication.controller.ts`
- `controllers/click.controller.ts`
- `controllers/conversion.controller.ts`
- `controllers/wallet.controller.ts`
- `controllers/walletTransaction.controller.ts`
- `controllers/postback.controller.ts`
- `controllers/apiToken.controller.ts`
- `controllers/admin.controller.ts`

## Service structure

Services encapsulate backend logic and orchestrate repository calls.

- `services/publisher.service.ts`
- `services/offer.service.ts`
- `services/offerApplication.service.ts`
- `services/click.service.ts`
- `services/conversion.service.ts`
- `services/wallet.service.ts`
- `services/walletTransaction.service.ts`
- `services/postback.service.ts`
- `services/apiToken.service.ts`
- `services/admin.service.ts`

## Repository structure

Repositories isolate PostgreSQL data access and can be implemented with raw queries, a query builder, or an ORM.

- `repositories/publisher.repository.ts`
- `repositories/offer.repository.ts`
- `repositories/offerApplication.repository.ts`
- `repositories/click.repository.ts`
- `repositories/conversion.repository.ts`
- `repositories/wallet.repository.ts`
- `repositories/walletTransaction.repository.ts`
- `repositories/postback.repository.ts`
- `repositories/apiToken.repository.ts`
- `repositories/admin.repository.ts`

## Additional files and purpose

- `src/config/`: environment loading, database pool/connection setup, and centralized config values.
- `src/routes/index.ts`: central router mounting all resource routers on `/api`.
- `src/db/migrations/`: versioned migration files to evolve the PostgreSQL schema.
- `src/db/seeds/`: data seeding files for publisher onboarding, sample offers, and admin accounts.
- `src/middlewares/`: middleware for authentication, request validation, error handling, and logging.
- `src/utils/`: helpers for standardized API responses, date formatting, and constants.
- `src/types/`: project-wide TypeScript interfaces, such as request body schemas and repository contracts.

## Notes

- This structure is intentionally backend-only and does not include any UI or admin panel code.
- The architecture maps directly to the existing ApexTrack database schema and supports standard RESTful resource boundaries.
