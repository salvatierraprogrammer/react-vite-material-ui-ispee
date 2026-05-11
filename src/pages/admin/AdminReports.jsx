import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material'
import {
  ReportOutlined, CheckCircleOutlined, DeleteOutlined,
  FlagOutlined,
} from '@mui/icons-material'
import { subscribeToReports, resolveReport, deleteReport } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import SearchToolbar from '../../components/admin/SearchToolbar'
import EmptyState from '../../components/admin/EmptyState'
import StatusChip from '../../components/admin/StatusChip'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'
import { getTimeAgo } from '../../utils/helpers'

export default function AdminReports() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const unsub = subscribeToReports(setReports)
    return unsub
  }, [])

  const pendingCount = useMemo(() => reports.filter((r) => !r.resolved).length, [reports])

  const filtered = useMemo(() => reports.filter((r) => {
    if (search) {
      const q = search.toLowerCase()
      if (!(r.reason || '').toLowerCase().includes(q) && !(r.type || '').toLowerCase().includes(q)) return false
    }
    if (filter === 'resolved' && !r.resolved) return false
    if (filter === 'pending' && r.resolved) return false
    return true
  }), [reports, search, filter])

  const handleResolve = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await resolveReport(selected.id, 'Reporte resuelto por administrador', currentUser.uid)
      dispatch(showSnackbar({ message: 'Reporte resuelto', severity: 'success' }))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteReport(selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Reporte eliminado', severity: 'success' }))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  const getConfirmProps = useCallback(() => {
    if (actionType === 'resolve') {
      return { title: 'Resolver reporte', description: '¿Deseas marcar este reporte como resuelto?', consequences: 'El usuario que reportó será notificado de la resolución.', type: 'resolve', confirmLabel: 'Resolver' }
    }
    return { title: 'Eliminar reporte', description: '¿Eliminar este reporte definitivamente?', consequences: 'Esta acción no se puede deshacer. El reporte se borrará del historial.', type: 'delete', confirmLabel: 'Eliminar' }
  }, [actionType])

  return (
    <AnimatedPage>
      <PageHeader icon={<ReportOutlined sx={{ fontSize: 18 }} />} title="Reportes" description="Gestioná los reportes de la comunidad" badge={pendingCount} />

      <SearchToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0) }}
        placeholder="Buscar reportes…"
        filters={[
          { key: 'filter', label: 'Estado', value: filter, options: [
            { value: 'pending', label: 'Pendientes' }, { value: 'resolved', label: 'Resueltos' },
          ]},
        ]}
        onFilterChange={(key, value) => { setFilter(value); setPage(0) }}
      />

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
            <TableCell>Motivo</TableCell><TableCell>Tipo</TableCell><TableCell>Reportado por</TableCell><TableCell>Estado</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Sin reportes" description={search || filter ? 'No hay reportes con esos filtros' : 'La comunidad no ha reportado contenido'} size="small" /></TableCell></TableRow>
            ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, i) => (
              <TableRow key={r.id}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  '& td': { py: 0.75 },
                  animation: 'slideIn 0.3s ease-out',
                  animationDelay: `${i * 0.03}s`,
                  animationFillMode: 'backwards',
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-8px)' },
                    to: { opacity: 1, transform: 'translateX(0)' },
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 24, height: 24, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: r.resolved ? '#10B98118' : '#EF444418',
                    }}>
                      <FlagOutlined sx={{ fontSize: 12, color: r.resolved ? '#10B981' : '#EF4444' }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{r.reason?.slice(0, 60) || 'Sin motivo'}</Typography>
                  </Box>
                </TableCell>
                <TableCell><StatusChip label={r.type || '—'} dot={false} /></TableCell>
                <TableCell><Typography sx={{ fontSize: 11.5 }}>{r.reportedBy?.slice(0, 16) || '—'}</Typography></TableCell>
                <TableCell><StatusChip status={r.resolved ? 'resolved' : 'pending'} /></TableCell>
                <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{getTimeAgo(r.createdAt)}</Typography></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                    {!r.resolved && (
                      <Tooltip title="Resolver">
                        <IconButton size="small" onClick={() => { setSelected(r); setActionType('resolve'); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#10B98118', transform: 'scale(1.1)' } }}>
                          <CheckCircleOutlined sx={{ fontSize: 15, color: '#10B981' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => { setSelected(r); setActionType('delete'); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#EF444418', transform: 'scale(1.1)' } }}>
                        <DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
      </Paper>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={actionType === 'resolve' ? handleResolve : handleDelete} loading={actionLoading}
        {...getConfirmProps()} />
    </AnimatedPage>
  )
}
