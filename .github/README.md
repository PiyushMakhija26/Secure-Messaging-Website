# GitHub Repository Information

This repository contains a complete full-stack secure messaging application with end-to-end encryption (E2E).

## Quick Links

- 📖 [Main README](../README.md) - Complete documentation
- 🚀 [Quick Start Guide](../QUICK_START.md) - Get started in 5 minutes
- 🐛 [Testing Guide](../TESTING.md) - How to test the application
- 📝 [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- 📋 [System Status](../SYSTEM_STATUS.md) - Current system status and known issues
- 🚢 [Deployment Ready](../DEPLOYMENT_READY.md) - Production deployment guide

## Project Structure

```
.
├── backend/           # Node.js + Express + MongoDB backend
├── frontend/          # React frontend
├── .github/           # GitHub configuration
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── workflows/          # CI/CD workflows
└── [documentation files]   # READMEs and guides
```

## Features

- ✅ End-to-End Encryption (TweetNaCl.js)
- ✅ Real-time Messaging (WebSocket)
- ✅ User Authentication (JWT)
- ✅ Room Management with Admin Controls
- ✅ Message History (server-side, encrypted)
- ✅ Responsive UI (Black/White Minimalist Design)
- ✅ Password-Protected Rooms
- ✅ Multi-user Support

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- WebSocket (ws)
- TweetNaCl.js
- JWT + bcrypt

**Frontend:**
- React 18
- React Router
- Axios
- TweetNaCl.js
- CSS (no frameworks, hand-crafted)

## Getting Help

1. **Check Documentation** - Start with [README.md](../README.md)
2. **Search Issues** - Your question might already be answered
3. **Create an Issue** - Use the provided templates for bugs and features
4. **Contribute** - Follow the [CONTRIBUTING.md](../CONTRIBUTING.md) guide

## Repository Status

- **Status**: ✅ Active Development
- **Latest Release**: v1.0.0
- **Node Version Required**: 14+
- **MongoDB**: 4.0+

## Code Standards

- Follow existing code style
- Use meaningful commit messages
- Add comments for complex logic
- Test changes before submitting PR

## Security

⚠️ **Important**: This is a demonstration project. For production use with sensitive data:
- Conduct professional security audit
- Implement key backup/recovery
- Configure proper HTTPS
- Use strong JWT secrets
- Implement rate limiting

See [Deployment Guide](../DEPLOYMENT_READY.md) for production considerations.

## License

MIT - See [LICENSE](../LICENSE) file

---

**Questions?** Create an issue or check the documentation files above!
