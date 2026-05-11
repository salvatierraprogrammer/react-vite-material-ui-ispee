import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CategoryCard from './CategoryCard'
import { categories } from '../../data/data'

export default function CategoriesSection() {
  const navigate = useNavigate()
  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Typography
        sx={{
          fontSize: { xs: 17, sm: 18 },
          fontWeight: 800,
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        Explorar por categoría
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500, mb: 2 }}>
        Saltá al año que estés cursando
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {categories.map((cat) => {
          const isAll = cat.name === 'Todas'
          const search = isAll ? '' : `?year=${cat.id}`
          return <CategoryCard key={cat.id} category={cat} onClick={() => navigate(`/materias${search}`)} />
        })}
      </Box>
    </Box>
  )
}
