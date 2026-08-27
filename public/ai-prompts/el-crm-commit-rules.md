# Ezzy Free CRM - Git Commit and Push Rules

These are the rules, methods, and formats required for all version control operations in this project. All AI coding assistants and developers must adhere to these policies.

---

## 1. Commit Policy
* **Do Not Commit Unless Explicitly Instructed**: Never perform a git commit or push unless the user explicitly requests it in the task prompt.
* **Commit Message Format**: 
  * Commit messages should be clear, descriptive, and accurately summarize the changes made.
  * For final deployment/release branches (e.g., `final-version`), the commit message must **start with the version number** in the format: `vX.Y.Z - [Description]`.
    * *Example:* `v1.0.10 - Bump version and add interactive quality and page links`

---

## 2. Branch Architecture and Flow
We maintain three primary branches:
1. `new-features` (Active development branch)
2. `main` (Staging/integration branch)
3. `final-version` (Production release branch)

### Workflow Steps:
When asked to commit and push all branches:
1. Stage and commit changes on the active development branch (`new-features`).
2. Switch to `main`, merge `new-features`, and push.
3. Switch to `final-version`, merge `main`, and push.
4. Return to `new-features` to continue active development.

---

## 3. Version Bump Procedure
When requested to increment the site version by `v0.0.1`:
1. Increment the version number in `package.json` (under `"version"`).
2. Increment `APP_VERSION` in `public/site-hf/version.js`.
3. Update the HTML version comment in `public/index.html` (e.g., `<!--  pvt local ezzy crm - v X.Y.Z -->`).
4. Update hardcoded fallback versions in other major dashboard views (like footer / sub-indices) to ensure consistency before the dynamic script mounts.
