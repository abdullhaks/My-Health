import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDoctor } from '../../interfaces/doctor';

interface AuthState {
    doctor: IDoctor | null;
  }
  
  const initialState: AuthState = {
    doctor: null,
  };


  const doctorSlice = createSlice({
    name: 'doctor',
    initialState,
    reducers: {
      loginDoctor: (state, action: PayloadAction<{ doctor: IDoctor }>) => {
        state.doctor = action.payload.doctor;
      },
      logoutDoctor: (state) => {
        state.doctor = null;
      },
      updateDoctor(state, action: PayloadAction<Partial<IDoctor>>) {
        if (state.doctor) {
        state.doctor = { ...state.doctor, ...action.payload };
            }
      },
    },
  });
  
  export const { loginDoctor, logoutDoctor, updateDoctor } = doctorSlice.actions;

export default doctorSlice.reducer;