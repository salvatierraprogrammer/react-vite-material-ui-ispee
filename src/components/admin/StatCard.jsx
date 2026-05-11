import { memo } from 'react'
import { Box, Typography, Skeleton, alpha } from '@mui/material'
import { motion } from 'framer-motion'

function StatCard({ icon, label, value, color, subtitle, loading, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={onClick ? { y: -3, transition: { duration: 0.2 } } : {}}
      style={{ height: '100%' }}
    >
      <Box
        onClick={onClick}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '16px',
          p: 2.25,
          border: '1px solid',
          borderColor: 'divider',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          transition: 'border-color 0.3s ease, box-shadow 0.35s ease, transform 0.2s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color || '#8B5CF6'}, ${color || '#8B5CF6'}55, ${color || '#8B5CF6'})`,
            opacity: 0.85,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            padding: '1px',
            background: `linear-gradient(135deg, ${alpha(color || '#8B5CF6', 0.08)}, transparent 60%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: 'none',
          },
          '&:hover': onClick ? {
            borderColor: alpha(color || '#8B5CF6', 0.3),
            boxShadow: `0 8px 32px ${alpha(color || '#8B5CF6', 0.12)}, 0 2px 8px ${alpha('#000', 0.04)}`,
            '&::after': { opacity: 1 },
          } : {},
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${alpha(color || '#8B5CF6', 0.12)}, ${alpha(color || '#8B5CF6', 0.04)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: `${alpha(color || '#8B5CF6', 0.15)}`,
            },
          }}>
            {icon}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontSize: 10.5,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.25,
            }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={60} height={30} sx={{ borderRadius: '4px' }} />
            ) : (
              <Typography sx={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: 'text.primary',
              }}>
                {value ?? '—'}
              </Typography>
            )}
          </Box>
        </Box>
        {subtitle && (
          <Typography sx={{
            fontSize: 11,
            color: 'text.disabled',
            mt: 1,
            pl: 0,
            lineHeight: 1.3,
          }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </motion.div>
  )
}

export default memo(StatCard)
