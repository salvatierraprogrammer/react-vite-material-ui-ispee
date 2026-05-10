import { Box, Typography } from '@mui/material'
import MaterialCard from '../cards/MaterialCard'

export default function RecentUploads({ materials }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Subidas recientes</Typography>
        <Typography sx={{ fontSize: 11, color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>Ver todos →</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {materials.slice(0, 8).map((m) => <MaterialCard key={m.id} material={m} />)}
      </Box>
    </Box>
  )
}
