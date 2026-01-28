# GitHub Actions Workflows

This repository contains a comprehensive CI/CD pipeline with security scanning and automated maintenance workflows.

## Workflow Overview

### CI/CD Pipeline

#### ci-build.yml
Continuous Integration workflow that runs on every push and PR.
- Lints code for style and quality issues
- Builds the application
- Uploads build artifacts
- **Triggers:** Push to any branch, PR to main

#### cd-docker.yml
Continuous Deployment workflow for Docker images.
- Builds multi-platform Docker images
- Pushes to GitHub Container Registry
- Tags images appropriately based on branch/tag
- Uses layer caching for faster builds
- **Triggers:** Push to main/release branches, version tags

#### cd-deploy.yml
Automated deployment to staging/production environments.
- Deploys after successful Docker build
- Environment-specific deployment strategies
- Creates GitHub deployments for tracking
- **Triggers:** After Docker build completes, manual dispatch

#### release.yml
Release management and versioning.
- Creates GitHub releases with changelogs
- Updates package versions
- Generates release notes automatically
- Supports prerelease versions
- **Triggers:** Version tags (v*), manual dispatch

### Testing

#### test.yml
Runs application tests and generates coverage reports.
- Unit tests
- Integration tests
- Code coverage analysis
- Coverage report artifacts
- **Triggers:** Push to any branch, PR to main

### Security Workflows

#### container-scanning.yml
Scans Docker images for vulnerabilities using Trivy.
- Container image scanning
- Filesystem scanning
- Security gate enforcement (phased by environment)
- SARIF upload to GitHub Security
- **Triggers:** Push to any branch, PR to main, weekly schedule, manual

#### dependency-scanning.yml
Scans dependencies for known vulnerabilities using SNYK.
- Dependency vulnerability scanning
- Software Bill of Materials (SBOM) generation
- CycloneDX format for compliance
- **Triggers:** Push to any branch, PR to main, daily schedule, manual

#### static-analysis.yml
Static code analysis using CodeQL.
- JavaScript/TypeScript analysis
- Security-extended query suite
- Automated code scanning alerts
- **Triggers:** Push to any branch, PR to main, weekly schedule, manual

#### secrets-detection.yml
Scans git history for hardcoded secrets using TruffleHog.
- Full git history scanning
- Secret detection and reporting
- Security recommendations
- **Triggers:** Push to any branch, PR to main, manual

### Quality & Maintenance

#### pr-validation.yml
Validates pull requests before merge.
- Semantic PR title validation
- Merge conflict detection
- Branch naming convention checks
- File size limit checks
- **Triggers:** PR opened/updated to main or release branches

#### dependency-updates.yml
Automated dependency maintenance.
- Weekly dependency updates
- Patch and minor version updates
- Automated security fixes
- Creates PRs for review
- **Triggers:** Weekly schedule, manual dispatch

#### cleanup.yml
Cleans up old artifacts and workflow data.
- Removes artifacts older than 30 days
- Removes failed workflow runs older than 90 days
- Clears unused caches older than 7 days
- **Triggers:** Weekly schedule, manual dispatch

## Security Gates

The container scanning workflow implements environment-based security gates:

- **Development:** Monitoring mode, all vulnerabilities logged
- **Staging:** Blocks CRITICAL vulnerabilities
- **Production:** Blocks CRITICAL and HIGH vulnerabilities

## Required Secrets

Configure these secrets in your repository settings:

- `SNYK_TOKEN` - For dependency scanning (optional but recommended)
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Artifact Retention

- Build artifacts: 7 days
- Test coverage: 30 days
- Security reports: 30-90 days
- Container reports: 90 days

## Permissions

Workflows use minimal required permissions following the principle of least privilege:
- `contents: read/write` - For repository access
- `security-events: write` - For security scanning uploads
- `packages: write` - For Docker registry
- `deployments: write` - For deployment tracking
- `pull-requests: write` - For PR automation

## Customization

### Deployment URLs
Update the deployment URLs in `cd-deploy.yml`:
```yaml
environment-url: https://${{ steps.environment.outputs.environment }}.example.com
```

### Container Registry
The workflows use GitHub Container Registry by default. To use a different registry, update `cd-docker.yml`:
```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

### Branch Strategy
Current branch strategy:
- `main` - Production deployments
- `release/*` - Staging deployments
- `feature/*`, `bugfix/*`, etc. - Development

## Best Practices

1. All workflows follow naming conventions
2. Consistent error handling with `continue-on-error`
3. Comprehensive summaries in `$GITHUB_STEP_SUMMARY`
4. Unique artifact names using commit SHA
5. Appropriate caching for faster builds
6. Security-first approach with multiple scanning layers