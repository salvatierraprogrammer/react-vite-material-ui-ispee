import { useMemo } from 'react'
import { Box, Typography, Button } from '@mui/material'
import { ArrowForwardRounded } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import MaterialCard from '../cards/MaterialCard'
import EmptyState from '../common/EmptyState'
import SkeletonCard from '../common/SkeletonCard'

export default function RecentUploads({ materials, loading = false }) {
  const navigate = useNavigate()
  const items = Array.isArray(materials) ? materials : []

  const slice = useMemo(() => items.slice(0, 8), [items])

  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 17, sm: 18 }, fontWeight: 800, letterSpacing: '-0.02em', display: 'block' }}>
            Subidas recientes
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500, mt: 0.25 }}>
            Lo último que sumó la comunidad
          </Typography>
        </Box>
        <Button
          variant="text"
          size="medium"
          endIcon={<ArrowForwardRounded />}
          onClick={() => navigate('/materias')}
          sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'none', minHeight: 44 }}
        >
          Ver todos
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} sx={{ height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <SkeletonCard />
            </Box>
          ))}
        </Box>
      ) : items.length === 0 ? (
        <EmptyState title="Sin materiales aún" description="Sé la primera en compartir apuntes con la comunidad ISPEE." />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'stretch',
          }}
        >
          {slice.map((m) => (
            <Box key={m.id} sx={{ height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <MaterialCard material={m} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
