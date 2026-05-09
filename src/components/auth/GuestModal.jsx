import { Box, Dialog, DialogTitle, DialogContent, Typography, Button, IconButton } from '@mui/material'
import { Close, LoginOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function GuestModal({ open, onClose, action }) {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Acceso requerido</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <LoginOutlined sx={{ fontSize: 48, color: 'primary.main', opacity: 0.5, mb: 1.5 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.75 }}>
          Iniciá sesión para {action || 'utilizar esta función'}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mb: 2 }}>
          Necesitás tener una cuenta para acceder a esta funcionalidad.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => { onClose(); navigate('/login') }} sx={{ fontSize: 12.5, px: 2 }}>
            Iniciar sesión
          </Button>
          <Button variant="outlined" onClick={() => { onClose(); navigate('/register') }} sx={{ fontSize: 12.5, px: 2 }}>
            Crear cuenta
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
