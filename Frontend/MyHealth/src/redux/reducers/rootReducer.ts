import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlices'

const appReducer = combineReducers({

    user:userReducer
});

const rootReducer = (state:any, action:any)=>{
    if (action.type ===   "LOGOUT"){
        state = undefined;
    };

    return appReducer(state, action);
};

export default rootReducer; 