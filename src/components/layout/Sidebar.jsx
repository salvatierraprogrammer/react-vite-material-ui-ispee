import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Button, Divider, useMediaQuery, useTheme } from '@mui/material'
import { HomeOutlined, SchoolOutlined, FavoriteBorderOutlined, UploadFileOutlined, ChatOutlined, ForumOutlined, AutoStoriesOutlined } from '@mui/icons-material'
import { setSidebarOpen } from '../../redux/slices/uiSlice'
import { DRAWER_WIDTH } from '../../constants'
import GuestModal from '../auth/GuestModal'

const nav = [
  { label: 'Inicio', icon: HomeOutlined, path: '/' },
  { label: 'Materias', icon: SchoolOutlined, path: '/materias' },
  { label: 'Favoritos', icon: FavoriteBorderOutlined, path: '/favoritos' },
  { label: 'Mis aportes', icon: UploadFileOutlined, path: '/mis-aportes' },
  { label: 'Mensajes', icon: ChatOutlined, path: '/mensajes' },
  { label: 'Foro', icon: ForumOutlined, path: '/foro' },
]

function SidebarContent({ onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [guestOpen, setGuestOpen] = useState(false)
  const go = (path) => { navigate(path); onNavigate?.() }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => go('/')}>
        <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AutoStoriesOutlined sx={{ color: '#fff', fontSize: 16 }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.1 }}>Apuntes ISPEE</Typography>
      </Box>

      <Divider sx={{ mx: 1.5, mb: 0.5 }} />

      <List dense disablePadding sx={{ px: 1 }}>
        {nav.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <ListItemButton key={item.label} onClick={() => go(item.path)} sx={{ borderRadius: '8px', mb: 0.25, bgcolor: active ? 'rgba(139,92,246,0.1)' : 'transparent', color: active ? 'primary.main' : 'text.secondary', '&:hover': { bgcolor: 'rgba(139,92,246,0.08)', color: 'primary.main' }, py: 0.5, px: 1 }}>
              <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}><Icon sx={{ fontSize: 17 }} /></ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { fontSize: 12.5, fontWeight: active ? 600 : 500 } }} />
            </ListItemButton>
          )
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ mx: 1.5, mb: 1.5, p: 1.25, borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', textAlign: 'center' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#fff', mb: 0.5 }}>Compartí tus apuntes</Typography>
        <Button variant="contained" fullWidth size="small" onClick={() => isAuthenticated ? go('/?subir=true') : setGuestOpen(true)} sx={{ backgroundColor: '#fff', color: '#8B5CF6', fontWeight: 700, fontSize: 11, py: 0.5, minHeight: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>Subir material</Button>
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

  if (isDesktop) return (
    <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' } }}>
      <SidebarContent />
    </Drawer>
  )

  return (
    <Drawer anchor="left" open={sidebarOpen} onClose={() => dispatch(setSidebarOpen(false))} sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>
      <SidebarContent onNavigate={() => dispatch(setSidebarOpen(false))} />
    </Drawer>
  )
}
