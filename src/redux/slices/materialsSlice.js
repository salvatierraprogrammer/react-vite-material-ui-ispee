import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getMaterials as fetchMaterialsApi,
  createMaterial as createMaterialApi,
  updateMaterial as updateMaterialApi,
  deleteMaterial as deleteMaterialApi,
} from '../../services/materialsService'
import { toggleUserFavorite } from '../../services/usersService'

export const fetchMaterials = createAsyncThunk('materials/fetchMaterials', async () => {
  return await fetchMaterialsApi()
})

export const addMaterial = createAsyncThunk('materials/addMaterial', async (material) => {
  return await createMaterialApi(material)
})

export const editMaterial = createAsyncThunk('materials/editMaterial', async ({ id, updates }) => {
  return await updateMaterialApi(id, updates)
})

export const removeMaterial = createAsyncThunk('materials/removeMaterial', async (id) => {
  await deleteMaterialApi(id)
  return id
})

export const toggleFavorite = createAsyncThunk('materials/toggleFavorite', async (materialId, { getState }) => {
  const { auth } = getState()
  const userId = auth.currentUser?.uid
  if (!userId) throw new Error('Not authenticated')
  await toggleUserFavorite(userId, materialId)
  return materialId
})

const materialsSlice = createSlice({
  name: 'materials',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setFavoriteIds: (state, action) => {
      const ids = action.payload || []
      state.items.forEach((m) => { m.isFavorite = ids.includes(m.id) })
    },
    setMaterials: (state, action) => {
      state.items = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaterials.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchMaterials.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.map((m) => ({ ...m, id: m.id })) })
      .addCase(fetchMaterials.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
      .addCase(addMaterial.fulfilled, (state, action) => { state.items = [action.payload, ...state.items] })
      .addCase(editMaterial.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(removeMaterial.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload)
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const item = state.items.find((m) => m.id === action.payload)
        if (item) item.isFavorite = !item.isFavorite
      })
  },
})

export const { setFavoriteIds, setMaterials } = materialsSlice.actions
export default materialsSlice.reducer
