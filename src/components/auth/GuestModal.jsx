import { Box, Dialog, DialogContent, Typography, Button, IconButton, useTheme, alpha } from '@mui/material'
import { Close, LoginOutlined, PersonAddAltOutlined, DownloadRounded, LockOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

/**
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {string} [action] — mensaje genérico: "Iniciá sesión para …"
 * @param {boolean} [forDownload] — copia fija para descargas (no redirige solo al abrir)
 */
export default function GuestModal({ open, onClose, action, forDownload = false }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const primary = theme.palette.primary.main

  const goLogin = () => {
    onClose()
    navigate('/login')
  }
  const goRegister = () => {
    onClose()
    navigate('/register')
  }

  const title = forDownload ? 'Descargas para miembros' : 'Acceso requerido'
  const description = forDownload
    ? 'Tienes que iniciar sesión para descargar materiales.'
    : `Iniciá sesión para ${action || 'utilizar esta función'}.`
  const subline = forDownload
    ? 'Creá una cuenta gratis y accedé a todos los archivos de la comunidad.'
    : 'Necesitás una cuenta para usar esta función de forma segura.'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      scroll="body"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: alpha('#0f172a', isDark ? 0.65 : 0.45),
          },
        },
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : alpha('#8B5CF6', 0.12),
            background: isDark
              ? `linear-gradient(145deg, ${alpha('#1a1035', 0.98)} 0%, ${alpha('#12081f', 0.99)} 100%)`
              : `linear-gradient(180deg, ${alpha('#fff', 0.92)} 0%, ${alpha('#faf5ff', 0.95)} 100%)`,
            boxShadow: isDark
              ? '0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(167,139,250,0.08)'
              : '0 24px 48px rgba(124,58,237,0.12), 0 12px 24px rgba(15,23,42,0.08)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          },
        },
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        aria-label="Cerrar"
        sx={{
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 1,
          color: 'text.secondary',
          '&:hover': { bgcolor: alpha(primary, 0.08) },
        }}
      >
        <Close fontSize="small" />
      </IconButton>

      <DialogContent sx={{ pt: 3.5, pb: 3, px: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(primary, 0.2)} 0%, ${alpha(primary, 0.06)} 100%)`,
              border: '1px solid',
              borderColor: alpha(primary, 0.25),
              boxShadow: `0 8px 24px ${alpha(primary, 0.15)}`,
            }}
          >
            {forDownload ? (
              <DownloadRounded sx={{ fontSize: 36, color: 'primary.main' }} />
            ) : (
              <LockOutlined sx={{ fontSize: 34, color: 'primary.main' }} />
            )}
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 17, sm: 18 },
              textAlign: 'center',
              letterSpacing: '-0.02em',
              mb: 1,
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.5,
              color: 'text.primary',
              mb: 0.75,
              px: 0.5,
            }}
          >
            {description}
          </Typography>

          <Typography
            sx={{
              fontSize: 12.5,
              color: 'text.secondary',
              textAlign: 'center',
              lineHeight: 1.55,
              mb: 2.5,
              px: 0.5,
            }}
          >
            {subline}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<LoginOutlined />}
              onClick={goLogin}
              sx={{
                py: 1.25,
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: `0 8px 20px ${alpha(primary, 0.35)}`,
              }}
            >
              Iniciar sesión
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<PersonAddAltOutlined />}
              onClick={goRegister}
              sx={{
                py: 1.15,
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 2,
                borderWidth: 1.5,
                '&:hover': { borderWidth: 1.5 },
              }}
            >
              Crear cuenta
            </Button>
            <Button
              variant="text"
              size="medium"
              fullWidth
              onClick={onClose}
              sx={{ fontWeight: 600, color: 'text.secondary', py: 0.75 }}
            >
              Cancelar
            </Button>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
