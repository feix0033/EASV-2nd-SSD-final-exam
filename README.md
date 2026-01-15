# Securing CI/CD Pipeline with Automated Security Analysis

This project shows how we integrated security tools into a CI/CD pipeline to catch vulnerabilities early. We're using a NestJS financial app to test three security tools: SNYK (dependencies), CodeQL (code analysis), and Trivy (containers).

## Goal

Figure out how SNYK, CodeQL, and Trivy work together to find vulnerabilities during builds and see how this helps meet Cyber Resilience Act requirements.

## Pipeline Flow

```
Code → SNYK → CodeQL → Build → Trivy → Security Check → Deploy
         ↓        ↓               ↓
    Dependencies  Code      Container Issues
         ↓        ↓               ↓
           GitHub Security Dashboard
```

## Security Tools

**SNYK** - Scans npm packages for vulnerabilities in dependencies and generates an SBOM.

**CodeQL** - Analyzes TypeScript code for SQL injection, XSS, hardcoded secrets, and other issues.

**Trivy** - Scans Docker images for OS vulnerabilities and misconfigurations.

## CRA Compliance

| Requirement | Tool | Implementation |
|-------------|------|----------------|
| Secure Development | CodeQL | SAST in pipeline |
| Vulnerability Management | All three | Scans on every commit |
| Supply Chain Security | SNYK | Dependency scanning + SBOM |
| Security by Default | All | Shift-left approach |
| Vulnerability Disclosure | GitHub | Security dashboard |
| Timely Updates | Dependabot | Auto dependency updates |

## Setup

**Steps:**
```bash
# Clone
git clone https://github.com/feix0033/EASV-2nd-SSD-final-exam.git
cd EASV-2nd-SSD-final-exam

# Install
cd financial-advisor-nest-js
npm install
```

**Configure:**
- Add SNYK token to GitHub Secrets
- Enable CodeQL in repo settings

## Running

```bash
npm run start:dev    # Development
npm run start:prod   # Production
npm run test         # Tests
docker build -t financial-advisor .  # Build container
```
