import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, TextField, Button, Chip, Alert, InputAdornment, CircularProgress, Avatar, Divider } from '@mui/material'
import {
  SecurityOutlined, LockOutlined, Visibility, VisibilityOff, EmailOutlined, PersonOutlined,
  CheckCircleOutlineOutlined, KeyOutlined, LogoutOutlined,
} from '@mui/icons-material'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../firebase/config'
import { showSnackbar } from '../redux/slices/uiSlice'
import { logoutUser } from '../services/authService'
import { clearUser } from '../redux/slices/authSlice'

export default function Seguridad() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [changingPw, setChangingPw] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      dispatch(showSnackbar({ message: 'Completá todos los campos', severity: 'warning' }))
      return
    }
    if (newPw.length < 6) {
      dispatch(showSnackbar({ message: 'La contraseña debe tener al menos 6 caracteres', severity: 'warning' }))
      return
    }
    if (newPw !== confirmPw) {
      dispatch(showSnackbar({ message: 'Las contraseñas nuevas no coinciden', severity: 'warning' }))
      return
    }
    if (!auth.currentUser?.email) {
      dispatch(showSnackbar({ message: 'No se puede cambiar la contraseña sin email', severity: 'error' }))
      return
    }
    setChangingPw(true)
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPw)
      dispatch(showSnackbar({ message: 'Contraseña cambiada con éxito', severity: 'success' }))
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) {
      if (e.code === 'auth/wrong-password') dispatch(showSnackbar({ message: 'La contraseña actual es incorrecta', severity: 'error' }))
      else dispatch(showSnackbar({ message: `Error: ${e.message}`, severity: 'error' }))
    }
    setChangingPw(false)
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SecurityOutlined sx={{ fontSize: 18, color: 'white' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Seguridad</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Gestioná la seguridad de tu cuenta</Typography>
        </Box>
      </Box>

      {/* Estado de la cuenta */}
      <Paper sx={{ borderRadius: '14px', p: 2, mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Estado de la cuenta</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { label: 'Email', value: currentUser?.email || auth.currentUser?.email || '—', icon: EmailOutlined },
            { label: 'Email verificado', ok: auth.currentUser?.emailVerified, icon: CheckCircleOutlineOutlined },
            { label: 'Método de autenticación', value: 'Email y contraseña', icon: KeyOutlined },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'action.hover' }}>
              <item.icon sx={{ fontSize: 16, color: item.ok !== undefined ? (item.ok ? '#10B981' : '#F59E0B') : '#8B5CF6' }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{item.label}</Typography>
                {item.value !== undefined ? (
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{item.value}</Typography>
                ) : (
                  <Chip label={item.ok ? 'Verificado' : 'Pendiente'} size="small" sx={{ height: 18, fontSize: 9, fontWeight: 600, bgcolor: item.ok ? '#10B98118' : '#F59E0B18', color: item.ok ? '#10B981' : '#F59E0B', mt: 0.25 }} />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Cambiar contraseña */}
      <Paper sx={{ borderRadius: '14px', p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <LockOutlined sx={{ fontSize: 18, color: '#8B5CF6' }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Cambiar contraseña</Typography>
        </Box>
        <TextField value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} label="Contraseña actual" type={showPw.current ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}>{showPw.current ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
        <TextField value={newPw} onChange={(e) => setNewPw(e.target.value)} label="Nueva contraseña" type={showPw.new ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}>{showPw.new ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
        <TextField value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} label="Confirmar nueva contraseña" type={showPw.confirm ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}>{showPw.confirm ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
        <Button variant="contained" onClick={handleChangePassword} disabled={changingPw || !currentPw || !newPw || !confirmPw} fullWidth sx={{ borderRadius: '10px', py: 0.75, fontSize: 12.5, fontWeight: 600 }}>
          {changingPw ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Cambiar contraseña'}
        </Button>
      </Paper>

      {/* Consejos */}
      <Alert severity="info" sx={{ borderRadius: '10px', fontSize: 11.5 }}>
        Usá una contraseña segura con al menos 8 caracteres, mayúsculas, minúsculas y números. No compartas tu contraseña con nadie.
      </Alert>
    </Box>
  )
}
