import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  logoutApi,
  updateUserApi,
  type TLoginData,
  type TRegisterData,
} from '@api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { setCookie, deleteCookie } from '@utils/cookie';

import type { TUser } from '@utils-types';

export type TUserState = {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  user: TUser | null;
  loginUserError: string | null;
  loginUserRequest: boolean;
  updateUserError: string | null;
};

const initialState: TUserState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
  loginUserError: null,
  loginUserRequest: false,
  updateUserError: null,
};

// Вход
export const loginUser = createAsyncThunk('user/loginUser', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  setCookie('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  return response.user;
});

// Регистрация
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

// Получение пользователя (восстановление сессии)
export const getUser = createAsyncThunk('user/getUser', async () => {
  const response = await getUserApi();
  return response.user;
});

// Обновление данных
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

// Выход
export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectLoginUserError: (state) => state.loginUserError,
    selectLoginUserRequest: (state) => state.loginUserRequest,
    selectUpdateUserError: (state) => state.updateUserError,
  },
  extraReducers: (builder) => {
    builder
      // Вход
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message ?? 'Ошибка входа';
        state.isAuthChecked = true;
      })
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loginUserRequest = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.error.message ?? 'Ошибка регистрации';
        state.isAuthChecked = true;
      })
      // Получение пользователя
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.isAuthChecked = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Обновление
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.updateUserError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError = action.error.message ?? 'Ошибка обновления профиля';
      })
      // Выход
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { authChecked } = userSlice.actions;
export const {
  selectUser,
  selectIsAuthenticated,
  selectIsAuthChecked,
  selectLoginUserError,
  selectLoginUserRequest,
  selectUpdateUserError,
} = userSlice.selectors;

export default userSlice.reducer;
