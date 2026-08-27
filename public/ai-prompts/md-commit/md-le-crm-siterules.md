# Ezzy Free CRM - AI Assistant Site Rules

This document outlines the strict operational rules and guidelines for the AI Assistant when working on the local Ezzy Free CRM codebase.

## 1. Git & Version Control Rules
- **No Unprompted Commits:** DO NOT perform any `git commit`, `git push`, or `git branch` operations unless explicitly instructed by the user.
- **Commit Format:** When instructed to commit, always provide a clear, concise commit message explaining what was fixed or added.
- **Branching:** Ensure you are working on the correct branch. Push to all branches only when specifically instructed (`git push --all origin`).

## 2. Version Increment System
- When instructed to "increment site version", you must update the version number by exactly `0.0.1` (unless otherwise specified).
- The version number must be kept fully synchronized and updated in the following key locations:
  1. **`package.json`** -> `"version": "x.x.x"`
  2. **`public/site-hf/version.js`** -> `const APP_VERSION = "x.x.x";`
  3. **`public/index.html`** -> Comment on line 4: `<!--  pvt local ezzy crm - v x.x.x -->`
  4. **Sub-directory dashboard index & details HTML files** -> The static version placeholder inside the footer tag: `<span class="appVersionDisplay">x.x.x</span>` (e.g., in `/view-db-person/index.html`, `/view-db-leads/index.html`, `/view-db-company/index.html`, `/view-db-company/company-details.html`)
- Always verify the current version in these files before incrementing to avoid accidental downgrades or skips.

## 3. Code Modification Rules
- **Preserve Unrelated Code:** Never remove existing functionality, comments, UI elements, or logic unless specifically asked by the user.
- **Paths & Imports:** Ensure all script and CSS link paths are accurate relative to the current file location. The CRM uses modularized directories (e.g., `/view-db-leads/`, `/auto-reply/`), so relative paths (like `../` or `../../`) must be carefully tracked.
- **Tool Usage:** Always use native file editing tools to replace or append code.

## 4. Design & Layout Standards
- **Unified UI:** Maintain the standard layout utilizing the existing global Sidebar, Top-Bar, and CSS variables (e.g., `--primary-color`, `--bg-main`, `--text-muted`).
- **Typography:** Ensure new elements use the existing UI typography (e.g., Google Fonts like `Outfit`).
- **Data Persistence:** Respect the `local-data` JSON structures. When reading or writing mock data, ensure it aligns with the existing schema.
