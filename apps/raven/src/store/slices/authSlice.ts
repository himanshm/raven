import { authService } from "@/api/services/auth.service";
import { createAppAsyncThunk } from "@/store/types";
import type { ApiError, LoginDto, RegisterDto, User } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// ===== THUNKS =====

export const signIn = createAppAsyncThunk<
  User,
  LoginDto,
  { rejectValue: ApiError }
>("auth/signIn", async (credentials: LoginDto, { rejectWithValue }) => {
  try {
    const response = await authService.signIn(credentials);
    return response.user;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const signOut = createAppAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>("auth/signOut", async (_, { rejectWithValue }) => {
  try {
    await authService.signOut();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const register = createAppAsyncThunk<
  User,
  RegisterDto,
  { rejectValue: ApiError }
>("auth/register", async (data: RegisterDto, { rejectWithValue }) => {
  try {
    const response = await authService.register(data);
    return response.user;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const getCurrentUser = createAppAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const user = await authService.getCurrentUser();
    return user;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

/***** SLICE *****/

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },

    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },
  extraReducers: builder => {
    // Sign In
    builder
      .addCase(signIn.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload?.message || "Sign In failed";
        state.loading = false;
        state.isAuthenticated = false;
      });
    // Register
    builder
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload?.message || "Register failed";
        state.isAuthenticated = false;
        state.loading = false;
      });
    // Sign Out
    builder
      .addCase(signOut.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOut.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
    // Get Current User
    builder
      .addCase(getCurrentUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.error = action.payload?.message || "Get Current User failed";
        state.isAuthenticated = false;
      });
  }
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
