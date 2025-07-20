# Contributing to RateMyMelon

Thank you for your interest in contributing to RateMyMelon! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment for all contributors
- Report any unacceptable behavior to the project maintainers

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ratemymelon.git
   cd ratemymelon
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/original-owner/ratemymelon.git
   ```

## Development Setup

Follow the setup instructions in the [README.md](README.md) to get your development environment running.

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Cloudinary account for image storage

### Environment Setup

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   ```

2. Configure your environment variables with your own API keys and database URLs

3. Install dependencies and start development servers:
   ```bash
   npm install
   cd server && npm install && cd ..
   npm run dev
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-analysis-metric`
- `fix/webbing-detection-accuracy`
- `docs/update-api-documentation`
- `refactor/optimize-image-processing`

### Commit Messages

Write clear, descriptive commit messages:
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when applicable

Example:
```
Add field spot detection enhancement

- Implement detailed color analysis for better accuracy
- Add specialized sampling for field spot regions
- Fix issue where scores were dropping to zero
- Closes #123
```

## Submitting Changes

1. **Update your fork:**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Go to GitHub and create a pull request
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

### Pull Request Guidelines

- **Description:** Clearly describe what your PR does and why
- **Testing:** Include information about how you tested your changes
- **Screenshots:** For UI changes, include before/after screenshots
- **Breaking Changes:** Clearly mark any breaking changes
- **Documentation:** Update documentation if needed

## Code Style

### JavaScript/React

- Use ES6+ features
- Follow React best practices and hooks patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization

- Components in `src/components/`
- Utilities in `src/utils/`
- Styles in `src/styles/`
- Server code in `server/`

### Example Code Style

```javascript
// Good
const analyzeWatermelonFeatures = async (imageData) => {
  try {
    const features = await extractFeatures(imageData);
    return calculateScores(features);
  } catch (error) {
    console.error('Analysis failed:', error);
    throw new Error('Failed to analyze watermelon features');
  }
};

// Avoid
const analyze = (img) => {
  // Complex logic without comments
  let x = img.data;
  // ... unclear operations
  return x;
};
```

## Testing

### Running Tests

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test
```

### Writing Tests

- Write unit tests for utility functions
- Test React components with React Testing Library
- Include integration tests for API endpoints
- Test edge cases and error conditions

### Test Structure

```javascript
describe('Watermelon Analysis', () => {
  test('should detect webbing patterns correctly', () => {
    const mockImage = createMockImageData();
    const result = detectWebbing(mockImage);
    
    expect(result.score).toBeGreaterThan(0);
    expect(result.confidence).toBeDefined();
  });
});
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Screenshots** if applicable
5. **Environment details:**
   - Browser and version
   - Operating system
   - Node.js version
   - Any relevant console errors

### Feature Requests

For feature requests, please include:

1. **Clear description** of the proposed feature
2. **Use case** - why is this feature needed?
3. **Proposed solution** if you have ideas
4. **Alternatives considered**

### Issue Templates

Use the provided issue templates when creating new issues to ensure all necessary information is included.

## Development Guidelines

### Performance Considerations

- Optimize image processing algorithms
- Use efficient data structures
- Minimize API calls
- Implement proper caching strategies
- Monitor bundle size

### Security Best Practices

- Validate all user inputs
- Sanitize data before database operations
- Use environment variables for sensitive data
- Implement proper error handling
- Follow OWASP security guidelines

### Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain good color contrast
- Test with screen readers

## Getting Help

- **Documentation:** Check the README and existing documentation first
- **Issues:** Search existing issues before creating new ones
- **Discussions:** Use GitHub Discussions for questions and ideas
- **Code Review:** Don't hesitate to ask for feedback on your PRs

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special thanks in documentation

Thank you for contributing to RateMyMelon! 🍉