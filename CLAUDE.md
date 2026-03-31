# CLAUDE.md - Repository Guidelines for AI Assistants

This document provides comprehensive guidelines for AI assistants working in this repository. It explains the codebase structure, development workflows, and key conventions to follow.

## Repository Overview

**Repository Name:** New-repository  
**Status:** Newly initialized  
**Primary Branch:** (To be determined based on project)  
**Development Branch:** `claude/add-claude-documentation-8lBGa`

### Project Description
*[Update this section with your specific project details]*

---

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Development Workflow](#development-workflow)
3. [Code Conventions](#code-conventions)
4. [Git Practices](#git-practices)
5. [Testing & Quality](#testing--quality)
6. [Common Patterns](#common-patterns)
7. [Documentation](#documentation)
8. [Quick Reference](#quick-reference)

---

## Repository Structure

*The repository will follow this structure:*

```
/
├── CLAUDE.md                 # This file - guidelines for AI assistants
├── README.md                 # Project overview and setup instructions
├── .gitignore               # Git ignore rules
├── package.json             # Project dependencies (if applicable)
├── src/                     # Source code directory
│   ├── index.js            # Entry point
│   ├── components/         # Reusable components
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── tests/                  # Test files
├── docs/                   # Documentation
└── .github/
    └── workflows/          # CI/CD workflows (GitHub Actions)
```

**Key Directories:**
- `src/` - All source code goes here
- `tests/` - All test files
- `docs/` - Additional documentation
- `.github/` - GitHub-specific configuration

---

## Development Workflow

### 1. Branch Management

**Naming Convention:**
- Feature branches: `feature/<name>` (e.g., `feature/user-auth`)
- Bug fixes: `fix/<name>` (e.g., `fix/login-redirect`)
- Documentation: `docs/<name>` (e.g., `docs/api-guide`)
- Chores: `chore/<name>` (e.g., `chore/update-deps`)
- Claude-generated: `claude/<task>-<id>` (e.g., `claude/add-tests-abc123`)

**Primary Development Branch:** `main` or `develop` (to be set)

### 2. Commit Workflow

```bash
# 1. Create or switch to your branch
git checkout -b feature/your-feature

# 2. Make changes following code conventions (see below)
# ... edit files ...

# 3. Stage and commit with clear messages
git add src/
git commit -m "Add feature: clear description"

# 4. Push to remote
git push -u origin feature/your-feature

# 5. Create PR when ready for review
```

### 3. Pull Request Process

**PR Title Format:** `[TYPE] Short description` (e.g., `[FEAT] Add user authentication`)

**Types:**
- `[FEAT]` - New feature
- `[FIX]` - Bug fix
- `[DOCS]` - Documentation
- `[REFACTOR]` - Code refactoring
- `[TEST]` - Test additions/updates
- `[CHORE]` - Build, dependencies, etc.

**PR Description Template:**
```markdown
## Summary
Brief description of changes

## Changes Made
- Bullet point 1
- Bullet point 2

## Testing
Describe how the changes were tested

## Related Issues
Closes #123
```

### 4. Code Review Guidelines

- Review for correctness, not style (formatting is automated)
- Check for security issues
- Ensure tests are included for new code
- Verify documentation is updated

---

## Code Conventions

### General Principles

1. **Write clean, readable code** - Code is read more often than written
2. **No premature optimization** - Make it work, then optimize if needed
3. **DRY Principle** - Don't Repeat Yourself; extract common patterns
4. **KISS Principle** - Keep It Simple, Stupid; avoid over-engineering
5. **Security First** - Validate inputs, avoid common vulnerabilities

### Naming Conventions

**Variables & Functions:**
```javascript
// Good
const userName = "Alice";
function validateEmail(email) { }
const MAX_RETRIES = 3;

// Avoid
const u = "Alice";
function chk(e) { }
const maxRetries = 3; // should be SCREAMING_SNAKE_CASE for constants
```

**Classes & Types:**
```javascript
// Good
class UserManager { }
interface UserData { }
type ApiResponse = { };

// Avoid
class userManager { }
interface userData { }
type ApiResponse_T = { };
```

**File Naming:**
- Components: `PascalCase.jsx` or `PascalCase.ts`
- Utilities: `camelCase.js`
- Config: `lowercase.config.js`
- Tests: `filename.test.js` or `filename.spec.js`

### Code Style

**Indentation:**
- Use 2 spaces (not tabs)
- Consistent throughout the project

**Line Length:**
- Maximum 100 characters per line
- Break long lines logically

**Comments:**
```javascript
// Use single-line comments for brief explanations
// Explain WHY, not WHAT (code shows what)

/**
 * Use JSDoc for functions and exports
 * @param {string} name - User name
 * @returns {Promise<User>} The user object
 */
function getUser(name) { }
```

**Error Handling:**
- Always handle errors explicitly
- Don't silently fail
- Log meaningful error messages

```javascript
try {
  await processData(data);
} catch (error) {
  console.error('Failed to process data:', error.message);
  throw error; // or handle appropriately
}
```

### Language-Specific Guidelines

*[Update based on project language(s)]*

#### JavaScript/TypeScript
- Use `const` by default, `let` if needed, never `var`
- Use async/await over `.then()` chains
- Type everything (if using TypeScript)
- No `any` types without explicit reasoning

#### Python
- Follow PEP 8
- Use type hints: `def func(name: str) -> int:`
- Use docstrings for modules, classes, and functions
- Use `black` for formatting if available

---

## Git Practices

### Best Practices

1. **Commit Frequently** - Small, focused commits are easier to review and revert if needed
2. **Meaningful Messages** - First line is 50 chars max, detailed description below
3. **Never Force Push to Shared Branches** - Only force push to your own feature branches
4. **Keep Branches Up to Date** - Rebase/merge main regularly to avoid conflicts
5. **Review Your Own PR First** - Check diff before requesting review

### Commit Message Format

```
[TYPE] Brief description (max 50 chars)

Longer explanation if needed. Explain what and why, not how.
Can be multiple paragraphs.

- Use bullets for multiple changes
- Keep it readable

Closes #123
```

**Types for commit messages:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Build, dependencies, etc.

### Handling Merge Conflicts

```bash
# 1. Pull the latest main
git fetch origin
git rebase origin/main

# 2. Resolve conflicts in your editor
# 3. Mark as resolved
git add .
git rebase --continue

# 4. Force push your branch (only your feature branch!)
git push -f origin feature/your-feature
```

---

## Testing & Quality

### Testing Requirements

1. **Unit Tests** - Test individual functions/methods
2. **Integration Tests** - Test interactions between components
3. **Coverage Target** - Aim for >80% code coverage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- filename.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test File Organization

```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
└── fixtures/  # Mock data
```

### Test Naming Convention

```javascript
describe('UserManager', () => {
  describe('createUser', () => {
    it('should create a user with valid data', () => {
      // Arrange
      const userData = { name: 'Alice' };
      
      // Act
      const user = new UserManager().createUser(userData);
      
      // Assert
      expect(user.name).toBe('Alice');
    });

    it('should throw error for missing name', () => {
      expect(() => {
        new UserManager().createUser({});
      }).toThrow();
    });
  });
});
```

---

## Common Patterns

### For AI Assistants Working on This Repository

#### When Starting Work

1. **Read this file first** - Understand the conventions
2. **Check the README** - Understand project setup
3. **Look at existing code** - Follow established patterns
4. **Ask for clarification** - If guidelines are unclear

#### When Making Changes

1. **Follow naming conventions** - Consistency matters
2. **Write tests first** - TDD approach preferred
3. **Keep commits atomic** - One logical change per commit
4. **Document as you go** - Update docs with changes
5. **Run tests locally** - Ensure nothing breaks

#### Pattern Examples

**Creating a New Module:**
```javascript
/**
 * utils/validator.js
 * Validation utilities for user input
 */

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password) {
  // At least 8 chars, 1 uppercase, 1 number
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}
```

**Creating a Test File:**
```javascript
import { isValidEmail } from '../src/utils/validator.js';

describe('validator', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
    });
  });
});
```

---

## Documentation

### What to Document

1. **README.md** - Project overview, setup, basic usage
2. **Code Comments** - Complex logic, WHY decisions
3. **Docstrings** - All public functions and classes
4. **CHANGELOG** - Track changes (if applicable)
5. **API Documentation** - If building an API

### Documentation Standards

- Use Markdown format
- Keep up-to-date with code changes
- Include examples where helpful
- Link to related documents

---

## Quick Reference

### Common Commands

```bash
# Setup
git clone <repo-url>
cd <repo>
npm install

# Development
git checkout -b feature/my-feature
npm run dev       # Start dev server
npm test          # Run tests
npm run lint      # Check code quality

# Before Committing
npm run format    # Format code
npm test          # Run tests
git diff          # Review changes

# Creating PR
git push -u origin feature/my-feature
# Then create PR on GitHub

# Keeping Updated
git fetch origin
git rebase origin/main
npm install       # If deps changed
```

### Important Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file - AI assistant guidelines |
| `README.md` | Project overview and setup |
| `package.json` | Dependencies and scripts |
| `.gitignore` | Files to exclude from git |
| `.github/workflows/` | CI/CD automation |

---

## Troubleshooting

### Common Issues

**Merge conflicts when rebasing:**
```bash
# Resolve conflicts, then:
git add .
git rebase --continue
git push -f origin feature/branch
```

**Accidentally committed to wrong branch:**
```bash
# Move commits to correct branch
git reflog  # Find commit hash
git cherry-pick <hash>
git reset --hard HEAD~1  # Remove from wrong branch
```

**Need to update from main:**
```bash
git fetch origin
git rebase origin/main
npm install
```

---

## Notes for Updates

This document should be updated when:
- New conventions are established
- Architecture changes
- New tools are adopted
- Workflows are refined

**Last Updated:** 2026-03-31  
**Maintainer:** Repository Owner

---

## Additional Resources

*[Add links to relevant resources for your project]*

- Project Wiki: [Add URL]
- Architecture Guide: [Add URL]
- API Documentation: [Add URL]
- Team Documentation: [Add URL]

---

**Remember:** This guide exists to make development smoother and code more maintainable. If something is unclear or needs updating, propose improvements!
