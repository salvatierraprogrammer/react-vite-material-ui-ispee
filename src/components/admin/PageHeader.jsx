import { Box, Typography, alpha } from '@mui/material'
import { motion } from 'framer-motion'

export default function PageHeader({ icon, title, description, badge, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        mb: 2, flexWrap: 'wrap', gap: 1.5,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white',
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.15)',
                },
              }}>
                {icon}
              </Box>
            </motion.div>
          )}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                {title}
              </Typography>
              {badge != null && (
                <Typography sx={{
                  fontSize: 10, fontWeight: 700, height: 20, px: 1,
                  display: 'inline-flex', alignItems: 'center',
                  bgcolor: alpha('#8B5CF6', 0.12), color: '#8B5CF6',
                  borderRadius: '6px',
                }}>
                  {badge}
                </Typography>
              )}
            </Box>
            {description && (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, fontWeight: 400 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
    </motion.div>
  )
}
