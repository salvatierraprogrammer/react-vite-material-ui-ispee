import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Paper, Button, Avatar, IconButton, TextField, Dialog, DialogTitle, DialogContent, Chip, Divider, Tooltip } from '@mui/material'
import {
  Add, Close, ThumbUpOutlined, ThumbUp, ChatBubbleOutlined, DeleteOutlined, EditOutlined, Send, MoreHoriz, FavoriteBorder
} from '@mui/icons-material'
import { subscribePosts, createPost, likePost, addComment, subscribeComments, updatePost, deletePost, deleteComment } from '../services/forumService'
import { getTimeAgo } from '../utils/helpers'
import GuestModal from '../components/auth/GuestModal'

export default function Foro() {
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [newPostOpen, setNewPostOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editingPost, setEditingPost] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [guestOpen, setGuestOpen] = useState(false)
  const [guestAction, setGuestAction] = useState('')

  useEffect(() => {
    const unsub = subscribePosts(setPosts)
    setLoading(false)
    return unsub
  }, [])

  useEffect(() => {
    if (!expandedPost) { setComments([]); return }
    const unsub = subscribeComments(expandedPost.id, setComments)
    return unsub
  }, [expandedPost?.id])

  const handleCreatePost = async () => {
    if (!newContent.trim()) return
    const title = newTitle.trim() || 'Sin título'
    await createPost({
      userId: currentUser.uid,
      author: currentUser.name,
      authorPhoto: currentUser.photoURL || '',
      title,
      content: newContent.trim(),
    })
    setNewPostOpen(false); setNewTitle(''); setNewContent('')
  }

  const handleLike = async (postId) => {
    if (!isAuthenticated) { setGuestAction('dar like'); setGuestOpen(true); return }
    await likePost(postId, currentUser.uid).catch(() => {})
  }

  const handleAddComment = async () => {
    if (!commentInput.trim()) return
    if (!isAuthenticated) { setGuestAction('comentar'); setGuestOpen(true); return }
    await addComment(expandedPost.id, {
      userId: currentUser.uid,
      author: currentUser.name,
      authorPhoto: currentUser.photoURL || '',
      content: commentInput.trim(),
    })
    setCommentInput('')
  }

  const handleEditPost = async () => {
    if (!editContent.trim()) return
    await updatePost(editingPost.id, currentUser.uid, {
      title: editTitle.trim(),
      content: editContent.trim(),
    }).catch(() => {})
    setEditingPost(null); setEditTitle(''); setEditContent('')
  }

  const handleDeletePost = async (postId) => {
    if (!isAuthenticated) return
    await deletePost(postId, currentUser.uid).catch(() => {})
    if (expandedPost?.id === postId) setExpandedPost(null)
  }

  const handleDeleteComment = async (commentId) => {
    await deleteComment(expandedPost.id, commentId, currentUser.uid).catch(() => {})
  }

  const openNewPost = () => {
    if (!isAuthenticated) { setGuestAction('publicar en el foro'); setGuestOpen(true); return }
    setNewPostOpen(true)
  }

  const startEdit = (post) => {
    setEditingPost(post)
    setEditTitle(post.title || '')
    setEditContent(post.content || '')
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 17, fontWeight: 800 }}>Foro</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Debatí y consultá con la comunidad ISPEE</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Add sx={{ fontSize: 14 }} />} onClick={openNewPost} sx={{ fontSize: 12 }}>Nuevo tema</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary', fontSize: 13 }}>Cargando foro…</Typography>
          ) : posts.length === 0 ? (
            <Paper sx={{ textAlign: 'center', py: 4, borderRadius: '12px' }}>
              <FavoriteBorder sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>Todavía no hay publicaciones</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Sé la primera en iniciar un tema de discusión</Typography>
              <Button variant="contained" size="small" onClick={openNewPost} sx={{ fontSize: 12 }}>Crear primera publicación</Button>
            </Paper>
          ) : (
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              {posts.map((post) => {
                const hasLiked = (post.likes || []).includes(currentUser?.uid)
                const isOwner = currentUser?.uid === post.userId
                return (
                  <Box
                    key={post.id}
                    sx={{
                      p: 1.5, cursor: 'pointer', transition: 'all 0.15s',
                      bgcolor: expandedPost?.id === post.id ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderBottom: '1px solid', borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5 }} onClick={() => setExpandedPost(expandedPost?.id === post.id ? null : post)}>
                      <Avatar src={post.authorPhoto} sx={{ width: 32, height: 32, bgcolor: '#8B5CF6', fontSize: 12, mt: 0.25 }}>
                        {post.author?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13.5, mb: 0.25 }}>{post.title}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.75, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: expandedPost?.id === post.id ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{post.author} · {getTimeAgo(post.createdAt)}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <ThumbUpOutlined sx={{ fontSize: 13, color: hasLiked ? 'primary.main' : 'text.secondary' }} />
                            <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{post.likesCount || post.likes?.length || 0}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                            <ChatBubbleOutlined sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>{post.commentsCount || 0}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {expandedPost?.id === post.id && (
                      <Box sx={{ ml: 6, mt: 1 }}>
                        <Divider sx={{ mb: 1.5 }} />

                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                          <Button size="small" startIcon={hasLiked ? <ThumbUp sx={{ fontSize: 14 }} /> : <ThumbUpOutlined sx={{ fontSize: 14 }} />}
                            onClick={(e) => { e.stopPropagation(); handleLike(post.id) }}
                            sx={{ fontSize: 11, color: hasLiked ? 'primary.main' : 'text.secondary', minWidth: 0, borderRadius: '6px' }}>
                            {post.likesCount || post.likes?.length || 0} {hasLiked ? 'Te gusta' : 'Me gusta'}
                          </Button>
                          {isOwner && (
                            <>
                              <Button size="small" startIcon={<EditOutlined sx={{ fontSize: 14 }} />}
                                onClick={(e) => { e.stopPropagation(); startEdit(post) }}
                                sx={{ fontSize: 11, color: 'text.secondary', minWidth: 0, borderRadius: '6px' }}>Editar</Button>
                              <Button size="small" startIcon={<DeleteOutlined sx={{ fontSize: 14 }} />}
                                onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id) }}
                                sx={{ fontSize: 11, color: 'error.main', minWidth: 0, borderRadius: '6px' }}>Eliminar</Button>
                            </>
                          )}
                        </Box>

                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>Comentarios ({comments.length})</Typography>

                        {isAuthenticated ? (
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                            <Avatar src={currentUser?.photoURL} sx={{ width: 24, height: 24, bgcolor: '#8B5CF6', fontSize: 10 }}>{currentUser?.name?.charAt(0)}</Avatar>
                            <TextField fullWidth size="small" placeholder="Escribí un comentario…" value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 } }}
                              slotProps={{ input: { endAdornment: <IconButton size="small" onClick={handleAddComment}><Send sx={{ fontSize: 14 }} /></IconButton> } }} />
                          </Box>
                        ) : (
                          <Button size="small" variant="outlined" sx={{ fontSize: 11, mb: 1.5, borderRadius: '6px' }}
                            onClick={() => { setGuestAction('comentar'); setGuestOpen(true) }}>
                            Iniciá sesión para comentar
                          </Button>
                        )}

                        {comments.length === 0 ? (
                          <Typography sx={{ fontSize: 11.5, color: 'text.secondary', py: 1, textAlign: 'center' }}>Sin comentarios. ¡Sé la primera en responder!</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {comments.map((c) => (
                              <Box key={c.id} sx={{ display: 'flex', gap: 1, py: 0.75 }}>
                                <Avatar src={c.authorPhoto} sx={{ width: 24, height: 24, bgcolor: '#10B981', fontSize: 10 }}>{c.author?.charAt(0)}</Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                    <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{c.author}</Typography>
                                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>{getTimeAgo(c.createdAt)}</Typography>
                                    {currentUser?.uid === c.userId && (
                                      <IconButton size="small" sx={{ ml: 'auto' }} onClick={() => handleDeleteComment(c.id)}>
                                        <Close sx={{ fontSize: 10 }} />
                                      </IconButton>
                                    )}
                                  </Box>
                                  <Typography sx={{ fontSize: 12, mt: 0.25 }}>{c.content}</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Paper>
          )}
        </Box>
      </Box>

      <Dialog open={newPostOpen} onClose={() => setNewPostOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Nuevo tema</Typography>
          <IconButton onClick={() => setNewPostOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
            <TextField label="Título" fullWidth size="small" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder='Ej: ¿Cómo preparar el final de Pedagogía?' />
            <TextField label="Contenido" fullWidth multiline rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Escribí tu consulta o tema de discusión…" />
            <Button variant="contained" fullWidth onClick={handleCreatePost} sx={{ fontSize: 12 }}>Publicar tema</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingPost)} onClose={() => setEditingPost(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Editar publicación</Typography>
          <IconButton onClick={() => setEditingPost(null)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
            <TextField label="Título" fullWidth size="small" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <TextField label="Contenido" fullWidth multiline rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <Button variant="contained" fullWidth onClick={handleEditPost} sx={{ fontSize: 12 }}>Guardar cambios</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action={guestAction} />
    </Box>
  )
}
