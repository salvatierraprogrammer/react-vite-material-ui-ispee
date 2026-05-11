export const DRAWER_WIDTH = 244
export const HEADER_HEIGHT = 56

export const FILE_COLORS = { pdf: '#EF4444', docx: '#2563EB', pptx: '#EA580C' }
export const FILE_ICONS = { pdf: 'pdf', docx: 'word', pptx: 'ppt' }

export const TYPE_COLORS = {
  'mapa-conceptual': '#8B5CF6',
  resumen: '#EC4899',
  tp: '#F59E0B',
  'apunte-teorico': '#10B981',
  pdf: '#3B82F6',
  guia: '#EF4444',
}

export const TYPE_LABELS = {
  'mapa-conceptual': 'Mapa Conceptual',
  resumen: 'Resumen',
  tp: 'Trabajo Práctico',
  'apunte-teorico': 'Apunte Teórico',
  pdf: 'PDF',
  guia: 'Guía de Estudio',
}

export const NOTIFICATION_TYPES = {
  COMMENT: 'comment',
  MESSAGE: 'message',
  LIKE: 'like',
  MATERIAL: 'material',
  FORUM_REPLY: 'forum_reply',
  SHARE: 'share',
}

export const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'valorados', label: 'Mejor valorados' },
  { value: 'descargados', label: 'Más descargados' },
]

export const STORAGE_KEYS = {
  MATERIALS: 'apuntes-materials',
  NOTIFICATIONS: 'apuntes-notifications',
  CHAT: 'apuntes-chat',
  FORUM: 'apuntes-forum',
}
