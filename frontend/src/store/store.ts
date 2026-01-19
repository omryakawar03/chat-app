import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import userStatusReducer from "./userStatusSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    userStatus: userStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
