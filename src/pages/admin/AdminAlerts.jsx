import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Button, Switch, Divider, TextField, Alert } from '@mui/material'
import {
  NotificationsActiveOutlined, SendOutlined, CampaignOutlined,
} from '@mui/icons-material'
import { createNotification } from '../../services/notificationService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import PageHeader from '../../components/admin/PageHeader'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'
import { getAllUsers } from '../../services/adminService'
import { motion } from 'framer-motion'

export default function AdminAlerts() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sendToAll, setSendToAll] = useState(true)

  const handleSendAlert = async () => {
    if (!message.trim() || !currentUser?.uid) return
    setSending(true)
    try {
      const users = await getAllUsers()
      const targets = sendToAll ? users : users.filter((u) => u.role !== 'admin')
      let sent = 0
      for (const u of targets) {
        if (u.id === currentUser.uid) continue
        try {
          const targetPath = u.role === 'admin' ? '/admin/alertas' : '/notificaciones'
          await createNotification({
            userId: u.id,
            text: message.trim(),
            type: 'alert',
            targetPath,
          })
          sent++
        } catch {}
      }
      dispatch(showSnackbar({ message: `Alerta enviada a ${sent} usuario(s)`, severity: 'success' }))
      setMessage('')
      setTitle('')
    } catch (e) { dispatch(showSnackbar({ message: `Error: ${e.message}`, severity: 'error' })) }
    setSending(false)
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<NotificationsActiveOutlined sx={{ fontSize: 18 }} />} title="Alertas" description="Enviá notificaciones masivas a los usuarios" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Paper sx={{ borderRadius: '14px', p: 2.5, maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F59E0B18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CampaignOutlined sx={{ fontSize: 18, color: '#F59E0B' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Nueva alerta</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Todas las notificaciones se enviarán como notificación push en la app.</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TextField value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la alerta (opcional)" size="small" fullWidth
            sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }} />

          <TextField value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribí el mensaje de la alerta…" multiline rows={4} fullWidth
            sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }} />

          <motion.div whileTap={{ scale: 0.99 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Switch size="small" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} />
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Enviar a todos los usuarios</Typography>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Si desactivás, no se enviará a administradores.</Typography>
              </Box>
            </Box>
          </motion.div>

          <Alert severity="info" sx={{ mb: 2, borderRadius: '8px', fontSize: 11 }}>
            Se enviará una notificación a {sendToAll ? 'todos los usuarios' : 'usuarios no administradores'}.
            {message && ` Vista previa: "${message.slice(0, 60)}${message.length > 60 ? '…' : ''}"`}
          </Alert>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="contained" onClick={handleSendAlert} disabled={sending || !message.trim()} startIcon={<SendOutlined sx={{ fontSize: 15 }} />}
                sx={{ fontSize: 12, fontWeight: 600, borderRadius: '10px', py: 0.75 }}>
                {sending ? 'Enviando…' : 'Enviar alerta'}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outlined" onClick={() => { setMessage(''); setTitle('') }} disabled={sending}
                sx={{ fontSize: 12, fontWeight: 600, borderRadius: '10px' }}>
                Limpiar
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>
    </AnimatedPage>
  )
}
