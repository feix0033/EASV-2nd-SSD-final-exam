# Securing CI/CD Pipeline with Automated Security Analysis

A comprehensive demonstration of DevSecOps practices using SNYK, CodeQL, and Trivy to secure a CI/CD pipeline in compliance with the Cyber Resilience Act (CRA).

## Overview

This project demonstrates how to integrate automated security analysis tools into a CI/CD pipeline to identify vulnerabilities during the build process. Using a NestJS financial tracking application as a test case, the project implements three key security tools:

- **SNYK** - Software Composition Analysis (SCA)
- **CodeQL** - Static Application Security Testing (SAST)
- **Trivy** - Container Vulnerability Scanning

The implementation showcases how these security controls support Cyber Resilience Act requirements for secure software development and supply-chain protection.

## Problem Statement

This project investigates how a CI/CD pipeline can be secured using automated analysis tools such as SNYK (Software Composition Analysis), CodeQL (Static Application Security Testing) and Trivy (Container Scanning). The goal is to identify vulnerabilities during the build process and assess how these security controls support the Cyber Resilience Act requirements for secure software development and supply-chain protection.

## Security Pipeline Architecture

```
Code Commit → SNYK (SCA) → CodeQL (SAST) → Build → Trivy (Container Scan) → Security Gate → Deploy
                ↓              ↓                        ↓
            Dependency     Code Security        Container Security
            Vulnerabilities Vulnerabilities     Vulnerabilities
                ↓              ↓                        ↓
                    GitHub Security Dashboard
```

## Security Tools

### 1. SNYK - Software Composition Analysis (SCA)

**Purpose**: Identify vulnerabilities in open-source dependencies

**What it scans**:
- npm packages and their dependencies
- Known CVEs in third-party libraries
- License compliance issues
- Outdated packages with security patches

**Integration**: GitHub Actions workflow
- Scans `package.json` and `package-lock.json`
- Generates SBOM (Software Bill of Materials)
- Reports vulnerabilities to GitHub Security tab

### 2. CodeQL - Static Application Security Testing (SAST)

**Purpose**: Detect security vulnerabilities in source code

**What it scans**:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Hardcoded secrets and credentials
- Insecure cryptography
- Path traversal vulnerabilities
- Command injection risks

**Integration**: GitHub Advanced Security
- Analyzes TypeScript/JavaScript code
- Uses semantic code analysis
- Creates code scanning alerts

### 3. Trivy - Container Vulnerability Scanner

**Purpose**: Scan container images for security issues

**What it scans**:
- OS package vulnerabilities
- Application dependencies in containers
- Misconfigurations in Dockerfiles
- Infrastructure-as-Code security issues

**Integration**: GitHub Actions workflow
- Scans Docker images before deployment
- Checks base image vulnerabilities
- Reports CRITICAL and HIGH severity issues

## Cyber Resilience Act (CRA) Compliance

| CRA Requirement | Tool(s) | Implementation | Status |
|-----------------|---------|----------------|--------|
| **Secure Development Process** | CodeQL | SAST integrated in CI/CD | ✅ |
| **Vulnerability Management** | SNYK, Trivy, CodeQL | Automated scanning on every commit | ✅ |
| **Supply Chain Security** | SNYK | Dependency scanning and SBOM generation | ✅ |
| **Security by Default** | All tools | Shift-left security approach | ✅ |
| **Vulnerability Disclosure** | GitHub Security | Centralized security dashboard | ✅ |
| **Timely Updates** | Dependabot | Automated dependency updates | ✅ |

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── security-pipeline.yml    # CI/CD security pipeline
├── docs/
│   ├── screenshots/                 # Security scan results
│   ├── architecture/                # Pipeline diagrams
│   ├── reports/                     # Security reports
│   └── exam-synopsis.md            # Project synopsis
├── agramkow-api/                   # Agramkow NestJS application
│   ├── src/                        # Application source code
│   ├── test/                       # Unit and E2E tests
│   ├── Dockerfile                  # Container configuration
│   └── package.json                # Dependencies
└── README.md                        # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Docker (for container scanning)
- GitHub account (for Actions and Security features)
- SNYK account (free tier available)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/feix0033/EASV-2nd-SSD-final-exam.git
   cd EASV-2nd-SSD-final-exam
   ```

2. **Install dependencies**
   ```bash
   cd financial-advisor-nest-js
   npm install
   ```

3. **Configure security tools**
   - Set up SNYK token in GitHub Secrets
   - Enable CodeQL in repository settings
   - Review security pipeline configuration

### Running the Application

```bash
# Navigate to application directory
cd financial-advisor-nest-js

# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Run tests
npm run test

# Build Docker image
docker build -t financial-advisor .
```

## Security Pipeline Workflow

The automated security pipeline runs on every push and pull request:

1. **Checkout Code** - Retrieve source code
2. **SNYK Scan** - Analyze dependencies for vulnerabilities
3. **CodeQL Analysis** - Perform static code analysis
4. **Build Container** - Create Docker image
5. **Trivy Scan** - Scan container for vulnerabilities
6. **Security Gate** - Evaluate results and block/allow deployment
7. **Report** - Generate security reports and alerts

### Viewing Security Results

**GitHub Security Tab**:
- Navigate to repository → Security → Code scanning alerts
- View vulnerabilities detected by all three tools
- Filter by severity (Critical, High, Medium, Low)
- Review remediation recommendations

**CI/CD Pipeline**:
- Navigate to repository → Actions
- Select latest workflow run
- Review security scan outputs
- Download security reports as artifacts

## Testing the Security Pipeline

The sample application intentionally includes various security issues to demonstrate tool effectiveness:

### SNYK Findings
- Vulnerable dependencies (e.g., outdated packages)
- Dependency vulnerabilities with available patches
- License compliance issues

### CodeQL Findings
- SQL injection vulnerabilities
- XSS (Cross-site scripting) risks
- Hardcoded credentials
- Insecure data handling

### Trivy Findings
- Base image vulnerabilities (Node.js Alpine)
- OS package vulnerabilities
- Container misconfigurations

## Development Workflow

1. **Write Code** - Develop features following best practices
2. **Commit Changes** - Push to GitHub
3. **Automated Scanning** - Security pipeline runs automatically
4. **Review Alerts** - Check security dashboard for issues
5. **Remediate** - Fix vulnerabilities based on recommendations
6. **Verify** - Re-run pipeline to confirm fixes
7. **Deploy** - Only after passing security gates

## Key Security Findings

### Dependency Vulnerabilities (SNYK)
- Total dependencies scanned: [To be populated]
- Vulnerabilities found: [To be populated]
- Critical: [X] | High: [X] | Medium: [X] | Low: [X]

### Code Security Issues (CodeQL)
- Files analyzed: [To be populated]
- Security issues found: [To be populated]
- By category: SQL Injection, XSS, Secrets, etc.

### Container Vulnerabilities (Trivy)
- Base image vulnerabilities: [To be populated]
- Application vulnerabilities: [To be populated]
- Configuration issues: [To be populated]

## Benefits of Integrated Security Pipeline

✅ **Early Detection** - Find vulnerabilities during development, not production
✅ **Automated Analysis** - No manual security reviews needed
✅ **Comprehensive Coverage** - Dependencies, code, and runtime environment
✅ **CRA Compliance** - Meet regulatory requirements
✅ **Cost Effective** - Prevent expensive security incidents
✅ **Developer Friendly** - Integrates seamlessly into existing workflow

## Limitations and Future Improvements

### Current Limitations
- False positives require manual triage
- Performance impact on CI/CD pipeline
- Some vulnerabilities require manual verification
- Tool configuration requires security expertise

### Recommended Improvements
- Implement Dynamic Application Security Testing (DAST)
- Add secret scanning for credentials
- Integrate Software Bill of Materials (SBOM) management
- Implement security policy enforcement
- Add runtime security monitoring

## Academic Context

This project is developed as part of the **Software Security Development (SSD)** course at EASV, specifically focusing on:

- **DevSecOps Practices** - Integrating security into DevOps
- **Automated Security Testing** - Using industry-standard tools
- **Cyber Resilience Act** - Understanding regulatory compliance
- **Secure SDLC** - Implementing security throughout development lifecycle
- **Vulnerability Management** - Identifying and remediating security issues

## Resources

### Official Documentation
- [SNYK Documentation](https://docs.snyk.io/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)

### Related Topics
- OWASP Top 10
- DevSecOps best practices
- Container security
- Supply chain security
- Software Bill of Materials (SBOM)

## License

UNLICENSED - Academic project for educational purposes

## Author

**EASV 2nd Semester - Software Security Development Final Exam Project**

---

**Note**: This project uses a financial tracking application as a sample codebase to demonstrate security pipeline implementation. The focus is on the security tooling and CI/CD integration, not the application functionality itself.
