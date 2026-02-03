# Phase 0 Research – NutriPilot MVP

- Decision: Wrap Amplify REST APIs with typed utility functions in `src/api` using `API` and `Auth` modules.
  - Rationale: Keeps network access centralized, enables token refresh/error handling, and simplifies mocking in Jest.
  - Alternatives considered: Calling `fetch` directly (harder to reuse auth headers); using Amplify GraphQL API (overkill vs simple REST endpoints defined in spec).

- Decision: Manage session and profile context with React Context + hooks layered on Amplify Auth state listeners.
  - Rationale: Aligns with Amplify best practices, avoids extra dependencies, and keeps components under constitution limits by centralizing logic.
  - Alternatives considered: Redux Toolkit (extra setup/cost without complex state); zustand (lightweight but duplicates existing Amplify session events).

- Decision: Apply Tailwind CSS utility classes with a small design token map for macro colors.
  - Rationale: Fast iteration for the MVP UI while respecting 2-space formatting; easy to align with provided layout mocks.
  - Alternatives considered: Styled Components (adds runtime cost); plain CSS modules (slower to iterate, less consistent styling).

- Decision: Implement DynamoDB access in Lambdas with `@aws-sdk/lib-dynamodb` DocumentClient wrappers per entity.
  - Rationale: Simplifies marshaling, enables typed access patterns, and matches single-table design references in spec.
  - Alternatives considered: Raw `@aws-sdk/client-dynamodb` (more boilerplate); using Amplify DataStore (not ideal for server-managed flows).

- Decision: Integrate OpenAI GPT-4o-mini via REST call inside `analyzeMeal` Lambda with retry+timeout guard.
  - Rationale: Keeps sensitive API key in Secrets Manager, enforces 10s timeout, and supports deterministic testing via mocked OpenAI client.
  - Alternatives considered: Streaming responses (unneeded for short summaries); client-side invocation (would expose key).

- Decision: Use Jest with React Testing Library and AWS SDK v3 mocks for Lambda tests to maintain ≥80% coverage.
  - Rationale: Matches repo tooling, offers component-level confidence, and allows deterministic AWS interactions.
  - Alternatives considered: Cypress E2E (valuable later but slower for MVP); Vitest (faster but deviates from existing setup).
