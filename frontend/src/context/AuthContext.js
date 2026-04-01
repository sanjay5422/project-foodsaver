import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import socket from '../services/socketService';

const AuthContext = createContext();

const getStoredToken = () =>
  localStorage.getItem('foodsaver_token');

const getInitialUser = () => {
  const role = localStorage.getItem('foodsaver_role');
  const name = localStorage.getItem('foodsaver_name');
  if (role && name) {
    return { role, name };
  }
  return null;
};

const persistAuthPayload = (payload) => {
  const data = payload?.data || payload;
  const token = data?.token || payload?.token;
  const role = data?.role ?? payload?.role;
  const name = data?.name ?? payload?.name;

  if (token) {
    localStorage.setItem('foodsaver_token', token);
  }
  if (role != null) {
    localStorage.setItem('foodsaver_role', String(role).toLowerCase());
  }
  if (name != null) {
    localStorage.setItem('foodsaver_name', name);
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem('foodsaver_token');
  localStorage.removeItem('foodsaver_role');
  localStorage.removeItem('foodsaver_name');
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      const payload = action.payload;
      const data = payload?.data ?? payload;
      persistAuthPayload(payload);

      const role = data?.role ?? payload?.role;
      const normalizedRole =
        role != null ? String(role).toLowerCase() : undefined;

      const nextToken =
        data?.token || payload?.token || state.token;

      return {
        ...state,
        isAuthenticated: true,
        user: {
          ...data,
          role: normalizedRole,
        },
        token: nextToken,
        loading: false,
      };
    }
    case 'LOGOUT':
      clearStoredAuth();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'AUTH_ERROR':
      clearStoredAuth();
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: !!getStoredToken(),
  user: getInitialUser(),
  token: getStoredToken(),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get('http://localhost:5000/api/auth/verify')
        .then((response) => {
          const userData = response.data.data || response.data;
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: userData,
          });

          if (userData && userData._id) {
            socket.auth = { token };
            socket.connect();
            socket.emit('register', userData._id);
          }
        })
        .catch((error) => {
          console.error('Token verification failed:', error);
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'AUTH_ERROR', payload: 'Token expired or invalid' });
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (arg1, arg2) => {
    // OTP-friendly login overload: login({ token, role, name })
    if (arg1 && typeof arg1 === 'object' && arg1.token) {
      const userData = {
        token: arg1.token,
        role: arg1.role,
        name: arg1.name
      };

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData,
      });

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${arg1.token}`;

      return { success: true };
    }

    // Normal login: login(email, password)
    const email = arg1;
    const password = arg2;

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const userData = response.data.data || response.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userData,
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

      if (userData && userData._id) {
        socket.auth = { token: userData.token };
        socket.connect();
        socket.emit('register', userData._id);
      }

      return response.data;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response.data.message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const userResponse = response.data.data || response.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: userResponse,
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${userResponse.token}`;

      if (userResponse && userResponse._id) {
        socket.auth = { token: userResponse.token };
        socket.connect();
        socket.emit('register', userResponse._id);
      }

      return response.data;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response.data.message });
      throw error;
    }
  };

  const logout = () => {
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    socket.disconnect();
  };

  const clearTokensAndLogout = () => {
    clearStoredAuth();
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    socket.disconnect();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearTokensAndLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
