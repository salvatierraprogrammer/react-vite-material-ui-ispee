import { motion } from 'framer-motion'
import { Box, Typography, Button } from '@mui/material'
import { SearchOffOutlined } from '@mui/icons-material'

export default function EmptyState({ icon, title, description, action, iconColor = '#6B7280', size = 'medium' }) {
  const Icon = icon || SearchOffOutlined
  const iconSize = size === 'large' ? 72 : size === 'small' ? 40 : 56

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        py: size === 'large' ? 6 : size === 'small' ? 3 : 4, px: 2,
      }}>
        <Box sx={{
          width: iconSize + 24, height: iconSize + 24, borderRadius: '16px',
          bgcolor: `${iconColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 2,
        }}>
          <Icon sx={{ fontSize: iconSize, color: iconColor, opacity: 0.7 }} />
        </Box>
        {title && (
          <Typography sx={{ fontSize: size === 'small' ? 13 : 15, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            {title}
          </Typography>
        )}
        {description && (
          <Typography sx={{ fontSize: size === 'small' ? 11 : 12.5, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
            {description}
          </Typography>
        )}
        {action && (
          <Button
            variant="outlined"
            size="small"
            onClick={action.onClick}
            startIcon={action.icon}
            sx={{ mt: 2, borderRadius: '10px', fontSize: 12, fontWeight: 600 }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </motion.div>
  )
}
