import { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants'
import { generateId } from '../utils/helpers'

export function useForum() {
  const [posts, setPosts] = useState(() => loadFromStorage(STORAGE_KEYS.FORUM, []))

  const sync = useCallback((data) => {
    setPosts(data)
    saveToStorage(STORAGE_KEYS.FORUM, data)
  }, [])

  const createPost = useCallback((title, content, author, attachments) => {
    const post = { id: generateId(), title, content, author, attachments: attachments || [], replies: 0, createdAt: new Date().toISOString() }
    const updated = [post, ...posts]
    sync(updated)
    return post
  }, [posts, sync])

  const addReply = useCallback((postId, reply) => {
    const updated = posts.map((p) => p.id === postId ? { ...p, replies: p.replies + 1 } : p)
    sync(updated)
  }, [posts, sync])

  return { posts, createPost, addReply }
}
