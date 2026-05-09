import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import materialsReducer from './slices/materialsSlice'
import userReducer from './slices/userSlice'
import uiReducer from './slices/uiSlice'
import notificationsReducer from './slices/notificationsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    materials: materialsReducer,
    user: userReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
  },
})

export default store
