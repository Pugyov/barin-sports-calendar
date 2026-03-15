# E2E Test Scenarios

Manual or Playwright scenarios to validate after environment setup:

1. Sign in with a viewer account and verify `/calendar` and `/pipeline` are readable, `/import` is read-only.
2. Sign in with editor/admin and create a task in `/pipeline`; verify it appears in `/calendar` on START/DUE/PUB dates.
3. Upload `Marketing Calendar 2026.xlsx` in dry-run mode and verify result counts + no writes.
4. Upload the same workbook in commit mode and verify idempotent upsert by `Task ID`.
5. Edit and delete a task from `/pipeline` and confirm both pages update.
