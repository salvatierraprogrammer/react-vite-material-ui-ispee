import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Button, Switch, TextField, Alert, AlertTitle, List, ListItemButton, ListItemIcon, ListItemText, Divider, CircularProgress, InputAdornment, Chip } from '@mui/material'
import {
  SecurityOutlined, ShieldOutlined, BlockOutlined, WarningAmberOutlined, ReportOutlined, VisibilityOutlined,
  LockOutlined, EmailOutlined, CheckCircleOutlineOutlined, HistoryOutlined, PersonOutlined,
  Visibility, VisibilityOff,
} from '@mui/icons-material'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { showSnackbar } from '../../redux/slices/uiSlice'
import { subscribeToAuditLogs } from '../../services/adminService'
import PageHeader from '../../components/admin/PageHeader'
import StatusChip from '../../components/admin/StatusChip'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'
import { motion } from 'framer-motion'

function formatDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

export default function AdminSecurity() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [changingPw, setChangingPw] = useState(false)

  const [settings, setSettings] = useState({
    autoBlockWarnings: true,
    notifyOnReport: true,
    moderateNewUsers: false,
    requireEmailVerification: false,
  })

  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    const unsub = subscribeToAuditLogs((logs) => setRecentLogs(logs.slice(0, 10)), 10)
    return unsub
  }, [])

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    dispatch(showSnackbar({ message: 'Configuración actualizada', severity: 'success' }))
  }

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
      else if (e.code === 'auth/weak-password') dispatch(showSnackbar({ message: 'La contraseña es muy débil', severity: 'error' }))
      else dispatch(showSnackbar({ message: `Error: ${e.message}`, severity: 'error' }))
    }
    setChangingPw(false)
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<SecurityOutlined sx={{ fontSize: 18 }} />} title="Seguridad" description="Protegé tu cuenta y configurá las opciones de moderación" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Paper sx={{ borderRadius: '14px', overflow: 'hidden', alignSelf: 'start' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#8B5CF618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LockOutlined sx={{ fontSize: 15, color: '#8B5CF6' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Cambiar contraseña</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <TextField value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} label="Contraseña actual" type={showPw.current ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
                slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}>{showPw.current ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
              <TextField value={newPw} onChange={(e) => setNewPw(e.target.value)} label="Nueva contraseña" type={showPw.new ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
                slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}>{showPw.new ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
              <TextField value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} label="Confirmar nueva contraseña" type={showPw.confirm ? 'text' : 'password'} size="small" fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
                slotProps={{ input: { endAdornment: <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}>{showPw.confirm ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}</InputAdornment> } }} />
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button variant="contained" onClick={handleChangePassword} disabled={changingPw || !currentPw || !newPw || !confirmPw} fullWidth sx={{ borderRadius: '10px', py: 0.75, fontSize: 12.5, fontWeight: 600 }}>
                  {changingPw ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Cambiar contraseña'}
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Paper sx={{ borderRadius: '14px', overflow: 'hidden', alignSelf: 'start' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#3B82F618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldOutlined sx={{ fontSize: 15, color: '#3B82F6' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Configuración de seguridad</Typography>
            </Box>
            <List dense>
              {[
                { key: 'autoBlockWarnings', icon: BlockOutlined, label: 'Bloqueo automático por advertencias', desc: 'Bloquear usuarios al llegar a 3 advertencias', color: '#EF4444' },
                { key: 'notifyOnReport', icon: ReportOutlined, label: 'Notificar nuevos reportes', desc: 'Recibir notificación cuando alguien reporte contenido', color: '#F59E0B' },
                { key: 'moderateNewUsers', icon: VisibilityOutlined, label: 'Moderar usuarios nuevos', desc: 'Revisar manualmente cuentas nuevas antes de activarlas', color: '#3B82F6' },
                { key: 'requireEmailVerification', icon: WarningAmberOutlined, label: 'Requerir verificación de email', desc: 'Solo usuarios con email verificado pueden acceder', color: '#F97316' },
              ].map((item) => (
                <ListItemButton key={item.key} sx={{ borderRadius: '6px', mx: 0.5, px: 1.5, py: 0.75 }}>
                  <ListItemIcon sx={{ minWidth: 34 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon sx={{ fontSize: 14, color: item.color }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText primary={item.label} secondary={item.desc} slotProps={{ primary: { fontSize: 12, fontWeight: 600 }, secondary: { fontSize: 10.5 } }} />
                  <Switch checked={settings[item.key]} onChange={() => handleToggle(item.key)} size="small" />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Paper sx={{ borderRadius: '14px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#10B98118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleOutlineOutlined sx={{ fontSize: 15, color: '#10B981' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Estado de la cuenta</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Email verificado', ok: auth.currentUser?.emailVerified, icon: EmailOutlined },
                { label: 'Cuenta activa', ok: !currentUser?.isBlocked && !currentUser?.suspended, icon: PersonOutlined },
                { label: 'Autenticación', ok: true, icon: LockOutlined },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 0.75, borderRadius: '8px', bgcolor: 'action.hover' }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: item.ok ? '#10B98118' : '#EF444418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <item.icon sx={{ fontSize: 13, color: item.ok ? '#10B981' : '#EF4444' }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{item.label}</Typography>
                  <StatusChip status={item.ok ? 'resolved' : 'pending'} label={item.ok ? 'OK' : 'Pendiente'} dot={false} />
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Paper sx={{ borderRadius: '14px', overflow: 'hidden', alignSelf: 'start' }}>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: '#F59E0B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HistoryOutlined sx={{ fontSize: 15, color: '#F59E0B' }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Actividad reciente</Typography>
            </Box>
            <Box>
              {recentLogs.length === 0 ? (
                <Typography sx={{ p: 2, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>Sin actividad registrada</Typography>
              ) : recentLogs.map((log, i) => (
                <motion.div key={log.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.75, borderBottom: i < recentLogs.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: log.action?.includes('block') ? '#EF4444' : log.action?.includes('delete') ? '#EF4444' : '#10B981', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 500 }}>{log.action?.replace(/_/g, ' ') || 'Acción'}</Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{log.details?.email || log.details?.uid?.slice(0, 16) || ''}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 10, color: 'text.disabled', whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Paper sx={{ borderRadius: '14px', p: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Roles y permisos</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mb: 1.5 }}>Los roles se asignan desde la sección <strong>Usuarios</strong>.</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                { role: 'Admin', desc: 'Acceso completo al panel', color: '#8B5CF6' },
                { role: 'Moderador', desc: 'Gestiona reportes y contenido', color: '#3B82F6' },
                { role: 'Profesor', desc: 'Sube materiales y participa', color: '#10B981' },
                { role: 'Estudiante', desc: 'Acceso básico a la plataforma', color: '#6B7280' },
              ].map((r) => (
                <Chip key={r.role} label={`${r.role}: ${r.desc}`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: `${r.color}12`, color: r.color, fontWeight: 500 }} />
              ))}
            </Box>
          </Paper>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Paper sx={{ borderRadius: '14px', p: 2 }}>
            <Alert severity="info" sx={{ borderRadius: '10px', fontSize: 11.5 }}>
              <AlertTitle sx={{ fontSize: 12, fontWeight: 700 }}>Recordatorio de seguridad</AlertTitle>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                Todas las acciones realizadas en el panel quedan registradas en el <strong>Registro de auditoría</strong>. Usá contraseñas seguras y no compartas tu cuenta.
              </Typography>
            </Alert>
          </Paper>
        </motion.div>
      </Box>
    </AnimatedPage>
  )
}
