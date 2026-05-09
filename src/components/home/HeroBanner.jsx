import { Box, Typography, Button, Container } from '@mui/material'
import { AutoStoriesOutlined, ArrowForward } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function HeroBanner() {
  const navigate = useNavigate()
  return (
    <Box sx={{ borderRadius: '16px', background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 50%, #E8E0FF 100%)', position: 'relative', overflow: 'hidden', px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 3 }, mb: 2 }}>
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.08)' }} />
      <Container maxWidth="lg" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(139,92,246,0.15)', borderRadius: '14px', px: 1.25, py: 0.15, mb: 1 }}>
              <AutoStoriesOutlined sx={{ fontSize: 12, color: '#7C3AED' }} />
              <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#7C3AED' }}>Comunidad ISPEE</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 20, sm: 24, md: 28 }, fontWeight: 800, color: '#111827', lineHeight: 1.15, mb: 0.75 }}>Bienvenida a Apuntes ISPEE</Typography>
            <Typography sx={{ fontSize: { xs: 13, md: 14 }, color: '#6B7280', lineHeight: 1.5, mb: 2, maxWidth: 420 }}>Un espacio colaborativo para compartir, aprender y acompañarnos en el profesorado.</Typography>
            <Button variant="contained" size="small" onClick={() => navigate('/materias')} endIcon={<ArrowForward />} sx={{ px: 2.5, py: 0.75, fontSize: 12.5, borderRadius: '10px' }}>Explorar materias</Button>
          </Box>
          <Box sx={{ flex: '0 0 auto', display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ width: 140, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6 20%, #A78BFA 80%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoStoriesOutlined sx={{ fontSize: 56, color: 'rgba(255,255,255,0.9)' }} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
