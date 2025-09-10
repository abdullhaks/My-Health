import { Action, combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlices'
import adminReducer from '../slices/adminSlices'
import doctorReducer from '../slices/doctorSlices'
import { IUser } from "../../interfaces/user";
import { IAdminData } from "../../interfaces/admin";
import { IDoctor } from "../../interfaces/doctor";

interface RootState {
  user: { user: IUser | null };
  admin: { admin: IAdminData | null };
  doctor: { doctor: IDoctor | null };
}


const appReducer = combineReducers({

    user:userReducer,
    admin:adminReducer,
    doctor:doctorReducer
});

const rootReducer = (state: RootState | undefined, action: Action): RootState =>{
    if (action.type ===   "LOGOUT"){
        state = undefined;
    };

    return appReducer(state, action);
};

export default rootReducer; 