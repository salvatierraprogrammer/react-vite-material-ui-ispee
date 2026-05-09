import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Box } from '@mui/material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectMaterials, selectMaterialsLoading } from '../redux/selectors'
import HeroBanner from '../components/home/HeroBanner'
import CategoriesSection from '../components/home/CategoriesSection'
import RecentUploads from '../components/home/RecentUploads'
import FooterInfo from '../components/home/FooterInfo'
import Loading from '../components/common/Loading'
import ModalCrearMaterial from '../components/modals/ModalCrearMaterial'

export default function Home() {
  const dispatch = useDispatch()
  const materials = useSelector(selectMaterials)
  const loading = useSelector(selectMaterialsLoading)
  const [searchParams, setSearchParams] = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])
  useEffect(() => { if (searchParams.get('subir') === 'true') { setCreateOpen(true); setSearchParams({}) } }, [searchParams, setSearchParams])

  if (loading) return <Loading />

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
