import { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Paper, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Badge, TextField, IconButton, InputAdornment, ClickAwayListener, Divider, CircularProgress, Tooltip } from '@mui/material'
import { Send, Search, Close, ChatOutlined, ArrowBack, FlagOutlined } from '@mui/icons-material'
import { useResponsive } from '../hooks/useResponsive'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { subscribeConversations, subscribeMessages, getOrCreateConversation, sendMessage, markConversationRead } from '../services/chatService'
import { searchUsers } from '../services/usersService'
import { createNotification } from '../services/notificationService'
import { getTimeAgo, debounce } from '../utils/helpers'
import ReportModal from '../components/modals/ReportModal'

export default function Mensajes() {
  const { currentUser } = useSelector((s) => s.auth)
  const isRestricted = currentUser?.blockedForWarnings || currentUser?.suspended || currentUser?.isBlocked || (currentUser?.warnings || 0) >= 3
  const { isSmall } = useResponsive()
  const [mobileView, setMobileView] = useState('list')
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const bottomRef = useRef(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [otherStatus, setOtherStatus] = useState({ online: false })
  const [reportTarget, setReportTarget] = useState(null)

  useEffect(() => {
    if (!selectedConv || !currentUser) { setOtherStatus({ online: false }); return }
    const other = getOtherParticipant(selectedConv)
    if (!other?.uid) return
    const unsub = onSnapshot(doc(db, 'users', other.uid), (snap) => {
      if (snap.exists()) setOtherStatus({ online: snap.data().online, lastSeen: snap.data().lastSeen })
    })
    return unsub
  }, [selectedConv?.id, currentUser?.uid])

  useEffect(() => {
    if (!currentUser?.uid) return
    const unsub = subscribeConversations(currentUser.uid, (convs) => {
      setConversations(convs)
      setInitialLoading(false)
    })
    return unsub
  }, [currentUser?.uid])

  useEffect(() => {
    if (!selectedConv?.id) { setMessages([]); return }
    const unsub = subscribeMessages(selectedConv.id, (msgs) => {
      setMessages(msgs)
    })
    markConversationRead(selectedConv.id, currentUser?.uid).catch(() => {})
    return unsub
  }, [selectedConv?.id, currentUser?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearch = useCallback(
    debounce(async (q) => {
      if (!q.trim()) { setSearchResults([]); setSearching(false); return }
      setSearching(true)
      try {
        const users = await searchUsers(q)
        setSearchResults(users.filter((u) => u.uid !== currentUser?.uid))
      } catch {
        setSearchResults([])
      }
      setSearching(false)
    }, 300),
    [currentUser?.uid]
  )

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    setShowSearch(true)
    handleSearch(val)
  }

  const handleSelectUser = async (user) => {
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    if (!currentUser) return
    const conv = await getOrCreateConversation(currentUser, user)
    setSelectedConv(conv)
    if (isSmall) setMobileView('chat')
  }

  const handleSelectConv = async (conv) => {
    setSelectedConv(conv)
    if (isSmall) setMobileView('chat')
    if (currentUser?.uid) {
      await markConversationRead(conv.id, currentUser.uid).catch(() => {})
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedConv?.id || !currentUser?.uid) return
    if (isRestricted) { alert('Contactate con soporte para quitar el bloqueo ya que no cumpliste con tu conducta.'); return }
    await sendMessage(selectedConv.id, currentUser.uid, input.trim())
    const other = getOtherParticipant(selectedConv)
    if (other?.uid) {
      createNotification({
          userId: other.uid,
          text: `${currentUser.name} te envió un mensaje`,
          type: 'message',
          targetPath: '/mensajes',
        }).catch(() => {})
    }
    setInput('')
  }

  const getOtherParticipant = (conv) => {
    if (!conv?.participants || !currentUser) return { name: 'Usuario', photoURL: '' }
    return conv.participants.find((p) => p.uid !== currentUser.uid) || conv.participants[0]
  }

  const getUnreadCount = (conv) => {
    if (!conv?.id || !messages.length || !currentUser) return 0
    return messages.filter((m) => m.senderId !== currentUser.uid && !m.read).length
  }

  const otherUser = getOtherParticipant(selectedConv)

  const showSidebar = !isSmall || mobileView === 'list'
  const showChat = !isSmall || mobileView === 'chat'

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 104px)', gap: 1.5 }}>
      {showSidebar && (
        <Paper sx={{ width: isSmall ? '100%' : 280, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, pb: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>Mensajes</Typography>
            <TextField
              fullWidth size="small" placeholder="Buscar compañeros…"
              value={searchQuery} onChange={handleSearchChange}
              onFocus={() => setShowSearch(true)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false) }}><Close sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
                }
              }}
            />
            {showSearch && searchQuery && (
              <ClickAwayListener onClickAway={() => setShowSearch(false)}>
                <Paper elevation={4} sx={{ mt: 0.5, borderRadius: '8px', maxHeight: 200, overflow: 'auto', position: 'relative', zIndex: 10 }}>
                  {searching ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={20} /></Box>
                  ) : searchResults.length === 0 ? (
                    <Typography sx={{ p: 1.5, textAlign: 'center', fontSize: 12, color: 'text.secondary' }}>Sin resultados</Typography>
                  ) : (
                    searchResults.map((u) => (
                      <ListItemButton key={u.uid} dense onClick={() => handleSelectUser(u)} sx={{ py: 0.5, px: 1.5 }}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{ '& .MuiBadge-dot': { bgcolor: u.online ? '#10B981' : '#9CA3AF', width: 8, height: 8, borderRadius: '50%' } }}>
                            <Avatar src={u.photoURL} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 11 }}>{u.name?.charAt(0)}</Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText primary={u.displayName || u.name} secondary={u.lastName || ' '} slotProps={{ primary: { fontSize: 12.5, fontWeight: 600 }, secondary: { fontSize: 10.5 } }} />
                      </ListItemButton>
                    ))
                  )}
                </Paper>
              </ClickAwayListener>
            )}
          </Box>
          <Divider sx={{ mt: 1 }} />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {initialLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                <ChatOutlined sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Buscá compañeros para empezar a chatear</Typography>
              </Box>
            ) : (
              <List dense>
                {conversations.map((conv) => {
                  const other = getOtherParticipant(conv)
                  const unread = getUnreadCount(conv)
                  return (
                    <ListItemButton key={conv.id} selected={selectedConv?.id === conv.id}
                      onClick={() => handleSelectConv(conv)}
                      sx={{ borderRadius: '8px', mx: 1, mb: 0.25, py: 0.5 }}>
                      <ListItemAvatar sx={{ minWidth: 36 }}>
                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot"
                          sx={{ '& .MuiBadge-dot': { bgcolor: other.online ? '#10B981' : '#9CA3AF', width: 8, height: 8, borderRadius: '50%' } }}>
                          <Avatar src={other.photoURL} sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: 11 }}>{other.name?.charAt(0)}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={other.name}
                        secondary={conv.lastMessage || 'Sin mensajes aún'}
                        slotProps={{
                          primary: { fontSize: 12.5, fontWeight: unread > 0 ? 700 : 500 },
                          secondary: { fontSize: 10.5, noWrap: true, sx: { maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: unread > 0 ? 600 : 400 } }
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                        <Typography sx={{ fontSize: 9.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {conv.lastMessageAt ? getTimeAgo(conv.lastMessageAt) : ''}
                        </Typography>
                        {unread > 0 && (
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{unread}</Typography>
                          </Box>
                        )}
                      </Box>
                    </ListItemButton>
                  )
                })}
              </List>
            )}
          </Box>
        </Paper>
      )}

      {showChat && (
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden' }}>
          {selectedConv ? (
            <>
              <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isSmall && (
                  <IconButton size="small" onClick={() => setMobileView('list')}>
                    <ArrowBack sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
                <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot"
                  sx={{ '& .MuiBadge-dot': { bgcolor: otherStatus.online ? '#10B981' : '#9CA3AF', width: 10, height: 10, borderRadius: '50%', border: '2px solid', borderColor: 'background.paper' } }}>
                  <Avatar src={otherUser.photoURL} sx={{ width: 32, height: 32, bgcolor: '#8B5CF6', fontSize: 12 }}>{otherUser.name?.charAt(0)}</Avatar>
                </Badge>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{otherUser.name}</Typography>
                  <Typography sx={{ fontSize: 10.5, color: otherStatus.online ? '#10B981' : 'text.secondary' }}>
                    {otherStatus.online ? 'En línea' : 'Desconectado'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, p: 1.5, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>
                      No hay mensajes aún.<br />Escribí algo para empezar la conversación.
                    </Typography>
                  </Box>
                ) : (
                    messages.map((msg, i) => {
                    const isMine = msg.senderId === currentUser?.uid
                    const showAvatar = i === 0 || messages[i - 1]?.senderId !== msg.senderId
                    return (
                      <Box key={msg.id || i} sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                        {showAvatar ? (
                          <Avatar src={isMine ? currentUser?.photoURL : otherUser.photoURL}
                            sx={{ width: 22, height: 22, bgcolor: isMine ? '#7C3AED' : '#8B5CF6', fontSize: 9, flexShrink: 0 }}>
                            {(isMine ? currentUser?.name : otherUser.name)?.charAt(0)}
                          </Avatar>
                        ) : (
                          <Box sx={{ width: 22, flexShrink: 0 }} />
                        )}
                        <Box>
                          <Box sx={{
                            p: 1, borderRadius: isMine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                            bgcolor: isMine ? 'primary.main' : 'action.hover',
                            color: isMine ? '#fff' : 'text.primary',
                          }}>
                            <Typography sx={{ fontSize: 12.5, wordBreak: 'break-word' }}>{msg.text}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
                            <Typography sx={{ fontSize: 9, color: 'text.secondary', mt: 0.25 }}>
                              {msg.createdAt ? getTimeAgo(msg.createdAt) : ''}
                            </Typography>
                            {!isMine && (
                              <Tooltip title="Reportar mensaje">
                                <IconButton size="small" onClick={() => setReportTarget({ id: msg.id, conversationId: selectedConv?.id, senderId: msg.senderId })}
                                  sx={{ color: 'text.disabled', '&:hover': { color: '#EF4444' }, width: 16, height: 16, mt: 0.25 }}>
                                  <FlagOutlined sx={{ fontSize: 10 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </Box>

              {isRestricted ? (
                <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: '#FEE2E2' }}>
                  <Typography sx={{ fontSize: 12, color: '#991B1B', fontWeight: 600, textAlign: 'center' }}>
                    Contactate con soporte para quitar el bloqueo ya que no cumpliste con tu conducta.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField fullWidth size="small" placeholder="Escribí un mensaje…" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 12.5 } }} />
                  <IconButton onClick={handleSend} size="small"
                    sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, width: 32, height: 32 }}>
                    <Send sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 1 }}>
              <ChatOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.2 }} />
              <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Seleccioná una conversación</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>O buscá compañeros para chatear</Typography>
            </Box>
          )}
        </Paper>
      )}
      <ReportModal
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetId={reportTarget?.conversationId || reportTarget?.id}
        targetUserId={reportTarget?.senderId}
        type="message"
      />
    </Box>
  )
}
