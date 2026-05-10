import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, TextField, MenuItem, IconButton, Tooltip } from '@mui/material'
import { Add } from '@mui/icons-material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectMaterials, selectMaterialsLoading } from '../redux/selectors'
import MaterialCard from '../components/cards/MaterialCard'
import SkeletonCard from '../components/common/SkeletonCard'
import EmptyState from '../components/common/EmptyState'
import ModalCrearMaterial from '../components/modals/ModalCrearMaterial'
import GuestModal from '../components/auth/GuestModal'
import { years, subjects, materialTypes } from '../data/data'
import { SORT_OPTIONS } from '../constants'

export default function Materias() {
  const dispatch = useDispatch()
  const materials = useSelector(selectMaterials)
  const loading = useSelector(selectMaterialsLoading)
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [createOpen, setCreateOpen] = useState(false)
  const [guestOpen, setGuestOpen] = useState(false)
  const [filters, setFilters] = useState({ year: '', subject: '', type: '', sort: 'recientes' })

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  const filtered = useMemo(() => materials
    .filter((m) => !filters.year || m.year === Number(filters.year))
    .filter((m) => !filters.subject || m.subject === filters.subject)
    .filter((m) => !filters.type || m.type === filters.type)
    .sort((a, b) => filters.sort === 'recientes' ? new Date(b.createdAt) - new Date(a.createdAt) : filters.sort === 'valorados' ? b.rating - a.rating : b.downloads - a.downloads)
  , [materials, filters])

  return (
    <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Box><Typography sx={{ fontSize: 17, fontWeight: 800 }}>Materias</Typography><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{filtered.length} materiales</Typography></Box>
        {isAuthenticated ? (
          <Tooltip title="Subir material"><IconButton onClick={() => setCreateOpen(true)} size="small" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}><Add sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        ) : (
          <Tooltip title="Subir material"><IconButton onClick={() => setGuestOpen(true)} size="small" sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}><Add sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <TextField select label="Año" value={filters.year} onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))} size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}><MenuItem value="">Todos</MenuItem>{years.map((y) => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}</TextField>
        <TextField select label="Materia" value={filters.subject} onChange={(e) => setFilters((p) => ({ ...p, subject: e.target.value }))} size="small" sx={{ minWidth: { xs: '100%', sm: 130 } }}><MenuItem value="">Todas</MenuItem>{subjects.map((s) => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}</TextField>
        <TextField select label="Tipo" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))} size="small" sx={{ minWidth: { xs: '100%', sm: 100 } }}><MenuItem value="">Todos</MenuItem>{materialTypes.map((t) => <MenuItem key={t.id} value={t.value}>{t.name}</MenuItem>)}</TextField>
        <TextField select label="Orden" value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))} size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>{SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField>
      </Box>

      {loading ? (
        <Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>Cargando materiales...</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
          </Box>
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" description="No hay materiales con esos filtros." />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {filtered.map((m) => <MaterialCard key={m.id} material={m} />)}
        </Box>
      )}
      <ModalCrearMaterial open={createOpen} onClose={() => setCreateOpen(false)} />
      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action="subir materiales" />
    </Box>
  )
}
