import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Button } from '@mui/material'
import {
  HistoryOutlined, DeleteOutlined, Search, Clear, RefreshOutlined, PersonOutlined, BlockOutlined, CheckCircleOutlined, WarningAmberOutlined, DescriptionOutlined, ForumOutlined, DeleteSweepOutlined,
} from '@mui/icons-material'
import { subscribeToAuditLogs, deleteAuditLog } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import EmptyState from '../../components/admin/EmptyState'
import { AnimatedPage, AnimatedListItem } from '../../components/admin/AnimatedContainer'

const ACTION_CONFIG = {
  user_blocked: { label: 'Bloqueo de usuario', color: '#EF4444', icon: BlockOutlined },
  user_unblocked: { label: 'Desbloqueo de usuario', color: '#10B981', icon: CheckCircleOutlined },
  user_suspended: { label: 'Suspensión de usuario', color: '#F97316', icon: WarningAmberOutlined },
  user_warned: { label: 'Advertencia a usuario', color: '#F59E0B', icon: WarningAmberOutlined },
  user_deleted: { label: 'Usuario eliminado', color: '#EF4444', icon: PersonOutlined },
  role_change: { label: 'Cambio de rol', color: '#8B5CF6', icon: PersonOutlined },
  material_deleted: { label: 'Material eliminado', color: '#EF4444', icon: DescriptionOutlined },
  material_hidden: { label: 'Material ocultado', color: '#F59E0B', icon: DescriptionOutlined },
  material_unhidden: { label: 'Material mostrado', color: '#10B981', icon: DescriptionOutlined },
  forum_post_deleted: { label: 'Publicación eliminada', color: '#EF4444', icon: ForumOutlined },
  comment_deleted: { label: 'Comentario eliminado', color: '#EF4444', icon: ForumOutlined },
  forum_comment_deleted: { label: 'Comentario de foro eliminado', color: '#EF4444', icon: ForumOutlined },
  report_resolved: { label: 'Reporte resuelto', color: '#10B981', icon: CheckCircleOutlined },
  report_deleted: { label: 'Reporte eliminado', color: '#EF4444', icon: DescriptionOutlined },
  storage_file_deleted: { label: 'Archivo eliminado', color: '#EF4444', icon: DeleteSweepOutlined },
  sanction_deleted: { label: 'Sanción eliminada', color: '#EF4444', icon: WarningAmberOutlined },
}

function formatDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

export default function AdminAuditLogs() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const unsub = subscribeToAuditLogs(setLogs)
    return unsub
  }, [])

  const filtered = useMemo(() => logs.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    const cfg = ACTION_CONFIG[l.action]
    return (cfg?.label || '').toLowerCase().includes(q) || (l.adminId || '').toLowerCase().includes(q) || (l.action || '').toLowerCase().includes(q)
  }), [logs, search])

  const handleDelete = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteAuditLog(selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Registro eliminado', severity: 'success' }))
      setLogs((prev) => prev.filter((l) => l.id !== selected.id))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<HistoryOutlined sx={{ fontSize: 18 }} />} title="Registro de auditoría" description="Todas las acciones realizadas en el panel" badge={logs.length}
        action={
          <Button size="small" variant="outlined" startIcon={<RefreshOutlined sx={{ fontSize: 14 }} />} onClick={() => setLogs([])} sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', transition: 'all 0.15s ease', '&:hover': { transform: 'translateY(-1px)' } }}>
            Recargar
          </Button>
        } />

      <TextField value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} placeholder="Buscar acciones…" size="small"
        sx={{ mb: 2, minWidth: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>, endAdornment: search ? <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => setSearch('')}><Clear sx={{ fontSize: 14, color: 'text.secondary' }} /></InputAdornment> : null } }} />

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
            <TableCell>Acción</TableCell><TableCell>Detalles</TableCell><TableCell>Administrador</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState title="Sin registros" description={search ? 'No hay registros con ese criterio' : 'No hay actividad registrada aún'} size="small" /></TableCell></TableRow>
            ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((l, i) => {
              const cfg = ACTION_CONFIG[l.action] || { label: l.action || 'Acción', color: '#6B7280', icon: HistoryOutlined }
              const Icon = cfg.icon
              return (
                <TableRow key={l.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    '& td': { py: 0.75 },
                    animation: 'slideIn 0.3s ease-out',
                    animationDelay: `${i * 0.02}s`,
                    animationFillMode: 'backwards',
                    '@keyframes slideIn': {
                      from: { opacity: 0, transform: 'translateX(-8px)' },
                      to: { opacity: 1, transform: 'translateX(0)' },
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '6px', bgcolor: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon sx={{ fontSize: 12, color: cfg.color }} />
                      </Box>
                      <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{cfg.label}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 11 }}>{l.details?.reason || l.details?.email || l.details?.uid?.slice(0, 16) || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11.5 }}>{l.adminId?.slice(0, 12) || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{formatDate(l.createdAt)}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar registro">
                      <IconButton size="small" onClick={() => { setSelected(l); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#EF444418', transform: 'scale(1.1)' } }}><DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[15, 30, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
      </Paper>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} loading={actionLoading}
        title="Eliminar registro" description="¿Eliminar este registro de auditoría?" consequences="Esta acción no se puede deshacer." type="delete" confirmLabel="Eliminar" />
    </AnimatedPage>
  )
}
