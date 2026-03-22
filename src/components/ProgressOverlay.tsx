import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function ProgressOverlay() {
  const { isProcessing, progress } = useAppStore();

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="glass rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-glow">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary-foreground border-t-transparent rounded-full"
          />
        </div>
        <h3 className="text-lg font-bold mb-2">Analisando vídeo...</h3>
        <p className="text-sm text-muted-foreground mb-4">Identificando os melhores momentos</p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-mono">{progress}%</p>
      </div>
    </motion.div>
  );
}
