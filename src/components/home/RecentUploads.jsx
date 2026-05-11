import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MaterialCard from '../cards/MaterialCard'
import EmptyState from '../common/EmptyState'

export default function RecentUploads({ materials }) {
  const navigate = useNavigate()
  const items = Array.isArray(materials) ? materials : []

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Subidas recientes</Typography>
        <Typography onClick={() => navigate('/materias')} sx={{ fontSize: 11, color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}>
          Ver todos →
        </Typography>
      </Box>
      {items.length === 0 ? (
        <EmptyState title="Sin materiales aún" description="Sé la primera en compartir apuntes con la comunidad ISPEE." />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {items.slice(0, 8).map((m) => <MaterialCard key={m.id} material={m} />)}
        </Box>
      )}
    </Box>
  )
}
