import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectFavorites, selectMaterialsLoading } from '../redux/selectors'
import MaterialCard from '../components/cards/MaterialCard'
import EmptyState from '../components/common/EmptyState'
import Loading from '../components/common/Loading'
import { FavoriteBorder } from '@mui/icons-material'

export default function Favoritos() {
  const dispatch = useDispatch()
  const favorites = useSelector(selectFavorites)
  const loading = useSelector(selectMaterialsLoading)

  useEffect(() => { dispatch(fetchMaterials()) }, [dispatch])

  if (loading) return <Loading />

  return (
    <Box>
      <Typography sx={{ fontSize: 17, fontWeight: 800, mb: 0.25 }}>Favoritos</Typography>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>{favorites.length} materiales guardados</Typography>
      {favorites.length === 0 ? (
        <EmptyState icon={FavoriteBorder} title="Sin favoritos" description="Guardá tus materiales favoritos para tenerlos siempre a mano." />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2 }}>
          {favorites.map((m) => <MaterialCard key={m.id} material={m} />)}
        </Box>
      )}
    </Box>
  )
}
