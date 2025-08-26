# 🚀 Advanced Development Kit (ADK)

> A comprehensive CLI toolkit for modern development workflows - featuring task automation, project cleaning, and developer utilities built with TypeScript.

[![npm version](https://img.shields.io/npm/v/advanced-dev-kit.svg)](https://www.npmjs.com/package/advanced-dev-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/AdarshHatkar/advanced-dev-kit.svg)](https://github.com/AdarshHatkar/advanced-dev-kit/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/AdarshHatkar/advanced-dev-kit.svg)](https://github.com/AdarshHatkar/advanced-dev-kit/issues)

## ✨ Features

- 🧹 **Project Cleanup** - Clean temporary files and build artifacts
- 🚀 **Smart Deployment** - Automated deployment workflows with version management
- 🩺 **Health Diagnostics** - System and environment health checks
- ⚡ **Fast & Modern** - Built with TypeScript and optimized for performance
- 🎨 **Beautiful UI** - Rich terminal interface with colors and animations


## 📦 Quick Start

### Option 1: Global Installation (Recommended)
```bash
npm install -g advanced-dev-kit
```

After global installation, use `adk` directly from anywhere:
```bash
adk --help
adk doctor
adk clean
```

### Option 2: Local Project Usage
```bash
# Install locally
npm install advanced-dev-kit

# Use with npx
npx adk --help
npx adk clean
```

### Option 3: Development Setup
```bash
# Clone and setup for development
git clone https://github.com/AdarshHatkar/advanced-dev-kit.git
cd advanced-dev-kit
npm install
npm run build

# Install globally from source
npm install -g .
```

## 🎯 Quick Commands

Once installed globally, here are the most common commands:

```bash
# Check system health and ADK installation
adk doctor

# Clean your project
adk clean

# Deploy to development
adk deploy dev

# Deploy to production (with version management)
adk deploy prod

# Get help
adk --help
```

## 📖 Detailed Usage

### 🧹 `adk clean`
Clean temporary folders and files from your project.

**What it cleans:**
- `node_modules/` directories
- Build artifacts (`dist/`, `build/`)
- Temporary files and caches
- Log files

**Usage:**
```bash
adk clean
```

### 🚀 `adk deploy`
Deployment commands with smart workflows and version management.

#### Deploy to Development
```bash
adk deploy dev
```
- Pushes main branch to dev branch with force
- Quick and simple development deployment

#### Deploy to Production
```bash
adk deploy prod
```
**Comprehensive production workflow:**
- ✅ Pulls latest changes from stable branch
- ✅ Checks for uncommitted changes
- ✅ Ensures you're on the main branch
- ✅ Auto-increments version if needed
- ✅ Creates deployment commit with timestamp
- ✅ Pushes changes to main branch
- ✅ Creates pull request from main to stable
- ✅ Opens PR in browser

### 🩺 `adk doctor`
Run comprehensive system and environment diagnostics.

**Checks:**
- ADK installation status
- Node.js and npm compatibility
- Git availability and repository status
- Available ADK commands
- Current project status

**Usage:**
```bash
adk doctor
```

## ⚙️ Configuration

### Deployment Tracking
ADK uses a `deploy.json` file to track deployment history and manage versions:

```json
{
  "last_deploy": "2025-07-05 14:30:00",
  "hash": "abc123def456", 
  "version": "1.2.3"
}
```

This file is automatically created and updated during production deployments.

## 🔧 Prerequisites for Production Deployment

Before using `adk deploy prod`, ensure you have:

1. **✅ Git Repository**
   - Must be a git repository
   - Requires `main` and `stable` branches

2. **✅ GitHub CLI** 
   ```bash
   # Install GitHub CLI
   npm install -g @github/cli
   
   # Authenticate
   gh auth login
   ```

3. **✅ Clean Working Directory**
   - No uncommitted changes
   - All changes should be committed

4. **✅ Correct Branch**
   - Must be on `main` branch for production deployment

## 🛠️ Development

### Building the Project
```bash
npm run build      # Build once
npm run dev        # Build and watch for changes
```

### Available Scripts
```bash
npm run build           # Build the project
npm run dev             # Build and watch for changes  
npm run clean           # Clean build artifacts
npm run deploy:dev      # Alias for 'adk deploy dev'
npm run deploy:prod     # Alias for 'adk deploy prod'
```

## 🐛 Troubleshooting

### Common Issues

**1. `adk: command not found`**
```bash
# Reinstall globally
npm install -g advanced-dev-kit

# Or check if npm global bin is in PATH
npm config get prefix
```

**2. Permission errors on Windows**
```bash
# Run PowerShell as Administrator, then:
npm install -g advanced-dev-kit
```

**3. Deploy command fails**
```bash
# Check prerequisites
adk doctor

# Ensure GitHub CLI is authenticated
gh auth status
```

### Getting Help
```bash
# Show help
adk --help

# Run diagnostics
adk doctor

# Check version
adk --version
```

**Need more help?**
- 📖 [Read the full documentation](https://github.com/AdarshHatkar/advanced-dev-kit#readme)
- 🐛 [Report a bug](https://github.com/AdarshHatkar/advanced-dev-kit/issues/new)
- 💡 [Request a feature](https://github.com/AdarshHatkar/advanced-dev-kit/issues/new)
- 💬 [Join discussions](https://github.com/AdarshHatkar/advanced-dev-kit/discussions)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/advanced-dev-kit.git
   cd advanced-dev-kit
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Make your changes**
5. **Build and test**
   ```bash
   npm run build
   npm install -g .  # Install your changes globally
   adk doctor        # Test the installation
   ```
6. **Submit a pull request**

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [TypeScript](https://www.typescriptlang.org/)
- CLI framework powered by [Commander.js](https://github.com/tj/commander.js/)
- Beautiful terminal UI with [Boxen](https://github.com/sindresorhus/boxen) and [Chalk](https://github.com/chalk/chalk)

---

<div align="center">

**Made with ❤️ for developers who love beautiful and efficient tools**

[Report Bug](https://github.com/AdarshHatkar/advanced-dev-kit/issues) • [Request Feature](https://github.com/AdarshHatkar/advanced-dev-kit/issues) • [Documentation](https://github.com/AdarshHatkar/advanced-dev-kit#readme)

</div>