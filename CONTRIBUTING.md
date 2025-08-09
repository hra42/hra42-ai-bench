# Contributing to HRA42 AI Bench

Thank you for your interest in contributing to HRA42 AI Bench! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Expected Behavior

- Be respectful and considerate
- Provide constructive feedback
- Accept responsibility for mistakes
- Focus on resolution rather than blame
- Help others learn and grow

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information
- Other conduct deemed unprofessional

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Git configured with your GitHub account
- Basic knowledge of TypeScript and SvelteKit
- Familiarity with the project structure

### First-Time Contributors

1. **Find an Issue**
   - Look for issues labeled `good first issue`
   - Check `help wanted` labels
   - Read issue descriptions carefully
   - Comment to claim an issue

2. **Understand the Codebase**
   - Read the [Architecture Documentation](docs/ARCHITECTURE.md)
   - Review existing code patterns
   - Explore the component structure
   - Understand the data flow

3. **Ask Questions**
   - Use GitHub Discussions for general questions
   - Comment on issues for specific clarifications
   - Join our Discord for real-time help

## Development Setup

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/hra42-ai-bench.git
cd hra42-ai-bench

# Add upstream remote
git remote add upstream https://github.com/hra42/hra42-ai-bench.git
```

### Install Dependencies

```bash
# Install project dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your OpenRouter API key to .env
```

### Database Setup

```bash
# Initialize the database
npm run db:init

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

### Start Development Server

```bash
# Start the development server
npm run dev

# Open http://localhost:5173
```

### Verify Setup

```bash
# Run type checking
npm run check

# Run linting
npm run lint

# Run tests
npm run test
```

## How to Contribute

### Types of Contributions

#### 🐛 Bug Fixes
- Identify and fix bugs
- Improve error handling
- Fix edge cases
- Enhance stability

#### ✨ Features
- Implement new benchmark types
- Add model integrations
- Create UI components
- Develop API endpoints

#### 📚 Documentation
- Improve existing docs
- Add code examples
- Create tutorials
- Update API documentation

#### 🎨 UI/UX Improvements
- Enhance visual design
- Improve accessibility
- Optimize responsive layouts
- Refine user workflows

#### ⚡ Performance
- Optimize queries
- Improve load times
- Reduce bundle size
- Enhance caching

#### 🧪 Testing
- Write unit tests
- Add integration tests
- Create E2E tests
- Improve coverage

### Contribution Ideas

#### Small Contributions
- Fix typos in documentation
- Add missing TypeScript types
- Improve error messages
- Add loading states

#### Medium Contributions
- Create new UI components
- Add export formats
- Implement keyboard shortcuts
- Enhance mobile experience

#### Large Contributions
- Add new benchmark types
- Integrate new model providers
- Implement plugin system
- Create visualization tools

## Development Workflow

### Branch Strategy

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions
- `perf/` - Performance improvements

### Commit Guidelines

#### Commit Message Format

```
type(scope): brief description

Longer explanation if needed. Explain the problem
this commit solves and why this approach was chosen.

Fixes #123
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Test addition
- `chore`: Maintenance

#### Examples

```bash
# Feature commit
git commit -m "feat(benchmark): add CSV export functionality

Implements CSV export for benchmark results with customizable
columns and filtering options.

Closes #45"

# Bug fix commit
git commit -m "fix(api): handle rate limit errors gracefully

Adds exponential backoff and retry logic for OpenRouter
API rate limit responses.

Fixes #67"
```

### Development Cycle

1. **Plan**
   - Understand requirements
   - Design solution
   - Consider edge cases

2. **Implement**
   - Write clean code
   - Follow project patterns
   - Add necessary types

3. **Test**
   - Write unit tests
   - Test manually
   - Check edge cases

4. **Document**
   - Add code comments
   - Update documentation
   - Add examples

5. **Review**
   - Self-review changes
   - Run linting
   - Check for regressions

## Coding Standards

### TypeScript Guidelines

```typescript
// Use explicit types
interface BenchmarkConfig {
  type: BenchmarkType;
  models: string[];
  prompt: string;
  config?: ModelConfig;
}

// Avoid any type
// ❌ Bad
function process(data: any) { }

// ✅ Good
function process(data: BenchmarkResult) { }

// Use enums for constants
enum BenchmarkStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Prefer interfaces over types for objects
// ✅ Good
interface User {
  id: string;
  name: string;
}

// Use async/await over promises
// ✅ Good
async function fetchData() {
  const result = await api.get('/data');
  return result;
}
```

### Svelte Component Guidelines

```svelte
<!-- Component structure -->
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  
  // 2. Props
  export let title: string;
  export let variant: 'primary' | 'secondary' = 'primary';
  
  // 3. State
  let isLoading = false;
  let data: any[] = [];
  
  // 4. Computed
  $: itemCount = data.length;
  
  // 5. Functions
  async function loadData() {
    isLoading = true;
    // Implementation
    isLoading = false;
  }
  
  // 6. Lifecycle
  onMount(() => {
    loadData();
  });
</script>

<!-- Template -->
<div class="container">
  {#if isLoading}
    <Spinner />
  {:else}
    <h1>{title}</h1>
    <!-- Content -->
  {/if}
</div>

<!-- No custom styles - use Tailwind only -->
```

### Tailwind CSS Guidelines

```svelte
<!-- Use Tailwind utilities exclusively -->
<!-- ❌ Bad -->
<div style="margin: 10px; padding: 20px;">

<!-- ✅ Good -->
<div class="m-2.5 p-5">

<!-- Responsive design -->
<div class="p-4 md:p-6 lg:p-8">

<!-- Component variants -->
<button class="
  px-4 py-2 rounded-lg transition-colors
  {variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}
">

<!-- Consistent spacing -->
<div class="space-y-4">
  <Card />
  <Card />
  <Card />
</div>
```

### File Organization

```typescript
// Group imports by type
// 1. Node/npm packages
import { writable } from 'svelte/store';

// 2. SvelteKit imports
import { page } from '$app/stores';

// 3. Local imports - types
import type { BenchmarkConfig } from '$lib/types';

// 4. Local imports - utils
import { formatCost } from '$lib/utils/format';

// 5. Local imports - components
import Button from '$lib/components/atoms/Button.svelte';
```

## Testing Guidelines

### Unit Testing

```typescript
// Example: Testing a utility function
import { describe, it, expect } from 'vitest';
import { formatCost } from '$lib/utils/format';

describe('formatCost', () => {
  it('should format cost with 4 decimal places', () => {
    expect(formatCost(0.0025)).toBe('$0.0025');
  });
  
  it('should handle zero cost', () => {
    expect(formatCost(0)).toBe('$0.0000');
  });
  
  it('should handle large costs', () => {
    expect(formatCost(123.456789)).toBe('$123.4568');
  });
});
```

### Component Testing

```typescript
// Example: Testing a Svelte component
import { render, fireEvent } from '@testing-library/svelte';
import Button from '$lib/components/atoms/Button.svelte';

describe('Button Component', () => {
  it('should render with text', () => {
    const { getByText } = render(Button, {
      props: { text: 'Click me' }
    });
    
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('should handle click events', async () => {
    const { component, getByRole } = render(Button);
    const button = getByRole('button');
    
    let clicked = false;
    component.$on('click', () => clicked = true);
    
    await fireEvent.click(button);
    expect(clicked).toBe(true);
  });
});
```

### Integration Testing

```typescript
// Example: Testing API endpoints
import { describe, it, expect } from 'vitest';

describe('API: /api/models', () => {
  it('should return list of models', async () => {
    const response = await fetch('/api/models');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.models).toBeInstanceOf(Array);
    expect(data.models.length).toBeGreaterThan(0);
  });
});
```

### Testing Best Practices

1. **Write tests first** (TDD when possible)
2. **Test behavior, not implementation**
3. **Keep tests simple and focused**
4. **Use descriptive test names**
5. **Avoid testing external services**
6. **Mock dependencies appropriately**
7. **Maintain high coverage (>80%)**

## Documentation

### Code Documentation

```typescript
/**
 * Executes a benchmark run across multiple models
 * @param config - Benchmark configuration
 * @param models - Array of model IDs to test
 * @returns Promise resolving to benchmark results
 * @throws {Error} If no models are selected
 * @example
 * const results = await executeBenchmark(
 *   { type: 'text', prompt: 'Hello' },
 *   ['gpt-4', 'claude-3']
 * );
 */
export async function executeBenchmark(
  config: BenchmarkConfig,
  models: string[]
): Promise<BenchmarkResult> {
  // Implementation
}
```

### README Updates

When adding features, update relevant sections:

1. Feature list if adding major functionality
2. Installation steps if requirements change
3. Configuration if new env vars added
4. API documentation for new endpoints
5. Examples for new use cases

### Changelog

Update `CHANGELOG.md` for significant changes:

```markdown
## [Unreleased]

### Added
- CSV export functionality for benchmark results (#45)
- Keyboard shortcuts for common actions

### Fixed
- Rate limit handling in OpenRouter client (#67)
- Memory leak in streaming responses

### Changed
- Improved error messages for better debugging
- Updated model selection UI for better UX
```

## Pull Request Process

### Before Submitting

1. **Update from upstream**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run quality checks**
```bash
npm run check
npm run lint
npm run test
npm run build
```

3. **Update documentation**
- Add/update relevant docs
- Update changelog
- Add code comments

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List specific changes
- Include reasoning
- Note any decisions made

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No regressions found

## Screenshots
(If UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors

Fixes #(issue number)
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs
   - Tests must pass
   - Linting must pass
   - Build must succeed

2. **Code Review**
   - At least one approval required
   - Address all feedback
   - Resolve conversations
   - Update PR if needed

3. **Merge**
   - Squash and merge for features
   - Regular merge for multi-commit features
   - Rebase and merge for fixes

### Post-Merge

1. Delete your feature branch
2. Update your local main
3. Thank reviewers
4. Monitor for issues

## Community

### Communication Channels

#### GitHub Discussions
- General questions
- Feature requests
- Ideas and feedback
- Community support

#### Discord Server
- Real-time chat
- Quick questions
- Collaboration
- Community events

#### GitHub Issues
- Bug reports
- Feature tracking
- Task assignment
- Progress updates

### Getting Help

#### For Questions
1. Check existing documentation
2. Search GitHub issues
3. Ask in Discussions
4. Join Discord for chat

#### For Problems
1. Search for similar issues
2. Create detailed bug report
3. Include reproduction steps
4. Provide system information

### Recognition

We value all contributions and recognize contributors through:

- Credits in release notes
- Contributors list in README
- Shoutouts in community channels
- Contributor badges

## Thank You!

Your contributions make HRA42 AI Bench better for everyone. We appreciate your time, effort, and expertise. Together, we're building the best LLM benchmarking platform!

---

**Questions?** Feel free to ask in [GitHub Discussions](https://github.com/hra42/hra42-ai-bench/discussions) or reach out on [Discord](https://discord.gg/hra42bench).