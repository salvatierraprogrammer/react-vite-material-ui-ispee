import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Card, Switch, Divider, Chip, Skeleton, List, ListItemButton, ListItemText, IconButton, Tooltip, Alert, AlertTitle, Button } from '@mui/material'
import { NotificationsOutlined, WarningAmberOutlined, InfoOutlined, DeleteOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { updateUserProfile } from '../services/usersService'
import { setUser } from '../redux/slices/authSlice'
import { showSnackbar } from '../redux/slices/uiSlice'
import { getSanctions } from '../services/adminService'

const NOTIF_TYPES = [
  { key: 'material', label: 'Nuevos materiales', desc: 'Cuando alguien sube un material nuevo', icon: InfoOutlined },
  { key: 'comment', label: 'Comentarios', desc: 'Cuando comentan tus materiales o posts', icon: InfoOutlined },
  { key: 'message', label: 'Mensajes', desc: 'Cuando recibís un mensaje nuevo', icon: InfoOutlined },
  { key: 'like', label: 'Likes', desc: 'Cuando dan like a tus materiales', icon: InfoOutlined },
  { key: 'forumReply', label: 'Respuestas en el foro', desc: 'Cuando responden tus publicaciones', icon: InfoOutlined },
]

export default function Configuracion() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.currentUser)
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [sanctions, setSanctions] = useState([])

  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)
    Promise.all([
      getDoc(doc(db, 'users', user.uid)),
      getSanctions(50),
    ]).then(([userSnap, allSanctions]) => {
      if (userSnap.exists()) {
        const data = userSnap.data()
        setPrefs(data.notifPrefs || {
          material: true, comment: true, message: true, like: true, forumReply: true,
        })
      }
      setSanctions(allSanctions.filter((s) => s.userId === user.uid))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.uid])

  const handleToggle = useCallback(async (key) => {
    const newVal = !prefs[key]
    setSaving(key)
    setPrefs((prev) => ({ ...prev, [key]: newVal }))
    try {
      await updateUserProfile(user.uid, { notifPrefs: { ...prefs, [key]: newVal } })
      dispatch(showSnackbar({ message: 'Preferencia actualizada', severity: 'success' }))
    } catch {
      setPrefs((prev) => ({ ...prev, [key]: !newVal }))
      dispatch(showSnackbar({ message: 'Error al actualizar', severity: 'error' }))
    }
    setSaving(null)
  }, [prefs, user?.uid, dispatch])

  const formatDate = (ts) => {
    if (!ts) return '-'
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts)
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return '-' }
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Configuración</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2.5 }}>Administrá tus preferencias de notificaciones y advertencias</Typography>

      {/* ─── NOTIFICACIONES ─── */}
      <Card sx={{ borderRadius: '14px', overflow: 'hidden', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <NotificationsOutlined sx={{ color: '#3B82F6', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</Typography>
          <Chip label="Recibí alertas sobre actividad" size="small" sx={{ fontSize: 9, height: 18 }} />
        </Box>
        {loading ? (
          <Box sx={{ p: 2 }}>{[1,2,3,4,5].map((i) => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />)}</Box>
        ) : (
          NOTIF_TYPES.map((notif, idx) => {
            const Icon = notif.icon
            const isOn = prefs?.[notif.key] !== false
            return (
              <Box key={notif.key} sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                '&:hover': { bgcolor: 'action.hover' },
                borderBottom: idx < NOTIF_TYPES.length - 1 ? 1 : 0,
                borderColor: 'divider',
              }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: isOn ? '#3B82F618' : 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon sx={{ fontSize: 15, color: isOn ? '#3B82F6' : 'text.disabled' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{notif.label}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{notif.desc}</Typography>
                </Box>
                <Switch
                  checked={isOn}
                  onChange={() => handleToggle(notif.key)}
                  disabled={saving === notif.key}
                  size="small"
                  sx={{ flexShrink: 0 }}
                />
              </Box>
            )
          })
        )}
      </Card>

      {/* ─── ADVERTENCIAS ─── */}
      <Card sx={{ borderRadius: '14px', overflow: 'hidden', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <WarningAmberOutlined sx={{ color: '#F59E0B', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Advertencias</Typography>
          <Chip label={`${sanctions.length} registro${sanctions.length !== 1 ? 's' : ''}`} size="small" sx={{ fontSize: 9, height: 18 }} />
        </Box>
        {loading ? (
          <Box sx={{ p: 2 }}><Skeleton height={60} /></Box>
        ) : sanctions.length === 0 ? (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircleOutlineOutlined sx={{ color: '#10B981', fontSize: 18 }} />
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>No tenés advertencias ni sanciones activas</Typography>
          </Box>
        ) : (
          <List dense>
            {sanctions.map((s) => (
              <ListItemButton key={s.id} sx={{ borderRadius: '6px', mx: 1, mb: 0.25, py: 0.75 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{s.reason}</Typography>
                      <Chip
                        label={s.type === 'suspension' ? 'Suspensión' : 'Advertencia'}
                        size="small"
                        sx={{ height: 18, fontSize: 9, fontWeight: 600, bgcolor: s.type === 'suspension' ? '#EF444418' : '#F59E0B18', color: s.type === 'suspension' ? '#EF4444' : '#F59E0B' }}
                      />
                    </Box>
                  }
                  secondary={formatDate(s.createdAt)}
                  slotProps={{ primary: { sx: { mb: 0.1 } }, secondary: { fontSize: 10.5 } }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Card>

      {/* ─── INFORMACIÓN ─── */}
      <Card sx={{ borderRadius: '14px', p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <InfoOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
            Las notificaciones se muestran en el ícono de campana en la barra superior. Podés elegir qué tipo de alertas querés recibir.
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}
