# Lavora Firebase Rules test harness

This folder contains a **starter draft**, not production-approved Security Rules. The bundled `database.rules.json` pins the only admin to the placeholder UID `REPLACE_WITH_REAL_ADMIN_UID`. Replace that value only in a deployment copy after verifying the real Firebase Authentication UID, and make deployment fail if the placeholder remains.

## Requirements

- Node.js version supported by the installed Firebase CLI
- Java runtime supported by the Realtime Database Emulator
- npm network access to install dev dependencies

## Run

```bash
npm install
npm run test:rules
```

The script starts only the Realtime Database Emulator and runs the tests against it. Tests seed fixture data with Security Rules disabled, then perform authenticated/unauthenticated reads and writes.

If testing a copy of the rules where the placeholder was deliberately replaced, set `LAVORA_ADMIN_UID` to the same verified UID before running the suite. For the bundled default placeholder rules, do not set this variable.

## Important limitations

- The test suite is a starter regression suite; it has **not been executed successfully in the authoring environment** because installing dependencies timed out. JSON and JavaScript syntax checks are not equivalent to an emulator pass.
- Passing this suite does not prove the HTML integration, Google OAuth setup, migration, IndexedDB durability, Base64 compression, or multi-device synchronization work end to end.
- Align every path and required field with the final application schema before deployment. Staff/customer-readable records are deliberately allowlisted; the app must map the legacy schema instead of writing the old project object wholesale.
- Do not deploy the placeholder admin UID or use these rules against real project data before Emulator validation and code review.
- Append-only client-written `audit` data is useful for troubleshooting but is not tamper-proof authoritative auditing. Strong abuse controls, authoritative auditing or code-redemption services may require a trusted backend; assess plan and billing requirements first.
