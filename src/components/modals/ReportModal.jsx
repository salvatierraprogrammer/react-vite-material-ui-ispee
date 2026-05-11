import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Dialog, DialogTitle, DialogContent, Box, Typography, TextField, MenuItem, Button, IconButton, CircularProgress } from '@mui/material'
import { Close, FlagOutlined } from '@mui/icons-material'
import { showSnackbar } from '../../redux/slices/uiSlice'
import { createReport } from '../../services/adminService'

const REPORT_REASONS = [
  { value: 'inapropiado', label: 'Contenido inapropiado' },
  { value: 'spam', label: 'Spam' },
  { value: 'ofensivo', label: 'Lenguaje ofensivo' },
  { value: 'plagio', label: 'Plagio / Derechos de autor' },
  { value: 'duplicado', label: 'Material duplicado' },
  { value: 'otro', label: 'Otro' },
]

export default function ReportModal({ open, onClose, targetId, targetUserId, type }) {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((s) => s.auth)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    const finalReason = reason === 'otro' ? customReason : REPORT_REASONS.find((r) => r.value === reason)?.label || reason
    if (!finalReason) return
    setSending(true)
    try {
      await createReport({
        type: type || 'material',
        targetId,
        reason: finalReason,
        reportedBy: currentUser?.uid || 'anónimo',
        targetUserId: targetUserId || null,
      })
      dispatch(showSnackbar({ message: 'Reporte enviado. Gracias por ayudar a mantener la comunidad.', severity: 'success' }))
      onClose()
      setReason('')
      setCustomReason('')
    } catch {
      dispatch(showSnackbar({ message: 'Error al enviar el reporte', severity: 'error' }))
    }
    setSending(false)
  }

  const handleClose = () => {
    if (!sending) { onClose(); setReason(''); setCustomReason('') }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: '16px' }, margin: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'calc(100% - 32px)' } } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlagOutlined sx={{ fontSize: 18, color: '#EF4444' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Reportar contenido</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>Ayudanos a mantener la comunidad segura</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={sending}><Close sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2.5, pb: 2.5 }}>
        <TextField select label="Motivo del reporte" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth size="small" sx={{ mb: reason === 'otro' ? 1.5 : 0, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12.5 } }}>
          <MenuItem value="" disabled>Seleccioná un motivo</MenuItem>
          {REPORT_REASONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
        </TextField>
        {reason === 'otro' && (
          <TextField label="Describí el motivo" value={customReason} onChange={(e) => setCustomReason(e.target.value)} fullWidth multiline rows={3} size="small" placeholder="Contanos por qué reportás este contenido…"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 } }} />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button onClick={handleClose} disabled={sending} size="small" sx={{ borderRadius: '8px', fontSize: 12 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={sending || !reason} size="small" sx={{ borderRadius: '8px', fontSize: 12 }}>
            {sending ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Enviar reporte'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}