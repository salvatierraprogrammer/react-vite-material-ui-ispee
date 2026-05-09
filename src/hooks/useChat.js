import { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { generateId } from '../utils/helpers'

export function useChat() {
  const [conversations, setConversations] = useState(() => loadFromStorage(STORAGE_KEYS.CHAT, []))

  const sync = useCallback((data) => {
    setConversations(data)
    saveToStorage(STORAGE_KEYS.CHAT, data)
  }, [])

  const sendMessage = useCallback((to, text, attachment) => {
    const list = [...conversations]
    const existing = list.find((c) => c.user === to)
    const msg = { id: generateId(), from: 'yo', text, attachment, time: new Date().toISOString(), read: true }
    if (existing) {
      existing.messages.push(msg)
      existing.lastMessage = text
      existing.unread = 0
    } else {
      list.push({ user: to, messages: [msg], lastMessage: text, unread: 0 })
    }
    sync(list)
    return msg
  }, [conversations, sync])

  const shareMaterial = useCallback((to, material) => {
    return sendMessage(to, `Te compartí: ${material.title}`, { type: 'material', ...material })
  }, [sendMessage])

  const sharePost = useCallback((to, post) => {
    return sendMessage(to, `Mirá este post: ${post.title}`, { type: 'post', ...post })
  }, [sendMessage])

  return { conversations, sendMessage, shareMaterial, sharePost }
}
