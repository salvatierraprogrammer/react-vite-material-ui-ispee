import { useState, memo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, Box, Typography, Chip, IconButton, Rating, Button, Avatar } from '@mui/material'
import {
  FavoriteBorder,
  Favorite,
  DownloadOutlined,
  VisibilityOutlined,
  AutoStoriesOutlined,
  DescriptionOutlined,
  MapOutlined,
  AssignmentOutlined,
  SchoolOutlined,
  PictureAsPdfOutlined,
} from '@mui/icons-material'
import { toggleFavorite } from '../../redux/slices/materialsSlice'
import { getTimeAgo, truncate, formatFileSize } from '../../utils/helpers'
import { TYPE_COLORS, FILE_COLORS } from '../../constants'
import { useNavigate } from 'react-router-dom'
import GuestModal from '../auth/GuestModal'

const typeIcons = {
  'mapa-conceptual': MapOutlined,
  resumen: AutoStoriesOutlined,
  tp: AssignmentOutlined,
  'apunte-teorico': SchoolOutlined,
  pdf: DescriptionOutlined,
  guia: DescriptionOutlined,
}

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
  const [guestForDownload, setGuestForDownload] = useState(false)

  const Icon = typeIcons[material.type] || AutoStoriesOutlined
  const color = TYPE_COLORS[material.type] || '#8B5CF6'
  const FileIconComp = getFileIcon(material)
  const PreviewIcon = FileIconComp || Icon
  const fColor = fileColor(material)

  const handleFavorite = useCallback(() => {
    if (!isAuthenticated) {
      setGuestForDownload(false)
      setGuestAction('guardar en favoritos')
      setGuestOpen(true)
      return
    }
    dispatch(toggleFavorite(material.id))
  }, [dispatch, isAuthenticated, material.id])

  const handleDownload = useCallback(() => {
    if (!isAuthenticated) {
      setGuestForDownload(true)
      setGuestOpen(true)
      return
    }
    if (material.fileUrl) window.open(material.fileUrl, '_blank')
  }, [isAuthenticated, material.fileUrl])

  return (
    <>
      <Card
        onMouseEnter={() => setElevated(true)}
        onMouseLeave={() => setElevated(false)}
        elevation={0}
        sx={{
          position: 'relative',
          cursor: 'default',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          border: '1px solid',
          borderColor: elevated ? 'rgba(139,92,246,0.14)' : 'rgba(0,0,0,0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          transform: elevated ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: elevated
            ? '0 6px 18px rgba(139,92,246,0.1), 0 2px 6px rgba(15,23,42,0.04)'
            : '0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <Box
          sx={{
            height: 72,
            background: `linear-gradient(135deg, ${color}12 0%, ${color}22 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <PreviewIcon sx={{ fontSize: 34, color: fColor || color, opacity: FileIconComp ? 0.65 : 0.48 }} />
          <Chip
            label={material.typeLabel}
            size="small"
            sx={{
              position: 'absolute',
              top: 6,
              left: 6,
              bgcolor: color,
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: '5px',
              height: 18,
              letterSpacing: 0.01,
              '& .MuiChip-label': { px: 0.75, py: 0 },
            }}
          />
          <IconButton
            onClick={handleFavorite}
            size="small"
            aria-label={material.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: 'rgba(255,255,255,0.88)',
              width: 28,
              height: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {material.isFavorite ? (
              <Favorite sx={{ fontSize: 14, color: '#EF4444' }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 14, color: '#6B7280' }} />
            )}
          </IconButton>
        </Box>

        <CardContent
          sx={{
            p: 1.35,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            '&:last-child': { pb: 1.35 },
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Typography
            sx={{
              fontSize: 9.5,
              fontWeight: 700,
              color,
              textTransform: 'uppercase',
              letterSpacing: 0.05,
              mb: 0.35,
              lineHeight: 1.2,
            }}
          >
            {material.subject}
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 12.5,
              letterSpacing: '-0.01em',
              color: 'text.primary',
              mb: 0.35,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer',
              lineHeight: 1.35,
              '&:hover': { color: 'primary.main' },
            }}
            onClick={() => navigate(`/material/${material.id}`)}
          >
            {material.title}
          </Typography>
          <Typography
            sx={{
              fontSize: 10.5,
              color: 'text.secondary',
              mb: 0.85,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.45,
            }}
          >
            {truncate(material.description, 60)}
          </Typography>

          {material.fileName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.85 }}>
              <PictureAsPdfOutlined sx={{ fontSize: 14, color: fColor || 'text.secondary', flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: 'text.secondary',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}
              >
                {material.fileName}
              </Typography>
              {material.fileSize && (
                <Typography sx={{ fontSize: 9.5, color: 'text.secondary', flexShrink: 0, fontWeight: 500 }}>
                  {formatFileSize(material.fileSize)}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.35, mb: 0.85 }}>
            {material.tags?.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontSize: 8.75,
                  height: 18,
                  borderRadius: '4px',
                  bgcolor: 'rgba(139,92,246,0.08)',
                  color: '#7C3AED',
                  fontWeight: 600,
                  border: '1px solid rgba(139,92,246,0.12)',
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            ))}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 0.75,
              mb: 0.85,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
              <Avatar
                src={material.userId === currentUser?.uid ? currentUser?.photoURL : material.authorPhoto || ''}
                sx={{ width: 18, height: 18, fontSize: 9, fontWeight: 700, bgcolor: color }}
              >
                {material.author?.charAt(0)}
              </Avatar>
              <Typography
                sx={{
                  fontSize: 10,
                  color: 'text.secondary',
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {material.author} · {getTimeAgo(material.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <DownloadOutlined sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>{material.downloads ?? 0}</Typography>
              </Box>
              <Rating value={material.rating} readOnly precision={0.1} sx={{ fontSize: 11, color: '#F59E0B' }} />
            </Box>
          </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.65, mt: 'auto', pt: 0.25 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityOutlined sx={{ fontSize: 15 }} />}
              onClick={() => navigate(`/material/${material.id}`)}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                py: 0.45,
                px: 1,
                minHeight: 34,
                flex: 1,
                borderRadius: '8px',
              }}
            >
              Ver detalle
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadOutlined sx={{ fontSize: 15 }} />}
              onClick={handleDownload}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                py: 0.45,
                px: 1,
                minHeight: 34,
                flex: 1,
                borderRadius: '8px',
                boxShadow: 'none',
              }}
            >
              Descargar
            </Button>
          </Box>

          {actions && (
            <Box
              sx={{
                mt: 0.85,
                pt: 0.85,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                gap: 0.5,
                justifyContent: 'flex-end',
              }}
            >
              {actions}
            </Box>
          )}
        </CardContent>
      </Card>
      <GuestModal open={guestOpen} onClose={() => setGuestOpen(false)} action={guestAction} forDownload={guestForDownload} />
    </>
  )
}

export default memo(MaterialCard)
