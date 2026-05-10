import { useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, Box, Typography, Chip, IconButton, Rating, Button, Avatar } from '@mui/material'
import { FavoriteBorder, Favorite, DownloadOutlined, VisibilityOutlined, AutoStoriesOutlined, DescriptionOutlined, MapOutlined, AssignmentOutlined, SchoolOutlined, PictureAsPdfOutlined } from '@mui/icons-material'
import { toggleFavorite } from '../../redux/slices/materialsSlice'
import { getTimeAgo, truncate, formatFileSize } from '../../utils/helpers'
import { TYPE_COLORS, FILE_COLORS } from '../../constants'
import { useNavigate } from 'react-router-dom'
import GuestModal from '../auth/GuestModal'

const typeIcons = { 'mapa-conceptual': MapOutlined, resumen: AutoStoriesOutlined, tp: AssignmentOutlined, 'apunte-teorico': SchoolOutlined, pdf: DescriptionOutlined, guia: DescriptionOutlined }

function getFileIcon(material) {
  const ext = material.fileName?.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return PictureAsPdfOutlined
  return null
}

function fileColor(material) {
  const ext = material.fileName?.split('.').pop()?.toLowerCase()
  return FILE_COLORS[ext] || null
}

function MaterialCard({ material, actions }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, currentUser } = useSelector((s) => s.auth)
  const [elevated, setElevated] = useState(false)
  const [guestOpen, setGuestOpen] = useState(false)
  const [guestAction, setGuestAction] = useState('')
  const Icon = typeIcons[material.type] || AutoStoriesOutlined
  const color = TYPE_COLORS[material.type] || '#8B5CF6'
  const fIcon = getFileIcon(material)
  const fColor = fileColor(material)

  const handleFavorite = () => {
    if (!isAuthenticated) { setGuestAction('guardar en favoritos'); setGuestOpen(true); return }
    dispatch(toggleFavorite(material.id))
  }

  const handleDownload = () => {
    if (!isAuthenticated) { setGuestAction('descargar archivos'); setGuestOpen(true); return }
    if (material.fileUrl) window.open(material.fileUrl, '_blank')
  }

  return (
    <>
      <Card onMouseEnter={() => setElevated(true)} onMouseLeave={() => setElevated(false)} sx={{ transition: 'all 0.2s ease', transform: elevated ? 'translateY(-2px)' : 'translateY(0)', boxShadow: elevated ? '0 6px 16px rgba(139,92,246,0.1)' : '0 1px 2px rgba(0,0,0,0.04)', position: 'relative', cursor: 'default' }}>
        <Box sx={{ height: 72, background: `linear-gradient(135deg, ${color}12 0%, ${color}25 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {fIcon ? (
            <fIcon sx={{ fontSize: 34, color: fColor, opacity: 0.6 }} />
          ) : (
            <Icon sx={{ fontSize: 34, color, opacity: 0.45 }} />
          )}
          <Chip label={material.typeLabel} size="small" sx={{ position: 'absolute', top: 6, left: 6, bgcolor: color, color: '#fff', fontSize: 9, fontWeight: 600, borderRadius: '5px', height: 18 }} />
          <IconButton onClick={handleFavorite} size="small" sx={{ position: 'absolute', top: 3, right: 3, bgcolor: 'rgba(255,255,255,0.85)', width: 24, height: 24 }}>
            {material.isFavorite ? <Favorite sx={{ fontSize: 13, color: '#EF4444' }} /> : <FavoriteBorder sx={{ fontSize: 13, color: '#6B7280' }} />}
          </IconButton>
        </Box>
        <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
          <Typography sx={{ fontSize: 9, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: 0.04, mb: 0.25 }}>{material.subject}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: 'text.primary', mb: 0.25, display: '-webkit-box', WebkitLineClamp: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/material/${material.id}`)}>{material.title}</Typography>
          <Typography sx={{ fontSize: 10.5, color: 'text.secondary', mb: 0.75, display: '-webkit-box', WebkitLineClamp: 1, overflow: 'hidden' }}>{truncate(material.description, 60)}</Typography>
          {material.fileName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <PictureAsPdfOutlined sx={{ fontSize: 13, color: fileColor(material) || 'text.secondary' }} />
              <Typography sx={{ fontSize: 10, color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{material.fileName}</Typography>
              {material.fileSize && <Typography sx={{ fontSize: 9, color: 'text.secondary' }}>{formatFileSize(material.fileSize)}</Typography>}
            </Box>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25, mb: 0.75 }}>
            {material.tags?.slice(0, 2).map((tag) => <Chip key={tag} label={tag} size="small" sx={{ fontSize: 8.5, height: 16, borderRadius: '3px', bgcolor: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500 }} />)}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar src={material.userId === currentUser?.uid ? currentUser?.photoURL : (material.authorPhoto || '')} sx={{ width: 16, height: 16, fontSize: 8, bgcolor: color }}>{material.author?.charAt(0)}</Avatar>
              <Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>{material.author} · {getTimeAgo(material.createdAt)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <DownloadOutlined sx={{ fontSize: 11, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>{material.downloads}</Typography>
              </Box>
              <Rating value={material.rating} readOnly precision={0.1} sx={{ fontSize: 10.5, color: '#F59E0B' }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" variant="outlined" startIcon={<VisibilityOutlined sx={{ fontSize: 13 }} />} onClick={() => navigate(`/material/${material.id}`)} sx={{ fontSize: 10.5, py: 0.25, px: 1, minHeight: 0, flex: 1, borderRadius: '6px' }}>Ver detalle</Button>
            <Button size="small" variant="contained" startIcon={<DownloadOutlined sx={{ fontSize: 13 }} />} onClick={handleDownload} sx={{ fontSize: 10.5, py: 0.25, px: 1, minHeight: 0, flex: 1, borderRadius: '6px' }}>Descargar</Button>
          </Box>
          {actions && <Box sx={{ mt: 0.75, pt: 0.75, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>{actions}</Box>}
        </CardContent>
      </Card>
      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action={guestAction} />
    </>
  )
}

export default memo(MaterialCard)
