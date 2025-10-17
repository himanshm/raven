# Finance Folio - Raven Application

A modern financial portfolio management application built with React, TypeScript, and Redux Toolkit.

## 🏗️ Architectural Layers

```
┌─────────────────────────────────────┐
│         COMPONENTS                  │  (UI)
│  - LoginForm, Dashboard, etc.       │
└─────────────────┬───────────────────┘
                  │ dispatch / call
                  ↓
┌─────────────────────────────────────┐
│    STATE MANAGEMENT                 │  (State)
│  Redux Thunks OR React Query        │
└─────────────────┬───────────────────┘
                  │ calls
                  ↓
┌─────────────────────────────────────┐
│         SERVICES                    │  (Business Logic)
│  - authService.signIn()             │
│  - userService.updateProfile()      │
└─────────────────┬───────────────────┘
                  │ calls
                  ↓
┌─────────────────────────────────────┐
│         API BASE                    │  (HTTP Layer)
│  - apiPost, apiGet, etc.            │
└─────────────────┬───────────────────┘
                  │ HTTP
                  ↓
           🌐 BACKEND API
```

Each layer has a purpose:

- **Components** = UI + user interaction
- **State Management** = Cache + loading states
- **Services** = Business logic + API orchestration ← THIS IS KEY
- **API Base** = HTTP infrastructure

---

## 🔐 Authentication System

The Raven application implements a robust authentication system with cookie-based sessions, automatic token refresh, and optimized initialization flow.

### Authentication Flow Overview

```mermaid
graph TD
    A[App Starts] --> B[AuthProvider]
    B --> C{initialized?}
    C -->|No| D[initializeAuth]
    C -->|Yes| E[Show App]
    D --> F[getCurrentUser API]
    F --> G{API Response}
    G -->|Success| H[Set User Data]
    G -->|401/Error| I[Set Unauthenticated]
    H --> J[initialized: true]
    I --> J
    J --> K[RouteGuard Check]
    K --> L{isAuthenticated?}
    L -->|Yes| M[Protected Routes]
    L -->|No| N[Public Routes]
```

### Key Components

#### 1. **AuthProvider** (`/components/AuthProvider.tsx`)

- **Purpose**: Handles authentication initialization at app startup
- **Features**:
  - Single initialization call (prevents duplicate API requests)
  - Loading state management during initialization
  - Global state coordination

```typescript
// Prevents multiple initializations
const hasDispatched = useRef(false);

useEffect(() => {
  if (!initialized && !hasDispatched.current) {
    hasDispatched.current = true;
    dispatch(initializeAuth());
  }
}, [dispatch, initialized]);
```

#### 2. **Auth Slice** (`/store/slices/authSlice.ts`)

- **Purpose**: Centralized authentication state management
- **State Structure**:
  ```typescript
  interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    initialized: boolean; // Has initialization been attempted?
    initializing: boolean; // Is initialization in progress?
    loading: boolean; // Is an auth operation in progress?
    error: string | null;
  }
  ```

#### 3. **RouteGuard** (`/components/routes/RouteGuard.tsx`)

- **Purpose**: Protects routes based on authentication status
- **Logic**:
  - Waits for `initialized: true` before making routing decisions
  - Redirects unauthenticated users to login
  - Redirects authenticated users away from auth pages

#### 4. **useAuth Hook** (`/hooks/useAuth.ts`)

- **Purpose**: Provides authentication utilities to components
- **Features**:
  - Login/logout functions
  - Manual session refresh
  - Error handling with toast notifications

### Authentication States

| State               | `initialized` | `isAuthenticated` | `initializing` | UI Behavior            |
| ------------------- | ------------- | ----------------- | -------------- | ---------------------- |
| **App Starting**    | `false`       | `false`           | `false`        | Show loading spinner   |
| **Checking Auth**   | `false`       | `false`           | `true`         | Show "Initializing..." |
| **Authenticated**   | `true`        | `true`            | `false`        | Show protected app     |
| **Unauthenticated** | `true`        | `false`           | `false`        | Show login page        |

---

## Redux Async Thunks with `createAppAsyncThunk`

### What is `createAppAsyncThunk`?

A typed wrapper around Redux Toolkit's `createAsyncThunk` that includes our app's `RootState` and `AppDispatch` types.

```typescript
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();
```

### Anatomy of an Async Thunk

```typescript
export const signIn = createAppAsyncThunk(
  "auth/signIn", // ← Type Prefix
  async (credentials: LoginDto, { rejectWithValue }) => {
    // ← Payload Creator
    try {
      const response = await authService.signIn(credentials);
      return response.user; // ← Fulfilled payload
    } catch (error) {
      return rejectWithValue(error); // ← Rejected payload
    }
  }
);
```

### 1. Type Prefix: `"auth/signIn"`

This string automatically generates **3 action types**:

- `"auth/signIn/pending"` - Dispatched when async operation starts
- `"auth/signIn/fulfilled"` - Dispatched when operation succeeds
- `"auth/signIn/rejected"` - Dispatched when operation fails

### 2. Payload Creator Callback

**When is it called?**

```typescript
// Dispatch from component
dispatch(signIn({ email: "user@example.com", password: "pass123" }));
```

**What it receives:**

- First argument: `credentials` (what you passed to dispatch)
- Second argument: `thunkAPI` object with utilities like `rejectWithValue`, `getState`, `dispatch`

**What it returns:**

- Success: Return value becomes `action.payload` in fulfilled action
- Error: `rejectWithValue(error)` becomes `action.payload` in rejected action

### 3. `rejectWithValue(error)` - Why Use It?

**Without `rejectWithValue`:**

```typescript
catch (error) {
  throw error;  // Redux wraps this
}
// Result in reducer:
// action.payload = undefined
// action.error = { message: "Request failed", name: "Error" }
```

**With `rejectWithValue`:**

```typescript
catch (error) {
  return rejectWithValue(error);  // You control the payload
}
// Result in reducer:
// action.payload = error (your full ApiError object)
// Can access: error.message, error.status, error.data
```

**Benefits:**

- Access custom error properties (status code, validation errors, etc.)
- Return structured error data to UI
- Type-safe error handling

### Complete Execution Flow

```typescript
// Step 1: User action triggers dispatch
dispatch(signIn({ email: "user@example.com", password: "pass123" }))

// Step 2: "auth/signIn/pending" action dispatched immediately
// State updates:
// { loading: true, error: null }

// Step 3: Callback executes
await authService.signIn(credentials)
  ↓
await apiPost("/api/v0/auth/login", credentials)
  ↓
HTTP POST to backend

// Step 4a: SUCCESS PATH
// Returns: { user: { id: 1, name: "John" }, token: "abc123" }
// Token saved to sessionStorage
// "auth/signIn/fulfilled" action dispatched
// State updates:
// { user: { id: 1, name: "John" }, loading: false, isAuthenticated: true }

// Step 4b: ERROR PATH
// API returns: { message: "Invalid credentials", status: 401 }
// rejectWithValue(error) called
// "auth/signIn/rejected" action dispatched
// State updates:
// { error: "Invalid credentials", loading: false }
```

### `initialized` and `isAuthenticated` states in the auth store slice

```
initialized = "Have we TRIED to check auth?" (yes/no)
isAuthenticated = "Did we FIND a valid session?" (yes/no)
```

Both need to be true for different reasons:
`initialized: true, isAuthenticated: true` → Show app
`initialized: true, isAuthenticated: false` → Show login
`initialized: false` → Show loading (don't know yet)

## Forgot Password Flow

```
Forgot Password Flow:
┌─────────────────┐    ForgotPasswordDto    ┌──────────────────┐
│ "Forgot Password"│ ──────────────────────► │ Send Reset Email │
│ (enter email)   │                         │ (with token)     │
└─────────────────┘                         └──────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ResetPasswordDto     ┌──────────────────┐
│ "Reset Password"│ ◄────────────────────── │ Email Link Click │
│ (enter new pwd) │                         │ (contains token) │
└─────────────────┘                         └──────────────────┘

Alternative - Change Password (logged in):
┌─────────────────┐    ChangePasswordDto    ┌──────────────────┐
│ "Change Password"│ ──────────────────────► │ Update Password  │
│ (current + new) │                         │ (authenticated)  │
└─────────────────┘                         └──────────────────┘
```
