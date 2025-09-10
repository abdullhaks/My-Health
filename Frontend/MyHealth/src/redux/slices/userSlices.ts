import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../interfaces/user';

interface AuthState {
    user: IUser | null;
  }
  
  const initialState: AuthState = {
    user: null,
  };


  const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
      loginUser: (state, action: PayloadAction<{ user: IUser }>) => {
        state.user = action.payload.user;
      },
      logoutUser: (state) => {
        state.user = null;
      },
      updateUser(state, action: PayloadAction<Partial<IUser>>) {
         if (state.user) {
        state.user = { ...state.user, ...action.payload };
            }
      },
    },
  });
  
  export const { loginUser, logoutUser, updateUser } = userSlice.actions;

export default userSlice.reducer;