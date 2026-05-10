import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Paper, Chip, Button, Avatar, Rating, IconButton, Divider, TextField, Breadcrumbs, Link } from '@mui/material'
import {
  DownloadOutlined, VisibilityOutlined, ArrowBack, FavoriteBorder, Favorite,
  PictureAsPdfOutlined, DescriptionOutlined, AutoStoriesOutlined, MapOutlined,
  AssignmentOutlined, SchoolOutlined, ChatBubbleOutlined, SendOutlined, DeleteOutlined, EditOutlined
} from '@mui/icons-material'
import { fetchMaterials } from '../redux/slices/materialsSlice'
import { selectMaterials } from '../redux/selectors'
import { toggleFavorite } from '../redux/slices/materialsSlice'
import { getTimeAgo, formatFileSize } from '../utils/helpers'
import { TYPE_COLORS, FILE_COLORS } from '../constants'
import { subscribeComments, addComment, deleteComment } from '../services/materialCommentsService'
import { rateMaterial, getUserRating } from '../services/ratingService'
import { incrementDownload } from '../services/materialsService'
import Loading from '../components/common/Loading'
import GuestModal from '../components/auth/GuestModal'

const typeIcons = { 'mapa-conceptual': MapOutlined, resumen: AutoStoriesOutlined, tp: AssignmentOutlined, 'apunte-teorico': SchoolOutlined, pdf: DescriptionOutlined, guia: DescriptionOutlined }

function getFileIcon(m) {
  const ext = m?.fileName?.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return PictureAsPdfOutlined
  return null
}

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const materials = useSelector(selectMaterials)
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)
  const [loading, setLoading] = useState(true)
  const [guestOpen, setGuestOpen] = useState(false)
  const [guestAction, setGuestAction] = useState('')
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [userRating, setUserRating] = useState(null)
  const [avgRating, setAvgRating] = useState(0)
  const [ratingsCount, setRatingsCount] = useState(0)
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')

  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchMaterials()).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [dispatch, materials.length])

  useEffect(() => {
    if (!id) return
    const unsub = subscribeComments(id, (cmts) => {
      setComments(cmts)
    })
    return unsub
  }, [id])

  useEffect(() => {
    if (!id || !currentUser?.uid) return
    getUserRating(id, currentUser.uid).then((r) => {
      if (r) { setUserRating(r.rating); setAvgRating(r.rating) }
    }).catch(() => {})
  }, [id, currentUser?.uid])

  const material = materials.find((m) => m.id === id)
  const color = TYPE_COLORS[material?.type] || '#8B5CF6'
  const Icon = typeIcons[material?.type] || AutoStoriesOutlined
  const FileIcon = material ? getFileIcon(material) : null
  const fColor = material?.fileName ? FILE_COLORS[material.fileName.split('.').pop()?.toLowerCase()] : undefined

  const handleFavorite = () => {
    if (!isAuthenticated) { setGuestAction('guardar en favoritos'); setGuestOpen(true); return }
    dispatch(toggleFavorite(material.id))
  }

  const handleDownload = async () => {
    if (!isAuthenticated) { setGuestAction('descargar archivos'); setGuestOpen(true); return }
    if (material?.fileUrl) window.open(material.fileUrl, '_blank')
    await incrementDownload(id).catch(() => {})
  }

  const handleView = () => {
    if (!isAuthenticated) { setGuestAction('visualizar el archivo'); setGuestOpen(true); return }
    if (material?.fileUrl) window.open(material.fileUrl, '_blank')
  }

  const handleAddComment = async () => {
    if (!commentInput.trim()) return
    if (!isAuthenticated) { setGuestAction('comentar'); setGuestOpen(true); return }
    await addComment({
      materialId: id,
      userId: currentUser.uid,
      author: currentUser.name,
      authorPhoto: currentUser.photoURL || '',
      comment: commentInput.trim(),
    })
    setCommentInput('')
  }

  const handleRate = async (rating) => {
    if (!isAuthenticated) { setGuestAction('calificar'); setGuestOpen(true); return }
    setUserRating(rating)
    const result = await rateMaterial(id, currentUser.uid, rating)
    setAvgRating(result.averageRating)
    setRatingsCount(result.ratingsCount)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId, currentUser.uid).catch(() => {})
  }

  const startEditComment = (comment) => {
    setEditingComment(comment.id)
    setEditCommentText(comment.comment)
  }

  if (loading) return <Loading />
  if (!material) return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography sx={{ fontSize: 18, fontWeight: 600, mb: 1 }}>Material no encontrado</Typography>
      <Button variant="contained" onClick={() => navigate('/materias')}>Volver a materias</Button>
    </Box>
  )

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 1.5, fontSize: 12 }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', fontSize: 12 }} onClick={() => navigate('/')}>Inicio</Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', fontSize: 12 }} onClick={() => navigate('/materias')}>Materias</Link>
        <Typography sx={{ fontSize: 12, color: 'text.primary' }}>{material.title}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px' }}>
        <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 3 }}>
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 240 }, mb: { xs: 2, md: 0 } }}>
            <Box sx={{ height: 200, borderRadius: '12px', background: `linear-gradient(135deg, ${color}10 0%, ${color}25 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
              {FileIcon ? (
                <FileIcon sx={{ fontSize: 64, color: fColor, opacity: 0.6 }} />
              ) : (
                <Icon sx={{ fontSize: 64, color, opacity: 0.4 }} />
              )}
              <Chip label={material.typeLabel} size="small" sx={{ bgcolor: color, color: '#fff', fontSize: 11, fontWeight: 600, borderRadius: '6px', height: 22 }} />
            </Box>
            {material.fileName && (
              <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '10px', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
                <PictureAsPdfOutlined sx={{ fontSize: 24, color: fColor || 'text.secondary' }} />
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.fileName}</Typography>
                  {material.fileSize && <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{formatFileSize(material.fileSize)}</Typography>}
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button variant="contained" fullWidth startIcon={<DownloadOutlined sx={{ fontSize: 16 }} />} onClick={handleDownload} sx={{ fontSize: 12.5, py: 0.75, borderRadius: '8px' }}>Descargar</Button>
              <Button variant="outlined" fullWidth startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />} onClick={handleView} sx={{ fontSize: 12.5, py: 0.75, borderRadius: '8px' }}>Visualizar</Button>
            </Box>
            <IconButton onClick={handleFavorite} sx={{ mt: 1.5, width: '100%', borderRadius: '8px', border: 1, borderColor: 'divider', gap: 0.5, color: material.isFavorite ? '#EF4444' : 'text.secondary', fontSize: 12 }}>
              {material.isFavorite ? <Favorite sx={{ fontSize: 16 }} /> : <FavoriteBorder sx={{ fontSize: 16 }} />}
              {material.isFavorite ? 'Guardado en favoritos' : 'Agregar a favoritos'}
            </IconButton>

            <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', bgcolor: 'action.hover', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Calificación</Typography>
              <Rating
                value={userRating || 0}
                onChange={(_, v) => v && handleRate(v)}
                sx={{ fontSize: 28, color: '#F59E0B' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{avgRating || material.averageRating || 0}</Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>({ratingsCount || material.ratingsCount || 0})</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>{material.title}</Typography>
            <Typography sx={{ fontSize: 12, color: 'primary.main', fontWeight: 600, mb: 1.5 }}>{material.subject}</Typography>
            <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>{material.description}</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Avatar src={material.userId === currentUser?.uid ? currentUser?.photoURL : (material.authorPhoto || '')} sx={{ width: 22, height: 22, bgcolor: color, fontSize: 10 }}>{material.author?.charAt(0)}</Avatar>
                <Box><Typography sx={{ fontSize: 11, fontWeight: 600 }}>{material.author}</Typography><Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Autor</Typography></Box>
              </Box>
              <Chip label={`${material.year}° Año`} size="small" sx={{ borderRadius: '6px', fontSize: 10.5, height: 22 }} />
              <Chip label={material.typeLabel} size="small" sx={{ borderRadius: '6px', fontSize: 10.5, height: 22, bgcolor: `${color}15`, color }} />
              {material.fileName && <Chip label={material.fileName.split('.').pop()?.toUpperCase()} size="small" sx={{ borderRadius: '6px', fontSize: 10.5, height: 22, bgcolor: fColor ? `${fColor}15` : 'action.hover', color: fColor || 'text.secondary', fontWeight: 700 }} />}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{material.downloads}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Descargas</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{avgRating || material.averageRating || 0}</Typography>
                  <Rating value={avgRating || material.averageRating || 0} readOnly precision={0.1} sx={{ fontSize: 14, color: '#F59E0B' }} />
                </Box>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{ratingsCount || material.ratingsCount || 0} calificaciones</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{comments.length}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Comentarios</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', px: 1.5, py: 1, borderRadius: '8px', bgcolor: 'action.hover' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{getTimeAgo(material.createdAt)}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Subido</Typography>
              </Box>
            </Box>

            {material.tags?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>Etiquetas</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {material.tags.map((tag) => <Chip key={tag} label={tag} size="small" sx={{ fontSize: 10.5, borderRadius: '5px', height: 22, bgcolor: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500 }} />)}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <ChatBubbleOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>Comentarios ({comments.length})</Typography>
            </Box>

            {isAuthenticated ? (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Avatar src={currentUser?.photoURL} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 11 }}>{currentUser?.name?.charAt(0)}</Avatar>
                <TextField fullWidth size="small" placeholder="Escribí un comentario…" value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 } }}
                  slotProps={{ input: { endAdornment: <IconButton size="small" onClick={handleAddComment} sx={{ color: 'primary.main' }}><SendOutlined sx={{ fontSize: 16 }} /></IconButton> } }} />
              </Box>
            ) : (
              <Button variant="outlined" size="small" sx={{ mb: 2, fontSize: 11, borderRadius: '6px' }}
                onClick={() => { setGuestAction('comentar'); setGuestOpen(true) }}>
                Iniciá sesión para comentar
              </Button>
            )}

            {comments.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', py: 1 }}>Todavía no hay comentarios. ¡Sé la primera en opinar!</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {comments.map((c) => (
                  <Paper key={c.id} variant="outlined" sx={{ p: 1.25, borderRadius: '10px', transition: 'all 0.15s', '&:hover': { borderColor: 'primary.light' } }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Avatar src={c.userId === currentUser?.uid ? currentUser?.photoURL : c.authorPhoto} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 11 }}>{c.author?.charAt(0)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{c.author}</Typography>
                          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{getTimeAgo(c.createdAt)}</Typography>
                          {currentUser?.uid === c.userId && (
                            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.25 }}>
                              <IconButton size="small" onClick={() => startEditComment(c)}><EditOutlined sx={{ fontSize: 12 }} /></IconButton>
                              <IconButton size="small" onClick={() => handleDeleteComment(c.id)}><DeleteOutlined sx={{ fontSize: 12 }} /></IconButton>
                            </Box>
                          )}
                        </Box>
                        {editingComment === c.id ? (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <TextField size="small" value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { fontSize: 12, borderRadius: '6px' } }} />
                            <Button size="small" variant="contained" sx={{ fontSize: 10, minWidth: 0 }} onClick={() => { setEditingComment(null) }}>Guardar</Button>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: 12.5 }}>{c.comment}</Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action={guestAction} />
    </Box>
  )
}
