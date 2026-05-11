import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { lightTheme, darkTheme } from './theme/theme'
import AppRouter from './routes/AppRouter'
import { onAuthChange } from './services/authService'
import { setUser, clearUser } from './redux/slices/authSlice'
import { setNotificationsRealtime } from './redux/slices/notificationsSlice'
import { setFavoriteIds } from './redux/slices/materialsSlice'
import { subscribeNotifications } from './services/notificationService'
import { getUserFavorites } from './services/usersService'
import { db } from './firebase/config'

import ErrorBoundary from './components/common/ErrorBoundary'

export default function App() {
  const dispatch = useDispatch()
  const darkMode = useSelector((state) => state.ui.darkMode)
  const { currentUser } = useSelector((s) => s.auth)

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      if (user) {
        let photoURL = user.photoURL || ''
        let photoPath = ''
        let role = 'estudiante'
        let description = ''
        let career = ''
        let academicYear = null
        let lastName = ''
        let warnings = 0
        let isBlocked = false
        let suspended = false
        let blockedForWarnings = false

        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            const data = snap.data()
            if (data.photoURL) photoURL = data.photoURL
            if (data.photoPath) photoPath = data.photoPath
            if (data.role) role = data.role
            if (data.description) description = data.description
            if (data.career) career = data.career
            if (data.academicYear) academicYear = data.academicYear
            if (data.lastName) lastName = data.lastName
            if (typeof data.warnings === 'number') warnings = data.warnings
            if (data.isBlocked) isBlocked = true
            if (data.suspended) suspended = true
            if (data.blockedForWarnings) blockedForWarnings = true
            dispatch(setFavoriteIds(data.favorites || []))
          }
        } catch {}

        dispatch(setUser({
          uid: user.uid,
          name: user.displayName || 'Usuario',
          lastName,
          email: user.email,
          photoURL,
          photoPath,
          role,
          description,
          career,
          academicYear,
          warnings,
          isBlocked,
          suspended,
          blockedForWarnings,
        }))

        updateDoc(doc(db, 'users', user.uid), {
          online: true,
          lastSeen: new Date().toISOString(),
        }).catch(() => {})
      } else {
        dispatch(clearUser())
      }
    })
    return unsub
  }, [dispatch])

  useEffect(() => {
    if (!currentUser?.uid) return

    const unsub = subscribeNotifications(currentUser.uid, (items) => {
      dispatch(setNotificationsRealtime(items))
    })
    return unsub
  }, [currentUser?.uid, dispatch])

  useEffect(() => {
    if (!currentUser?.uid) return

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        updateDoc(doc(db, 'users', currentUser.uid), { online: false }).catch(() => {})
      } else {
        updateDoc(doc(db, 'users', currentUser.uid), { online: true }).catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const handleBeforeUnload = () => {
      navigator.sendBeacon?.(
        `https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen`,
        JSON.stringify({ database: `projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases/(default)` })
      )
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      updateDoc(doc(db, 'users', currentUser.uid), { online: false }).catch(() => {})
    }
  }, [currentUser?.uid])

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </ThemeProvider>
  )
}
