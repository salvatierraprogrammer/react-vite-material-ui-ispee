import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Box, Button } from '@mui/material'
import { RefreshOutlined } from '@mui/icons-material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectMaterials, selectMaterialsLoading, selectMaterialsError } from '../redux/selectors'
import HeroBanner from '../components/home/HeroBanner'
import CategoriesSection from '../components/home/CategoriesSection'
import RecentUploads from '../components/home/RecentUploads'
import FooterInfo from '../components/home/FooterInfo'
import EmptyState from '../components/common/EmptyState'
import ModalCrearMaterial from '../components/modals/ModalCrearMaterial'

export default function Home() {
  const dispatch = useDispatch()
  const materials = useSelector(selectMaterials)
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  const heroStats = useMemo(() => {
    const items = Array.isArray(materials) ? materials : []
    const subjects = new Set(items.map((m) => m.subject).filter(Boolean)).size
    return { materials: items.length, subjects }
  }, [materials])

  useEffect(() => {
    dispatch(fetchMaterials())
  }, [dispatch])

  useEffect(() => {
    if (searchParams.get('subir') === 'true') {
      setCreateOpen(true)
      setSearchParams((prev) => {
        prev.delete('subir')
        return prev
      }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleRetry = useCallback(() => {
    dispatch(fetchMaterials())
  }, [dispatch])

  if (loading) {
    return (
      <Box>
        <HeroBanner stats={heroStats} statsLoading />
        <CategoriesSection />
        <RecentUploads materials={[]} loading />
        <FooterInfo />
        <ModalCrearMaterial open={createOpen} onClose={() => setCreateOpen(false)} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <HeroBanner stats={{ materials: 0, subjects: 0 }} />
        <EmptyState
          title="Error al cargar"
          description={error || 'No pudimos cargar los materiales. Verificá tu conexión e intentá de nuevo.'}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRetry}
            size="medium"
            sx={{ borderRadius: 2, px: 2.5, py: 1, fontWeight: 600 }}
          >
            Reintentar
          </Button>
        </Box>
        <FooterInfo />
      </Box>
    )
  }

  return (
    <Box>
      <HeroBanner stats={heroStats} />
      <CategoriesSection />
      <RecentUploads materials={materials} />
      <FooterInfo />
      <ModalCrearMaterial open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  )
}
