import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlices'
import adminReducer from '../slices/adminSlices'

const appReducer = combineReducers({

    user:userReducer,
    admin:adminReducer
});

const rootReducer = (state:any, action:any)=>{
    if (action.type ===   "LOGOUT"){
        state = undefined;
    };

    return appReducer(state, action);
};

export default rootReducer; 