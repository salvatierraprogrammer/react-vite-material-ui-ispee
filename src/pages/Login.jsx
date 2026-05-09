import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, TextField, Button, Paper, Divider, IconButton, InputAdornment, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Google, Visibility, VisibilityOff, AutoStoriesOutlined } from '@mui/icons-material'
import { loginUser, loginWithGoogle, sendVerificationEmail, resetPassword } from '../services/authService'
import { setUser } from '../redux/slices/authSlice'
import { showSnackbar } from '../redux/slices/uiSlice'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const [verifyWarning, setVerifyWarning] = useState(false)
  const verifyUserRef = useRef(null)

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await loginUser(form)
      dispatch(setUser({ uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL }))
      dispatch(showSnackbar({ message: `Bienvenido de nuevo, ${user.displayName || 'Usuario'}`, severity: 'success' }))
      if (!user.emailVerified) {
        verifyUserRef.current = user
        setVerifyWarning(true)
      } else {
        navigate(searchParams.get('redirect') || '/')
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError('Email o contraseña incorrectos')
      else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta')
      else setError('Error al iniciar sesión. Intentá de nuevo.')
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      const user = await loginWithGoogle()
      dispatch(setUser({ uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL }))
      dispatch(showSnackbar({ message: `Bienvenido, ${user.displayName || 'Usuario'}`, severity: 'success' }))
      navigate(searchParams.get('redirect') || '/')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('Error al iniciar con Google')
    }
  }

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail(verifyUserRef.current)
      dispatch(showSnackbar({ message: 'Email de verificación reenviado', severity: 'success' }))
    } catch {
      dispatch(showSnackbar({ message: 'Error al reenviar verificación', severity: 'error' }))
    }
  }

  const handleResetPassword = async () => {
    if (!resetEmail) return
    setResetLoading(true)
    try {
      await resetPassword(resetEmail)
      setResetSent(true)
    } catch {
      dispatch(showSnackbar({ message: 'Error al enviar el email. Verificá que el email sea correcto.', severity: 'error' }))
    } finally {
      setResetLoading(false)
    }
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
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>Bienvenido de nuevo</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Iniciá sesión para continuar</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: 12 }}>{error}</Alert>}
        {verifyWarning && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '8px', fontSize: 12 }}
            action={<Button size="small" sx={{ fontSize: 10 }} onClick={handleResendVerification}>Reenviar</Button>}>
            Email no verificado. Revisá tu bandeja de entrada.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} fullWidth size="small" required />
          <TextField label="Contraseña" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} fullWidth size="small" required
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">{showPw ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</IconButton></InputAdornment> }}} />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 0.75, fontSize: 13, borderRadius: '8px' }}>
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>
          <Button size="small" sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'none', alignSelf: 'flex-end', mt: -0.5 }} onClick={() => { setResetEmail(form.email); setResetOpen(true) }}>
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}><Typography sx={{ fontSize: 11, color: 'text.secondary', px: 1 }}>O continuá con</Typography></Divider>

        <Button variant="outlined" fullWidth onClick={handleGoogle} startIcon={<Google sx={{ fontSize: 16 }} />} sx={{ fontSize: 12.5, py: 0.75, borderRadius: '8px' }}>
          Google
        </Button>

        <Typography sx={{ textAlign: 'center', fontSize: 12.5, mt: 2.5, color: 'text.secondary' }}>
          ¿No tenés cuenta?{' '}
          <RouterLink to="/register" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>
            Registrate
          </RouterLink>
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Button size="small" sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'none' }} onClick={() => navigate('/')}>
            Seguir como invitado
          </Button>
        </Box>
      </Paper>

      <Dialog open={resetOpen} onClose={() => { setResetOpen(false); setResetSent(false) }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700 }}>Restablecer contraseña</DialogTitle>
        {resetSent ? (
          <>
            <DialogContent sx={{ fontSize: 13, color: 'text.secondary' }}>
              Si {resetEmail} está registrado, vas a recibir un email con instrucciones para restablecer tu contraseña.
            </DialogContent>
            <DialogActions><Button onClick={() => { setResetOpen(false); setResetSent(false) }}>Cerrar</Button></DialogActions>
          </>
        ) : (
          <>
            <DialogContent>
              <TextField label="Email" type="email" fullWidth size="small" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} autoFocus />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResetOpen(false)}>Cancelar</Button>
              <Button onClick={handleResetPassword} disabled={resetLoading || !resetEmail} variant="contained">
                {resetLoading ? 'Enviando…' : 'Enviar'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
