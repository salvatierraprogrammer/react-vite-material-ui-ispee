import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material'
import { AutoStoriesOutlined } from '@mui/icons-material'
import { verifyResetCode, confirmResetPassword } from '../services/authService'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')

  const [valid, setValid] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setValid(false)
      return
    }
    verifyResetCode(oobCode)
      .then((e) => { setEmail(e); setValid(true) })
      .catch(() => setValid(false))
  }, [oobCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      await confirmResetPassword(oobCode, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      if (err.code === 'auth/expired-action-code') setError('El enlace ya expiró. Solicitá un nuevo restablecimiento.')
      else setError('Error al restablecer la contraseña. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (valid === null) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 400, width: '100%', borderRadius: '16px', backdropFilter: 'blur(20px)', backgroundColor: 'background.paper', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoStoriesOutlined sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Apuntes ISPEE</Typography>
          </Box>
          {!valid ? (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>Enlace inválido</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Este enlace de restablecimiento no es válido o ya expiró.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/login')} sx={{ borderRadius: '8px' }}>
                Volver al inicio de sesión
              </Button>
            </>
          ) : success ? (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5, color: 'success.main' }}>Contraseña actualizada</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Tu contraseña se restableció correctamente. Redirigiendo al inicio de sesión…
              </Typography>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>Nueva contraseña</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                {email ? `Para ${email}` : ''}
              </Typography>
            </>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: 12 }}>{error}</Alert>}

        {valid && !success && (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nueva contraseña" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} fullWidth size="small" required />
            <TextField label="Confirmar contraseña" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} fullWidth size="small" required />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 0.75, fontSize: 13, borderRadius: '8px' }}>
              {loading ? 'Restableciendo…' : 'Restablecer contraseña'}
            </Button>
          </Box>
        )}

        <Typography sx={{ textAlign: 'center', fontSize: 12.5, mt: 2.5, color: 'text.secondary' }}>
          <RouterLink to="/login" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>
            Volver al inicio de sesión
          </RouterLink>
        </Typography>
      </Paper>
    </Box>
  )
}
