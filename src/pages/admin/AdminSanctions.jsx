import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Avatar } from '@mui/material'
import {
  GavelOutlined, DeleteOutlined, WarningAmberOutlined, PersonOffOutlined,
} from '@mui/icons-material'
import { subscribeToSanctions, deleteSanction } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import SearchToolbar from '../../components/admin/SearchToolbar'
import EmptyState from '../../components/admin/EmptyState'
import StatusChip from '../../components/admin/StatusChip'
import { AnimatedPage } from '../../components/admin/AnimatedContainer'

function formatDate(ts) {
  if (!ts) return '—'
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

export default function AdminSanctions() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [sanctions, setSanctions] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const unsub = subscribeToSanctions(setSanctions)
    return unsub
  }, [])

  const filtered = useMemo(() => sanctions.filter((s) => {
    if (search) {
      const q = search.toLowerCase()
      if (!(s.reason || '').toLowerCase().includes(q) && !(s.displayName || '').toLowerCase().includes(q)) return false
    }
    if (filter && s.type !== filter) return false
    return true
  }), [sanctions, search, filter])

  const handleDelete = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteSanction(selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Sanción eliminada', severity: 'success' }))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  return (
    <AnimatedPage>
      <PageHeader icon={<GavelOutlined sx={{ fontSize: 18 }} />} title="Sanciones" description="Historial de advertencias y suspensiones" badge={sanctions.length} />

      <SearchToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0) }}
        placeholder="Buscar por motivo o usuario…"
        filters={[
          { key: 'filter', label: 'Tipo', value: filter, options: [
            { value: 'warning', label: 'Advertencias' }, { value: 'suspension', label: 'Suspensiones' },
          ]},
        ]}
        onFilterChange={(key, value) => { setFilter(value); setPage(0) }}
      />

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
            <TableCell>Usuario</TableCell><TableCell>Motivo</TableCell><TableCell>Tipo</TableCell><TableCell>Aplicada por</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState title="Sin sanciones" description={search || filter ? 'No hay sanciones con esos filtros' : 'No hay sanciones registradas'} size="small" /></TableCell></TableRow>
            ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s, i) => (
              <TableRow key={s.id}
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
                    <Avatar sx={{ width: 24, height: 24, bgcolor: s.type === 'suspension' ? '#F9731618' : '#F59E0B18', fontSize: 10, color: s.type === 'suspension' ? '#F97316' : '#F59E0B' }}>
                      {s.type === 'suspension' ? <PersonOffOutlined sx={{ fontSize: 12 }} /> : <WarningAmberOutlined sx={{ fontSize: 12 }} />}
                    </Avatar>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{s.displayName || s.email || 'Usuario'}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Typography sx={{ fontSize: 11.5 }}>{s.reason?.slice(0, 50) || '—'}</Typography></TableCell>
                <TableCell>
                  <StatusChip status={s.type === 'suspension' ? 'suspended' : 'warning'} label={s.type === 'suspension' ? 'Suspensión' : 'Advertencia'} />
                </TableCell>
                <TableCell><Typography sx={{ fontSize: 11.5 }}>{s.createdBy?.slice(0, 12) || '—'}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{formatDate(s.createdAt)}</Typography></TableCell>
                <TableCell align="right">
                  <Tooltip title="Eliminar sanción">
                    <IconButton size="small" onClick={() => { setSelected(s); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#EF444418', transform: 'scale(1.1)' } }}><DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
      </Paper>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} loading={actionLoading}
        title="Eliminar sanción"
        description={selected ? `Se eliminará la sanción a ${selected.displayName || 'este usuario'}.` : ''}
        consequences={`${selected?.type === 'warning' ? 'La cantidad de advertencias del usuario se reducirá en 1. Si estaba bloqueado por advertencias y baja de 3, se desbloqueará automáticamente.' : 'La suspensión será eliminada del historial.'}`}
        type="delete" confirmLabel="Eliminar" />
    </AnimatedPage>
  )
}
