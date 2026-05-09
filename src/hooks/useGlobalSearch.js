import { useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { debounce } from '../utils/helpers'

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ materials: [], posts: [], users: [] })
  const materials = useSelector((s) => s.materials.items)

  const search = useCallback(
    debounce((q) => {
      if (!q.trim()) { setResults({ materials: [], posts: [], users: [] }); return }
      const term = q.toLowerCase()
      setResults({
        materials: materials.filter((m) => m.title.toLowerCase().includes(term) || m.subject.toLowerCase().includes(term) || m.tags?.some((t) => t.toLowerCase().includes(term))).slice(0, 5),
        posts: [],
        users: [],
      })
    }, 250),
    [materials]
  )

  const handleSearch = useCallback((val) => {
    setQuery(val)
    search(val)
  }, [search])

  return { query, setQuery: handleSearch, results, clear: () => { setQuery(''); setResults({ materials: [], posts: [], users: [] }) } }
}
