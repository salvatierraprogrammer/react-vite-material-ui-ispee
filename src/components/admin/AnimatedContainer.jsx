import { motion, AnimatePresence } from 'framer-motion'

const variants = {
  fade: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  },
  slideUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  },
  slideLeft: {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  },
  slideRight: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  },
  spring: {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 20 },
    },
  },
}

export default function AnimatedContainer({ children, type = 'fade', delay = 0, style, className }) {
  const v = variants[type] || variants.fade
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ delay }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedList({ children, stagger = 0.04 }) {
  return (
    <AnimatePresence mode="popLayout">
      {children}
    </AnimatePresence>
  )
}

export function AnimatedListItem({ children, index = 0, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: index * 0.04, ease: [0.25, 0.1, 0.25, 1] } }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  )
}
