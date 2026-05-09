import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Box, Typography, TextField, Button, Paper, Divider, IconButton, InputAdornment, Alert } from '@mui/material'
import { Google, Visibility, VisibilityOff, AutoStoriesOutlined } from '@mui/icons-material'
import { registerUser, loginWithGoogle, sendVerificationEmail } from '../services/authService'
import { setUser } from '../redux/slices/authSlice'
import { showSnackbar } from '../redux/slices/uiSlice'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', lastName: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    try {
      const user = await registerUser({ email: form.email, password: form.password, name: form.name, lastName: form.lastName })
      try {
        await sendVerificationEmail(user)
      } catch (emailErr) {
        setError('Error al enviar el email de verificación. Podés reenviarlo desde el inicio de sesión.')
      }
      const displayName = `${form.name} ${form.lastName}`.trim()
      dispatch(setUser({ uid: user.uid, name: displayName, email: form.email, photoURL: '' }))
      dispatch(showSnackbar({ message: `¡Bienvenido a Apuntes ISPEE, ${form.name}! Revisá tu email para verificar la cuenta.`, severity: 'success' }))
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Este email ya está registrado')
      else if (err.code === 'auth/weak-password') setError('La contraseña es muy débil')
      else setError('Error al registrarse. Intentá de nuevo.')
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      const user = await loginWithGoogle()
      dispatch(setUser({ uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL }))
      dispatch(showSnackbar({ message: `¡Bienvenida, ${user.displayName || 'Usuario'}!`, severity: 'success' }))
      navigate('/')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('Error al registrarse con Google')
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
          <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>Crear cuenta</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Unite a la comunidad ISPEE</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: 12 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="Nombre" value={form.name} onChange={handleChange('name')} fullWidth size="small" required />
            <TextField label="Apellido" value={form.lastName} onChange={handleChange('lastName')} fullWidth size="small" />
          </Box>
          <TextField label="Email" type="email" value={form.email} onChange={handleChange('email')} fullWidth size="small" required />
          <TextField label="Contraseña" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange('password')} fullWidth size="small" required
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">{showPw ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</IconButton></InputAdornment> }}} />
          <TextField label="Confirmar contraseña" type="password" value={form.confirm} onChange={handleChange('confirm')} fullWidth size="small" required />
          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 0.75, fontSize: 13, borderRadius: '8px' }}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}><Typography sx={{ fontSize: 11, color: 'text.secondary', px: 1 }}>O registrate con</Typography></Divider>

        <Button variant="outlined" fullWidth onClick={handleGoogle} startIcon={<Google sx={{ fontSize: 16 }} />} sx={{ fontSize: 12.5, py: 0.75, borderRadius: '8px' }}>
          Google
        </Button>

        <Typography sx={{ textAlign: 'center', fontSize: 12.5, mt: 2.5, color: 'text.secondary' }}>
          ¿Ya tenés cuenta?{' '}
          <RouterLink to="/login" style={{ color: '#8B5CF6', fontWeight: 600, textDecoration: 'none' }}>
            Iniciá sesión
          </RouterLink>
        </Typography>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Button size="small" sx={{ fontSize: 11, color: 'text.secondary', textTransform: 'none' }} onClick={() => navigate('/')}>
            Seguir como invitado
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
