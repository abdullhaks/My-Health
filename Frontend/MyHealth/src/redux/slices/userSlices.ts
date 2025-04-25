import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: any;
  }
  
  const initialState: AuthState = {
    user: null,
  };


  const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      loginUser: (state, action: PayloadAction<{ user: any }>) => {
        state.user = action.payload.user;
      },
      logoutUser: (state) => {
        state.user = null;
      },
      updateUser(state, action: PayloadAction<any>) {
        state.user = { ...state.user, ...action.payload };
      },
    },
  });
  
  export const { loginUser, logoutUser, updateUser } = userSlice.actions;

export default userSlice.reducer;