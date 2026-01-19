import { createSlice } from "@reduxjs/toolkit";

interface UserStatusState {
  [userId: string]: {
    isOnline: boolean;
    lastSeen: Date | null;
  };
}

const initialState: UserStatusState = {};

const userStatusSlice = createSlice({
  name: "userStatus",
  initialState,
  reducers: {
    updateStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      state[userId] = { isOnline, lastSeen }; // NOW VALID
    },
  },
});

export const { updateStatus } = userStatusSlice.actions;
export default userStatusSlice.reducer;
