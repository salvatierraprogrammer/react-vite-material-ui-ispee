import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload
      state.isAuthenticated = true
    },
    clearUser: (state) => {
      state.currentUser = null
      state.isAuthenticated = false
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setUser, clearUser, setAuthLoading } = authSlice.actions
export default authSlice.reducer
