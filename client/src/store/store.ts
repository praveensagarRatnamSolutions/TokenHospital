import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tokenReducer from './slices/tokenSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    token: tokenReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
