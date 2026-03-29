import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import api, { getErrorMessage } from '../services/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROLES } from '../constants';

// ── Initial State ──────────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true until initial auth check completes
  error: null,
};

// ── Action Types ───────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// ── Reducer ────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// ── Context Creation ───────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Auth Provider ──────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Check auth status on mount ─────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const cachedUser = localStorage.getItem(USER_KEY);

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        // Use cached user for immediate state while fetching fresh data
        if (cachedUser) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: JSON.parse(cachedUser),
          });
        }

        // Verify token & get fresh user data
        const response = await api.get('/auth/me');
        const user = response.data.data;

        localStorage.setItem(USER_KEY, JSON.stringify(user));
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } catch (error) {
        // Token invalid - clear everything
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initializeAuth();
  }, []);

  // ── Register ───────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true, user };
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true, user };
    } catch (error) {
      const message = getErrorMessage(error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // ── Update User ────────────────────────────────────────────────────────
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, [state.user]);

  // ── Clear Error ────────────────────────────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // ── Helper: Check role ─────────────────────────────────────────────────
  const isRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user]);

  const isSeeker = isRole(ROLES.SEEKER);
  const isExpert = isRole(ROLES.EXPERT);
  const isAdmin = isRole(ROLES.ADMIN);

  // ── Helper: Check onboarding ───────────────────────────────────────────
  const needsOnboarding = state.isAuthenticated && !state.user?.onboardingCompleted;

  // ── Context Value ──────────────────────────────────────────────────────
  const contextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    register,
    login,
    logout,
    updateUser,
    clearError,

    // Helpers
    isSeeker,
    isExpert,
    isAdmin,
    needsOnboarding,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
