import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails, Card } from '@mui/material'
import { ExpandMore, HelpOutlineOutlined, CloudUploadOutlined, SearchOutlined, FavoriteBorderOutlined, ForumOutlined, SchoolOutlined, MessageOutlined, SecurityOutlined } from '@mui/icons-material'

const faqs = [
  {
    icon: CloudUploadOutlined,
    question: '¿Cómo subir un material?',
    answer: 'Iniciá sesión, hacé clic en el botón "+" en la página de Materias, completá los datos del material (título, descripción, año, materia, tipo) y seleccioná el archivo. Solo se aceptan PDF, Word y PowerPoint de hasta 20 MB.',
  },
  {
    icon: SearchOutlined,
    question: '¿Cómo buscar apuntes?',
    answer: 'Usá la barra de búsqueda en la parte superior para encontrar materiales por título, materia o etiquetas. También podés filtrar por año, materia y tipo en la página de Materias.',
  },
  {
    icon: FavoriteBorderOutlined,
    question: '¿Cómo guardar un material como favorito?',
    answer: 'Hacé clic en el ícono de corazón en cualquier tarjeta de material para agregarlo a tus favoritos. Podés ver todos tus favoritos en la sección "Favoritos" del menú lateral.',
  },
  {
    icon: ForumOutlined,
    question: '¿Cómo funciona el foro?',
    answer: 'El foro es un espacio para debatir y compartir ideas. Podés crear nuevos temas, responder a publicaciones existentes y participar en las discusiones de la comunidad ISPEE.',
  },
  {
    icon: SchoolOutlined,
    question: '¿Qué tipos de materiales puedo encontrar?',
    answer: 'Hay resúmenes, mapas conceptuales, trabajos prácticos, apuntes teóricos, PDFs y guías de estudio, organizados por año y materia del profesorado.',
  },
  {
    icon: MessageOutlined,
    question: '¿Cómo enviar un mensaje?',
    answer: 'Andá a la sección "Mensajes" desde el menú lateral. Podés iniciar conversaciones con otros miembros de la comunidad y recibir notificaciones de nuevos mensajes.',
  },
  {
    icon: SecurityOutlined,
    question: '¿Cómo se protegen mis datos?',
    answer: 'Tu información personal está protegida. Solo tu nombre y foto de perfil son visibles para la comunidad. Podés editar tu perfil en cualquier momento desde la sección "Perfil".',
  },
]

export default function Ayuda() {
  return (
    <Box>
      <Card sx={{ p: 2, mb: 2, borderRadius: '14px', background: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpOutlineOutlined sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Centro de Ayuda</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Encontrá respuestas a las preguntas más frecuentes</Typography>
          </Box>
        </Box>
      </Card>

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        {faqs.map((faq, i) => {
          const Icon = faq.icon
          return (
            <Accordion key={i} disableGutters elevation={0} sx={{ '&:not(:last-child)': { borderBottom: 1, borderColor: 'divider' }, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18 }} />} sx={{ px: 2, py: 0.25, '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon sx={{ fontSize: 16, color: '#8B5CF6' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{faq.question}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 1.5, pt: 0 }}>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.6, pl: 5.5 }}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 3, mb: 1 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          ¿Tenés otra duda? Escribinos a soporte@ispee.edu.ar
        </Typography>
      </Box>
    </Box>
  )
}