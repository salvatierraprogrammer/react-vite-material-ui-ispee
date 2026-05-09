import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import CategoryCard from './CategoryCard'
import { categories } from '../../data/data'

export default function CategoriesSection() {
  const navigate = useNavigate()
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 1.25 }}>Explorar por categoría</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', md: 'repeat(5,1fr)' }, gap: 2 }}>
        {categories.map((cat) => <CategoryCard key={cat.id} category={cat} onClick={() => navigate('/materias')} />)}
      </Box>
    </Box>
  )
}
