import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: any;
    accessToken: string | null;
  }
  
  const initialState: AuthState = {
    user: null,
    accessToken: null,
  };


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
          login: (state, action: PayloadAction<{ user: any; accessToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
          },
          logout: (state) => {
            state.user = null;
            state.accessToken = null;
          },
          
        updateUser(state, action: PayloadAction<any>) {
            state.user = { ...state.user, ...action.payload };
        },
    },
});

export const { login, logout, updateUser } = userSlice.actions;

export default userSlice.reducer;