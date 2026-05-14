import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormField({ label, icon: Icon, error, children, ...props }) {
  return (
    <motion.div 
      className="input-group" 
      style={{ position: 'relative' }}
      animate={error ? { x: [-2, 2, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.4, times: [0, 0.25, 0.5, 0.75, 1] }}
    >
      {label && <label className="input-label">{label}</label>}
      <div className="input-icon">
        {Icon && <Icon size={18} className="icon" style={{ color: error ? 'var(--error)' : 'var(--text-secondary)' }} />}
        {children}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="error-bubble"
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                type: 'spring', 
                damping: 20, 
                stiffness: 300,
                delay: 0.1 
              }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
