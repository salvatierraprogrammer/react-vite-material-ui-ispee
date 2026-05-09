import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, Typography, Button } from '@mui/material'
import { LoginOutlined } from '@mui/icons-material'

export default function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)
  const { pathname } = useLocation()

  if (!requireAuth) return children

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
        <LoginOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Iniciá sesión para continuar</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
          Necesitás estar autenticado para acceder a esta sección.
        </Typography>
        <Button variant="contained" component="a" href={`/login?redirect=${encodeURIComponent(pathname)}`} sx={{ fontSize: 13, px: 3 }}>
          Iniciar sesión
        </Button>
      </Box>
    )
  }

  return children
}
