import { useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, IconButton, InputBase, Badge, Avatar, Typography, Popover, List, ListItemButton, ListItemText, ListItemAvatar, Divider, Chip, Paper, ClickAwayListener, Tooltip, Button } from '@mui/material'
import { Menu as MenuIcon, Search, DarkModeOutlined, LightModeOutlined, NotificationsOutlined, Close, School, Forum, LoginOutlined, Send, ChatBubbleOutlined, FavoriteBorder, FilePresentOutlined, SecurityOutlined, DoneAllOutlined, VisibilityOutlined } from '@mui/icons-material'
import { toggleDarkMode, setSidebarOpen, showSnackbar } from '../../redux/slices/uiSlice'
import { readAllNotifications, removeNotification } from '../../redux/slices/notificationsSlice'
import { clearUser } from '../../redux/slices/authSlice'
import { logoutUser } from '../../services/authService'
import { markAsRead } from '../../services/notificationService'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { getTimeAgo, truncate } from '../../utils/helpers'
import { useResponsive } from '../../hooks/useResponsive'
import { TYPE_COLORS } from '../../constants'

const NOTIF_CONFIG = {
  material:     { icon: <School sx={{ fontSize: 14 }} />,               color: '#8B5CF6' },
  upload:       { icon: <School sx={{ fontSize: 14 }} />,               color: '#8B5CF6' },
  message:      { icon: <Send sx={{ fontSize: 13 }} />,                 color: '#3B82F6' },
  comment:      { icon: <ChatBubbleOutlined sx={{ fontSize: 13 }} />,   color: '#10B981' },
  forum_reply:  { icon: <ChatBubbleOutlined sx={{ fontSize: 13 }} />,   color: '#10B981' },
  like:         { icon: <FavoriteBorder sx={{ fontSize: 13 }} />,       color: '#EF4444' },
  share:        { icon: <FilePresentOutlined sx={{ fontSize: 13 }} />,  color: '#F59E0B' },
  sanction:     { icon: <SecurityOutlined sx={{ fontSize: 13 }} />,     color: '#F97316' },
  download:     { icon: <FilePresentOutlined sx={{ fontSize: 13 }} />,  color: '#14B8A6' },
}

const DEFAULT_NOTIF = { icon: <NotificationsOutlined sx={{ fontSize: 14 }} />, color: '#94A3B8' }

function getNotifConfig(type) { return NOTIF_CONFIG[type] || DEFAULT_NOTIF }

function getDateGroup(dateStr) {
  const now = new Date(); now.setHours(0,0,0,0)
  const date = new Date(dateStr); date.setHours(0,0,0,0)
  const diff = Math.floor((now - date) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return 'Esta semana'
  return 'Anterior'
}

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const darkMode = useSelector((s) => s.ui.darkMode)
  const { currentUser, isAuthenticated } = useSelector((s) => s.auth)
  const notifItems = useSelector((s) => s.notifications.items)
  const unreadCount = notifItems.filter((n) => !n.read).length
  const uid = useSelector((s) => s.auth.currentUser?.uid)
  const { isMobile } = useResponsive()
  const { query, setQuery, results, clear } = useGlobalSearch()
  const [focused, setFocused] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const searchRef = useRef(null)
  const totalResults = results.materials.length + results.posts.length

  const handleSearchChange = useCallback((e) => setQuery(e.target.value), [setQuery])
  const handleSelect = useCallback((path) => { navigate(path); clear(); setFocused(false) }, [navigate, clear])

  const notifGroups = (() => {
    const groups = {}
    notifItems.forEach((n) => {
      const g = getDateGroup(n.createdAt)
      if (!groups[g]) groups[g] = []
      groups[g].push(n)
    })
    return groups
  })()
  const GROUP_ORDER = ['Hoy', 'Ayer', 'Esta semana', 'Anterior']

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

  const handleNotifClick = (n) => {
    setNotifAnchor(null)
    const role = currentUser?.role
    const path = n.type === 'alert' && role !== 'admin' ? '/notificaciones' : n.targetPath
    if (path) navigate(path)
    if (!n.read) markAsRead(n.id)
  }

  const handleDeleteNotif = (e, id) => {
    e.stopPropagation()
    dispatch(removeNotification(id))
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1100, backdropFilter: 'blur(12px)', backgroundColor: darkMode ? 'rgba(26,16,53,0.85)' : 'rgba(255,255,255,0.85)', minHeight: 52 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 480, position: 'relative' }}>
        {isMobile && <IconButton onClick={onMenuClick || (() => dispatch(setSidebarOpen(true)))} sx={{ color: 'text.primary' }} size="small"><MenuIcon sx={{ fontSize: 20 }} /></IconButton>}
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
          <Badge badgeContent={unreadCount} color="primary" overlap="circular" slotProps={{ badge: { sx: { fontSize: 9, fontWeight: 700, height: 16, minWidth: 16 } } }}><NotificationsOutlined sx={{ fontSize: 18 }} /></Badge>
        </IconButton>
        <Popover open={Boolean(notifAnchor)} anchorEl={notifAnchor} onClose={() => setNotifAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { borderRadius: '12px', mt: 1, width: 350, maxHeight: 440, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', overflow: 'hidden' } } }}>
          <Box sx={{ px: 1.5, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <NotificationsOutlined sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>Notificaciones</Typography>
              {unreadCount > 0 && <Chip label={unreadCount} size="small" sx={{ height: 18, minWidth: 18, fontSize: 9, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }} />}
            </Box>
            {unreadCount > 0 && uid && (
              <Chip icon={<DoneAllOutlined sx={{ fontSize: 11 }} />} label="Leer todas" size="small" onClick={() => dispatch(readAllNotifications(uid))} variant="outlined" sx={{ fontSize: 10, height: 22, cursor: 'pointer', '& .MuiChip-icon': { ml: 0.25 } }} />
            )}
          </Box>
          <List dense sx={{ maxHeight: 350, overflowY: 'auto', py: 0.5 }}>
            {notifItems.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, px: 2 }}>
                <NotificationsOutlined sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Sin notificaciones</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.25 }}>No tenés novedades por ahora</Typography>
              </Box>
            ) : GROUP_ORDER.map((g) => {
              const items = notifGroups[g]
              if (!items) return null
              return (
                <Box key={g}>
                  <Typography sx={{ px: 1.5, pt: 1, pb: 0.25, fontSize: 10, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.06, lineHeight: 1.6 }}>{g}</Typography>
                  {items.map((n) => {
                    const cfg = getNotifConfig(n.type)
                    return (
                      <ListItemButton key={n.id} onClick={() => handleNotifClick(n)} sx={{ borderRadius: '8px', mx: 0.75, mb: 0.15, bgcolor: n.read ? 'transparent' : 'action.selected', py: 0.4, px: 1, position: 'relative', '&:hover': { bgcolor: 'action.hover' } }}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Avatar sx={{ width: 30, height: 30, bgcolor: `${cfg.color}18`, color: cfg.color, fontSize: 13 }}>{cfg.icon}</Avatar>
                            {!n.read && <Box sx={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', border: '2px solid', borderColor: 'background.paper' }} />}
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={n.text}
                          secondary={getTimeAgo(n.createdAt)}
                          slotProps={{
                            primary: { fontSize: 12, fontWeight: n.read ? 400 : 600, pr: 1.5, lineHeight: 1.35 },
                            secondary: { fontSize: 10.5, color: 'text.disabled' },
                          }}
                        />
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={(e) => handleDeleteNotif(e, n.id)} sx={{ position: 'absolute', right: 2, top: 2, opacity: 0.35, '&:hover': { opacity: 1, bgcolor: 'error.main', color: 'white' } }}>
                            <Close sx={{ fontSize: 10 }} />
                          </IconButton>
                        </Tooltip>
                      </ListItemButton>
                    )
                  })}
                </Box>
              )
            })}
          </List>
          {notifItems.length > 0 && (
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 0.5 }}>
              <Button
                fullWidth
                size="small"
                startIcon={<VisibilityOutlined sx={{ fontSize: 13 }} />}
                onClick={() => { setNotifAnchor(null); navigate('/notificaciones') }}
                sx={{ borderRadius: '8px', fontSize: 11.5, fontWeight: 600, textTransform: 'none', color: 'text.secondary', py: 0.5 }}
              >
                Ver todas
              </Button>
            </Box>
          )}
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
                  <ListItemButton sx={{ borderRadius: '6px', py: 0.25 }} onClick={() => { setProfileAnchor(null); navigate('/perfil') }}>
                    <ListItemText primary="Mi Perfil" slotProps={{ primary: { fontSize: 12.5 } }} />
                  </ListItemButton>
                  <ListItemButton sx={{ borderRadius: '6px', py: 0.25 }} onClick={() => { setProfileAnchor(null); navigate('/configuracion') }}>
                    <ListItemText primary="Configuración" slotProps={{ primary: { fontSize: 12.5 } }} />
                  </ListItemButton>
                  <ListItemButton sx={{ borderRadius: '6px', py: 0.25 }} onClick={() => { setProfileAnchor(null); navigate('/ayuda') }}>
                    <ListItemText primary="Ayuda" slotProps={{ primary: { fontSize: 12.5 } }} />
                  </ListItemButton>
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
