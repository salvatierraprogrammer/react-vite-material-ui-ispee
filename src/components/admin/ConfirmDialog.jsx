import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, alpha } from '@mui/material'
import { WarningAmberOutlined, InfoOutlined, DeleteOutlined, BlockOutlined, PersonOffOutlined, ReportOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const ICON_MAP = {
  delete: <DeleteOutlined sx={{ fontSize: 26 }} />,
  block: <BlockOutlined sx={{ fontSize: 26 }} />,
  suspend: <PersonOffOutlined sx={{ fontSize: 26 }} />,
  warn: <WarningAmberOutlined sx={{ fontSize: 26 }} />,
  report: <ReportOutlined sx={{ fontSize: 26 }} />,
  resolve: <CheckCircleOutlineOutlined sx={{ fontSize: 26 }} />,
  info: <InfoOutlined sx={{ fontSize: 26 }} />,
}

const COLOR_MAP = {
  delete: '#EF4444',
  block: '#F59E0B',
  suspend: '#F97316',
  warn: '#8B5CF6',
  report: '#3B82F6',
  resolve: '#10B981',
  info: '#6B7280',
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, consequences, confirmLabel, cancelLabel, type, loading, children }) {
  const [internalLoading, setInternalLoading] = useState(false)
  const isProcessing = loading || internalLoading
  const icon = ICON_MAP[type] || ICON_MAP.info
  const color = COLOR_MAP[type] || COLOR_MAP.info

  const handleConfirm = async () => {
    if (isProcessing) return
    setInternalLoading(true)
    try {
      await onConfirm()
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={isProcessing ? undefined : onClose}
          maxWidth="xs"
          fullWidth
          slotProps={{
            backdrop: {
              sx: {
                backdropFilter: 'blur(8px)',
                bgcolor: alpha('#000', 0.5),
              },
            },
            paper: {
              sx: {
                borderRadius: '20px',
                p: 1,
                overflow: 'visible',
                boxShadow: '0 24px 48px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)',
              },
            },
          }}
          TransitionComponent={motion.div}
          TransitionProps={{
            initial: { opacity: 0, scale: 0.92, y: 20 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.92, y: 20 },
            transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.25 }}
          >
            <Box sx={{ textAlign: 'center', pt: 3, px: 2 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Box sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
                  color,
                  mx: 'auto',
                  mb: 2,
                  border: `1px solid ${alpha(color, 0.15)}`,
                }}>
                  {icon}
                </Box>
              </motion.div>
              <DialogTitle sx={{ p: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
                {title || 'Confirmar acción'}
              </DialogTitle>
            </Box>
            <DialogContent sx={{ px: 3, py: 2 }}>
              {description && (
                <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center', mb: 1, lineHeight: 1.5 }}>
                  {description}
                </Typography>
              )}
              {children}
              {consequences && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.25 }}
                >
                  <Box sx={{
                    bgcolor: alpha('#FEF2F2', 0.8),
                    borderRadius: '12px',
                    p: 1.5,
                    mt: 2,
                    border: '1px solid',
                    borderColor: alpha('#FECACA', 0.6),
                  }}>
                    <Typography sx={{
                      fontSize: 11.5,
                      color: '#991B1B',
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.5,
                    }}>
                      {consequences}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button
                onClick={onClose}
                disabled={isProcessing}
                variant="outlined"
                fullWidth
                sx={{
                  py: 1.25,
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: '12px',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' },
                }}
              >
                {cancelLabel || 'Cancelar'}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.25,
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: '12px',
                  bgcolor: color,
                  boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                  '&:hover': { bgcolor: color, filter: 'brightness(0.9)', boxShadow: `0 6px 16px ${alpha(color, 0.4)}` },
                  '&.Mui-disabled': { bgcolor: `${color}60` },
                }}
              >
                {isProcessing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (confirmLabel || 'Confirmar')}
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
