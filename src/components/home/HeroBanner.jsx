import { Box, Typography, Button, Container, Skeleton, Chip, useTheme, alpha } from '@mui/material'
import {
  AutoStoriesOutlined,
  ArrowForward,
  MenuBookOutlined,
  GroupsOutlined,
  TrendingUpOutlined,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function HeroIllustration() {
  const theme = useTheme()
  const p = theme.palette.primary.main
  const light = alpha(p, 0.35)
  return (
    <Box
      component="svg"
      viewBox="0 0 200 180"
      sx={{ width: '100%', maxWidth: 220, height: 'auto', display: 'block' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="heroBlob" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="heroGlass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="160" rx="72" ry="10" fill={alpha('#000', 0.06)} />
      <circle cx="100" cy="88" r="56" fill="url(#heroBlob)" opacity="0.9" />
      <circle cx="100" cy="88" r="52" fill="none" stroke={alpha('#fff', 0.35)} strokeWidth="1.5" />
      <rect x="58" y="52" width="84" height="72" rx="14" fill="url(#heroGlass)" stroke={alpha('#fff', 0.5)} strokeWidth="1" />
      <rect x="70" y="66" width="48" height="6" rx="3" fill={alpha('#fff', 0.85)} />
      <rect x="70" y="78" width="60" height="5" rx="2.5" fill={alpha('#fff', 0.45)} />
      <rect x="70" y="88" width="52" height="5" rx="2.5" fill={alpha('#fff', 0.35)} />
      <rect x="70" y="98" width="40" height="5" rx="2.5" fill={alpha('#fff', 0.28)} />
      <circle cx="148" cy="48" r="18" fill={light} stroke={alpha('#fff', 0.6)} strokeWidth="1.5" />
      <path d="M148 40v16M140 48h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </Box>
  )
}

/**
 * @param {{ materials: number, subjects: number }} [stats]
 * @param {boolean} [statsLoading]
 */
export default function HeroBanner({ stats, statsLoading }) {
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const materials = stats?.materials ?? 0
  const subjects = stats?.subjects ?? 0

  const statItems = [
    { icon: MenuBookOutlined, label: 'Materiales', value: materials },
    { icon: GroupsOutlined, label: 'Áreas', value: subjects },
    { icon: TrendingUpOutlined, label: 'Comunidad', value: null, text: 'Activa' },
  ]

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 2.5, md: 3 },
        mb: { xs: 2, md: 2.5 },
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 2.5, sm: 3, md: 3.5 },
        background: isDark
          ? `linear-gradient(125deg, ${alpha('#2D1B69', 0.55)} 0%, ${alpha('#1a1035', 0.9)} 45%, ${alpha('#12081f', 0.95)} 100%)`
          : 'linear-gradient(125deg, #F5F3FF 0%, #EDE9FE 38%, #E8E0FF 72%, #F0F9FF 100%)',
        border: '1px solid',
        borderColor: isDark ? alpha('#A78BFA', 0.15) : alpha('#8B5CF6', 0.12),
        boxShadow: isDark
          ? '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 6px rgba(15,23,42,0.04), 0 12px 32px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.65)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: isDark
            ? `radial-gradient(ellipse 80% 50% at 100% 0%, ${alpha('#8B5CF6', 0.2)} 0%, transparent 55%)`
            : `radial-gradient(ellipse 70% 55% at 100% 0%, ${alpha('#8B5CF6', 0.14)} 0%, transparent 50%)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          left: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          bgcolor: alpha('#8B5CF6', isDark ? 0.12 : 0.08),
          filter: 'blur(2px)',
        }}
      />

      <Container maxWidth="lg" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr minmax(160px, 0.38fr)' },
            alignItems: 'center',
            gap: { xs: 2, md: 3 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                <Chip
                  icon={<AutoStoriesOutlined sx={{ fontSize: '16px !important', color: 'primary.dark' }} />}
                  label="Comunidad ISPEE"
                  size="small"
                  sx={{
                    height: 28,
                    mb: 1.5,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: 0.02,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#8B5CF6', 0.2) : alpha('#8B5CF6', 0.14),
                    color: 'primary.dark',
                    border: '1px solid',
                    borderColor: alpha('#8B5CF6', isDark ? 0.35 : 0.22),
                    '& .MuiChip-icon': { color: 'inherit' },
                  }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.12,
                    color: 'text.primary',
                    mb: 1.25,
                    maxWidth: 520,
                  }}
                >
                  Bienvenida a Apuntes ISPEE
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 15 },
                    color: 'text.secondary',
                    lineHeight: 1.65,
                    mb: 2,
                    maxWidth: 480,
                    fontWeight: 500,
                  }}
                >
                  Un espacio colaborativo para compartir, aprender y acompañarnos en el profesorado. Encontrá
                  apuntes claros y seguí el ritmo del cursado con tranquilidad.
                </Typography>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.25 }}>
                  {statItems.map(({ icon: Icon, label, value, text }) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#fff', 0.55),
                        border: '1px solid',
                        borderColor: isDark ? alpha('#fff', 0.08) : alpha('#8B5CF6', 0.1),
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: isDark ? 'none' : '0 2px 8px rgba(15,23,42,0.04)',
                      }}
                    >
                      <Icon sx={{ fontSize: 20, color: 'primary.main', opacity: 0.9 }} />
                      <Box>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.06 }}>
                          {label}
                        </Typography>
                        {statsLoading ? (
                          <Skeleton variant="text" width={44} height={22} sx={{ mt: 0.25 }} />
                        ) : (
                          <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                            {text ?? String(value)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/materias')}
                  endIcon={<ArrowForward sx={{ fontSize: 20 }} />}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 2.5,
                    minHeight: 48,
                    boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.38)}`,
                    '&:hover': {
                      boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}`,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                >
                  Explorar materias
                </Button>
              </motion.div>
            </Box>
          </Box>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ justifySelf: 'center' }}
          >
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                borderRadius: 4,
                bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#fff', 0.35),
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.08) : alpha('#fff', 0.8),
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 8px 32px rgba(124,58,237,0.1)',
              }}
            >
              <HeroIllustration />
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  )
}
