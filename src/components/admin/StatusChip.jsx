import { Box, Chip } from '@mui/material'

const STATUS_CONFIG = {
  active: { label: 'Activo', color: '#10B981', bg: '#10B98118' },
  online: { label: 'En línea', color: '#10B981', bg: '#10B98118' },
  offline: { label: 'Fuera de línea', color: '#6B7280', bg: '#F3F4F6' },
  blocked: { label: 'Bloqueado', color: '#EF4444', bg: '#EF444418' },
  suspended: { label: 'Suspendido', color: '#F97316', bg: '#F9731618' },
  pending: { label: 'Pendiente', color: '#F59E0B', bg: '#F59E0B18' },
  resolved: { label: 'Resuelto', color: '#10B981', bg: '#10B98118' },
  warning: { label: 'Advertencia', color: '#F59E0B', bg: '#F59E0B18' },
  visible: { label: 'Visible', color: '#10B981', bg: '#10B98118' },
  hidden: { label: 'Oculto', color: '#F59E0B', bg: '#F59E0B18' },
  admin: { label: 'Admin', color: '#8B5CF6', bg: '#8B5CF618' },
  moderator: { label: 'Mod', color: '#3B82F6', bg: '#3B82F618' },
  professor: { label: 'Profesor', color: '#10B981', bg: '#10B98118' },
  student: { label: 'Estudiante', color: '#6B7280', bg: '#F3F4F6' },
}

export default function StatusChip({ status, label, size = 'small', dot = true }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg && !label) return null

  const finalLabel = label || cfg?.label || status
  const finalColor = cfg?.color || '#6B7280'
  const finalBg = cfg?.bg || '#F3F4F6'

  return (
    <Chip
      label={finalLabel}
      size={size}
      sx={{
        height: size === 'small' ? 18 : 22,
        fontSize: size === 'small' ? 8.5 : 10,
        fontWeight: 600,
        bgcolor: finalBg,
        color: finalColor,
        ...(dot ? { pl: 0.5, '& .MuiChip-label': { pl: 0.25 } } : {}),
      }}
      {...(dot ? {
        icon: <Box component="span" sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: finalColor, ml: 0.5 }} />
      } : {})}
    />
  )
}
