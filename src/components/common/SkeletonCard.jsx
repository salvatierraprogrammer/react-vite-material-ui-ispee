import { Box, Skeleton, Card } from '@mui/material'

export default function SkeletonCard() {
  return (
    <Card sx={{ p: 1.5 }}>
      <Skeleton variant="rounded" width="100%" height={70} sx={{ mb: 1, borderRadius: '8px' }} />
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="80%" height={18} sx={{ my: 0.25 }} />
      <Skeleton variant="text" width="60%" height={12} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Skeleton variant="text" width="30%" height={12} />
        <Skeleton variant="text" width="20%" height={12} />
      </Box>
    </Card>
  )
}
