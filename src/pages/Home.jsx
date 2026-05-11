import { useEffect, useState, useCallback } from 'react'
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
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import ModalCrearMaterial from '../components/modals/ModalCrearMaterial'

export default function Home() {
  const dispatch = useDispatch()
  const materials = useSelector(selectMaterials)
  const loading = useSelector(selectMaterialsLoading)
  const error = useSelector(selectMaterialsError)
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  useEffect(() => {
    if (searchParams.get('subir') === 'true') {
      setCreateOpen(true)
      setSearchParams((prev) => { prev.delete('subir'); return prev }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleRetry = useCallback(() => { dispatch(fetchMaterials()) }, [dispatch])

  if (loading) return <Loading text="Cargando materiales..." />

  if (error) {
    return (
      <Box>
        <HeroBanner />
        <EmptyState
          title="Error al cargar"
          description={error || 'No pudimos cargar los materiales. Verificá tu conexión e intentá de nuevo.'}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
          <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={handleRetry} size="small" sx={{ borderRadius: '8px' }}>
            Reintentar
          </Button>
        </Box>
        <FooterInfo />
      </Box>
    )
  }

  return (
    <Box>
      <HeroBanner />
      <CategoriesSection />
      <RecentUploads materials={materials} />
      <FooterInfo />
      <ModalCrearMaterial open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  )
}
