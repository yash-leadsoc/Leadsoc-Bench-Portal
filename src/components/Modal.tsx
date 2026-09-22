import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function Modal({ title, children, onClose, footer, lg }: {
  title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; lg?: boolean
}) {
  return (
    <div className="overlay" onClick={onClose}>
      <motion.div className={`modal ${lg ? 'lg' : ''}`} onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .18 }}>
        <div className="head">{title}</div>
        <div className="body">{children}</div>
        {footer && <div className="foot">{footer}</div>}
      </motion.div>
    </div>
  )
}
