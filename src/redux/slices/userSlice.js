import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: { id: 1, name: 'Érika', avatar: null, role: 'Estudiante', year: 3 },
    isAuthenticated: true,
  },
  reducers: {
    login: (state, action) => { state.currentUser = action.payload; state.isAuthenticated = true },
    logout: (state) => { state.currentUser = null; state.isAuthenticated = false },
    updateProfile: (state, action) => { state.currentUser = { ...state.currentUser, ...action.payload } },
  },
})

export const { login, logout, updateProfile } = userSlice.actions
export default userSlice.reducer
