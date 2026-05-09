import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMaterials, addMaterial, editMaterial, removeMaterial, toggleFavorite } from '../redux/slices/materialsSlice'

export function useMaterials() {
  const dispatch = useDispatch()
  const materials = useSelector((s) => s.materials.items)
  const loading = useSelector((s) => s.materials.loading)

  const getMaterials = useCallback(() => dispatch(fetchMaterials()), [dispatch])
  const create = useCallback((data) => dispatch(addMaterial(data)).unwrap(), [dispatch])
  const update = useCallback((id, updates) => dispatch(editMaterial({ id, updates })).unwrap(), [dispatch])
  const remove = useCallback((id) => dispatch(removeMaterial(id)).unwrap(), [dispatch])
  const favorite = useCallback((id) => dispatch(toggleFavorite(id)), [dispatch])

  return { materials, loading, getMaterials, create, update, remove, favorite }
}
