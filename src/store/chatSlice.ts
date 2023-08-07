import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ChatState {
  totalUnreadCount: number;
  currUnread: { count: number; sender: string };
  activeChatIndex: number;
  render: boolean;
}

const initialState: ChatState = {
  totalUnreadCount: 0,
  currUnread: { count: 0, sender: "" },
  activeChatIndex: -1,
  render: false,
};

export const chatSlice = createSlice({
  name: "chatSlice",
  initialState,
  reducers: {
    setTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.totalUnreadCount = action.payload;
    },
    incrementTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.totalUnreadCount += action.payload;
    },
    setCurrUnread: (
      state,
      action: PayloadAction<{ count: number; sender: string }>
    ) => {
      state.currUnread = action.payload;
    },
    setActiveChatIndex: (state, action: PayloadAction<number>) => {
      state.activeChatIndex = action.payload;
    },
    setRender: (state) => {
      state.render = !state.render;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setTotalUnreadCount,
  incrementTotalUnreadCount,
  setCurrUnread,
  setActiveChatIndex,
  setRender,
} = chatSlice.actions;

export default chatSlice.reducer;
