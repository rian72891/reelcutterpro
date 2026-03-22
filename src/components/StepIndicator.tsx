import { motion } from 'framer-motion';
import { Search, Scissors, Download } from 'lucide-react';

const steps = [
  { icon: Search, label: 'Análise' },
  { icon: Scissors, label: 'Seleção' },
  { icon: Download, label: 'Exportar' },
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive || isDone ? 1 : 0.4,
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'gradient-primary text-primary-foreground' : isDone ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full ${isDone ? 'bg-success' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
