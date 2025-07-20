# Security Policy

## Supported Versions

We actively support the following versions of RateMyMelon with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of RateMyMelon seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: security@ratemymelon.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### Preferred Languages

We prefer all communications to be in English.

## Security Measures

RateMyMelon implements several security measures to protect user data and system integrity:

### Data Protection
- All user images are processed securely and stored with proper access controls
- User consent is required before any data collection
- Personal data is handled in compliance with GDPR and privacy regulations
- Secure API endpoints with proper validation and sanitization

### Infrastructure Security
- Environment variables for sensitive configuration
- Secure database connections with authentication
- HTTPS enforcement in production
- Input validation and sanitization on all endpoints
- Rate limiting to prevent abuse
- Proper error handling to prevent information disclosure

### Code Security
- Regular dependency updates and vulnerability scanning
- Secure coding practices following OWASP guidelines
- Input validation and output encoding
- Protection against common web vulnerabilities (XSS, CSRF, SQL injection)

## Security Best Practices for Contributors

When contributing to RateMyMelon, please follow these security guidelines:

### Code Review
- All code changes require review before merging
- Security-sensitive changes require additional scrutiny
- Automated security scanning on pull requests

### Dependencies
- Keep dependencies up to date
- Review new dependencies for known vulnerabilities
- Use `npm audit` to check for security issues

### Data Handling
- Never log sensitive information
- Validate all user inputs
- Use parameterized queries for database operations
- Implement proper access controls

### Environment Configuration
- Never commit secrets or API keys to the repository
- Use environment variables for configuration
- Follow the principle of least privilege

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Initial response and acknowledgment
3. **Day 3-7**: Vulnerability assessment and validation
4. **Day 8-30**: Development of fix (timeline depends on severity)
5. **Day 31-45**: Testing and deployment of fix
6. **Day 46+**: Public disclosure (coordinated with reporter)

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed and fixed. Users will be notified through:

- GitHub security advisories
- Release notes
- Email notifications (if applicable)
- Documentation updates

## Scope

This security policy applies to:

- The main RateMyMelon application (frontend and backend)
- Official deployment configurations
- Documentation and guides
- Dependencies and third-party integrations

## Out of Scope

The following are generally considered out of scope:

- Vulnerabilities in third-party services (Cloudinary, MongoDB Atlas, etc.)
- Issues requiring physical access to servers
- Social engineering attacks
- Denial of service attacks
- Issues in unsupported versions

## Recognition

We appreciate the security research community's efforts to improve the security of RateMyMelon. Researchers who responsibly disclose vulnerabilities will be:

- Acknowledged in our security advisories (with permission)
- Listed in our contributors section
- Provided with updates on the fix progress

## Contact

For security-related questions or concerns, please contact:

- Email: security@ratemymelon.com
- For general questions: Use GitHub Discussions
- For non-security bugs: Use GitHub Issues

Thank you for helping keep RateMyMelon and our users safe!