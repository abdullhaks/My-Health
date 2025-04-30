import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    doctor: any;
  }
  
  const initialState: AuthState = {
    doctor: null,
  };


  const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
      loginDoctor: (state, action: PayloadAction<{ doctor: any }>) => {
        state.doctor = action.payload.doctor;
      },
      logoutDoctor: (state) => {
        state.doctor = null;
      },
      updateDoctor(state, action: PayloadAction<any>) {
        state.doctor = { ...state.doctor, ...action.payload };
      },
    },
  });
  
  export const { loginDoctor, logoutDoctor, updateDoctor } = doctorSlice.actions;

export default doctorSlice.reducer;