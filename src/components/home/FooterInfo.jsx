import { Box, Typography } from '@mui/material'
import { AccessibilityNewOutlined, Diversity3Outlined, AutoStoriesOutlined } from '@mui/icons-material'

const blocks = [
  { icon: AccessibilityNewOutlined, title: 'Accesible para todos', text: 'Materiales adaptados para cada necesidad.', color: '#8B5CF6' },
  { icon: Diversity3Outlined, title: 'Comunidad ISPEE', text: 'Compartí y aprendé junto a tus compañeras.', color: '#EC4899' },
  { icon: AutoStoriesOutlined, title: 'Aprender juntxs', text: 'La educación se construye entre todxs.', color: '#10B981' },
]

export default function FooterInfo() {
  return (
    <Box sx={{ mt: 3, mb: 1 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' }, gap: 2 }}>
        {blocks.map((block) => {
          const Icon = block.icon
          return (
            <Box key={block.title} sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'background.paper', border: 1, borderColor: 'divider', textAlign: 'center', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 16px rgba(139,92,246,0.08)', transform: 'translateY(-1px)' } }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: `${block.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 0.75 }}>
                <Icon sx={{ fontSize: 16, color: block.color }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: 'text.primary', mb: 0.25 }}>{block.title}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{block.text}</Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
