import { Card, CardContent, Typography, Box } from '@mui/material'
import { School, Filter1, Filter2, Filter3, Filter4 } from '@mui/icons-material'

const iconMap = { 'numeric-1-box': Filter1, 'numeric-2-box': Filter2, 'numeric-3-box': Filter3, 'numeric-4-box': Filter4, school: School }

export default function CategoryCard({ category, onClick }) {
  const Icon = iconMap[category.icon] || School
  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer', textAlign: 'center', py: 1.5, px: 1, border: '2px solid transparent', '&:hover': { borderColor: category.color, bgcolor: `${category.color}08` }, transition: 'all 0.2s ease' }}>
      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: `${category.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.75 }}>
        <Icon sx={{ fontSize: 18, color: category.color }} />
      </Box>
      <CardContent sx={{ p: 0 }}><Typography sx={{ fontWeight: 700, fontSize: 12, color: 'text.primary', mb: 0.25 }}>{category.name}</Typography><Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{category.count} materias</Typography></CardContent>
    </Card>
  )
}
