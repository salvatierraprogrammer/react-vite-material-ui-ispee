import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Chip, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, InputAdornment, Avatar, Button } from '@mui/material'
import {
  ForumOutlined, DeleteOutlined, VisibilityOutlined, ChatBubbleOutlined, BlockOutlined, Search, Clear, PersonOutlined, CheckCircleOutlined,
} from '@mui/icons-material'
import { getAllForumPosts, deleteForumPost, deleteForumComment, getAllForumSubcollectionComments } from '../../services/adminService'
import { showSnackbar } from '../../redux/slices/uiSlice'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import PageHeader from '../../components/admin/PageHeader'
import { getTimeAgo } from '../../utils/helpers'

export default function AdminForum() {
  const dispatch = useDispatch()
  const currentUser = useSelector((s) => s.auth.currentUser)
  const [tab, setTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getAllForumPosts(), getAllForumSubcollectionComments()]).then(([p, c]) => {
      setPosts(p)
      setComments(c)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredPosts = useMemo(() => {
    if (!search) return posts
    const q = search.toLowerCase()
    return posts.filter((p) =>
      (p.title || '').toLowerCase().includes(q) || (p.author || '').toLowerCase().includes(q)
    )
  }, [posts, search])

  const filteredComments = useMemo(() => {
    if (!search) return comments
    const q = search.toLowerCase()
    return comments.filter((c) =>
      (c.content || '').toLowerCase().includes(q) || (c.author || '').toLowerCase().includes(q)
    )
  }, [comments, search])

  const handleDeletePost = useCallback(async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteForumPost(selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Publicación eliminada', severity: 'success' }))
      setPosts((prev) => prev.filter((p) => p.id !== selected.id))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }, [selected, currentUser, dispatch])

  const handleDeleteComment = useCallback(async () => {
    if (!selected || !currentUser?.uid) return
    setActionLoading(true)
    try {
      await deleteForumComment(selected.postId, selected.id, currentUser.uid)
      dispatch(showSnackbar({ message: 'Comentario eliminado', severity: 'success' }))
      setComments((prev) => prev.filter((c) => c.id !== selected.id))
      setConfirmOpen(false)
    } catch (e) { dispatch(showSnackbar({ message: e.message, severity: 'error' })) }
    setActionLoading(false)
  }, [selected, currentUser, dispatch])

  const handleSearchChange = useCallback((value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value)
      setPage(0)
    }, 250)
  }, [])

  return (
    <Box>
      <PageHeader icon={<ForumOutlined sx={{ fontSize: 18 }} />} title="Foro" description="Moderá las publicaciones y comentarios del foro" badge={posts.length} />

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {['posts', 'comments'].map((t) => (
          <Button key={t} onClick={() => { setTab(t); setPage(0); setSearch('') }}
            variant={tab === t ? 'contained' : 'outlined'} size="small"
            sx={{ borderRadius: '20px', fontSize: 11.5, fontWeight: 600, px: 2 }}>
            {t === 'posts' ? 'Publicaciones' : 'Comentarios'}
          </Button>
        ))}
      </Box>

      <TextField onChange={(e) => handleSearchChange(e.target.value)} placeholder={`Buscar ${tab === 'posts' ? 'publicaciones' : 'comentarios'}…`} size="small"
        sx={{ minWidth: { xs: '100%', sm: 280 }, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 12.5 } }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>, endAdornment: search ? <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => { setSearch(''); setPage(0) }}><Clear sx={{ fontSize: 14, color: 'text.secondary' }} /></InputAdornment> : null } }} />

      {tab === 'posts' ? (
        <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
              <TableCell>Título</TableCell><TableCell>Autor</TableCell><TableCell>Comentarios</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, fontSize: 12, color: 'text.secondary' }}>No hay publicaciones</TableCell></TableRow>
              ) : filteredPosts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, '& td': { py: 0.75 } }}>
                  <TableCell><Typography sx={{ fontSize: 12, fontWeight: 600 }}>{p.title?.slice(0, 50) || 'Sin título'}</Typography></TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Avatar sx={{ width: 22, height: 22, fontSize: 9, bgcolor: '#10B981' }}>{p.author?.charAt(0) || '?'}</Avatar><Typography sx={{ fontSize: 11.5 }}>{p.author || '—'}</Typography></Box></TableCell>
                  <TableCell><Chip label={p.commentsCount || 0} size="small" sx={{ height: 18, fontSize: 9 }} /></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{getTimeAgo(p.createdAt)}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar publicación">
                      <IconButton size="small" onClick={() => { setSelected(p); setActionType('post'); setConfirmOpen(true) }} sx={{ '&:hover': { bgcolor: '#EF444418' } }}><DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
          <TablePagination component="div" count={filteredPosts.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: '14px', overflow: 'hidden' }}>
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ '& th': { fontSize: 10.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.04, bgcolor: 'action.hover', py: 1 } }}>
              <TableCell>Contenido</TableCell><TableCell>Autor</TableCell><TableCell>Post ID</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Acciones</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredComments.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, fontSize: 12, color: 'text.secondary' }}>No hay comentarios</TableCell></TableRow>
              ) : filteredComments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
                <TableRow key={c.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, '& td': { py: 0.75 } }}>
                  <TableCell><Typography sx={{ fontSize: 11.5 }}>{c.content?.slice(0, 60) || '—'}</Typography></TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Avatar src={c.authorPhoto || ''} sx={{ width: 22, height: 22, fontSize: 9, bgcolor: '#3B82F6' }}>{c.author?.charAt(0) || '?'}</Avatar><Typography sx={{ fontSize: 11.5 }}>{c.author || '—'}</Typography></Box></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{c.postId?.slice(0, 8) || '—'}</Typography></TableCell>
                  <TableCell><Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{getTimeAgo(c.createdAt)}</Typography></TableCell>
                  <TableCell align="right">
                    <Tooltip title="Eliminar comentario">
                      <IconButton size="small" onClick={() => { setSelected(c); setActionType('comment'); setConfirmOpen(true) }} sx={{ '&:hover': { bgcolor: '#EF444418' } }}><DeleteOutlined sx={{ fontSize: 15, color: '#EF4444' }} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></TableContainer>
          <TablePagination component="div" count={filteredComments.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0) }} rowsPerPageOptions={[10, 25, 50]} labelRowsPerPage="Filas" sx={{ fontSize: 11.5, '& .MuiTablePagination-toolbar': { minHeight: 44 } }} />
        </Paper>
      )}

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        onConfirm={actionType === 'post' ? handleDeletePost : handleDeleteComment} loading={actionLoading}
        title={actionType === 'post' ? 'Eliminar publicación' : 'Eliminar comentario'}
        description={actionType === 'post' ? '¿Deseas eliminar esta publicación del foro?' : '¿Deseas eliminar este comentario?'}
        consequences="Esta acción no se puede deshacer. Todos los comentarios asociados también se eliminarán."
        type="delete" confirmLabel="Eliminar" />
    </Box>
  )
}
