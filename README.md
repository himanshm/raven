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
