# AGENTS.md - Rentas Backend Development Guide

This document provides guidelines for agentic coding agents working on the Rentas backend codebase.

---

## 1. Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (database, redis, s3, supabase)
│   ├── controllers/    # Request handlers (route logic)
│   ├── middleware/      # Express middleware (auth, validation, error handling)
│   ├── models/prisma/  # Prisma schema and migrations
│   ├── routes/         # Express route definitions
│   ├── services/       # Business logic (independent of HTTP)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (logger, pagination, responses)
│   ├── workers/        # Background job workers
│   ├── websocket/      # WebSocket handlers
│   ├── app.ts          # Express app configuration
│   └── server.ts       # Server entry point
```

---

## 2. Commands

### Development
```bash
cd backend

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

### Linting & Formatting
```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

---

## 3. Code Style Guidelines

### 3.1 TypeScript Configuration
- `strict: true` is enabled in tsconfig.json
- Always use explicit types for function parameters and return types
- Avoid `any` - use `unknown` if type is truly unknown

### 3.2 Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `listing.service.ts` |
| Classes | PascalCase | `ListingService` |
| Interfaces | PascalCase | `ListingFilters` |
| Functions | camelCase | `getById()` |
| Variables | camelCase | `const listing = ...` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| Enums | PascalCase | `UserRole` |
| Enum Values | UPPER_SNAKE_CASE | `UserRole.ADMIN` |

### 3.3 Imports
**Order (top to bottom):**
1. Node built-ins (`fs`, `path`, `http`)
2. External packages (`express`, `jsonwebtoken`)
3. Internal modules (`../config`, `./services`)

```typescript
// Correct
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ListingService } from '../services/listing.service';
import { ApiResponse } from '../utils/apiResponse';
```

**Use absolute paths for internal imports:**
```typescript
// Good
import { prisma } from '../config/database';

// Avoid
import { prisma } from '../../config/database';
```

### 3.4 Formatting
- Use Prettier for formatting (`npm run format`)
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- Semicolons required

### 3.5 Class Structure
```typescript
export class ListingService {
  // Static methods for stateless operations
  static async list(filters: ListingFilters, pagination: PaginationParams) {
    // ... implementation
  }

  static async getById(id: string) {
    // ... implementation
  }

  // Use static methods instead of dependency injection for simplicity
}
```

### 3.6 Error Handling
**Use the AppError class:**
```typescript
import { AppError } from '../middleware/errorHandler.middleware';

// Throw with statusCode, code, message
throw new AppError(404, 'NOT_FOUND', 'Listing not found');
throw new AppError(403, 'FORBIDDEN', 'Not your listing');
throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', details);
```

**Controller error handling:**
```typescript
static async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await ListingService.getById(String(req.params.id));
    return ApiResponse.success(res, listing);
  } catch (err) {
    next(err); // Pass to error handler middleware
  }
}
```

### 3.7 Response Format
**Use ApiResponse utility:**
```typescript
// Success
return ApiResponse.success(res, data);
return ApiResponse.success(res, data, 200, meta);
return ApiResponse.created(res, listing);

// Error
return ApiResponse.badRequest(res, 'Invalid input');
return ApiResponse.unauthorized(res, 'Invalid token');
return ApiResponse.forbidden(res, 'Access denied');
return ApiResponse.notFound(res, 'Not found');
return ApiResponse.internal(res);
```

### 3.8 Pagination
```typescript
import { parsePagination } from '../utils/pagination';

const pagination = parsePagination(req.query as Record<string, unknown>);
// Returns: { page: number, limit: number, skip: number }

// Service usage
prisma.listing.findMany({
  skip: pagination.skip,
  take: pagination.limit,
});
```

### 3.9 Database Queries (Prisma)
**Use select for specific fields:**
```typescript
const listingSelect = {
  id: true,
  title: true,
  // ... explicit fields
};

const listing = await prisma.listing.findUnique({
  where: { id },
  select: listingSelect,  // Always use select, not include when possible
});
```

**Use proper where clauses:**
```typescript
const where: Prisma.ListingWhereInput = { status: 'active' };

if (filters.city) {
  where.city = { contains: filters.city, mode: 'insensitive' };
}
```

### 3.10 Async/Await
```typescript
// Always handle async errors with try/catch in controllers
static async getById(req: Request, res: Response, next: NextFunction) {
  try {
    const listing = await ListingService.getById(String(req.params.id));
    return ApiResponse.success(res, listing);
  } catch (err) {
    next(err);
  }
}

// Use Promise.all for parallel queries
const [listings, total] = await Promise.all([
  prisma.listing.findMany({ ... }),
  prisma.listing.count({ where }),
]);
```

### 3.11 Authentication
```typescript
import { authenticate } from '../middleware/auth.middleware';

// Route usage
router.get('/listings', authenticate, ListingController.list);
```

**Access user in controllers:**
```typescript
req.user!.userId  // Always use non-null assertion after auth middleware
```

---

## 4. API Design Patterns

### 4.1 RESTful Routes
```
GET    /api/v1/listings          - List all
GET    /api/v1/listings/:id      - Get by ID
POST   /api/v1/listings          - Create (auth required)
PUT    /api/v1/listings/:id      - Update (auth required, owner only)
DELETE /api/v1/listings/:id      - Delete (auth required, owner only)
```

### 4.2 Request Validation
- Use Zod for request body validation in routes
- Parse and validate query parameters in controllers

---

## 5. Testing Guidelines

Tests are located alongside source files with `.test.ts` extension.

### Writing Tests
```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('ListingService', () => {
  describe('list', () => {
    it('should return listings with pagination', async () => {
      const result = await ListingService.list({}, { page: 1, limit: 20 });
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta.total).toBeGreaterThanOrEqual(0);
    });
  });
});
```

---

## 6. Git Conventions

### Commit Messages
```
feat: add virtual tour viewer
fix: resolve listing search filters
refactor: extract pagination logic to utility
docs: update API documentation
```

### Branch Naming
```
feature/virtual-tour
fix/search-filters
hotfix/security-patch
```

---

## 7. Environment Variables

Required in `.env`:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_URL=redis://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
MAPBOX_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
FCM_SERVER_KEY=...
```

---

## 8. Key Dependencies

| Package | Purpose |
|---------|---------|
| Express 5 | Web framework |
| Prisma | ORM |
| Socket.io | WebSocket |
| Zod | Validation |
| JWT | Authentication |
| Bull | Queue/Workers |
| Winston | Logging |
