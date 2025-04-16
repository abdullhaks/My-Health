import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    admin: any;
    accessToken: string | null;
  }
  
  const initialState: AuthState = {
    admin: null,
    accessToken: null,
  };


const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
          login: (state, action: PayloadAction<{ admin: any; accessToken: string }>) => {
            state.admin = action.payload.admin;
            state.accessToken = action.payload.accessToken;
          },
          logout: (state) => {
            state.admin = null;
            state.accessToken = null;
          },
          
        updateAdmin(state, action: PayloadAction<any>) {
            state.admin = { ...state.admin, ...action.payload };
        },
    },
});

export const { login, logout, updateAdmin } = adminSlice.actions;

export default adminSlice.reducer;