import { Box, CircularProgress, Typography } from '@mui/material'

export default function Loading({ text }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 6, gap: 1.5 }}>
      <CircularProgress size={32} sx={{ color: '#8B5CF6' }} />
      {text && <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{text}</Typography>}
    </Box>
  )
}
