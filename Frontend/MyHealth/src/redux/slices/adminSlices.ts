import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    admin: any;
  }
  
  const initialState: AuthState = {
    admin: null,
  };


  const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
      loginAdmin: (state, action: PayloadAction<{ admin: any;}>) => {
        state.admin = action.payload.admin;
      },
      logoutAdmin: (state) => {
        state.admin = null;
      },
      updateAdmin(state, action: PayloadAction<any>) {
        state.admin = { ...state.admin, ...action.payload };
      },
    },
  });
  
  export const { loginAdmin, logoutAdmin, updateAdmin } = adminSlice.actions;

export default adminSlice.reducer;