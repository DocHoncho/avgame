# Contributing to AVGame

This document outlines the development workflow and best practices for contributing to the AVGame project.

## Development Workflow

### 1. Progress Tracking

When working on the project, always keep the progress documentation up-to-date:

- **Update `docs/ImplementationProgress.md`** when starting or completing tasks
- **Mark completed phases** in `docs/ImplementationPlan.md` with a checkmark (✅)
- **Update the "Current Focus" section** in both documents to reflect the current work

Remember that these documents serve as a living record of the project's status and help coordinate work between team members.

### 2. Commit Guidelines

Make focused, granular commits that represent logical units of work:

- **One feature or fix per commit** - Avoid bundling unrelated changes
- **Descriptive commit messages** - Follow the format below
- **Regular commits** - Commit frequently rather than making massive changes

#### Commit Message Format

```
[Phase X][Component] Brief description of the change

More detailed explanation if needed, including:
- What was changed
- Why it was changed
- Any notable implementation details
```

Examples:
```
[Phase 2][Input] Implement WASD keyboard movement

[Phase 2][Physics] Add capsule collision detection

[Phase 2][ECS] Set up basic entity component system with Transform component
```

### 3. Branch Strategy

- **Main branch** - Always stable, deployable code
- **Feature branches** - Create a branch for each feature or task
  - Format: `feature/phase-2-input-system` or `fix/renderer-performance`
- **Pull requests** - Use PRs for code review before merging to main

### 4. Testing

- **Write tests alongside code** - Aim for good test coverage
- **Run tests before committing** - Ensure your changes don't break existing functionality
- **Update tests when changing behavior** - Keep tests in sync with implementation

## Development Cycle

1. **Select a task** from the current phase in the Implementation Plan
2. **Update ImplementationProgress.md** to mark the task as "In Progress"
3. **Create a feature branch** for your work
4. **Implement the feature** with regular, focused commits
5. **Write/update tests** for your changes
6. **Run tests** to ensure everything works
7. **Update documentation** if needed
8. **Create a pull request** for review
9. **Update ImplementationProgress.md** to mark the task as "Complete"
10. **Update ImplementationPlan.md** if a phase is completed

## Code Style

- Follow the ESLint and Prettier configurations
- Use TypeScript types appropriately
- Document public APIs with JSDoc comments
- Follow the existing patterns in the codebase

## Remember

- **Quality over speed** - It's better to do it right than to do it quickly
- **Communication is key** - Document your work and decisions
- **Keep the big picture in mind** - Refer to the Technical Overview and Implementation Plan regularly
