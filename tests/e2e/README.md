# E2E Test Scenarios

Manual or Playwright scenarios to validate after environment setup:

1. Sign in with a viewer account and verify `/calendar` and `/pipeline` are readable.
2. Sign in with editor/admin and create a task in `/pipeline`; verify it appears in `/calendar` on START/DUE/PUB dates.
3. Edit and delete a task from `/pipeline` and confirm both pages update.
4. Sign in with an admin account and verify `/admin/task-types` can create task types and blocks deletion while a type is still assigned.
5. Sign in with an admin account and verify `/admin/users` can approve pending users and edit access state.
