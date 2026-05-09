import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationService'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (userId) => getNotifications(userId))
export const addNotification = createAsyncThunk('notifications/add', async (notif) => createNotification(notif))
export const readNotification = createAsyncThunk('notifications/read', async (id) => { await markAsRead(id); return id })
export const readAllNotifications = createAsyncThunk('notifications/readAll', async (userId) => { await markAllAsRead(userId) })
export const removeNotification = createAsyncThunk('notifications/remove', async (id) => { await deleteNotification(id); return id })

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], loading: false, unreadCount: 0 },
  reducers: {
    setUnreadCount: (state, action) => { state.unreadCount = action.payload },
    incrementUnread: (state) => { state.unreadCount += 1 },
    setNotificationsRealtime: (state, action) => {
      state.items = action.payload
      state.unreadCount = action.payload.filter((n) => !n.read).length
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload
        state.unreadCount = action.payload.filter((n) => !n.read).length
      })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
        state.unreadCount += 1
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        const n = state.items.find((x) => x.id === action.payload)
        if (n) { n.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1) }
      })
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.items.forEach((n) => { n.read = true })
        state.unreadCount = 0
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload)
      })
  },
})

export const { setUnreadCount, incrementUnread, setNotificationsRealtime } = notificationsSlice.actions
export default notificationsSlice.reducer
