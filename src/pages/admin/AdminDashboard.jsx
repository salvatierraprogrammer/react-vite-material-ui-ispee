import { useState, useEffect, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Paper, Button, Avatar, Chip, alpha } from '@mui/material'
import {
  PeopleOutlined, DescriptionOutlined, ForumOutlined, BlockOutlined, WarningAmberOutlined,
  SchoolOutlined, OnlinePredictionOutlined, TrendingUp, GavelOutlined, ReportOutlined, DashboardOutlined,
  StorageOutlined, NotificationsActiveOutlined, HistoryOutlined, ArrowForwardOutlined,
  SecurityOutlined, CleaningServicesOutlined,
} from '@mui/icons-material'
import { getDetailedStats, getReports, subscribeToUsers, subscribeToMaterials } from '../../services/adminService'
import StatCard from '../../components/admin/StatCard'
import PageHeader from '../../components/admin/PageHeader'
import EmptyState from '../../components/admin/EmptyState'
import { AnimatedPage, AnimatedListItem } from '../../components/admin/AnimatedContainer'
import { getTimeAgo } from '../../utils/helpers'
import { motion } from 'framer-motion'

const QUICK_ACTIONS = [
  { label: 'Usuarios', icon: PeopleOutlined, path: '/admin/usuarios', color: '#8B5CF6' },
  { label: 'Reportes', icon: ReportOutlined, path: '/admin/reportes', color: '#F59E0B' },
  { label: 'Materiales', icon: DescriptionOutlined, path: '/admin/materiales', color: '#3B82F6' },
  { label: 'Foro', icon: ForumOutlined, path: '/admin/foro', color: '#10B981' },
  { label: 'Sanciones', icon: GavelOutlined, path: '/admin/sanciones', color: '#EF4444' },
  { label: 'Almacenamiento', icon: StorageOutlined, path: '/admin/almacenamiento', color: '#EC4899' },
  { label: 'Alertas', icon: NotificationsActiveOutlined, path: '/admin/alertas', color: '#F97316' },
  { label: 'Auditoría', icon: HistoryOutlined, path: '/admin/auditoria', color: '#6B7280' },
]

function RecentUsers({ users }) {
  if (!users.length) return <Typography sx={{ p: 3, textAlign: 'center', fontSize: 12, color: 'text.disabled' }}>Sin usuarios aún</Typography>
  return users.map((u, i) => (
    <AnimatedListItem key={u.id} index={i}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1,
        borderBottom: i < users.length - 1 ? '1px solid' : 'none',
        borderColor: 'divider',
        transition: 'all 0.15s ease',
        '&:hover': { bgcolor: alpha('#8B5CF6', 0.03) },
      }}>
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={u.photoURL || ''} sx={{ width: 32, height: 32, bgcolor: '#8B5CF6', fontSize: 12, fontWeight: 700 }}>
            {(u.name || u.displayName || '?').charAt(0)}
          </Avatar>
          {u.online && (
            <Box sx={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981', border: '2px solid', borderColor: 'background.paper' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>
            {u.name || u.displayName || 'Sin nombre'}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>{u.email || ''}</Typography>
        </Box>
        <Chip label={u.role || 'estudiante'} size="small"
          sx={{
            height: 20, fontSize: 9.5, fontWeight: 600,
            bgcolor: u.role === 'admin' ? alpha('#8B5CF6', 0.12) : u.role === 'moderador' ? alpha('#3B82F6', 0.12) : alpha('#6B7280', 0.08),
            color: u.role === 'admin' ? '#8B5CF6' : u.role === 'moderador' ? '#3B82F6' : '#6B7280',
          }}
        />
      </Box>
    </AnimatedListItem>
  ))
}

function RecentReportsList({ reports }) {
  if (!reports.length) return <EmptyState title="Sin reportes" description="No hay reportes pendientes" size="small" />
  return reports.map((r, i) => (
    <AnimatedListItem key={r.id} index={i}>
      <Box sx={{
        px: 2, py: 1,
        borderBottom: i < reports.length - 1 ? '1px solid' : 'none',
        borderColor: 'divider',
        transition: 'all 0.15s ease',
        '&:hover': { bgcolor: alpha('#8B5CF6', 0.03) },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.15 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: r.resolved ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
            flexShrink: 0,
          }}>
            <ReportOutlined sx={{ fontSize: 14, color: r.resolved ? '#10B981' : '#EF4444' }} />
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
            {r.reason?.slice(0, 50) || 'Reporte'}
          </Typography>
          <Chip label={r.resolved ? 'Resuelto' : 'Pendiente'} size="small"
            sx={{
              height: 20, fontSize: 9.5, fontWeight: 600,
              bgcolor: r.resolved ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1),
              color: r.resolved ? '#10B981' : '#EF4444',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 10.5, color: 'text.disabled', ml: 5 }}>
          {r.type || '—'} · {getTimeAgo(r.createdAt)}
        </Typography>
      </Box>
    </AnimatedListItem>
  ))
}

function RecentMaterialsList({ materials }) {
  if (!materials.length) return <Typography sx={{ p: 3, textAlign: 'center', fontSize: 12, color: 'text.disabled' }}>Sin materiales aún</Typography>
  return materials.map((m, i) => (
    <AnimatedListItem key={m.id} index={i}>
      <Box sx={{
        px: 2, py: 1,
        borderBottom: i < materials.length - 1 ? '1px solid' : 'none',
        borderColor: 'divider',
        transition: 'all 0.15s ease',
        '&:hover': { bgcolor: alpha('#8B5CF6', 0.03) },
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: '8px', bgcolor: alpha('#3B82F6', 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <DescriptionOutlined sx={{ fontSize: 14, color: '#3B82F6' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
              {m.title || 'Sin título'}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: 'text.disabled' }}>
              {m.subject || '—'} · {getTimeAgo(m.createdAt)}
            </Typography>
          </Box>
          {m.hidden && (
            <Chip label="Oculto" size="small"
              sx={{ height: 20, fontSize: 9, bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', fontWeight: 600 }} />
          )}
        </Box>
      </Box>
    </AnimatedListItem>
  ))
}

function ActivityCard({ title, children, delay = 0, action, actionLabel, actionPath, navigateTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ height: '100%' }}
    >
      <Paper sx={{
        borderRadius: '16px', overflow: 'hidden', height: '100%',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
      }}>
        <Box sx={{
          px: 2, py: 1.5,
          borderBottom: '1px solid', borderColor: 'divider',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>
          {action && (
            <Button size="small" onClick={() => navigateTo(actionPath)} endIcon={<ArrowForwardOutlined sx={{ fontSize: 12 }} />}
              sx={{ fontSize: 10.5, fontWeight: 600, borderRadius: '8px', color: 'text.secondary' }}>
              {actionLabel}
            </Button>
          )}
        </Box>
        <Box sx={{ flex: 1, maxHeight: 280, overflow: 'auto' }}>
          {children}
        </Box>
      </Paper>
    </motion.div>
  )
}

function SystemSummary({ stats, displayStats, recentReports }) {
  if (!stats) return null

  const items = [
    { icon: <SchoolOutlined sx={{ fontSize: 16 }} />, label: 'Total PDFs', value: stats.totalPDFs || 0, color: '#3B82F6' },
    { icon: <StorageOutlined sx={{ fontSize: 16 }} />, label: 'Total Imágenes', value: stats.totalImages || 0, color: '#8B5CF6' },
    { icon: <ForumOutlined sx={{ fontSize: 16 }} />, label: 'Comentarios', value: displayStats?.totalComments || stats.totalComments || 0, color: '#10B981' },
    { icon: <SecurityOutlined sx={{ fontSize: 16 }} />, label: 'Activos (semana)', value: stats.activeUsers || 0, color: '#14B8A6' },
    { icon: <WarningAmberOutlined sx={{ fontSize: 16 }} />, label: 'Con advertencias', value: stats.warnedUsers || 0, color: '#F97316' },
    { icon: <ReportOutlined sx={{ fontSize: 16 }} />, label: 'Reportes sin resolver', value: recentReports.filter((r) => !r.resolved).length, color: '#EF4444' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Paper sx={{
        borderRadius: '16px', border: '1px solid', borderColor: 'divider', p: 2,
        background: (t) => `linear-gradient(135deg, ${alpha('#8B5CF6', 0.02)}, ${alpha('#3B82F6', 0.02)})`,
      }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Resumen del Sistema
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(6, 1fr)' }, gap: 1.5 }}>
          {items.map((item, i) => (
            <Box key={item.label} sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1.25,
              borderRadius: '10px', bgcolor: alpha(item.color, 0.04),
              border: '1px solid', borderColor: alpha(item.color, 0.08),
            }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1), color: item.color, flexShrink: 0,
              }}>
                {item.icon}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{item.value}</Typography>
                <Typography sx={{ fontSize: 9.5, color: 'text.disabled', lineHeight: 1.2 }}>{item.label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </motion.div>
  )
}

const QuickActionBtn = memo(function QuickActionBtn({ item, navigateTo, delay }) {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        onClick={() => navigateTo(item.path)}
        variant="outlined"
        startIcon={<Icon sx={{ fontSize: 15 }} />}
        sx={{
          justifyContent: 'flex-start', px: 1.25, py: 0.9,
          fontSize: 11, fontWeight: 600, borderRadius: '10px',
          borderColor: 'divider', color: 'text.primary', width: '100%',
          transition: 'all 0.2s ease',
          '&:hover': { borderColor: item.color, bgcolor: alpha(item.color, 0.06), color: item.color },
        }}
      >
        {item.label}
      </Button>
    </motion.div>
  )
})

export default function AdminDashboard() {
  const currentUser = useSelector((s) => s.auth.currentUser)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentReports, setRecentReports] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentMaterials, setRecentMaterials] = useState([])
  const [realtimeStats, setRealtimeStats] = useState(null)

  useEffect(() => {
    getDetailedStats().then((s) => { setStats(s); setStatsLoading(false) }).catch(() => setStatsLoading(false))
    getReports(5).then(setRecentReports).catch(() => {})
  }, [])

  useEffect(() => {
    const unsubUsers = subscribeToUsers((users) => {
      setRecentUsers(users.slice(0, 5))
      setRealtimeStats((prev) => ({ ...prev, totalUsers: users.length, blockedUsers: users.filter((u) => u.isBlocked || u.suspended).length, onlineUsers: users.filter((u) => u.online).length }))
    })
    const unsubMaterials = subscribeToMaterials((materials) => {
      setRecentMaterials(materials.slice(0, 5))
      setRealtimeStats((prev) => ({ ...prev, totalMaterials: materials.length }))
    })
    return () => { unsubUsers(); unsubMaterials() }
  }, [])

  const displayStats = realtimeStats || stats
  const unresolvedReports = recentReports.filter((r) => !r.resolved).length

  const navigateTo = useCallback((path) => navigate(path), [navigate])

  return (
    <AnimatedPage>
      <PageHeader
        icon={<DashboardOutlined sx={{ fontSize: 20 }} />}
        title="Panel de Administración"
        description={`Bienvenida, ${currentUser?.name || 'Administradora'}. Centro de control de la plataforma.`}
        action={
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Chip
              icon={<OnlinePredictionOutlined sx={{ fontSize: 13 }} />}
              label={statsLoading ? '—' : `${displayStats?.onlineUsers || 0} en línea`}
              size="small"
              sx={{
                fontSize: 11, height: 26,
                bgcolor: alpha('#10B981', 0.1), color: '#10B981',
                fontWeight: 600, borderRadius: '8px',
                '& .MuiChip-icon': { ml: 0.5 },
              }}
            />
          </motion.div>
        }
      />

      {/* Métricas principales */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <StatCard loading={statsLoading} icon={<PeopleOutlined sx={{ fontSize: 18, color: '#8B5CF6' }} />} label="Usuarios" value={displayStats?.totalUsers} color="#8B5CF6" subtitle={`${stats?.activeUsers || 0} activos esta semana`} onClick={() => navigateTo('/admin/usuarios')} delay={0} />
        <StatCard loading={statsLoading} icon={<DescriptionOutlined sx={{ fontSize: 18, color: '#3B82F6' }} />} label="Materiales" value={displayStats?.totalMaterials} color="#3B82F6" subtitle={`${stats?.totalPDFs || 0} PDFs · ${stats?.totalImages || 0} imágenes`} onClick={() => navigateTo('/admin/materiales')} delay={0.04} />
        <StatCard loading={statsLoading} icon={<ForumOutlined sx={{ fontSize: 18, color: '#10B981' }} />} label="Posts en foro" value={displayStats?.totalPosts || stats?.totalPosts} color="#10B981" subtitle={`${displayStats?.totalComments || stats?.totalComments || 0} comentarios`} onClick={() => navigateTo('/admin/foro')} delay={0.08} />
        <StatCard loading={statsLoading} icon={<TrendingUp sx={{ fontSize: 18, color: '#F59E0B' }} />} label="Reportes" value={recentReports.length} color="#F59E0B" subtitle={`${unresolvedReports} sin resolver`} onClick={() => navigateTo('/admin/reportes')} delay={0.12} />
      </Box>

      {/* Segunda fila de métricas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <StatCard loading={statsLoading} icon={<BlockOutlined sx={{ fontSize: 18, color: '#EF4444' }} />} label="Bloqueados" value={displayStats?.blockedUsers || 0} color="#EF4444" onClick={() => navigateTo('/admin/usuarios')} delay={0.16} />
        <StatCard loading={statsLoading} icon={<WarningAmberOutlined sx={{ fontSize: 18, color: '#F97316' }} />} label="Con advertencias" value={stats?.warnedUsers || 0} color="#F97316" onClick={() => navigateTo('/admin/sanciones')} delay={0.2} />
        <StatCard loading={statsLoading} icon={<SchoolOutlined sx={{ fontSize: 18, color: '#EC4899' }} />} label="Usuarios activos" value={stats?.activeUsers || 0} color="#EC4899" delay={0.24} />
        <StatCard loading={statsLoading} icon={<CleaningServicesOutlined sx={{ fontSize: 18, color: '#8B5CF6' }} />} label="Sanciones" value={stats?.warnedUsers || 0} color="#8B5CF6" onClick={() => navigateTo('/admin/sanciones')} delay={0.28} />
      </Box>

      {/* Resumen del sistema */}
      <Box sx={{ mb: 3 }}>
        <SystemSummary stats={stats} displayStats={displayStats} recentReports={recentReports} />
      </Box>

      {/* Actividad reciente - 3 columnas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1fr' }, gap: 2.5, mb: 3 }}>
        <ActivityCard title="Usuarios recientes" delay={0.32} action actionLabel="Ver todos" actionPath="/admin/usuarios" navigateTo={navigateTo}>
          <RecentUsers users={recentUsers} />
        </ActivityCard>
        <ActivityCard title="Últimos reportes" delay={0.36} action actionLabel="Ver todos" actionPath="/admin/reportes" navigateTo={navigateTo}>
          <RecentReportsList reports={recentReports} />
        </ActivityCard>
        <ActivityCard title="Materiales recientes" delay={0.4} action actionLabel="Ver todos" actionPath="/admin/materiales" navigateTo={navigateTo}>
          <RecentMaterialsList materials={recentMaterials} />
        </ActivityCard>
      </Box>

      {/* Acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.44, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Paper sx={{
          borderRadius: '16px', border: '1px solid', borderColor: 'divider', p: 2,
        }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Acciones rápidas</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 1 }}>
            {QUICK_ACTIONS.map((item, i) => (
              <QuickActionBtn key={item.label} item={item} navigateTo={navigateTo} delay={0.48 + i * 0.03} />
            ))}
          </Box>
        </Paper>
      </motion.div>
    </AnimatedPage>
  )
}
