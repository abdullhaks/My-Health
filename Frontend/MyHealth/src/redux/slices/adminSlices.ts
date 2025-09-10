import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAdminData } from '../../interfaces/admin';

interface AuthState {
    admin: IAdminData | null ;
  }
  
  const initialState: AuthState = {
    admin: null,
  };


  const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
      loginAdmin: (state, action: PayloadAction<{ admin: IAdminData;}>) => {
        state.admin = action.payload.admin;
      },
      logoutAdmin: (state) => {
        state.admin = null;
      },
      updateAdmin(state, action: PayloadAction<Partial<IAdminData>>) {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload };
            }
          }
      }
    });
  
  export const { loginAdmin, logoutAdmin, updateAdmin } = adminSlice.actions;

export default adminSlice.reducer;