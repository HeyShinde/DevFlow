# Release Notes

This page contains information about DevFlow releases, versioning, and changelog.

---

## Current Version

**DevFlow v0.0.1** - Initial Release

---

## Changelog

We follow the [Keep a Changelog](http://keepachangelog.com/) format for our release notes.

### [Unreleased]

**Added:**
- Initial release of DevFlow
- VS Code extension with sidebar UI
- Python backend with FastAPI
- Code indexing and search functionality
- AI-powered code understanding
- Find similar code feature
- Repository management tools
- Real-time backend logs
- AI settings configuration

**Features:**
- Natural language code search
- Semantic code similarity search
- Context-aware AI answers
- Multi-language support (Python, JavaScript, TypeScript, Java, Go, C++, C#, Rust, PHP, C)
- Vector embeddings with ChromaDB
- RESTful API endpoints
- Health monitoring and statistics
- Rate limiting and caching

---

## Versioning

DevFlow follows [Semantic Versioning](https://semver.org/) (SemVer):

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR**: Incompatible API changes
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Version History

| Version | Release Date | Description |
|---------|-------------|-------------|
| 0.0.1 | Initial | First release with core features |

---

## Reading the Changelog

### Change Types

**Added:** New features
**Changed:** Changes in existing functionality
**Deprecated:** Features that will be removed
**Removed:** Features that have been removed
**Fixed:** Bug fixes
**Security:** Security-related changes

### Example Entry

```markdown
## [1.2.0] - 2025-01-15

### Added
- New search endpoint with advanced filtering
- Support for TypeScript interfaces
- Dark mode theme for sidebar

### Changed
- Improved search performance by 40%
- Updated OpenAI model to gpt-4.1-turbo

### Fixed
- Resolved memory leak in vector store
- Fixed search results not displaying correctly
```

---

## Release Schedule

### Planned Releases

- **v0.1.0**: Enhanced search capabilities
- **v0.2.0**: Additional language support
- **v1.0.0**: Production-ready release

### Release Process

1. **Development**: Features developed in `main` branch
2. **Testing**: Comprehensive testing before release
3. **Release**: Tagged release with changelog update
4. **Distribution**: Published to VS Code Marketplace

---

## Breaking Changes

Breaking changes will be clearly marked in the changelog and will trigger a MAJOR version bump.

### Migration Guides

When breaking changes occur, migration guides will be provided to help users upgrade smoothly.

---

## Support

### Version Support

- **Current Version**: Full support
- **Previous Version**: Bug fixes only
- **Older Versions**: No support

### Upgrade Path

Always check the changelog before upgrading to understand any breaking changes or new requirements.

---

## Contributing to Release Notes

When contributing to DevFlow, please update the changelog in your pull requests:

1. Add your changes to the `[Unreleased]` section
2. Use appropriate change type labels
3. Provide clear, concise descriptions
4. Include issue numbers when relevant

### Example Contribution

```markdown
## [Unreleased]

### Added
- New feature description (#123)

### Fixed
- Bug fix description (#456)
```

---

## Links

- [Full Changelog](https://github.com/heyshinde/devflow/blob/main/CHANGELOG.md)
- [GitHub Releases](https://github.com/heyshinde/devflow/releases)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=devflow)

For the most up-to-date information, always check the [GitHub repository](https://github.com/heyshinde/devflow). 