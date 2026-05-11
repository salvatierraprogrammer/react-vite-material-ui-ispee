import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material'
import {
  DescriptionOutlined, DeleteOutlined, VisibilityOutlined, VisibilityOffOutlined, SchoolOutlined,
  OpenInNewOutlined,
} from '@mui/icons-material'
import { subscribeToMaterials, toggleHideMaterial, deleteMaterialWithFiles } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import SearchToolbar from '../../components/admin/SearchToolbar'
import EmptyState from '../../components/admin/EmptyState'
import StatusChip from '../../components/admin/StatusChip'
import { AnimatedPage, AnimatedListItem } from '../../components/admin/AnimatedContainer'
import FileViewerModal from '../../components/modals/FileViewerModal'
import { getTimeAgo } from '../../utils/helpers'
import { TYPE_COLORS, TYPE_LABELS } from '../../constants'

export default function AdminMaterials() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [materials, setMaterials] = useState([])
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewMaterial, setViewMaterial] = useState(null)

  useEffect(() => {
    const unsub = subscribeToMaterials((all) => setMaterials(all))
    return unsub
  }, [])

  const subjects = useMemo(() => [...new Set(materials.map((m) => m.subject).filter(Boolean))], [materials])

  const filtered = useMemo(() => materials.filter((m) => {
    if (search) {
      const q = search.toLowerCase()
      if (!(m.title || '').toLowerCase().includes(q) && !(m.subject || '').toLowerCase().includes(q)) return false
    }
    if (filterSubject && m.subject !== filterSubject) return false
    return true
  }), [materials, search, filterSubject])

  const handleToggleHide = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await toggleHideMaterial(selected.id, !selected.hidden, currentUser.uid)
      dispatch(showSnackbar({ message: `Material ${selected.hidden ? 'visible' : 'oculto'}`, severity: 'success' }))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteMaterialWithFiles(selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Material eliminado', severity: 'success' }))
      setMaterials((prev) => prev.filter((m) => m.id !== selected.id))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }

  const handleOpenViewer = useCallback((m) => {
    setViewMaterial(m)
    setViewerOpen(true)
  }, [])

  return (
    <AnimatedPage>
      <PageHeader icon={<DescriptionOutlined sx={{ fontSize: 18 }} />} title="Materiales" description="Gestioná todos los materiales subidos" badge={materials.length} />

      <SearchToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0) }}
        placeholder="Buscar por título o materia…"
        filters={[
          { key: 'filterSubject', label: 'Materia', value: filterSubject, options: subjects.map((s) => ({ value: s, label: s })) },
        ]}
        onFilterChange={(key, value) => { setFilterSubject(value); setPage(0) }}
      />

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
            <TableCell>Título</TableCell><TableCell>Materia</TableCell><TableCell>Tipo</TableCell><TableCell>Estado</TableCell><TableCell>Descargas</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="Sin materiales" description={search || filterSubject ? 'No hay materiales con esos filtros' : 'Aún no se subieron materiales'} size="small" /></TableCell></TableRow>
            ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((m, i) => (
              <TableRow key={m.id}
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
                  <Typography onClick={() => handleOpenViewer(m)}
                    sx={{ fontSize: 12, fontWeight: 600, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}>
                    {m.title?.slice(0, 40) || 'Sin título'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SchoolOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography sx={{ fontSize: 11.5 }}>{m.subject || '—'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip
                    status={m.type}
                    label={TYPE_LABELS[m.type] || m.type || '—'}
                    dot={false}
                  />
                </TableCell>
                <TableCell><StatusChip status={m.hidden ? 'hidden' : 'visible'} /></TableCell>
                <TableCell><Typography sx={{ fontSize: 11.5 }}>{m.downloads || 0}</Typography></TableCell>
                <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{getTimeAgo(m.createdAt)}</Typography></TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end' }}>
                    <Tooltip title="Ver archivo">
                      <IconButton size="small" onClick={() => handleOpenViewer(m)} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#3B82F618', transform: 'scale(1.1)' } }}>
                        <OpenInNewOutlined sx={{ fontSize: 15, color: '#3B82F6' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={m.hidden ? 'Mostrar' : 'Ocultar'}>
                      <IconButton size="small" onClick={() => { setSelected(m); setActionType('hide'); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#F59E0B18', transform: 'scale(1.1)' } }}>
                        {m.hidden ? <VisibilityOutlined sx={{ fontSize: 15, color: '#F59E0B' }} /> : <VisibilityOffOutlined sx={{ fontSize: 15, color: '#6B7280' }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" onClick={() => { setSelected(m); setActionType('delete'); setConfirmOpen(true) }} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: '#EF444418', transform: 'scale(1.1)' } }}><DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
      </Paper>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={actionType === 'hide' ? handleToggleHide : handleDelete} loading={actionLoading}
        title={actionType === 'hide' ? (selected?.hidden ? 'Mostrar material' : 'Ocultar material') : 'Eliminar material'}
        description={actionType === 'hide' ? `¿${selected?.hidden ? 'Mostrar' : 'Ocultar'} "${selected?.title?.slice(0, 40)}"?` : `¿Eliminar "${selected?.title?.slice(0, 40)}"?`}
        consequences={actionType === 'hide' ? (selected?.hidden ? 'El material volverá a ser visible para todos.' : 'El material dejará de ser visible. Podés mostrarlo después.') : 'Esta acción eliminará el material y su archivo. Es irreversible.'}
        type={actionType === 'delete' ? 'delete' : 'info'}
        confirmLabel={actionType === 'hide' ? (selected?.hidden ? 'Mostrar' : 'Ocultar') : 'Eliminar'} />

      <FileViewerModal
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setViewMaterial(null) }}
        fileUrl={viewMaterial?.fileUrl || ''}
        fileName={viewMaterial?.fileName || viewMaterial?.fileUrl?.split('/').pop() || ''}
        fileSize={viewMaterial?.fileSize}
        materialTitle={viewMaterial?.title}
      />
    </AnimatedPage>
  )
}
