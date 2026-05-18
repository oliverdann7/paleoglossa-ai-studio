# Claude AI Task Prompt - Phase 2: Branch Cleanup & Protection Rules
## 🎯 Priority: HIGH (Do After Phase 1)
**Estimated Time:** 45-60 minutes

---

## Overview
This phase focuses on cleaning up stale branches, setting up branch protection rules, and establishing a clean development workflow.

---

## Task 1: Delete Stale Branches

### Context
- **Current Branch Count:** 31 branches (way too many!)
- **Goal:** Reduce to 5-8 active branches
- **Timeline:** Branches older than 2 weeks without activity should be deleted

### Branches to Keep (Definitely Active)

These branches appear recent or actively worked on:
```
✅ main                                    (default branch - NEVER DELETE)
✅ feat/central-language-registry         (recent activity)
✅ feat/corpus-expansion-classical        (recent activity)
✅ feat/grammar-atlas-and-courses-progress (recent activity)
✅ feat/industrial-import-pipeline        (recent activity)
✅ fix/api-esm-prod-500s                  (fix branch - likely important)
✅ integration/pending-features           (integration branch)
```

### Branches to Delete (Experimental/Stale)

Delete these Claude AI-generated experimental branches (they're named with random adjectives):
```
❌ claude/angry-black-93c714
❌ claude/angry-lamarr-2e920f
❌ claude/competent-mestorf-38a084
❌ claude/fix-lessons-sentences-error-CRMsD
❌ claude/fix-reader-i18n-settings-word-analysis
❌ claude/flamboyant-lamport-5a258b
❌ claude/focused-germain-29c0af
❌ claude/interesting-antonelli-8a8851
❌ claude/sweet-gates-2e5a65
❌ claude/upbeat-edison-31156c
```

### Other Branches to Evaluate & Delete

```
❌ chatgpt/apply-master-blueprint         (experimental, no recent commits)
❌ chore/dependency-security-audit       (completed? verify then delete)
❌ cleanup-demo-modules                   (demo cleanup, likely done)
❌ feat/cherry-pick-perf-branch           (cherry-pick branches should be temporary)
❌ feat/dictionary-gloss-fallback         (check if merged, else delete)
❌ feat/grammar-reference-service        (check if merged, else delete)
❌ feat/john-1-corpus                     (check if merged, else delete)
❌ feat/polish-and-feature-flags          (check if merged, else delete)
❌ feat/premium-app-states                (check if merged, else delete)
❌ feat/research-notebook-foundation      (check if merged, else delete)
❌ feat/social-community-directory        (check if merged, else delete)
❌ fix/john-translation-license           (check if merged, else delete)
❌ fix/portuguese-i18n-coverage           (check if merged, else delete)
```

### Your Checklist

- [ ] **Review each branch**
  - [ ] Use GitHub UI to check last commit date
  - [ ] Check if PR was merged or abandoned
  - [ ] Verify no active work on the branch

- [ ] **Delete via GitHub UI** (safest method)
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/branches
  - [ ] For each branch to delete:
    - [ ] Click "Delete" button (trash icon)
    - [ ] Confirm deletion
  - [ ] Screenshot final branch list when done

- [ ] **Alternative: Delete via Git CLI** (if you prefer)
  ```bash
  # Local deletion (does not affect GitHub)
  git branch -d branch-name
  
  # Remote deletion (deletes from GitHub)
  git push origin --delete branch-name
  
  # Delete multiple at once
  git push origin --delete claude/angry-black-93c714 claude/angry-lamarr-2e920f claude/competent-mestorf-38a084
  ```

- [ ] **Verify final state**
  - [ ] Should have ~5-8 branches remaining
  - [ ] All remaining branches have clear purpose
  - [ ] No random/experimental branches left

---

## Task 2: Set Up Branch Protection on Main

### Goal
Protect the `main` branch from accidental/bad commits. This ensures quality standards.

### Your Checklist

- [ ] **Navigate to branch protection settings**
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings/branches
  - [ ] Click "Add rule"

- [ ] **Create protection rule for `main`**
  - [ ] Pattern: `main`
  - [ ] ✅ Enable: **"Require a pull request before merging"**
    - [ ] Required approving reviews: `1` (you can approve your own if solo, or adjust when team grows)
    - [ ] ☑️ "Dismiss stale pull request approvals when new commits are pushed"
    - [ ] ☑️ "Require review from code owners" (optional for solo dev)
  
  - [ ] ✅ Enable: **"Require status checks to pass before merging"**
    - [ ] ☑️ "Require branches to be up to date before merging"
    - [ ] Status checks required (we'll add these in Phase 3):
      - [ ] `build` (TypeScript check)
      - [ ] `lint` (ESLint check)
      - [ ] `test` (Jest tests)
    - [ ] ⚠️ Don't require status checks yet — we'll enable in Phase 3 after CI is set up
  
  - [ ] ✅ Enable: **"Include administrators"**
    - [ ] ☑️ This applies rules to everyone (including repo owner)
  
  - [ ] ✅ Enable: **"Restrict who can push to matching branches"**
    - [ ] Allow: `oliverdann7` (you)
  
  - [ ] ✅ Enable: **"Dismiss stale pull request approvals"**
    - [ ] Automatically dismiss when new commits are pushed
  
  - [ ] ✅ Enable: **"Require signed commits"**
    - [ ] ☑️ Optional but recommended for security
  
  - [ ] ✅ Enable: **"Require a successful deployment review"**
    - [ ] ☑️ Optional — enable if you have staging environment
  
  - [ ] **Optional: Add auto-delete rules**
    - [ ] ☑️ "Automatically delete head branches" (deletes PR branches after merge)

- [ ] **Save the rule**
  - [ ] Click "Create" button
  - [ ] Verify rule appears in the branches list

### Visual Check
- [ ] Go back to https://github.com/oliverdann7/paleoglossa-ai-studio/branches
- [ ] You should see a yellow/orange indicator on `main` branch saying it's protected
- [ ] Hover over it to see the protection rules

---

## Task 3: Configure Default Merge Strategy

### Goal
Ensure clean commit history by enforcing squash merges for PR branches.

### Your Checklist

- [ ] **Navigate to repository settings**
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings
  - [ ] Scroll to "Pull Requests" section

- [ ] **Set default merge strategy**
  - [ ] Current settings from API response:
    ```
    allow_merge_commit: true         (allow linear history)
    allow_rebase_merge: true         (allow rebase merges)
    allow_squash_merge: true         (allow squash merges)
    delete_branch_on_merge: false    (keep branches after merge)
    ```
  - [ ] ✅ Keep all merge types allowed (flexibility is good)
  - [ ] ✅ Enable: "Automatically delete head branches"
    - [ ] ☑️ Deletes feature branch after PR is merged
  - [ ] ✅ Set "Default merge method" to: **"Squash and merge"**
    - [ ] Cleans up commit history
    - [ ] Keeps main branch linear

- [ ] **Commit message templates** (optional)
  - [ ] Merge commit message: `PR_TITLE` (default)
  - [ ] Squash commit title: `COMMIT_OR_PR_TITLE` (default)
  - [ ] Or customize as needed

- [ ] **Save changes**
  - [ ] Scroll down and click "Save" or "Update"

---

## Task 4: Create CONTRIBUTING.md

### Goal
Document how to contribute to the project and proper workflow.

### File: `CONTRIBUTING.md`

```markdown
# Contributing to Paleoglossa AI Studio

Thank you for contributing to this project! Here's how to get started.

## Development Workflow

### 1. Set Up Your Environment
\`\`\`bash
npm install
npm run dev
\`\`\`

### 2. Create a Feature Branch
\`\`\`bash
git checkout -b feat/your-feature-name
# or for fixes:
git checkout -b fix/issue-description
# or for docs:
git checkout -b docs/update-readme
\`\`\`

### Branch Naming Conventions
- `feat/` — New features
- `fix/` — Bug fixes
- `chore/` — Maintenance, dependencies
- `docs/` — Documentation updates
- `refactor/` — Code refactoring without behavior change
- `perf/` — Performance improvements
- `test/` — Test additions/updates

### 3. Make Your Changes
\`\`\`bash
# Verify code quality
npm run type-check  # TypeScript type checking
npm run lint        # ESLint
npm run test        # Jest tests
npm run build       # Production build

# Fix linting issues automatically
npm run lint -- --fix
\`\`\`

### 4. Commit Your Changes
\`\`\`bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug in component"
\`\`\`

**Commit Message Format:**
```
<type>: <subject>

<body>
```

- `type`: feat, fix, chore, docs, refactor, perf, test
- `subject`: Short description (imperative mood, lowercase, no period)
- `body`: Detailed explanation (optional)

### 5. Push and Create Pull Request
\`\`\`bash
git push origin feat/your-feature-name
\`\`\`

Then create a PR on GitHub with:
- Clear title
- Description of changes
- Link to any related issues

### 6. Code Review & Merge
- Address any review feedback
- Keep commits clean (squash if needed)
- Once approved, PR will be merged automatically

## Code Standards

- **TypeScript**: Use strict mode, avoid \`any\`
- **Linting**: ESLint + Prettier
- **Testing**: Write tests for new features
- **Documentation**: Update README/docs if behavior changes

## Questions?

See [README.md](./README.md) or [ROADMAP.md](./ROADMAP.md) for more info.
```

### Your Checklist

- [ ] **Create the file**
  - [ ] Path: `CONTRIBUTING.md` (root of repo)
  - [ ] Copy the template above
  - [ ] Customize as needed

- [ ] **Update README.md**
  - [ ] Add link to CONTRIBUTING.md
  - [ ] Add "Contributing" section with link

---

## Success Criteria ✅

You'll know Phase 2 is complete when:

1. ✅ Stale branches deleted (31 → ~5-8 branches)
2. ✅ Branch protection rule created for `main`
3. ✅ Auto-delete head branches enabled
4. ✅ Squash merge set as default
5. ✅ `CONTRIBUTING.md` created and linked in README

---

## Next Steps

Once Phase 2 is complete:
- **Notify:** "Phase 2 complete: Branches cleaned up, protection rules configured"
- **Move to Phase 3:** CI/CD setup and comprehensive documentation
- **Reference Phase 3 prompt** for the final setup

---

## Tips for Claude

- 🗑️ **Be decisive about branch cleanup** — old branches clutter the workspace
- 🔒 **Branch protection prevents accidents** — easier to relax than to add later
- 📚 **CONTRIBUTING.md guides future collaborators** — invest time in clarity
- ✨ **Test the protection rules** — try to push directly to main and confirm it's blocked
- ⏱️ **This phase should feel like cleanup** — straightforward, no code changes
