import { useState, useCallback, memo } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/selectors'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton, Avatar, Badge, Tooltip, useMediaQuery, useTheme, alpha } from '@mui/material'
import {
  DashboardOutlined, PeopleOutlined, ReportOutlined, GavelOutlined, ForumOutlined, DescriptionOutlined,
  StorageOutlined, CleaningServicesOutlined, NotificationsActiveOutlined, SecurityOutlined, HistoryOutlined,
  ChevronLeft, MenuOutlined, LogoutOutlined, AutoStoriesOutlined,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import Header from './Header'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { label: 'Panel', icon: DashboardOutlined, path: '/admin', exact: true },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Usuarios', icon: PeopleOutlined, path: '/admin/usuarios' },
      { label: 'Reportes', icon: ReportOutlined, path: '/admin/reportes' },
      { label: 'Sanciones', icon: GavelOutlined, path: '/admin/sanciones' },
    ],
  },
  {
    label: 'Contenido',
    items: [
      { label: 'Foro', icon: ForumOutlined, path: '/admin/foro' },
      { label: 'Materiales', icon: DescriptionOutlined, path: '/admin/materiales' },
      { label: 'Almacenamiento', icon: StorageOutlined, path: '/admin/almacenamiento' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Auditoría', icon: HistoryOutlined, path: '/admin/auditoria' },
      { label: 'Alertas', icon: NotificationsActiveOutlined, path: '/admin/alertas' },
      { label: 'Limpieza', icon: CleaningServicesOutlined, path: '/admin/limpieza' },
      { label: 'Seguridad', icon: SecurityOutlined, path: '/admin/seguridad' },
    ],
  },
]

const DRAWER_WIDTH = 258

const NavItem = memo(function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative' }}
    >
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: '10px',
          mb: 0.3,
          py: 0.65,
          px: 1.5,
          bgcolor: isActive ? alpha('#8B5CF6', 0.08) : 'transparent',
          color: isActive ? '#8B5CF6' : 'text.secondary',
          '&:hover': {
            bgcolor: isActive ? alpha('#8B5CF6', 0.12) : alpha('#8B5CF6', 0.04),
            color: isActive ? '#8B5CF6' : 'text.primary',
          },
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            style={{
              position: 'absolute',
              left: 0,
              top: 5,
              bottom: 5,
              width: 3.5,
              borderRadius: '0 4px 4px 0',
              background: 'linear-gradient(180deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 0 8px rgba(139,92,246,0.4)',
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <ListItemIcon
          sx={{
            minWidth: 32,
            color: isActive ? '#8B5CF6' : 'inherit',
            '& .MuiSvgIcon-root': { fontSize: 20, transition: 'color 0.2s ease' },
          }}
        >
          <Icon />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '-0.01em',
            },
          }}
        />
      </ListItemButton>
    </motion.div>
  )
})

function AdminProfile({ currentUser, theme, isMobile, onClose }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <Box
        onClick={() => { navigate('/admin'); isMobile && onClose?.() }}
        sx={{
          px: 2,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha('#8B5CF6', 0.3)}, transparent)`,
          },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{
            badge: {
              sx: {
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#10B981',
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
              },
            },
          }}
        >
          <Avatar
            src={currentUser?.photoURL || ''}
            sx={{
              width: 38,
              height: 38,
              bgcolor: 'primary.main',
              fontSize: 14,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(139,92,246,0.25)',
            }}
          >
            {(currentUser?.name || currentUser?.displayName || 'A').charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentUser?.name || currentUser?.displayName || 'Administradora'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.15 }}>
            <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#10B981', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 500 }}>
              Administradora
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const currentUser = useSelector(selectCurrentUser)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = useCallback((item) => {
    return item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  }, [location.pathname])

  const handleNavigate = useCallback((path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }, [navigate, isMobile])

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      <Box sx={{
        background: (t) => `linear-gradient(135deg, ${alpha('#8B5CF6', t.palette.mode === 'dark' ? 0.08 : 0.04)}, transparent)`,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <AdminProfile currentUser={currentUser} theme={theme} isMobile={isMobile} onClose={() => setMobileOpen(false)} />
      </Box>

      <Divider sx={{ mx: 2, my: 0.5 }} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 0.5, '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: alpha('#8B5CF6', 0.15), '&:hover': { bgcolor: alpha('#8B5CF6', 0.3) } } }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 0.75 }}>
            <Typography
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: 9.5,
                fontWeight: 700,
                color: 'text.disabled',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              {section.label}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive(item)}
                  onClick={() => handleNavigate(item.path)}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ px: 1, py: 0.75 }}>
        <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
          <ListItemButton
            onClick={() => { navigate('/'); isMobile && setMobileOpen(false) }}
            sx={{
              borderRadius: '10px',
              py: 0.6,
              px: 1.5,
              color: 'text.secondary',
              '&:hover': { color: 'primary.main', bgcolor: alpha('#8B5CF6', 0.06) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 20 } }}>
              <AutoStoriesOutlined />
            </ListItemIcon>
            <ListItemText primary="Ir al inicio" slotProps={{ primary: { fontSize: 12.5, fontWeight: 500 } }} />
          </ListItemButton>
        </motion.div>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onMenuClick={isMobile ? (() => { document.activeElement?.blur?.(); setMobileOpen(true) }) : undefined} />
        <Box sx={{ flexGrow: 1, pt: { xs: 1.5, sm: 1.5, md: 2 }, px: { xs: 1.5, sm: 2.5, md: 3 }, pb: { xs: 1.5, sm: 2.5, md: 3 }, overflow: 'auto' }}>
          <Box component="main" sx={{ height: '100%' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
