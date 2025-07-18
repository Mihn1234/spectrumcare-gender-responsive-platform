# Contributing to SpectrumCare Platform 🤝

Thank you for your interest in contributing to SpectrumCare Platform! This project aims to transform autism support through innovative technology, and we welcome contributions from developers, healthcare professionals, autism advocates, and families with lived experience.

## 🌟 Ways to Contribute

- **Code**: Frontend, backend, AI/ML, testing, documentation
- **Design**: UI/UX improvements, accessibility enhancements
- **Content**: Documentation, user guides, training materials
- **Testing**: Quality assurance, user acceptance testing
- **Research**: Data analysis, outcome measurement, best practices
- **Community**: Support, feedback, feature suggestions

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/spectrum-care-platform.git
cd spectrum-care-platform

# Add upstream remote
git remote add upstream https://github.com/original-owner/spectrum-care-platform.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local

# Set up database (PostgreSQL required)
bun run db:setup

# Run development server
bun run dev
```

### 3. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

## 📝 Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled, proper typing required
- **ESLint**: Follow configured rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use conventional commit format

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add multi-role authentication system
fix(dashboard): resolve child profile loading issue
docs(api): update endpoint documentation
```

### Code Quality Requirements

- **Test Coverage**: Minimum 80% for new code
- **Type Safety**: No `any` types without justification
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals standards
- **Security**: Follow OWASP guidelines

## 🧪 Testing

### Running Tests

```bash
# All tests
bun test

# Unit tests only
bun test:unit

# Integration tests
bun test:integration

# E2E tests
bun test:e2e

# Watch mode
bun test:watch

# Coverage report
bun test:coverage
```

### Writing Tests

#### Unit Tests
```typescript
// components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('should render login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await screen.findByText(/email is required/i);
    await screen.findByText(/password is required/i);
  });
});
```

#### Integration Tests
```typescript
// api/__tests__/children.test.ts
import { testClient } from '../test-utils';

describe('/api/children', () => {
  it('should create child profile', async () => {
    const childData = {
      firstName: 'Test',
      lastName: 'Child',
      dateOfBirth: '2015-01-01'
    };

    const response = await testClient
      .post('/api/children')
      .send(childData)
      .expect(201);

    expect(response.body).toMatchObject(childData);
  });
});
```

## 🎨 UI/UX Guidelines

### Design System

- **Component Library**: shadcn/ui as base, custom components for domain-specific needs
- **Typography**: System fonts with fallbacks for accessibility
- **Colors**: Accessible color palette with sufficient contrast ratios
- **Spacing**: Consistent spacing scale (4px base unit)
- **Responsive**: Mobile-first responsive design

### Accessibility

- **Keyboard Navigation**: All interactive elements must be keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Clear focus states for all interactive elements

### Component Creation

```typescript
// components/ui/CustomComponent.tsx
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "default-size",
        sm: "small-size",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Additional props
}

const CustomComponent = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

CustomComponent.displayName = "CustomComponent";

export { CustomComponent, componentVariants };
```

## 🔒 Security Guidelines

### Data Handling

- **Sensitive Data**: Never log or expose sensitive information
- **Authentication**: Use secure authentication methods
- **Authorization**: Implement proper role-based access control
- **Input Validation**: Validate and sanitize all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Escape user-generated content

### API Security

```typescript
// Example secure API route
import { z } from 'zod';
import { authenticate, authorize } from '@/lib/auth';

const createChildSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    // Authenticate user
    const user = await authenticate(request);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Authorize action
    if (!authorize(user, 'children:create')) {
      return new Response('Forbidden', { status: 403 });
    }

    // Validate input
    const body = await request.json();
    const validatedData = createChildSchema.parse(body);

    // Process request
    const child = await createChild(validatedData, user.id);

    return Response.json(child);
  } catch (error) {
    console.error('Error creating child:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

## 📊 Performance Guidelines

### Frontend Performance

- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Monitor bundle size with `bun run analyze`
- **Lazy Loading**: Implement lazy loading for non-critical content

### Backend Performance

- **Database Queries**: Optimize queries and use indexes
- **Caching**: Implement Redis caching for frequently accessed data
- **Rate Limiting**: Implement API rate limiting
- **Monitoring**: Set up performance monitoring

## 🚀 Deployment

### Environment Setup

```bash
# Development
cp .env.example .env.local

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

### Docker Development

```bash
# Build development image
docker build -f Dockerfile.dev -t spectrum-care-dev .

# Run with docker-compose
docker-compose -f docker-compose.dev.yml up
```

## 📚 Documentation

### Code Documentation

- **Functions**: Document complex functions with JSDoc
- **Components**: Include prop descriptions and examples
- **APIs**: Use OpenAPI/Swagger for API documentation
- **README**: Update README for significant changes

### User Documentation

- **User Guides**: Step-by-step guides for each user type
- **Feature Documentation**: Comprehensive feature explanations
- **Troubleshooting**: Common issues and solutions
- **Video Tutorials**: Screen recordings for complex workflows

## 🐛 Bug Reports

### Before Submitting

1. **Search**: Check existing issues for duplicates
2. **Reproduce**: Ensure the bug is reproducible
3. **Environment**: Test in multiple browsers/devices
4. **Minimal Case**: Create minimal reproduction case

### Bug Report Template

```markdown
**Bug Description**
Clear description of what went wrong.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should have happened.

**Screenshots**
Add screenshots if applicable.

**Environment**
- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 119]
- Version: [e.g. 1.0.0]

**Additional Context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Summary**
Brief description of the feature.

**User Story**
As a [user type], I want [goal] so that [benefit].

**Detailed Description**
Comprehensive explanation of the feature.

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Additional Context**
Mockups, examples, or references.
```

## 🎯 Pull Request Process

### Before Submitting

1. **Sync**: Sync your fork with upstream
2. **Test**: Run all tests and ensure they pass
3. **Lint**: Fix all linting errors
4. **Review**: Self-review your changes

### Pull Request Template

```markdown
**Description**
Summary of changes and motivation.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: QA testing for significant features
4. **Documentation**: Update documentation if needed

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time community chat
- **Email**: security@spectrumcare.platform for security issues

### Mentorship Program

New contributors can request mentorship for:
- **Technical Guidance**: Code architecture and best practices
- **Domain Knowledge**: Autism support and SEND system understanding
- **Career Development**: Professional growth in health tech

## 🏆 Recognition

### Contributor Levels

- **Contributor**: Made meaningful contributions
- **Collaborator**: Regular contributor with commit access
- **Maintainer**: Core team member with admin access

### Recognition

- **Contributors File**: All contributors listed in CONTRIBUTORS.md
- **Release Notes**: Significant contributions highlighted
- **Community Spotlight**: Featured in newsletter and social media
- **Conference Speaking**: Opportunities to present work

## 📋 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards community members

**Unacceptable Behavior:**
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project team at conduct@spectrumcare.platform. All complaints will be reviewed and investigated promptly and fairly.

---

Thank you for contributing to SpectrumCare Platform! Together, we're building a better future for autism support. 💙
