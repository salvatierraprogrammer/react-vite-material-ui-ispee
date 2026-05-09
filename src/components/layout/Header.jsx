import { useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, IconButton, InputBase, Badge, Avatar, Typography, Popover, List, ListItemButton, ListItemText, ListItemAvatar, Divider, Chip, Paper, ClickAwayListener } from '@mui/material'
import { Menu as MenuIcon, Search, DarkModeOutlined, LightModeOutlined, NotificationsOutlined, Close, School, Forum, LoginOutlined } from '@mui/icons-material'
import { toggleDarkMode, setSidebarOpen, showSnackbar } from '../../redux/slices/uiSlice'
import { readAllNotifications, removeNotification } from '../../redux/slices/notificationsSlice'
import { clearUser } from '../../redux/slices/authSlice'
import { logoutUser } from '../../services/authService'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { getTimeAgo, truncate } from '../../utils/helpers'
import { useResponsive } from '../../hooks/useResponsive'
import { TYPE_COLORS } from '../../constants'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const darkMode = useSelector((s) => s.ui.darkMode)
  const { currentUser, isAuthenticated } = useSelector((s) => s.auth)
  const notifItems = useSelector((s) => s.notifications.items)
  const unreadCount = notifItems.filter((n) => !n.read).length
  const { uid } = useSelector((s) => s.auth.currentUser || {})
  const { isMobile } = useResponsive()
  const { query, setQuery, results, clear } = useGlobalSearch()
  const [focused, setFocused] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const searchRef = useRef(null)
  const totalResults = results.materials.length + results.posts.length

  const handleSearchChange = useCallback((e) => setQuery(e.target.value), [setQuery])
  const handleSelect = useCallback((path) => { navigate(path); clear(); setFocused(false) }, [navigate, clear])

  const handleLogout = async () => {
    try {
      await logoutUser()
      dispatch(clearUser())
      setProfileAnchor(null)
      dispatch(showSnackbar({ message: 'Sesión cerrada', severity: 'info' }))
      navigate('/')
    } catch {
      dispatch(showSnackbar({ message: 'Error al cerrar sesión', severity: 'error' }))
    }
  }

  const handleDeleteNotif = (e, id) => {
    e.stopPropagation()
    dispatch(removeNotification(id))
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1100, backdropFilter: 'blur(12px)', backgroundColor: darkMode ? 'rgba(26,16,53,0.85)' : 'rgba(255,255,255,0.85)', minHeight: 52 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 480, position: 'relative' }}>
        {isMobile && <IconButton onClick={() => dispatch(setSidebarOpen(true))} sx={{ color: 'text.primary' }} size="small"><MenuIcon sx={{ fontSize: 20 }} /></IconButton>}
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: '8px', px: 1, py: 0.25, flex: 1, transition: 'all 0.2s', border: '1.5px solid', borderColor: focused ? 'primary.main' : 'transparent' }}>
          <Search sx={{ color: 'text.secondary', fontSize: 16 }} />
          <InputBase placeholder='Buscá apuntes, materias…' value={query} onChange={handleSearchChange} onFocus={() => setFocused(true)} inputRef={searchRef} sx={{ ml: 0.5, flex: 1, fontSize: 12.5, '& input::placeholder': { opacity: 0.5 } }} />
          {query && <IconButton size="small" onClick={() => { clear(); setFocused(false) }}><Close sx={{ fontSize: 14 }} /></IconButton>}
        </Paper>
        {focused && query && totalResults > 0 && (
          <ClickAwayListener onClickAway={() => setFocused(false)}>
            <Paper elevation={8} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, borderRadius: '10px', overflow: 'hidden', zIndex: 1200, maxHeight: 340, overflowY: 'auto' }}>
              {results.materials.length > 0 && (
                <Box>
                  <Typography sx={{ px: 1.5, pt: 0.75, pb: 0.25, fontSize: 10, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05 }}>Materiales</Typography>
                  {results.materials.map((m) => (
                    <ListItemButton key={m.id} dense onClick={() => handleSelect(`/material/${m.id}`)} sx={{ py: 0.5, px: 1.5 }}>
                      <ListItemAvatar sx={{ minWidth: 28 }}><Avatar sx={{ width: 22, height: 22, bgcolor: TYPE_COLORS[m.type] || '#8B5CF6', fontSize: 11 }}><School sx={{ fontSize: 12 }} /></Avatar></ListItemAvatar>
                      <ListItemText primary={truncate(m.title, 40)} secondary={`${m.subject} · ${m.typeLabel}`} slotProps={{ primary: { fontSize: 12.5, fontWeight: 600 }, secondary: { fontSize: 10.5 } }} />
                    </ListItemButton>
                  ))}
                </Box>
              )}
              {results.posts.length > 0 && (
                <Box>
                  <Typography sx={{ px: 1.5, pt: 0.5, pb: 0.25, fontSize: 10, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.05 }}>Foro</Typography>
                  {results.posts.map((p) => (
                    <ListItemButton key={p.id} dense onClick={() => handleSelect('/foro')} sx={{ py: 0.5, px: 1.5 }}>
                      <ListItemAvatar sx={{ minWidth: 28 }}><Avatar sx={{ width: 22, height: 22, bgcolor: '#10B981', fontSize: 11 }}><Forum sx={{ fontSize: 12 }} /></Avatar></ListItemAvatar>
                      <ListItemText primary={truncate(p.title, 40)} slotProps={{ primary: { fontSize: 12.5, fontWeight: 600 } }} />
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </Paper>
          </ClickAwayListener>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <IconButton onClick={() => dispatch(toggleDarkMode())} size="small" sx={{ color: 'text.secondary' }}>{darkMode ? <LightModeOutlined sx={{ fontSize: 18 }} /> : <DarkModeOutlined sx={{ fontSize: 18 }} />}</IconButton>
        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} size="small" sx={{ color: 'text.secondary' }}>
          <Badge badgeContent={unreadCount} color="primary" slotProps={{ badge: { sx: { fontSize: 9, fontWeight: 700, height: 16, minWidth: 16 } } }}><NotificationsOutlined sx={{ fontSize: 18 }} /></Badge>
        </IconButton>
        <Popover open={Boolean(notifAnchor)} anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { borderRadius: '12px', mt: 1, width: 340, maxHeight: 420, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' } } }}>
          <Box sx={{ px: 1.5, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</Typography>
            {unreadCount > 0 && uid && <Chip label="Leer todas" size="small" onClick={() => dispatch(readAllNotifications(uid))} sx={{ fontSize: 10, cursor: 'pointer', height: 22 }} />}
          </Box>
          <List dense sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifItems.length === 0 && <Typography sx={{ p: 1.5, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>Sin notificaciones</Typography>}
            {notifItems.map((n) => (
              <ListItemButton key={n.id} sx={{ borderRadius: '6px', mx: 1, mb: 0.25, bgcolor: n.read ? 'transparent' : 'action.selected', py: 0.5 }}>
                <ListItemText primary={n.text} secondary={getTimeAgo(n.createdAt)}
                  slotProps={{ primary: { fontSize: 12.5, fontWeight: n.read ? 400 : 600, pr: 2 }, secondary: { fontSize: 10.5 } }} />
                <IconButton size="small" onClick={(e) => handleDeleteNotif(e, n.id)} sx={{ position: 'absolute', right: 4, top: 4 }}>
                  <Close sx={{ fontSize: 12 }} />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        </Popover>

        {isAuthenticated ? (
          <>
            <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} size="small" sx={{ ml: 0.25 }}>
              <Avatar src={currentUser?.photoURL || ''} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 11, fontWeight: 700 }}
                slotProps={{ img: { sx: { objectFit: 'cover' } } }}>
                {currentUser?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Popover open={Boolean(profileAnchor)} anchorEl={profileAnchor} onClose={() => setProfileAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { borderRadius: '12px', mt: 1, minWidth: 180, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' } } }}>
              <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                  <Avatar src={currentUser?.photoURL || ''} sx={{ width: 32, height: 32, bgcolor: '#8B5CF6', fontSize: 13 }}
                    slotProps={{ img: { sx: { objectFit: 'cover' } } }}>{currentUser?.name?.charAt(0) || 'U'}</Avatar>
                  <Box><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{currentUser?.name}</Typography><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Estudiante</Typography></Box>
                </Box>
                <Divider sx={{ my: 0.75 }} />
                <List dense>
                  {['Mi Perfil', 'Configuración', 'Ayuda'].map((item) => (
                    <ListItemButton key={item} sx={{ borderRadius: '6px', py: 0.25 }} onClick={() => { setProfileAnchor(null); if (item === 'Mi Perfil') navigate('/perfil') }}>
                      <ListItemText primary={item} slotProps={{ primary: { fontSize: 12.5 } }} />
                    </ListItemButton>
                  ))}
                  <Divider sx={{ my: 0.25 }} />
                  <ListItemButton sx={{ borderRadius: '6px', py: 0.25 }} onClick={handleLogout}>
                    <ListItemText primary="Cerrar sesión" slotProps={{ primary: { fontSize: 12.5, color: 'error.main' } }} />
                  </ListItemButton>
                </List>
              </Box>
            </Popover>
          </>
        ) : (
          <IconButton onClick={() => navigate('/login')} size="small" sx={{ ml: 0.25, color: 'text.secondary' }}>
            <LoginOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
