import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { LockOutlined, LoginOutlined } from '@mui/icons-material'

export default function AdminRoute({ children }) {
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, bgcolor: 'background.default' }}>
        <LockOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Iniciá sesión para continuar</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
          Necesitás estar autenticada para acceder al panel de administración.
        </Typography>
        <Button variant="contained" component="a" href={`/login?redirect=/admin`} sx={{ fontSize: 13, px: 3 }}>
          Iniciar sesión
        </Button>
      </Box>
    )
  }

  if (currentUser?.role !== 'admin') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, bgcolor: 'background.default' }}>
        <LockOutlined sx={{ fontSize: 48, color: '#EF4444', opacity: 0.4 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Acceso restringido</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
          Esta sección es solo para administradores. Si necesitás acceso, contactate con el equipo de soporte.
        </Typography>
        <Button variant="contained" component="a" href="/" sx={{ fontSize: 13, px: 3 }}>
          Volver al inicio
        </Button>
      </Box>
    )
  }

  return children
}
