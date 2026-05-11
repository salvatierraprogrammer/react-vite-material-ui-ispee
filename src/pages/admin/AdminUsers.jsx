import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Avatar, IconButton, Button, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Switch } from '@mui/material'
import {
  PeopleOutlined, MoreVertOutlined, BlockOutlined, CheckCircleOutlined, WarningAmberOutlined,
  PersonOffOutlined, DeleteOutlined, Search, Clear, ShieldOutlined,
  SchoolOutlined, PersonOutlined,
} from '@mui/icons-material'
import { subscribeToUsers, updateUserRole, blockUser, unblockUser, warnUser, suspendUser, deleteUserAccount, toggleUserUpload } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import SearchToolbar from '../../components/admin/SearchToolbar'
import EmptyState from '../../components/admin/EmptyState'
import StatusChip from '../../components/admin/StatusChip'
import { AnimatedPage, AnimatedListItem } from '../../components/admin/AnimatedContainer'
import { getTimeAgo } from '../../utils/helpers'

export default function AdminUsers() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [warnReason, setWarnReason] = useState('')

  useEffect(() => {
    const unsub = subscribeToUsers((allUsers) => { setUsers(allUsers); setLoading(false) })
    return unsub
  }, [])

  const filtered = useMemo(() => users.filter((u) => {
    if (search) {
      const q = search.toLowerCase()
      const match = (u.name || '').toLowerCase().includes(q) || (u.lastName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q)
      if (!match) return false
    }
    if (roleFilter && u.role !== roleFilter) return false
    if (statusFilter === 'blocked' && !u.isBlocked && !u.suspended) return false
    if (statusFilter === 'warned' && !(u.warnings > 0)) return false
    if (statusFilter === 'online' && !u.online) return false
    return true
  }), [users, search, roleFilter, statusFilter])

  const handleAction = useCallback((user, action) => {
    setSelectedUser(user)
    setActionType(action)
    setWarnReason('')
    setConfirmOpen(true)
  }, [])

  const executeAction = async () => {
    if (!selectedUser || !currentUser?.uid) return
    setActionLoading(true)
    try {
      switch (actionType) {
        case 'block':
          await blockUser(selectedUser.id, currentUser.uid)
          dispatch(showSnackbar({ message: `${selectedUser.name || 'Usuario'} bloqueado`, severity: 'success' }))
          break
        case 'unblock':
          await unblockUser(selectedUser.id, currentUser.uid)
          dispatch(showSnackbar({ message: `${selectedUser.name || 'Usuario'} desbloqueado`, severity: 'success' }))
          break
        case 'warn':
          if (!warnReason.trim()) { dispatch(showSnackbar({ message: 'Escribí un motivo para la advertencia', severity: 'warning' })); setActionLoading(false); return }
          await warnUser(selectedUser.id, warnReason.trim(), currentUser.uid)
          dispatch(showSnackbar({ message: `Advertencia enviada a ${selectedUser.name || 'Usuario'}`, severity: 'success' }))
          break
        case 'suspend':
          await suspendUser(selectedUser.id, warnReason.trim() || 'Sin motivo', currentUser.uid)
          dispatch(showSnackbar({ message: `${selectedUser.name || 'Usuario'} suspendido`, severity: 'success' }))
          break
        case 'delete':
          await deleteUserAccount(selectedUser.id, currentUser.uid)
          dispatch(showSnackbar({ message: `Cuenta de ${selectedUser.name || 'Usuario'} eliminada`, severity: 'success' }))
          break
      }
      setConfirmOpen(false)
    } catch (e) {
      dispatch(showSnackbar({ message: `Error: ${e.message}`, severity: 'error' }))
    }
    setActionLoading(false)
  }

  const handleToggleUpload = useCallback(async (uid, canUpload) => {
    if (!currentUser?.uid) return
    await toggleUserUpload(uid, canUpload, currentUser.uid)
    dispatch(showSnackbar({ message: `Permiso de subida ${canUpload ? 'habilitado' : 'deshabilitado'}`, severity: 'success' }))
  }, [currentUser, dispatch])

  const getConfirmProps = useCallback(() => {
    switch (actionType) {
      case 'block': return { title: 'Bloquear usuario', description: `Estás a punto de bloquear a ${selectedUser?.name || 'este usuario'}.`, consequences: 'No podrá acceder a la plataforma hasta que un administrador lo desbloquee.', type: 'block', confirmLabel: 'Bloquear' }
      case 'unblock': return { title: 'Desbloquear usuario', description: `¿Deseas desbloquear a ${selectedUser?.name || 'este usuario'}?`, consequences: 'Recuperará el acceso completo a la plataforma.', type: 'info', confirmLabel: 'Desbloquear' }
      case 'warn': return { title: 'Enviar advertencia', description: `Se enviará una advertencia a ${selectedUser?.name || 'este usuario'}.`, consequences: `${((selectedUser?.warnings || 0) + 1) >= 3 ? '⚠️ Esta es la 3ª advertencia — la cuenta será bloqueada automáticamente.' : `Lleva ${selectedUser?.warnings || 0}/3 advertencias.`}`, type: 'warn', confirmLabel: 'Enviar advertencia' }
      case 'suspend': return { title: 'Suspender cuenta', description: `Estás a punto de suspender a ${selectedUser?.name || 'este usuario'}.`, consequences: 'No podrá acceder hasta que un administrador reactive la cuenta.', type: 'suspend', confirmLabel: 'Suspender' }
      case 'delete': return { title: 'Eliminar cuenta', description: `Estás a punto de eliminar la cuenta de ${selectedUser?.name || 'este usuario'}.`, consequences: 'Esta acción es irreversible. Se perderán todos sus datos.', type: 'delete', confirmLabel: 'Eliminar' }
      default: return {}
    }
  }, [actionType, selectedUser])

  const roleChipColor = (role) => {
    const colors = { admin: '#8B5CF6', moderador: '#3B82F6', profesor: '#10B981', estudiante: '#6B7280' }
    return colors[role] || '#6B7280'
  }

  const handleMenuOpen = (e, u) => { setSelectedUser(u); setMenuAnchor(e.currentTarget) }

  return (
    <AnimatedPage>
      <PageHeader icon={<PeopleOutlined sx={{ fontSize: 18 }} />} title="Usuarios" description="Gestioná todos los usuarios de la plataforma" badge={users.length} />

      <SearchToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(0) }}
        placeholder="Buscar por nombre, email…"
        filters={[
          { key: 'roleFilter', label: 'Rol', value: roleFilter, options: [
            { value: 'admin', label: 'Admin' }, { value: 'moderador', label: 'Moderador' },
            { value: 'profesor', label: 'Profesor' }, { value: 'estudiante', label: 'Estudiante' },
          ]},
          { key: 'statusFilter', label: 'Estado', value: statusFilter, options: [
            { value: 'online', label: 'En línea' }, { value: 'blocked', label: 'Bloqueados' }, { value: 'warned', label: 'Con advertencias' },
          ]},
        ]}
        onFilterChange={(key, value) => { if (key === 'roleFilter') setRoleFilter(value); else setStatusFilter(value); setPage(0) }}
      />

      <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Subidas</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, fontSize: 12, color: 'text.secondary' }}>Cargando usuarios…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7}><EmptyState title="Sin resultados" description="No se encontraron usuarios con esos criterios" size="small" /></TableCell></TableRow>
              ) : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u, i) => (
                <TableRow key={u.id}
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
                      <Avatar src={u.photoURL || ''} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 10 }}>{u.name?.charAt(0) || u.displayName?.charAt(0) || '?'}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{u.name || u.displayName || 'Sin nombre'}</Typography>
                        <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{u.lastName || ''}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 11.5 }}>{u.email || '—'}</Typography></TableCell>
                  <TableCell>
                    <StatusChip status={u.role} label={u.role || 'estudiante'} dot={false} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {u.online && <StatusChip status="online" />}
                      {u.suspended && <StatusChip status="suspended" />}
                      {u.isBlocked && !u.suspended && <StatusChip status="blocked" />}
                      {(u.warnings || 0) > 0 && <StatusChip status="warning" label={`${u.warnings} adv.`} />}
                      {!u.online && !u.suspended && !u.isBlocked && !(u.warnings > 0) && <StatusChip status="active" label="Activo" />}
                    </Box>
                  </TableCell>
                  <TableCell><Typography sx={{ fontSize: 11.5 }}>{u.uploadsCount ?? '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{getTimeAgo(u.createdAt)}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, u)} sx={{ transition: 'all 0.15s ease', '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.05)' } }}><MoreVertOutlined sx={{ fontSize: 16 }} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 180, mt: 0.5 } } }}>
        {selectedUser?.isBlocked ? (
          <MenuItem onClick={() => { setMenuAnchor(null); handleAction(selectedUser, 'unblock') }}>
            <ListItemIcon><CheckCircleOutlined sx={{ fontSize: 16, color: '#10B981' }} /></ListItemIcon>
            <ListItemText primary="Desbloquear" slotProps={{ primary: { fontSize: 12 } }} />
          </MenuItem>
        ) : (
          [
            <MenuItem key="block" onClick={() => { setMenuAnchor(null); handleAction(selectedUser, 'block') }}>
              <ListItemIcon><BlockOutlined sx={{ fontSize: 16, color: '#EF4444' }} /></ListItemIcon>
              <ListItemText primary="Bloquear" slotProps={{ primary: { fontSize: 12 } }} />
            </MenuItem>,
            <MenuItem key="suspend" onClick={() => { setMenuAnchor(null); handleAction(selectedUser, 'suspend') }}>
              <ListItemIcon><PersonOffOutlined sx={{ fontSize: 16, color: '#F97316' }} /></ListItemIcon>
              <ListItemText primary="Suspender" slotProps={{ primary: { fontSize: 12 } }} />
            </MenuItem>,
          ]
        )}
        <MenuItem onClick={() => { setMenuAnchor(null); handleAction(selectedUser, 'warn') }}>
          <ListItemIcon><WarningAmberOutlined sx={{ fontSize: 16, color: '#F59E0B' }} /></ListItemIcon>
          <ListItemText primary="Advertir" slotProps={{ primary: { fontSize: 12 } }} />
        </MenuItem>
        {currentUser?.role === 'admin' && selectedUser?.role !== 'admin' && (
          <MenuItem onClick={() => { setMenuAnchor(null); handleAction(selectedUser, 'delete') }}>
            <ListItemIcon><DeleteOutlined sx={{ fontSize: 16, color: '#EF4444' }} /></ListItemIcon>
            <ListItemText primary="Eliminar cuenta" slotProps={{ primary: { fontSize: 12 } }} />
          </MenuItem>
        )}
        {selectedUser && (
          <MenuItem onClick={() => { setMenuAnchor(null); handleToggleUpload(selectedUser.id, selectedUser?.canUpload === false) }}>
            <ListItemIcon>
              <Box sx={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Switch size="small" checked={selectedUser?.canUpload !== false} onChange={() => {}} />
              </Box>
            </ListItemIcon>
            <ListItemText primary="Puede subir" slotProps={{ primary: { fontSize: 12 } }} />
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeAction}
        loading={actionLoading}
        {...getConfirmProps()}
      >
        {actionType === 'warn' && (
          <TextField
            autoFocus
            value={warnReason}
            onChange={(e) => setWarnReason(e.target.value)}
            placeholder="Motivo de la advertencia"
            size="small"
            fullWidth
            sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          />
        )}
        {actionType === 'suspend' && (
          <TextField
            autoFocus
            value={warnReason}
            onChange={(e) => setWarnReason(e.target.value)}
            placeholder="Motivo de la suspensión"
            size="small"
            fullWidth
            sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
          />
        )}
      </ConfirmDialog>
    </AnimatedPage>
  )
}
