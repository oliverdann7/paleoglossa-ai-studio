# Claude AI Task Prompt - Phase 1: Code Review & Issue Resolution
## 🎯 Priority: IMMEDIATE (Do First)
**Estimated Time:** 30-45 minutes

---

## Overview
This phase focuses on reviewing the active PR, resolving the blocking issue, and ensuring the `main` branch is clean and merge-ready.

---

## Task 1: Review & Merge PR #132

### Context
- **PR Title:** feat: centralize feature flags and structure metadata checklist
- **PR URL:** https://github.com/oliverdann7/paleoglossa-ai-studio/pull/132
- **Status:** Open (4 minutes old as of 2026-05-18)
- **Changes:** Feature flag module + mobile metadata checklist

### Your Checklist
- [ ] **Review the PR description** — Understand the intent
  - Centralizes `src/lib/features.ts` for feature flags
  - Updates `src/pages/Subscription.tsx` to use new module
  - Adds `docs/mobile-metadata-checklist.md` for app store release
  
- [ ] **Check for code quality issues**
  - [ ] No console.logs or debug code left behind
  - [ ] TypeScript types are correct (no `any` without justification)
  - [ ] Follows existing code patterns in the codebase
  - [ ] Comments are clear and helpful
  
- [ ] **Verify the feature flag module** (`src/lib/features.ts`)
  - [ ] Exports functions/constants correctly
  - [ ] Handles environment variables properly (e.g., `VITE_ENABLE_MOBILE_PURCHASES`)
  - [ ] Can be imported and used by other modules
  
- [ ] **Check the updated Subscription.tsx**
  - [ ] Uses the new features module instead of direct env access
  - [ ] Logic is equivalent to the old code (no behavior change)
  - [ ] No breaking changes to other components
  
- [ ] **Review the metadata checklist** (`docs/mobile-metadata-checklist.md`)
  - [ ] Is it complete and actionable?
  - [ ] Covers all required fields for App Store and Google Play?
  - [ ] Is it formatted clearly for future reference?
  
- [ ] **Verify test instructions work**
  - [ ] Follow the "Testing Instructions" in the PR description
  - [ ] Subscription.tsx still behaves correctly
  - [ ] No runtime errors
  
- [ ] **Approval & Merge**
  - [ ] If all checks pass: **Approve and Merge** with commit message: `Merge PR #132: Centralize feature flags and add mobile metadata checklist`
  - [ ] If issues found: Comment with specific feedback and wait for fixes
  - [ ] Delete the branch after merging

### Notes
- This PR appears to be well-intentioned housekeeping
- If you find any issues, be constructive and specific in comments
- Feature flags are a common pattern—this centralizes them well

---

## Task 2: Resolve the Open Issue

### Context
- **Open Issues:** 1 (need to fetch details)
- **Issue URL:** Check GitHub issues tab at https://github.com/oliverdann7/paleoglossa-ai-studio/issues

### Your Checklist
- [ ] **Identify the issue**
  - [ ] Read the issue title and description
  - [ ] Note the priority (bug vs feature vs question)
  - [ ] Check if there are any error messages or stack traces
  
- [ ] **Determine the scope**
  - [ ] Is it blocking production?
  - [ ] Does it affect a feature branch or main?
  - [ ] How critical is it? (P0=Blocking, P1=High, P2=Medium, P3=Low)
  
- [ ] **Categorize & Label**
  - [ ] Add appropriate label: `bug`, `enhancement`, `documentation`, `question`, etc.
  - [ ] Add priority label: `p0-critical`, `p1-high`, `p2-medium`, `p3-low`
  - [ ] If it's a bug, add `bug` label
  
- [ ] **Create an action plan**
  - [ ] Assign to yourself if you'll fix it
  - [ ] If it requires code changes:
    - [ ] Create a feature branch: `fix/issue-#<number>-<description>`
    - [ ] Link the branch to the issue
  - [ ] If it's a question: Answer it and close
  - [ ] If it's a feature request: Add to ROADMAP.md and link
  
- [ ] **If it's a Bug**
  - [ ] Reproduce the issue locally
  - [ ] Add a minimal code example to the issue
  - [ ] Propose a fix
  - [ ] Create a fix branch and PR
  
- [ ] **If it's a Feature Request**
  - [ ] Evaluate feasibility
  - [ ] Check if it aligns with ROADMAP.md
  - [ ] Add to roadmap if relevant
  - [ ] Leave a comment: "Thanks for the suggestion! Added to roadmap for consideration."
  
- [ ] **If it's a Question/Documentation**
  - [ ] Answer thoroughly
  - [ ] Update README.md or docs if it's a common question
  - [ ] Close the issue if resolved

### Notes
- With only 1 open issue, this should be quick
- Make sure to label it properly for future reference
- If it's urgent, prioritize it

---

## Task 3: Verify Main Branch Health

### Context
- **Default Branch:** `main`
- **Last Push:** 2026-05-18T17:28:05Z
- **Status:** Should be clean and production-ready

### Your Checklist
- [ ] **Check branch status**
  - [ ] Navigate to https://github.com/oliverdann7/paleoglossa-ai-studio/tree/main
  - [ ] Verify no uncommitted changes
  - [ ] Verify build status (should be green)
  
- [ ] **Ensure README.md is accurate**
  - [ ] Does it describe the project correctly?
  - [ ] Does it have setup instructions?
  - [ ] Does it link to ROADMAP.md?
  - [ ] **If needed:** Plan README update for Phase 2
  
- [ ] **Check for stale branches**
  - [ ] List all branches at https://github.com/oliverdann7/paleoglossa-ai-studio/branches
  - [ ] Identify which branches can be deleted (see Phase 2)
  - [ ] Note which branches are active and being worked on
  
- [ ] **Verify environment setup**
  - [ ] Check `.env.example` is accurate
  - [ ] Check `package.json` for any obvious issues
  - [ ] Verify `tsconfig.json` is correct for the project

---

## Success Criteria ✅

You'll know Phase 1 is complete when:

1. ✅ PR #132 is merged to `main` (or rejected with clear feedback)
2. ✅ The open issue is triaged, labeled, and has an action plan
3. ✅ `main` branch is verified as clean and production-ready
4. ✅ You've identified stale branches for Phase 2 cleanup

---

## Next Steps

Once Phase 1 is complete:
- **Notify the team:** "Phase 1 complete: PR merged, issue triaged, main branch verified"
- **Move to Phase 2:** Branch cleanup and protection rules
- **Reference Phase 2 prompt** for the next set of tasks

---

## Tips for Claude

- 🔍 **Be thorough in PR review** — catch issues early
- 📝 **Document your findings** — leave clear comments
- 🏷️ **Label issues properly** — helps with future tracking
- ✨ **Keep it constructive** — feedback should help, not demotivate
- ⏱️ **Time-box each task** — don't get stuck on one issue
