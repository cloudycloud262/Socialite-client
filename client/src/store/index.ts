import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import { authApi } from "./authApi";
import { userApi } from "./userApi";
import { postApi } from "./postApi";
import { commentApi } from "./commentApi";
import { notificationApi } from "./notificationApi";
import { useDispatch } from "react-redux";
import { chatApi } from "./chatApi";
import { communityApi } from "./communityApi";

export const store = configureStore({
  reducer: {
    chatSlice: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [communityApi.reducerPath]: communityApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      postApi.middleware,
      chatApi.middleware,
      commentApi.middleware,
      communityApi.middleware,
      notificationApi.middleware
    ),
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export type RootState = ReturnType<typeof store.getState>;
