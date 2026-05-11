import { Box, Skeleton, Paper } from '@mui/material'
import { motion } from 'framer-motion'

function SkeletonRow({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Box sx={{ display: 'flex', gap: 2, px: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton animation="wave" height={16} sx={{ flex: 2, borderRadius: '4px' }} />
        <Skeleton animation="wave" height={16} sx={{ flex: 1, borderRadius: '4px' }} />
        <Skeleton animation="wave" height={16} sx={{ flex: 1, borderRadius: '4px' }} />
        <Skeleton animation="wave" height={16} sx={{ flex: 1, borderRadius: '4px' }} />
      </Box>
    </motion.div>
  )
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </Box>
  )
}

export function StatsSkeleton({ cards = 4 }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: `repeat(${Math.min(cards, 4)}, 1fr)` }, gap: 2.5 }}>
      {Array.from({ length: cards }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
        >
          <Paper sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
              <Skeleton animation="wave" variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton animation="wave" width="60%" height={12} sx={{ borderRadius: '4px' }} />
                <Skeleton animation="wave" width="40%" height={28} sx={{ mt: 0.5, borderRadius: '4px' }} />
              </Box>
            </Box>
            <Skeleton animation="wave" width="80%" height={10} sx={{ borderRadius: '4px' }} />
          </Paper>
        </motion.div>
      ))}
    </Box>
  )
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <Paper sx={{ p: 2.25, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                <Skeleton animation="wave" variant="rounded" width={42} height={42} sx={{ borderRadius: '12px' }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton animation="wave" width="50%" height={11} sx={{ borderRadius: '4px' }} />
                  <Skeleton animation="wave" width="35%" height={26} sx={{ mt: 0.25, borderRadius: '4px' }} />
                </Box>
              </Box>
              <Skeleton animation="wave" width="70%" height={10} sx={{ borderRadius: '4px' }} />
            </Paper>
          </motion.div>
        ))}
      </Box>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Paper sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Skeleton animation="wave" width="30%" height={16} sx={{ borderRadius: '4px' }} />
          </Box>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, borderBottom: i < 3 ? '1px solid' : 'none', borderColor: 'divider' }}>
              <Skeleton animation="wave" variant="circular" width={32} height={32} sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton animation="wave" width="40%" height={13} sx={{ borderRadius: '4px' }} />
                <Skeleton animation="wave" width="25%" height={10} sx={{ mt: 0.25, borderRadius: '4px' }} />
              </Box>
              <Skeleton animation="wave" width={50} height={20} sx={{ borderRadius: '10px' }} />
            </Box>
          ))}
        </Paper>
      </motion.div>
    </Box>
  )
}
