import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material'
import { School, Filter1, Filter2, Filter3, Filter4, Looks5Outlined } from '@mui/icons-material'
import { motion } from 'framer-motion'

const iconMap = { 'numeric-1-box': Filter1, 'numeric-2-box': Filter2, 'numeric-3-box': Filter3, 'numeric-4-box': Filter4, 'numeric-5-box': Looks5Outlined, school: School }

export default function CategoryCard({ category, onClick }) {
  const theme = useTheme()
  const Icon = iconMap[category.icon] || School
  const isDark = theme.palette.mode === 'dark'

  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }} style={{ height: '100%' }}>
      <Card
        onClick={onClick}
        elevation={0}
        sx={{
          cursor: 'pointer',
          textAlign: 'center',
          py: 1.75,
          px: 1.25,
          height: '100%',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(15,23,42,0.05)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          '&:hover': {
            borderColor: alpha(category.color, 0.55),
            bgcolor: alpha(category.color, isDark ? 0.12 : 0.08),
            boxShadow: `0 8px 24px ${alpha(category.color, 0.15)}`,
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(category.color, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1,
          }}
        >
          <Icon sx={{ fontSize: 20, color: category.color }} />
        </Box>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: 'text.primary', mb: 0.35, letterSpacing: '-0.01em' }}>{category.name}</Typography>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>{category.count} materias</Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}
