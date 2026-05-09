import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: false,
    sidebarOpen: false,
    notificationsOpen: false,
    profileMenuOpen: false,
    snackbar: { open: false, message: '', severity: 'success' },
  },
  reducers: {
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen },
    toggleProfileMenu: (state) => { state.profileMenuOpen = !state.profileMenuOpen },
    showSnackbar: (state, action) => { state.snackbar = { open: true, ...action.payload } },
    hideSnackbar: (state) => { state.snackbar = { ...state.snackbar, open: false } },
    closeNotifications: (state) => { state.notificationsOpen = false },
    closeProfileMenu: (state) => { state.profileMenuOpen = false },
  },
})

export const { toggleDarkMode, setSidebarOpen, toggleNotifications, toggleProfileMenu, showSnackbar, hideSnackbar, closeNotifications, closeProfileMenu } = uiSlice.actions
export default uiSlice.reducer
