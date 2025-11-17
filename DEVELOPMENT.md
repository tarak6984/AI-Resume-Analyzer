# AI Resume Analyzer - Development Guide

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Performance](#performance)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🚀 Project Overview

AI Resume Analyzer is a comprehensive web application that helps job seekers optimize their resumes using AI-powered analysis. The application provides detailed feedback, job matching capabilities, and performance analytics to improve career prospects.

### Key Features

- **AI-Powered Resume Analysis**: Get detailed feedback on resume quality across multiple categories
- **Job Matching Dashboard**: Compare resumes against real job postings with compatibility scores
- **Performance Analytics**: Track improvements over time with comprehensive comparison tools
- **Secure Authentication**: Browser-based auth powered by Puter.js
- **File Management**: Upload, store, and manage multiple resume versions
- **Responsive Design**: Optimized for all device sizes

## 🏗️ Architecture

### Frontend Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Router  │    │    Zustand      │    │    Puter.js     │
│   (Routing)     │    │  (State Mgmt)   │    │ (Auth/Storage)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │              React Components                  │
         │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
         │  │ Routes  │ │ Common  │ │ Feature │         │
         │  └─────────┘ └─────────┘ └─────────┘         │
         └───────────────────────────────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │                 Utilities                     │
         │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
         │  │Analytics│ │Job Match│ │Feedback │         │
         │  └─────────┘ └─────────┘ └─────────┘         │
         └───────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication**: Puter.js handles user auth and session management
2. **File Upload**: PDFs uploaded to Puter cloud storage
3. **AI Analysis**: Resume analyzed using Puter AI with custom prompts
4. **Data Storage**: Analysis results stored in Puter key-value store
5. **Analytics**: Performance data calculated from stored job matches

## 💻 Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Environment Setup

No environment variables required! The app uses Puter.js for all backend services.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run analyze      # Analyze bundle size
npm run preview      # Preview production build
```

## 🛠️ Tech Stack

### Core Technologies

- **React 19** - UI library with latest features
- **React Router v7** - Full-stack routing with SSR support
- **TypeScript** - Type safety and better DX
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Fast build tool and dev server

### State Management & Data

- **Zustand** - Lightweight state management
- **Puter.js** - Cloud backend (auth, storage, AI)

### Testing & Quality

- **Vitest** - Fast unit testing framework
- **Testing Library** - Component testing utilities
- **TypeScript** - Static type checking

### Performance & Analytics

- **Bundle Analyzer** - Bundle size analysis
- **React.lazy** - Code splitting
- **Custom performance hooks** - Optimization utilities

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx   # Error handling components
│   ├── LoadingSkeleton.tsx # Loading state components
│   ├── JobMatching.tsx     # Job matching components
│   ├── ResumeComparison.tsx # Analytics components
│   └── ...
├── lib/                 # Utility functions
│   ├── analytics.ts         # Analytics calculations
│   ├── feedback-utils.ts    # AI feedback utilities
│   ├── job-matching.ts      # Job matching logic
│   ├── performance.ts       # Performance utilities
│   ├── puter.ts            # Puter.js integration
│   └── utils.ts            # General utilities
├── routes/              # Route components
│   ├── home.tsx            # Dashboard
│   ├── upload.tsx          # Upload page
│   ├── jobs.tsx            # Job matching
│   ├── analytics.tsx       # Analytics dashboard
│   ├── resume.tsx          # Resume details
│   └── auth.tsx            # Authentication
├── test/                # Test files
│   ├── components.test.tsx  # Component tests
│   ├── utils.test.ts       # Utility tests
│   └── setup.ts            # Test configuration
└── root.tsx            # App root component

constants/
└── index.ts            # App constants and prompts

types/
├── index.d.ts          # App type definitions
└── puter.d.ts          # Puter.js types

public/                 # Static assets
├── icons/              # SVG icons
├── images/             # Images and illustrations
└── ...
```

## 🔌 API Reference

### Puter.js Services

#### Authentication
```typescript
// Sign in user
await puter.auth.signIn();

// Check if user is signed in
const isSignedIn = await puter.auth.isSignedIn();

// Get user info
const user = await puter.auth.getUser();

// Sign out
await puter.auth.signOut();
```

#### File Storage
```typescript
// Upload file
const uploadResult = await puter.fs.upload([file]);

// Read file
const blob = await puter.fs.read(path);

// Write data
await puter.fs.write(path, data);

// Delete file
await puter.fs.delete(path);
```

#### AI Services
```typescript
// Chat with AI
const response = await puter.ai.chat(prompt, options);

// Analyze file with AI
const feedback = await puter.ai.feedback(filePath, prompt);

// Extract text from image
const text = await puter.ai.img2txt(image);
```

#### Key-Value Store
```typescript
// Store data
await puter.kv.set(key, JSON.stringify(data));

// Retrieve data
const data = await puter.kv.get(key);

// List keys
const keys = await puter.kv.list(pattern);

// Delete data
await puter.kv.delete(key);
```

### Custom Utilities

#### Analytics
```typescript
import { calculateResumeAnalytics, generateComparisonInsights } from '~/lib/analytics';

// Calculate analytics for a resume
const analytics = await calculateResumeAnalytics(resume, jobMatches, kv);

// Generate comparison insights
const insights = generateComparisonInsights(resumes, analytics);
```

#### Job Matching
```typescript
import { analyzeJobMatch, getJobMatchColor } from '~/lib/job-matching';

// Analyze job match
const matchScore = await analyzeJobMatch(resumePath, jobPosting, aiFeedback);

// Get color for match score
const colorClass = getJobMatchColor(score);
```

#### Feedback Processing
```typescript
import { validateFeedbackStructure, sanitizeFeedback } from '~/lib/feedback-utils';

// Validate AI feedback
const isValid = validateFeedbackStructure(feedback);

// Sanitize feedback
const cleanFeedback = sanitizeFeedback(rawFeedback);
```

## 🧪 Testing

### Test Structure
```bash
app/test/
├── components.test.tsx  # Component integration tests
├── utils.test.ts       # Utility function tests
└── setup.ts           # Test configuration
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test components.test.tsx
```

### Writing Tests

#### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MyComponent } from '~/components/MyComponent';

test('renders correctly', () => {
  render(
    <MemoryRouter>
      <MyComponent />
    </MemoryRouter>
  );
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

#### Utility Tests
```typescript
import { describe, it, expect } from 'vitest';
import { myUtilFunction } from '~/lib/utils';

describe('myUtilFunction', () => {
  it('should return expected result', () => {
    const result = myUtilFunction('input');
    expect(result).toBe('expected output');
  });
});
```

## ⚡ Performance

### Bundle Optimization
- **Code Splitting**: Routes are automatically split by React Router
- **Manual Chunks**: Vendor libraries separated into chunks
- **Tree Shaking**: Unused code eliminated in production
- **Minification**: Esbuild for fast, optimized builds

### Runtime Optimization
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Virtual Scrolling**: Efficient handling of large lists
- **Image Optimization**: Responsive images with lazy loading

### Performance Monitoring
```typescript
import { measurePerformance, getMemoryUsage } from '~/lib/performance';

// Measure function performance
measurePerformance('dataProcessing', () => {
  processLargeDataset();
});

// Monitor memory usage
const memory = getMemoryUsage();
console.log(`Memory used: ${memory?.used}`);
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# This will open a visualization showing:
# - Bundle composition
# - Chunk sizes
# - Dependency analysis
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set up custom domain
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Configuration

The app is designed to work without environment variables, but you may want to configure:

- **Analytics**: Add Google Analytics or similar
- **Monitoring**: Add error tracking (Sentry, etc.)
- **CDN**: Configure for static asset delivery

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Write** tests for new functionality
4. **Run** tests: `npm run test`
5. **Check** types: `npm run typecheck`
6. **Commit** changes: `git commit -m 'Add amazing feature'`
7. **Push** to branch: `git push origin feature/amazing-feature`
8. **Create** a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Automatic with Prettier (if configured)
- **Linting**: ESLint rules for code quality
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions

### Commit Guidelines

Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` code style changes
- `refactor:` code refactoring
- `test:` test additions or updates
- `chore:` build/tooling changes

### Pull Request Guidelines

- Include clear description of changes
- Add tests for new functionality
- Update documentation if needed
- Ensure all tests pass
- Keep PRs focused and atomic

## 📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [Puter.js Documentation](https://docs.puter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

#### Performance Issues
```bash
# Analyze bundle
npm run analyze

# Check memory usage in dev tools
```

#### Puter.js Issues
- Ensure internet connection
- Check browser console for errors
- Verify Puter.js is loaded in network tab

### Getting Help

- **Issues**: GitHub Issues for bugs and feature requests
- **Discussions**: GitHub Discussions for questions
- **Documentation**: This file and inline code comments