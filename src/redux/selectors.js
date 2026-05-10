import { createSelector } from '@reduxjs/toolkit'

const selectMaterialsState = (s) => s.materials
const selectAuthState = (s) => s.auth
const selectUiState = (s) => s.ui
const selectNotifState = (s) => s.notifications

export const selectMaterials = (s) => s.materials.items
export const selectMaterialsLoading = createSelector(selectMaterialsState, (ms) => ms.loading)
export const selectFavorites = createSelector(selectMaterialsState, (ms) => ms.items.filter((m) => m.isFavorite))
export const selectMyMaterials = createSelector([selectMaterialsState, selectAuthState], (ms, as) => ms.items.filter((m) => m.userId === as.currentUser?.uid))
export const selectCurrentUser = createSelector(selectAuthState, (as) => as.currentUser)
export const selectDarkMode = createSelector(selectUiState, (ui) => ui.darkMode)
export const selectUnreadCount = createSelector(selectNotifState, (ns) => ns.items.filter((n) => !n.read).length)
export const selectIsAuthenticated = createSelector(selectAuthState, (as) => as.isAuthenticated)

export const selectMaterialsByYear = (year) => createSelector(selectMaterials, (items) => items.filter((m) => m.year === Number(year)))
export const selectMaterialsBySubject = (subject) => createSelector(selectMaterials, (items) => items.filter((m) => m.subject === subject))
