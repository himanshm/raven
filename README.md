# Architectural layers of the application

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

Components = UI + user interaction
State Management = Cache + loading states
Services = Business logic + API orchestration ← THIS IS KEY
API Base = HTTP infrastructure

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
