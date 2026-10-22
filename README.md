# Agentic Social & Client Finder AI 🚀
### Autonomous Lead Generation, High-Intent Client Acquisition, Multi-Platform Job Automation & Secure Outreach Engine
**Lead Engineer**: [Syed Akbar Hashmi](https://syed-akber-hashmi-v2.vercel.app/) • **Live Portfolio**: [syed-akber-hashmi-v2.vercel.app](https://syed-akber-hashmi-v2.vercel.app/) • **Contact**: [syedakbarhashmi519@gmail.com](mailto:syedakbarhashmi519@gmail.com)

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://syed-akber-hashmi-v2.vercel.app/)
[![Tests Passing](https://img.shields.io/badge/Tests-100%25%20Passing-success.svg)](tests/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED.svg)](Dockerfile)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Executive Overview

**Agentic Social & Client Finder AI** is a unified, enterprise-grade autonomous operating platform engineered for high-intent client acquisition and career pipeline automation. Built with clean architecture, zero hardcoded secrets, and resilient error recovery, the system combines:

1. **Intelligent Lead Finder**: Multi-source high-intent discovery engine that scores potential buyer posts (0–100), categorizes them into high-value service domains (Website Building, Mobile Apps, SaaS Platforms, Custom Software, and AI Automation), and exports structured CSV/JSON datasets.
2. **Secure SMTP Email Hub**: Production-ready Nodemailer integration with rate-limited dispatch queues, dynamic template interpolation, safe secret masking, and persistent audit telemetry.
3. **Multi-Platform Job Application Suite**:
   - **LinkedIn Easy Apply**: Closed-loop automation tracking active applications (50 verified high-response applications recorded in persistent state).
   - **Indeed Search & Apply**: Automated remote job search with qualification scoring and application execution.
   - **Custom Career Portals**: Native ATS detection (Greenhouse, Lever, Workday, BambooHR) with structured field mapping.
4. **AI Resume Enhancer & ATS Optimizer**: Target keyword extraction, ATS compatibility scoring (0–100), missing keyword detection, and Google/STAR metric-driven bullet point transformation.
5. **Unified Autonomous Workflow Studio**: Orchestrates end-to-end pipelines linking discovery ➔ candidate resume ATS alignment ➔ autonomous dispatch (job submission or client email pitch) ➔ audit telemetry.
6. **Modern Web Portal**: Responsive, glassmorphic dark-theme SPA with real-time KPI metrics, interactive tables, tabbed application centers, and configuration inspectors.

---

## 🏗️ Architecture & Component Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│               AGENTIC SOCIAL & CLIENT FINDER WEB PORTAL                │
│       (http://localhost:3000 • Responsive Glassmorphism SPA)           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ REST APIs & WebSockets
┌────────────────────────────────────▼───────────────────────────────────┐
│                     EXPRESS 5 CORE API SERVER                          │
│     (Rate Limiting • Security Headers • Sanitized Error Handling)       │
├────────────────────────────────────────────────────────────────────────┤
│  /api/health       • System healthcheck & uptime metrics               │
│  /api/leads        • Lead finder, scoring, filtering, CSV export       │
│  /api/email        • Secure SMTP dispatcher, templates, audit log      │
│  /api/jobs         • LinkedIn, Indeed, and Custom ATS job runners      │
│  /api/resume       • ATS scoring, missing keywords, STAR rewriter      │
│  /api/workflow     • Autonomous end-to-end pipeline orchestrator       │
└───────┬──────────────┬───────────────┬───────────────┬─────────────────┘
        │              │               │               │
┌───────▼──────┐┌──────▼───────┐┌──────▼───────┐┌──────▼─────────────────┐
│ Lead Finder  ││ Secure SMTP  ││ Multi-Board  ││ AI Resume Enhancer     │
│ & Scorer     ││ Email Hub    ││ Job Engine   ││ & ATS Optimizer        │
│ (0-100 Scale)││ (Rate Limit) ││ (LinkedIn,   ││ (STAR Rewriter,        │
│              ││              ││ Indeed, ATS) ││  Keyword Density)      │
└───────┬──────┘└──────┬───────┘└──────┬───────┘└──────┬─────────────────┘
        │              │               │               │
        └──────────────┴───────┬───────┴───────────────┘
                               │
                ┌──────────────▼────────────────┐
                │   Unified Workflow Pipeline   │
                │   (Discovery ➔ ATS Alignment  │
                │    ➔ Dispatch ➔ Telemetry)    │
                └──────────────┬────────────────┘
                               │
                ┌──────────────▼────────────────┐
                │ Persistent Audit Storage JSON │
                │  - data/leads.json            │
                │  - data/email-history.json    │
                │  - data/indeed-jobs.json      │
                │  - data/custom-board-jobs.json│
                │  - data/workflow-runs.json    │
                │  - linkedin-jobs-applied.json │
                └───────────────────────────────┘
```

---

## ⚡ Key Modules

### 1. Lead Finder & Intent Scorer (`src/leads/lead-engine.js`)
- Evaluates inbound client requirements and social inquiries using weighted pattern analysis across 5 core specializations:
  - **Website Building**: React, Next.js, Webflow, Landing Pages, UI/UX
  - **Mobile Apps**: Flutter, React Native, iOS, Android, Dart
  - **SaaS Platforms**: Multi-tenant architectures, Stripe subscriptions, Auth, Dashboards
  - **AI Automation**: Autonomous agents, LLM integrations, LangChain, Browser automation
  - **Custom Software**: Microservices, CRM integrations, ERPs, API pipelines
- Filters by intent threshold, computes conversion probabilities, and exports one-click CSV summaries.

### 2. Secure SMTP Email Hub (`src/email/smtp-service.js`)
- Configured purely via standard environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM`.
- Includes live SMTP connection handshake verification (`/api/email/verify`).
- Rate-limited queuing protects sender domain reputation.
- Sanitizes all telemetry logs so passwords, tokens, and authorization headers are never exposed.

### 3. Multi-Platform Job Engine (`src/jobs/application/`)
- **LinkedIn Engine** (`linkedin-engine.js`): Tracks and runs Easy Apply submissions with audit records of 50 active applications.
- **Indeed Engine** (`indeed-engine.js`): Generates targeted remote query URLs for AI Native and Full Stack roles, scores descriptions against candidate skills, and executes applications.
- **Custom Board Engine** (`custom-board-engine.js`): Detects applicant tracking systems (Greenhouse, Lever, Workday, BambooHR) from target URLs and formats candidate metadata into compliant payloads.

### 4. AI Resume Enhancer & ATS Optimizer (`src/resume/resume-enhancer.js`)
- **Technology Taxonomy**: 60+ curated industry keywords covering modern web, mobile, distributed backend, cloud, and agentic AI.
- **ATS Scoring Algorithm**:
  - Keyword Match Ratio (40 points)
  - Keyword Placement & Section Density (25 points)
  - STAR / Google Action-Verb Impact (20 points)
  - Structure & Brevity Optimization (15 points)
- **Missing Keyword Detection**: Identifies critical requirements from target JDs not present in the candidate resume.
- **STAR Rewriter**: Rewrites standard bullet points into Google-style accomplishment statements (*"Action Verb + Task + Quantifiable Business Impact"*).

### 5. Unified Autonomous Orchestrator (`src/orchestrator/unified-workflow.js`)
- Connects disparate systems into self-governing pipelines:
  - **Lead Outreach Pipeline**: Ingests qualified lead ➔ interpolates personalized proposal template ➔ dispatches secure SMTP email ➔ writes persistent audit trail.
  - **Job Application Pipeline**: Ingests job requisition ➔ extracts ATS keywords ➔ projects resume compatibility ➔ dispatches application ➔ saves telemetry record.

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`
- (Optional) Docker & Docker Compose

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Hashmi707/nexxiq-ai-platform.git
cd nexxiq-ai-platform
npm install
```

### 2. Configure Environment Variables
Copy the template and configure your parameters:
```bash
cp .env.example .env
```
Key variables to verify:
```env
PORT=3000
NODE_ENV=production

# Candidate Profile
CANDIDATE_NAME="Syed Akbar Hashmi"
CANDIDATE_EMAIL="syedakbarhashmi519@gmail.com"
CANDIDATE_PORTFOLIO="https://syed-akber-hashmi-v2.vercel.app/"
COMPANY_NAME="Agentic Social AI"

# SMTP Settings
SMTP_HOST=mail.wavcabs.com.au
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@wavcabs.com.au
SMTP_PASS=your_smtp_password
EMAIL_FROM="Syed Akbar Hashmi <info@wavcabs.com.au>"
```

### 3. Run the Platform
```bash
# Start Web Portal & API Server
npm start

# Or run directly
node src/server.js
```
The application will be live at:
- **Web Portal UI**: `http://localhost:3000`
- **Health Endpoint**: `http://localhost:3000/api/health`

---

## 🐳 Docker Deployment

Run the complete platform inside a hardened, isolated Docker container:

### Using Docker Compose (Recommended)
```bash
# Build and run detached
docker compose up -d

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

### Using Standalone Docker
```bash
# Build image
docker build -t agentic-social-client-finder:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --name agentic_social \
  --env-file .env \
  -v "$(pwd)/data:/app/data" \
  agentic-social-client-finder:latest
```

---

## 🧪 Comprehensive Test Suite

The platform maintains a 100% test pass rate across unit, scenario, audit, and HTTP smoke tests:

```bash
# Run all tests
npm test

# Run Agentic Architecture tests
npm run test:agentic

# Run HTTP API & Web UI smoke tests
node tests/smoke-test.js
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, domain, and uptime |
| `GET` | `/api/leads` | Search and filter discovered leads |
| `GET` | `/api/leads/stats` | Lead metrics by category and status |
| `GET` | `/api/leads/export/csv` | Download filtered leads as CSV |
| `POST` | `/api/leads/score-text` | Analyze post text and compute intent score |
| `GET` | `/api/email/config` | Safe masked SMTP configuration |
| `POST` | `/api/email/verify` | Test SMTP server handshake connection |
| `POST` | `/api/email/send` | Send personalized email via queue |
| `GET` | `/api/email/history` | Audit log of dispatched emails |
| `GET` | `/api/jobs/linkedin` | Retrieve LinkedIn job applications (50 verified) |
| `POST` | `/api/jobs/indeed/search` | Search remote Indeed job requisitions |
| `POST` | `/api/jobs/custom/detect-ats` | Detect ATS provider from career URL |
| `POST` | `/api/resume/analyze` | Calculate ATS score (0-100) and missing keywords |
| `POST` | `/api/resume/enhance` | Rewrite resume with target keywords and STAR bullets |
| `GET` | `/api/resume/default` | Fetch default candidate profile and sample resume |
| `POST` | `/api/workflow/lead-outreach` | Trigger automated lead outreach pipeline |
| `POST` | `/api/workflow/job-application` | Trigger automated job application pipeline |
| `GET` | `/api/workflow/runs` | Retrieve execution telemetry logs |

---

## 🔒 Security & Privacy Engineering

- **Zero Hardcoded Secrets**: All credentials (SMTP passwords, API keys, session tokens) must be provided through `.env` or system environment variables.
- **Masked Telemetry**: The API never returns plaintext passwords in `/api/email/config` or logging outputs.
- **Strict `.gitignore` & `.dockerignore`**: Guarantees `.env`, `private/`, `.pid`, and session profiles are excluded from commits and Docker builds.
- **Built-in Rate Limiting**: The Express API enforces per-IP request limits (180 req/min) to prevent abuse.
- **Enterprise Security Headers**: Automatic `X-Content-Type-Options`, `X-Frame-Options`, and `X-XSS-Protection` headers on all responses.

---

## 👤 Developer & Maintainer

- **Developer**: Syed Akbar Hashmi
- **Role**: AI Native Full Stack Developer
- **Portfolio**: [syed-akber-hashmi-v2.vercel.app](https://syed-akber-hashmi-v2.vercel.app/)
- **Contact Email**: [syedakbarhashmi519@gmail.com](mailto:syedakbarhashmi519@gmail.com)
- **LinkedIn**: [linkedin.com/in/syed-akbar-hashmi](https://www.linkedin.com/in/syed-akbar-hashmi)
- **GitHub**: [github.com/Hashmi707](https://github.com/Hashmi707)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
