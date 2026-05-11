import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
  Tooltip,
  Avatar,
  alpha,
} from '@mui/material'
import {
  HomeOutlined,
  HomeRounded,
  SchoolOutlined,
  SchoolRounded,
  FavoriteBorderOutlined,
  FavoriteRounded,
  UploadFileOutlined,
  UploadFileRounded,
  ChatOutlined,
  ChatRounded,
  ForumOutlined,
  ForumRounded,
  AutoStoriesOutlined,
  DashboardOutlined,
  NotificationsOutlined,
  NotificationsRounded,
  HelpOutlineOutlined,
  HelpRounded,
  ChevronRightRounded,
} from '@mui/icons-material'
import { setSidebarOpen } from '../../redux/slices/uiSlice'
import { DRAWER_WIDTH } from '../../constants'
import { ROLES } from '../../services/authService'
import GuestModal from '../auth/GuestModal'

const nav = [
  { label: 'Inicio', icon: HomeOutlined, iconActive: HomeRounded, path: '/' },
  { label: 'Materias', icon: SchoolOutlined, iconActive: SchoolRounded, path: '/materias' },
  { label: 'Favoritos', icon: FavoriteBorderOutlined, iconActive: FavoriteRounded, path: '/favoritos' },
  { label: 'Mis aportes', icon: UploadFileOutlined, iconActive: UploadFileRounded, path: '/mis-aportes' },
  { label: 'Mensajes', icon: ChatOutlined, iconActive: ChatRounded, path: '/mensajes' },
  { label: 'Notificaciones', icon: NotificationsOutlined, iconActive: NotificationsRounded, path: '/notificaciones' },
  { label: 'Foro', icon: ForumOutlined, iconActive: ForumRounded, path: '/foro' },
  { label: 'Ayuda', icon: HelpOutlineOutlined, iconActive: HelpRounded, path: '/ayuda' },
]

function SidebarContent({ onNavigate }) {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)
  const unreadCount = useSelector((s) => s.notifications.items.filter((n) => !n.read).length)
  const [guestOpen, setGuestOpen] = useState(false)
  const isDark = theme.palette.mode === 'dark'
  const primary = theme.palette.primary.main

  const go = (path) => {
    navigate(path)
    onNavigate?.()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        backgroundImage: isDark
          ? `linear-gradient(180deg, ${alpha('#1a1035', 1)} 0%, ${alpha('#12081f', 1)} 100%)`
          : `linear-gradient(180deg, ${alpha('#fff', 1)} 0%, ${alpha('#fafafa', 1)} 100%)`,
      }}
    >
      <Box
        sx={{
          px: 1.75,
          pt: 1.75,
          pb: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          cursor: 'pointer',
          borderRadius: 2,
          mx: 1,
          mt: 1,
          transition: 'background-color 0.2s ease',
          '&:hover': { bgcolor: alpha(primary, 0.06) },
        }}
        onClick={() => go('/')}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 16px ${alpha(primary, 0.35)}`,
          }}
        >
          <AutoStoriesOutlined sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}>Apuntes ISPEE</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 600, mt: 0.15 }}>Plataforma estudiantil</Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, my: 1, opacity: 0.85 }} />

      <List dense disablePadding sx={{ px: 1.25, flex: 1, overflow: 'auto' }}>
        <Typography
          sx={{
            px: 1.5,
            py: 0.75,
            fontSize: 10,
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Menú
        </Typography>
        {nav.map((item) => {
          const active = location.pathname === item.path
          const isNotif = item.path === '/notificaciones'
          const Icon = active ? item.iconActive || item.icon : item.icon
          return (
            <Tooltip key={item.label} title={item.label} placement="right" enterDelay={500} arrow>
              <Box component="span" sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => go(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.35,
                    py: 0.85,
                    px: 1.25,
                    minHeight: 42,
                    position: 'relative',
                    overflow: 'hidden',
                    color: active ? primary : 'text.secondary',
                    bgcolor: active ? alpha(primary, isDark ? 0.18 : 0.1) : 'transparent',
                    fontWeight: active ? 700 : 500,
                    border: '1px solid',
                    borderColor: active ? alpha(primary, isDark ? 0.35 : 0.22) : 'transparent',
                    transition: 'background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease',
                    '&:hover': {
                      bgcolor: alpha(primary, isDark ? 0.12 : 0.07),
                      color: primary,
                      borderColor: alpha(primary, isDark ? 0.2 : 0.12),
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  {active && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: 4,
                        background: `linear-gradient(180deg, ${primary}, #A78BFA)`,
                        boxShadow: `0 0 12px ${alpha(primary, 0.45)}`,
                      }}
                    />
                  )}
                  <ListItemIcon sx={{ minWidth: 38, color: 'inherit', justifyContent: 'center' }}>
                    {isNotif ? (
                      <Badge
                        badgeContent={unreadCount > 0 ? unreadCount : 0}
                        color="primary"
                        overlap="circular"
                        invisible={unreadCount === 0}
                        slotProps={{ badge: { sx: { fontSize: 9, fontWeight: 800, minWidth: 16, height: 16 } } }}
                      >
                        <Icon sx={{ fontSize: 21 }} />
                      </Badge>
                    ) : (
                      <Icon sx={{ fontSize: 21 }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { fontSize: 13, fontWeight: active ? 700 : 600, letterSpacing: '-0.01em' },
                    }}
                  />
                  {active && <ChevronRightRounded sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />}
                </ListItemButton>
              </Box>
            </Tooltip>
          )
        })}

        {currentUser?.role === ROLES.ADMIN && (
          <>
            <Divider sx={{ my: 1.25, mx: 1 }} />
            <Typography
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: 10,
                fontWeight: 800,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Admin
            </Typography>
            <Tooltip title="Panel de administración" placement="right" enterDelay={400} arrow>
              <Box component="span" sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => go('/admin')}
                  sx={{
                    borderRadius: 2,
                    mb: 0.35,
                    py: 0.85,
                    px: 1.25,
                    minHeight: 42,
                    position: 'relative',
                    color: location.pathname.startsWith('/admin') ? primary : 'text.secondary',
                    bgcolor: location.pathname.startsWith('/admin') ? alpha(primary, isDark ? 0.18 : 0.1) : 'transparent',
                    border: '1px solid',
                    borderColor: location.pathname.startsWith('/admin') ? alpha(primary, 0.22) : 'transparent',
                    fontWeight: location.pathname.startsWith('/admin') ? 700 : 500,
                    '&:hover': {
                      bgcolor: alpha(primary, 0.08),
                      color: primary,
                      borderColor: alpha(primary, 0.12),
                    },
                  }}
                >
                  {location.pathname.startsWith('/admin') && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: 4,
                        background: `linear-gradient(180deg, ${primary}, #A78BFA)`,
                      }}
                    />
                  )}
                  <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                    <DashboardOutlined sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText primary="Panel admin" slotProps={{ primary: { fontSize: 13, fontWeight: 700 } }} />
                </ListItemButton>
              </Box>
            </Tooltip>
          </>
        )}
      </List>

      {isAuthenticated && currentUser && (
        <Box sx={{ px: 1.5, pb: 1, pt: 0.5 }}>
          <Box
            onClick={() => go('/perfil')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 1.25,
              borderRadius: 2,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: alpha(primary, isDark ? 0.28 : 0.2),
              bgcolor: alpha(primary, isDark ? 0.14 : 0.08),
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                borderColor: alpha(primary, 0.45),
                bgcolor: alpha(primary, isDark ? 0.2 : 0.12),
                boxShadow: `0 4px 16px ${alpha(primary, 0.2)}`,
              },
            }}
          >
            <Avatar
              src={currentUser.photoURL || ''}
              sx={{ width: 40, height: 40, fontWeight: 800, bgcolor: primary, border: '2px solid', borderColor: alpha('#fff', 0.35) }}
              slotProps={{ img: { sx: { objectFit: 'cover' } } }}
            >
              {currentUser.name?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary' }}>
                {currentUser.name || 'Usuario'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 700, opacity: 0.95 }}>Ver perfil</Typography>
            </Box>
            <ChevronRightRounded sx={{ fontSize: 20, color: 'primary.main', opacity: 0.75 }} />
          </Box>
        </Box>
      )}

      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            textAlign: 'center',
            boxShadow: `0 10px 28px ${alpha('#6D28D9', 0.35)}`,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff', mb: 1, lineHeight: 1.35 }}>Compartí tus apuntes</Typography>
          <Button
            variant="contained"
            fullWidth
            size="medium"
            onClick={() => (isAuthenticated ? go('/?subir=true') : setGuestOpen(true))}
            sx={{
              backgroundColor: '#fff',
              color: '#6D28D9',
              fontWeight: 800,
              fontSize: 12.5,
              py: 1,
              minHeight: 40,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
            }}
          >
            Subir material
          </Button>
        </Box>
      </Box>
      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action="subir materiales" />
    </Box>
  )
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const sidebarOpen = useSelector((s) => s.ui.sidebarOpen)

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    )
  }

  return (
    <Drawer
      anchor="left"
      open={sidebarOpen}
      onClose={() => dispatch(setSidebarOpen(false))}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <SidebarContent onNavigate={() => dispatch(setSidebarOpen(false))} />
    </Drawer>
  )
}
