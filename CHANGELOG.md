# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-28

### 🎉 Initial Release

This is the first major release of FormatAI with production-ready features and Docker support.

### 🐳 Added - Docker Support
- **Docker Configuration**: Complete Docker setup with multi-stage build
- **Docker Compose**: Easy deployment with `docker-compose.yml`
- **Production Ready**: Nginx-based production container
- **Environment Variables**: Secure API key management for containers
- **Health Checks**: Automatic container health monitoring
- **Auto-restart**: Resilient container configuration

### 🔧 Added - Configuration & Setup
- **Unified Ports**: Both development and production use port 5175
- **Enhanced .gitignore**: Comprehensive patterns for Node.js, Docker, and development files
- **Environment Template**: `.env.example` for easy setup
- **Build Optimization**: Multi-stage Docker build for smaller production images

### 🤖 Added - AI Features  
- **Multi-Provider Support**: Google Gemini and OpenRouter integration
- **Flexible Model Selection**: Support for custom models
- **Local Storage**: Browser-based API key persistence
- **Fallback System**: Environment variables → Local storage → Build args

### 🎨 Added - UI/UX
- **Dark Theme**: Modern, professional dark theme design
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Real-time Preview**: Live HTML rendering with syntax highlighting
- **File Upload**: Support for .txt and .md files
- **LaTeX Rendering**: KaTeX integration for mathematical equations
- **Mermaid Diagrams**: Professional diagram generation

### 🔨 Added - Technical Features
- **Vite Build Tool**: Lightning-fast development and build process
- **TypeScript**: Full TypeScript support for better development experience
- **React 19**: Latest React with modern hooks and patterns
- **Security Headers**: Nginx configuration with security best practices
- **Error Handling**: Comprehensive error handling and user feedback

### 📚 Added - Documentation
- **Comprehensive README**: Detailed setup and usage instructions
- **Docker Documentation**: Complete Docker deployment guide
- **API Key Setup**: Step-by-step API key configuration
- **Troubleshooting**: Common issues and solutions guide

### 🔒 Security
- **Secure API Keys**: Multiple secure methods for API key management
- **Content Security**: Proper handling of user-generated content
- **Docker Security**: Non-root user and minimal container privileges
- **Environment Isolation**: Proper separation of development and production configs

### 🚀 Performance
- **Optimized Build**: Efficient Vite build configuration
- **Static Assets**: Nginx-optimized static file serving
- **Lazy Loading**: Dynamic imports where appropriate
- **Caching**: Proper browser caching headers

---

## Future Releases

Stay tuned for upcoming features:
- Additional AI provider integrations
- More export formats (PDF, Word, etc.)
- Collaborative features
- Plugin system
- Advanced theming options

---

## [1.0.1] - 2025-09-29

### 🎨 Improved - Mermaid.js Diagram Formatting
- **Enhanced Diagram Rendering**: Improved Mermaid.js formatting rules for better diagram compatibility
- **Quote Consistency**: All labels and texts now properly enclosed in double quotes
- **Arrow Direction**: Standardized left-to-right arrow notation for consistency
- **Direction Declarations**: All flowcharts now use LR (Left to Right) direction
- **Special Character Support**: Better handling of special characters in diagram labels

### 🔧 Technical Improvements
- **Enhanced Prompt System**: Updated AI service with comprehensive Mermaid.js formatting rules
- **Better Error Prevention**: Prevents rendering issues with special characters in diagrams
- **Consistent Output**: Ensures uniform diagram appearance across all supported types

---

**Full Changelog**: https://github.com/LookUpMark/format-ai/commits/v1.0.1