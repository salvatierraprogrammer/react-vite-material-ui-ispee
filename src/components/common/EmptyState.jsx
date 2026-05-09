import { Box, Typography } from '@mui/material'
import { InboxOutlined } from '@mui/icons-material'

export default function EmptyState({ icon, title, description }) {
  const Icon = icon || InboxOutlined
  return (
    <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
      <Icon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.35, mb: 1.5 }} />
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>{title || 'Sin contenido'}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{description || 'No hay elementos para mostrar todavía.'}</Typography>
    </Box>
  )
}
