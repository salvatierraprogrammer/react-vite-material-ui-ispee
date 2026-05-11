import { Box, Skeleton, Card } from '@mui/material'

export default function SkeletonCard() {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <Skeleton variant="rounded" width="100%" height={72} sx={{ borderRadius: 0 }} animation="wave" />
      <Box sx={{ p: 1.35, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="text" width="38%" height={12} sx={{ mb: 0.5 }} animation="wave" />
        <Skeleton variant="text" width="88%" height={18} sx={{ mb: 0.35 }} animation="wave" />
        <Skeleton variant="text" width="72%" height={14} sx={{ mb: 0.85 }} animation="wave" />
        <Skeleton variant="text" width="56%" height={12} sx={{ mb: 0.85 }} animation="wave" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.85 }}>
          <Skeleton variant="text" width="45%" height={14} animation="wave" />
          <Skeleton variant="text" width="22%" height={14} animation="wave" />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.65 }}>
          <Skeleton variant="rounded" height={34} sx={{ flex: 1, borderRadius: '8px' }} animation="wave" />
          <Skeleton variant="rounded" height={34} sx={{ flex: 1, borderRadius: '8px' }} animation="wave" />
        </Box>
      </Box>
    </Card>
  )
}
