import { Dialog, DialogTitle, DialogContent, Box, Typography, Button, IconButton, Divider, Chip } from '@mui/material'
import {
  Close, School, Send, ChatBubbleOutlined, FavoriteBorder, FilePresentOutlined,
  SecurityOutlined, NotificationsOutlined, OpenInNew, DeleteOutlined, DoneAllOutlined,
} from '@mui/icons-material'
import { getTimeAgo } from '../../utils/helpers'

const NOTIF_CONFIG = {
  material:     { icon: <School sx={{ fontSize: 22 }} />,                 color: '#8B5CF6', label: 'Material' },
  upload:       { icon: <School sx={{ fontSize: 22 }} />,                 color: '#8B5CF6', label: 'Subida' },
  message:      { icon: <Send sx={{ fontSize: 20 }} />,                   color: '#3B82F6', label: 'Mensaje' },
  comment:      { icon: <ChatBubbleOutlined sx={{ fontSize: 20 }} />,     color: '#10B981', label: 'Comentario' },
  forum_reply:  { icon: <ChatBubbleOutlined sx={{ fontSize: 20 }} />,     color: '#10B981', label: 'Respuesta' },
  like:         { icon: <FavoriteBorder sx={{ fontSize: 20 }} />,         color: '#EF4444', label: 'Me gusta' },
  share:        { icon: <FilePresentOutlined sx={{ fontSize: 20 }} />,    color: '#F59E0B', label: 'Compartido' },
  sanction:     { icon: <SecurityOutlined sx={{ fontSize: 20 }} />,       color: '#F97316', label: 'Sanción' },
  download:     { icon: <FilePresentOutlined sx={{ fontSize: 20 }} />,    color: '#14B8A6', label: 'Descarga' },
  alert:        { icon: <NotificationsOutlined sx={{ fontSize: 20 }} />,  color: '#F59E0B', label: 'Alerta' },
}

const DEFAULT_NOTIF = { icon: <NotificationsOutlined sx={{ fontSize: 22 }} />, color: '#94A3B8', label: 'Notificación' }

function getNotifConfig(type) { return NOTIF_CONFIG[type] || DEFAULT_NOTIF }

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ModalDetalleNotificacion({ open, notificacion, onClose, onMarkRead, onNavigate, onDelete }) {
  if (!notificacion) return null

  const cfg = getNotifConfig(notificacion.type)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: '16px' }, margin: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'calc(100% - 32px)' } } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color }}>
            {cfg.icon}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{cfg.label}</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', textTransform: 'capitalize' }}>
              {notificacion.read ? 'Leída' : 'Sin leer'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"><Close sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
        <Box sx={{ my: 1.5, p: 2, bgcolor: 'action.hover', borderRadius: '10px' }}>
          <Typography sx={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>{notificacion.text}</Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Fecha</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{formatDate(notificacion.createdAt)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Tiempo</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{getTimeAgo(notificacion.createdAt)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Estado</Typography>
            <Chip
              label={notificacion.read ? 'Leída' : 'Sin leer'}
              size="small"
              color={notificacion.read ? 'default' : 'primary'}
              sx={{ fontSize: 10.5, fontWeight: 600, height: 22 }}
            />
          </Box>
          {notificacion.targetPath && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Enlace</Typography>
              <Typography sx={{ fontSize: 11.5, color: 'primary.main', fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {notificacion.targetPath}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          {!notificacion.read && (
            <Button
              variant="contained"
              size="small"
              startIcon={<DoneAllOutlined sx={{ fontSize: 15 }} />}
              onClick={() => { onMarkRead(notificacion); onClose() }}
              sx={{ borderRadius: '8px', fontSize: 11.5, fontWeight: 600 }}
            >
              Marcar como leída
            </Button>
          )}
          {notificacion.targetPath && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNew sx={{ fontSize: 15 }} />}
              onClick={() => { onNavigate(notificacion); onClose() }}
              sx={{ borderRadius: '8px', fontSize: 11.5, fontWeight: 600 }}
            >
              Ir al contenido
            </Button>
          )}
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteOutlined sx={{ fontSize: 15 }} />}
            onClick={() => onDelete(notificacion.id)}
            sx={{ borderRadius: '8px', fontSize: 11.5, fontWeight: 600, ml: 'auto' }}
          >
            Eliminar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
