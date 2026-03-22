import { motion } from 'framer-motion';
import { Play, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SmartCut, useAppStore } from '@/store/useAppStore';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getScoreColor(score: number) {
  if (score >= 70) return 'bg-primary/20 text-primary';
  if (score >= 40) return 'bg-warning/20 text-warning';
  return 'bg-muted text-muted-foreground';
}

export function SmartCutCard({ cut, index }: { cut: SmartCut; index: number }) {
  const { toggleCutSelection } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const duration = cut.endTime - cut.startTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass rounded-2xl p-4 transition-all duration-300 ${
        cut.selected ? 'border-primary/40 neon-shadow' : 'glass-hover'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-16 rounded-xl bg-muted flex items-center justify-center relative overflow-hidden flex-shrink-0 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
          <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute bottom-1 right-1 text-[10px] font-mono bg-background/80 px-1 rounded">
            {duration}s
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-muted-foreground">
              {formatTime(cut.startTime)} — {formatTime(cut.endTime)}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${getScoreColor(cut.score)}`}>
              {cut.score}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{cut.transcript}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => toggleCutSelection(cut.id)}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${
              cut.selected
                ? 'gradient-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => !cut.selected && toggleCutSelection(cut.id)}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-destructive transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded transcript */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground leading-relaxed">
          {cut.transcript}
        </p>
      </motion.div>
    </motion.div>
  );
}
