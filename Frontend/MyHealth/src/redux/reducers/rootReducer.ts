import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlices'
import adminReducer from '../slices/adminSlices'
import doctorReducer from '../slices/doctorSlices'

const appReducer = combineReducers({

    user:userReducer,
    admin:adminReducer,
    doctor:doctorReducer
});

const rootReducer = (state:any, action:any)=>{
    if (action.type ===   "LOGOUT"){
        state = undefined;
    };

    return appReducer(state, action);
};

export default rootReducer; 