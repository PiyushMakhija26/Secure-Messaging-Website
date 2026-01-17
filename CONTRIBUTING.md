# Contributing to Secure Messaging Website

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful and professional. We're building a secure, inclusive community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/secure-messaging-website.git
   cd secure-messaging-website
   ```
3. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 14+ and npm/yarn
- MongoDB (running locally or cloud instance)
- Git

### Installation

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm start
   ```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Branch Naming Convention

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

Example: `feature/add-message-reactions`, `bugfix/websocket-connection-loss`

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
<type>: <description>

<optional body with more details>

<optional footer with issue references>
```

**Types**:
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that don't affect code meaning (formatting, etc)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Changes to build process, dependencies, etc

**Examples**:
```
feat: add message encryption validation

fix: resolve WebSocket connection timeout issue

docs: update installation instructions
```

## Making Changes

### Code Style
- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### Frontend
- Use functional components with hooks
- Keep components modular and reusable
- Maintain the black/white minimalist design aesthetic
- Test responsive design at mobile, tablet, and desktop sizes

### Backend
- Follow Node.js best practices
- Use async/await over callbacks
- Validate all user inputs
- Add proper error handling
- Log important events for debugging

## Testing

- Test your changes thoroughly
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- For mobile: test on actual devices or use browser DevTools
- Test with multiple user accounts if possible
- Verify WebSocket connections work properly

## Pull Request Process

1. **Update your branch**:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what you changed and why
   - Reference to related issues (if any): `Closes #123`
   - Screenshots for UI changes
   - List of testing performed

4. **Respond to review comments** promptly and professionally

### PR Checklist
- [ ] Changes follow code style guidelines
- [ ] Self-review of changes performed
- [ ] Comments added for complex logic
- [ ] No new warnings generated
- [ ] Dependent changes merged and published
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if applicable)

## Reporting Issues

Use GitHub Issues to report bugs or suggest features. Include:

**For Bugs**:
- Browser and OS information
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

**For Features**:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach (optional)

## Questions?

Feel free to ask questions by:
- Opening an issue with the `question` label
- Checking existing issues for answers
- Reviewing the documentation in README.md and QUICK_START.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
