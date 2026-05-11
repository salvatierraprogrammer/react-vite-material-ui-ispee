import { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, Tabs, Tab, IconButton, Chip, ListItemButton, ListItemAvatar, Avatar, ListItemText, Tooltip, alpha } from '@mui/material'
import {
  NotificationsOutlined, School, Send, ChatBubbleOutlined, FavoriteBorder,
  FilePresentOutlined, SecurityOutlined, DeleteOutlined, ArrowBack,
} from '@mui/icons-material'
import { readAllNotifications, removeNotification, readNotification } from '../redux/slices/notificationsSlice'
import { getTimeAgo } from '../utils/helpers'
import ModalDetalleNotificacion from '../components/modals/ModalDetalleNotificacion'

const NOTIF_CONFIG = {
  material:     { icon: <School sx={{ fontSize: 18 }} />,                 color: '#8B5CF6', label: 'Material' },
  upload:       { icon: <School sx={{ fontSize: 18 }} />,                 color: '#8B5CF6', label: 'Subida' },
  message:      { icon: <Send sx={{ fontSize: 16 }} />,                   color: '#3B82F6', label: 'Mensaje' },
  comment:      { icon: <ChatBubbleOutlined sx={{ fontSize: 16 }} />,     color: '#10B981', label: 'Comentario' },
  forum_reply:  { icon: <ChatBubbleOutlined sx={{ fontSize: 16 }} />,     color: '#10B981', label: 'Respuesta' },
  like:         { icon: <FavoriteBorder sx={{ fontSize: 16 }} />,         color: '#EF4444', label: 'Me gusta' },
  share:        { icon: <FilePresentOutlined sx={{ fontSize: 16 }} />,    color: '#F59E0B', label: 'Compartido' },
  sanction:     { icon: <SecurityOutlined sx={{ fontSize: 16 }} />,       color: '#F97316', label: 'Sanción' },
  download:     { icon: <FilePresentOutlined sx={{ fontSize: 16 }} />,    color: '#14B8A6', label: 'Descarga' },
  alert:        { icon: <NotificationsOutlined sx={{ fontSize: 16 }} />,  color: '#F59E0B', label: 'Alerta' },
}

const DEFAULT_NOTIF = { icon: <NotificationsOutlined sx={{ fontSize: 18 }} />, color: '#94A3B8', label: 'Notificación' }

function getNotifConfig(type) { return NOTIF_CONFIG[type] || DEFAULT_NOTIF }

export default function Notificaciones() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: notifItems } = useSelector((s) => s.notifications)
  const uid = useSelector((s) => s.auth.currentUser?.uid)
  const [tab, setTab] = useState(0)
  const [selected, setSelected] = useState(null)

  const unreadCount = useMemo(() => notifItems.filter((n) => !n.read).length, [notifItems])

  const filtered = useMemo(() => {
    if (tab === 0) return notifItems
    if (tab === 1) return notifItems.filter((n) => !n.read)
    return notifItems.filter((n) => n.read)
  }, [notifItems, tab])

  const handleClickNotif = (n) => {
    setSelected(n)
  }

  const handleMarkRead = (n) => {
    if (!n.read && n.id) dispatch(readNotification(n.id))
  }

  const handleNavigate = (n) => {
    if (!n.read && n.id) dispatch(readNotification(n.id))
    if (n.targetPath) navigate(n.targetPath)
  }

  const handleDelete = (id) => {
    dispatch(removeNotification(id))
    setSelected(null)
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowBack sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Notificaciones</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </Typography>
        </Box>
        {unreadCount > 0 && uid && (
          <Chip
            label="Leer todas"
            size="small"
            onClick={() => dispatch(readAllNotifications(uid))}
            sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', height: 28 }}
          />
        )}
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2, minHeight: 36, borderBottom: 1, borderColor: 'divider',
          '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 12.5, fontWeight: 600, textTransform: 'none' },
        }}
      >
        <Tab label={`Todas (${notifItems.length})`} />
        <Tab label={`Sin leer (${unreadCount})`} />
        <Tab label={`Leídas (${notifItems.length - unreadCount})`} />
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <NotificationsOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography sx={{ fontSize: 15, color: 'text.secondary', fontWeight: 600 }}>Sin notificaciones</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>No hay novedades por acá</Typography>
        </Box>
      ) : (
        <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          {filtered.map((n, idx) => {
            const cfg = getNotifConfig(n.type)
            return (
              <ListItemButton
                key={n.id}
                onClick={() => handleClickNotif(n)}
                sx={{
                  py: 1.25, px: 2, borderBottom: idx < filtered.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider', bgcolor: n.read ? 'transparent' : alpha(cfg.color, 0.04),
                  '&:hover': { bgcolor: alpha(cfg.color, 0.08) },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: `${cfg.color}18`, color: cfg.color }}>
                      {cfg.icon}
                    </Avatar>
                    {!n.read && (
                      <Box sx={{
                        position: 'absolute', top: -1, right: -1, width: 10, height: 10,
                        borderRadius: '50%', bgcolor: cfg.color, border: '2px solid', borderColor: 'background.paper',
                      }} />
                    )}
                  </Box>
                </ListItemAvatar>
                <ListItemText
                  primary={n.text}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                      <Chip label={cfg.label} size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 600, bgcolor: `${cfg.color}14`, color: cfg.color }} />
                      <Typography component="span" sx={{ fontSize: 11, color: 'text.disabled' }}>{getTimeAgo(n.createdAt)}</Typography>
                    </Box>
                  }
                  slotProps={{
                    primary: { sx: { fontSize: 13.5, fontWeight: n.read ? 400 : 600, lineHeight: 1.35 } },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 0.25, ml: 1 }}>
                  {n.targetPath && (
                    <Tooltip title="Ir">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleNavigate(n) }}
                        sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { opacity: 1, color: 'primary.main' } }}>
                        <ArrowBack sx={{ fontSize: 15, transform: 'rotate(180deg)' }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Eliminar">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(n.id) }}
                      sx={{ color: 'text.secondary', opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}>
                      <DeleteOutlined sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemButton>
            )
          })}
        </Paper>
      )}

      <ModalDetalleNotificacion
        open={Boolean(selected)}
        notificacion={selected}
        onClose={() => setSelected(null)}
        onMarkRead={handleMarkRead}
        onNavigate={handleNavigate}
        onDelete={handleDelete}
      />
    </Box>
  )
}
