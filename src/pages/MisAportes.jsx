import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, IconButton, Tooltip } from '@mui/material'
import { Add, EditOutlined, DeleteOutlined, ShareOutlined } from '@mui/icons-material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectMyMaterials, selectMaterialsLoading } from '../redux/selectors'
import MaterialCard from '../components/cards/MaterialCard'
import EmptyState from '../components/common/EmptyState'
import Loading from '../components/common/Loading'
import ModalCrearMaterial from '../components/modals/ModalCrearMaterial'
import ModalEditarMaterial from '../components/modals/ModalEditarMaterial'
import DialogEliminar from '../components/modals/DialogEliminar'

export default function MisAportes() {
  const dispatch = useDispatch()
  const myMaterials = useSelector(selectMyMaterials)
  const loading = useSelector(selectMaterialsLoading)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  if (loading) return <Loading />

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Mis aportes</Typography>
        <Tooltip title="Subir material"><IconButton onClick={() => setCreateOpen(true)} size="small" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}><Add sx={{ fontSize: 16 }} /></IconButton></Tooltip>
      </Box>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>{myMaterials.length} materiales compartidos</Typography>

      {myMaterials.length === 0 ? (
        <EmptyState title="Sin aportes" description="Todavía no subiste ningún material. ¡Compartí tus apuntes!" />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
          {myMaterials.map((m) => (
            <Box key={m.id} sx={{ position: 'relative', '&:hover .actions': { opacity: 1 } }}>
              <MaterialCard material={m} actions={
                <><IconButton size="small" onClick={() => setEditTarget(m)} sx={{ width: 24, height: 24 }}><EditOutlined sx={{ fontSize: 14, color: 'primary.main' }} /></IconButton><IconButton size="small" sx={{ width: 24, height: 24 }}><ShareOutlined sx={{ fontSize: 14, color: 'text.secondary' }} /></IconButton><IconButton size="small" onClick={() => setDeleteTarget(m)} sx={{ width: 24, height: 24 }}><DeleteOutlined sx={{ fontSize: 14, color: '#EF4444' }} /></IconButton></>
              } />
            </Box>
          ))}
        </Box>
      )}
      <ModalCrearMaterial open={createOpen} onClose={() => setCreateOpen(false)} />
      <ModalEditarMaterial open={Boolean(editTarget)} onClose={() => setEditTarget(null)} material={editTarget} />
      <DialogEliminar open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} materialId={deleteTarget?.id} materialTitle={deleteTarget?.title} />
    </Box>
  )
}
