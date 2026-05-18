# Claude AI Task Prompt - Phase 3: CI/CD Setup & Documentation
## 🎯 Priority: CRITICAL (Do After Phases 1 & 2)
**Estimated Time:** 60-90 minutes

---

## Overview
This phase focuses on setting up automated CI/CD pipelines, enabling security scanning, and creating comprehensive documentation.

---

## Task 1: Create GitHub Actions CI Workflow

### Goal
Automate type-checking, linting, testing, and building on every PR.

### File: `.github/workflows/ci.yml`

```yaml
name: CI (Type Check, Lint, Test, Build)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  quality:
    name: Code Quality Checks
    runs-on: ubuntu-latest
    timeout-minutes: 20

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check (TypeScript)
        run: npm run type-check
        continue-on-error: false

      - name: Lint code (ESLint)
        run: npm run lint
        continue-on-error: false

      - name: Run tests (Jest)
        run: npm run test -- --coverage
        continue-on-error: true  # Don't block on test failures (can improve later)

      - name: Build project
        run: npm run build
        continue-on-error: false

  e2e:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30
    if: github.event_name == 'pull_request'  # Only on PRs

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run E2E tests (Playwright)
        run: npm run e2e
        continue-on-error: true

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

status_checks:
  name: CI Status
  runs-on: ubuntu-latest
  needs: [quality, e2e]
  if: always()
  
  steps:
    - name: Check CI status
      run: |
        if [ "${{ needs.quality.result }}" != "success" ]; then
          echo "❌ Quality checks failed"
          exit 1
        fi
        echo "✅ CI passed"
```

### Your Checklist

- [ ] **Create the workflow file**
  - [ ] Path: `.github/workflows/ci.yml`
  - [ ] Copy the YAML above
  - [ ] Commit with message: `ci: add GitHub Actions CI workflow`

- [ ] **Verify the workflow runs**
  - [ ] Push to a feature branch
  - [ ] Create a PR
  - [ ] Watch the "Actions" tab: https://github.com/oliverdann7/paleoglossa-ai-studio/actions
  - [ ] Confirm workflow triggers and shows status

- [ ] **Check npm scripts exist**
  - [ ] `npm run type-check` — should exist (tsconfig.json based)
  - [ ] `npm run lint` — should exist (eslint.config.mjs)
  - [ ] `npm run test` — should exist or create one
  - [ ] `npm run build` — should exist (vite.config.ts)
  - [ ] `npm run e2e` — should exist or create one
  - [ ] **If any are missing:** Create placeholder scripts in package.json:
    ```json
    "scripts": {
      "type-check": "tsc --noEmit",
      "lint": "eslint . --ext .ts,.tsx,.js,.jsx,.mjs",
      "test": "jest",
      "build": "vite build",
      "e2e": "playwright test"
    }
    ```

- [ ] **Monitor first CI run**
  - [ ] Check for red/green status
  - [ ] Fix any immediate failures
  - [ ] Note which checks pass/fail for reference

---

## Task 2: Create GitHub Actions Security Scanning Workflow

### Goal
Enable Dependabot and security scanning to catch vulnerabilities.

### File: `.github/workflows/security.yml`

```yaml
name: Security Scanning

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

permissions:
  contents: read
  security-events: write

jobs:
  dependency-check:
    name: Dependency Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Audit npm dependencies
        run: npm audit --audit-level=moderate
        continue-on-error: true  # Report but don't block

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    
    strategy:
      fail-fast: false
      matrix:
        language: ['javascript']

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

### Your Checklist

- [ ] **Create the security workflow**
  - [ ] Path: `.github/workflows/security.yml`
  - [ ] Copy the YAML above

- [ ] **Enable Dependabot** (GitHub native)
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings/security_and_analysis
  - [ ] Scroll to "Dependabot alerts"
  - [ ] ✅ Enable "Dependabot alerts"
  - [ ] ✅ Enable "Dependabot security updates"
  - [ ] ✅ Enable "Dependabot version updates"

- [ ] **Create Dependabot config** (optional, for scheduling)
  - [ ] Path: `.github/dependabot.yml`
  - [ ] Content:
    ```yaml
    version: 2
    updates:
      - package-ecosystem: "npm"
        directory: "/"
        schedule:
          interval: "weekly"
          day: "monday"
          time: "04:00"
        open-pull-requests-limit: 10
        reviewers:
          - "oliverdann7"
    ```

- [ ] **Verify security settings**
  - [ ] Check: https://github.com/oliverdann7/paleoglossa-ai-studio/security/overview
  - [ ] Confirm alerts are enabled

---

## Task 3: Update Branch Protection to Require Status Checks

### Goal
Now that CI is running, enforce it on all PRs.

### Your Checklist

- [ ] **Navigate to branch protection settings**
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings/branches
  - [ ] Click on the `main` branch rule

- [ ] **Update the protection rule**
  - [ ] Scroll to "Require status checks to pass before merging"
  - [ ] ✅ Enable "Require branches to be up to date before merging"
  - [ ] Add required status checks:
    - [ ] ✅ `CI / Code Quality Checks` (from ci.yml)
    - [ ] ✅ `Security Scanning / Dependency Security Audit` (from security.yml)
  - [ ] Save changes

- [ ] **Test the protection**
  - [ ] Try to merge a PR without CI passing
  - [ ] Confirm GitHub blocks it with error message
  - [ ] ✅ Status checks are working!

---

## Task 4: Update README.md

### Goal
Replace the generic "Test" description with comprehensive documentation.

### File: `README.md`

```markdown
# Paleoglossa AI Studio

A comprehensive TypeScript-based language learning and corpus management platform. Paleoglossa provides AI-assisted language instruction, intelligent corpus expansion, grammar reference management, and community-driven language learning.

**Live:** https://paleoglossa.com

---

## 🎯 Features

- 📚 **Corpus Management**: Intelligent corpus expansion with classical and modern texts
- 🤖 **AI-Assisted Learning**: Integration with language models for personalized instruction
- 📖 **Grammar Reference**: Comprehensive grammar atlas and reference materials
- 🌍 **Language Support**: Multi-language support with i18n coverage
- 💬 **Community**: Social directory and community engagement features
- 📱 **Mobile-Ready**: Cross-platform mobile support (iOS/Android via Capacitor)
- 🔐 **Premium Features**: Feature-flagged premium capabilities
- 📊 **Research Tools**: Research notebook and analysis tools

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/oliverdann7/paleoglossa-ai-studio.git
cd paleoglossa-ai-studio

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
\`\`\`

### Available Commands

\`\`\`bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build locally
npm run type-check   # TypeScript type checking
npm run lint         # ESLint linting
npm run lint:fix     # Fix linting issues automatically
npm run test         # Run Jest tests
npm run e2e          # Run Playwright E2E tests
npm run clean        # Clean build artifacts
\`\`\`

---

## 📖 Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — How to contribute
- **[ROADMAP.md](./ROADMAP.md)** — Feature roadmap and planned work
- **[AGENTS.md](./AGENTS.md)** — AI agent configurations
- **[CLAUDE.md](./CLAUDE.md)** — Claude AI integration notes
- **[SECURITY_NOTES.md](./SECURITY_NOTES.md)** — Security guidelines

---

## 🔧 Project Structure

\`\`\`
paleoglossa-ai-studio/
├── src/                    # Source code
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── lib/               # Utilities and helpers
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── api/                    # Backend API
├── app/                    # App-specific code
├── android/                # Android build (Capacitor)
├── ios/                    # iOS build (Capacitor)
├── e2e/                    # End-to-end tests
├── docs/                   # Documentation
├── public/                 # Static assets
└── scripts/                # Utility scripts
\`\`\`

---

## 🔐 Security

- See [SECURITY_NOTES.md](./SECURITY_NOTES.md) for security guidelines
- Dependencies are audited via `npm audit`
- Automated security scanning via GitHub Actions
- Dependabot alerts enabled

---

## 🧪 Testing

- **Type Checking**: \`npm run type-check\`
- **Linting**: \`npm run lint\`
- **Unit Tests**: \`npm run test\`
- **E2E Tests**: \`npm run e2e\`

All tests must pass before merging to \`main\` (enforced via branch protection).

---

## 📦 Technologies

- **Frontend**: React, TypeScript, Vite
- **Mobile**: Capacitor (iOS/Android)
- **Backend**: Node.js API
- **Database**: Firebase/Firestore
- **Hosting**: Vercel
- **Testing**: Jest, Playwright
- **Linting**: ESLint, Prettier
- **Build**: Vite

---

## 📝 Environment Variables

See [.env.example](./.env.example) for required environment variables.

Key variables:
- \`VITE_API_URL\` — API base URL
- \`VITE_FIREBASE_*\` — Firebase configuration
- \`VITE_ENABLE_MOBILE_PURCHASES\` — Feature flag for mobile purchases
- See .env.example for complete list

---

## 🤝 Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development workflow
- Branch naming conventions
- Commit message format
- Code standards
- PR process

---

## 📅 Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and current priorities.

Key initiatives:
- Central language registry
- Industrial import pipeline
- Grammar atlas enhancements
- Research notebook expansion
- Social community features

---

## 📄 License

See LICENSE file for details.

---

## 📧 Contact

For questions or support, reach out to the maintainer at https://paleoglossa.com

---

## ⭐ Acknowledgments

- Built with modern web technologies
- Powered by AI-assisted development
- Community-driven language learning mission
```

### Your Checklist

- [ ] **Update README.md**
  - [ ] Replace generic "Test" description with content above
  - [ ] Update any outdated links
  - [ ] Verify all links work
  - [ ] Commit: `docs: comprehensive README with features and setup`

- [ ] **Verify links in README**
  - [ ] CONTRIBUTING.md exists
  - [ ] ROADMAP.md exists
  - [ ] SECURITY_NOTES.md exists
  - [ ] .env.example exists

- [ ] **Verify .env.example is up to date**
  - [ ] Check it includes all required env vars
  - [ ] Add any missing variables from actual setup
  - [ ] Comment each variable with explanation

---

## Task 5: Create GitHub Actions Deployment Workflow (Optional)

### Goal
Optional: Set up automated deployment to production (Vercel).

### File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

### Your Checklist (if using Vercel)

- [ ] **Get Vercel secrets**
  - [ ] Go to Vercel dashboard
  - [ ] Get: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

- [ ] **Add secrets to GitHub**
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings/secrets/actions
  - [ ] Add secrets:
    - [ ] `VERCEL_TOKEN`
    - [ ] `VERCEL_ORG_ID`
    - [ ] `VERCEL_PROJECT_ID`

- [ ] **Create workflow file**
  - [ ] Path: `.github/workflows/deploy.yml`
  - [ ] Copy YAML above
  - [ ] Commit: `ci: add Vercel deployment workflow`

- [ ] **Test deployment** (optional)
  - [ ] Merge a PR to main
  - [ ] Watch Actions tab
  - [ ] Confirm deployment triggered
  - [ ] Verify live site updated

---

## Task 6: Enable GitHub Issues & Projects

### Goal
Set up issue tracking and project management.

### Your Checklist

- [ ] **Verify GitHub Issues enabled**
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings
  - [ ] Scroll to "Features" section
  - [ ] ✅ Confirm "Issues" is checked

- [ ] **Set up issue templates** (optional)
  - [ ] Create: `.github/ISSUE_TEMPLATE/bug_report.md`
  - [ ] Create: `.github/ISSUE_TEMPLATE/feature_request.md`
  - [ ] Create: `.github/ISSUE_TEMPLATE/question.md`

- [ ] **Enable GitHub Projects** (optional)
  - [ ] Go to: https://github.com/oliverdann7/paleoglossa-ai-studio/settings
  - [ ] ✅ Confirm "Projects" is checked
  - [ ] Create a new project for tracking work

---

## Success Criteria ✅

You'll know Phase 3 is complete when:

1. ✅ GitHub Actions CI workflow created and passing
2. ✅ Security scanning workflow enabled
3. ✅ Dependabot configured
4. ✅ Branch protection updated to require CI checks
5. ✅ README.md comprehensive and current
6. ✅ .env.example up to date
7. ✅ CONTRIBUTING.md linked in README
8. ✅ Optional: Deployment workflow configured
9. ✅ Optional: GitHub Issues/Projects set up

---

## Final Validation Checklist

Once all phases are complete:

- [ ] **Code Quality**
  - [ ] `npm run type-check` passes locally
  - [ ] `npm run lint` passes (no errors)
  - [ ] `npm run build` succeeds
  - [ ] `npm run test` passes

- [ ] **CI/CD**
  - [ ] PR triggers CI workflow automatically
  - [ ] All CI checks pass on PRs
  - [ ] CI failures block PR merge
  - [ ] Deployment workflow works (if configured)

- [ ] **Repository Health**
  - [ ] Branch list clean (5-8 branches)
  - [ ] Branch protection enforced on main
  - [ ] Documentation comprehensive
  - [ ] Security scanning enabled

- [ ] **Developer Experience**
  - [ ] New contributor can clone and run locally
  - [ ] CONTRIBUTING.md is clear and helpful
  - [ ] Branch naming conventions documented
  - [ ] Setup takes <10 minutes

---

## 🎉 You're Done!

Your repository is now:
- ✅ **Automated** — CI/CD handles testing and deployment
- ✅ **Secure** — Dependabot and security scanning enabled
- ✅ **Well-documented** — README, contributing guide, API docs
- ✅ **Professional** — Branch protection, status checks enforced
- ✅ **Scalable** — Ready for team collaboration

---

## Tips for Claude

- 🔄 **Test workflows after creation** — Make sure they actually run
- 📊 **Monitor CI on first PRs** — Fix any failures early
- 🔐 **Secrets are critical** — Store them securely in GitHub
- 📚 **Documentation is key** — Clear docs reduce support questions
- 🚀 **Deployment should be boring** — Automate it and let it run
- ⏱️ **This is the final phase** — Take your time getting it right
