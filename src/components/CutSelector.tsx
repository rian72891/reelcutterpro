import { motion } from 'framer-motion';
import { Wand2, Hand } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SmartCutCard } from './SmartCutCard';
import { StepIndicator } from './StepIndicator';

const durations = [15, 30, 60, 90];

export function CutSelector() {
  const { cutMode, setCutMode, smartCuts, selectedDuration, setSelectedDuration, manualRange, setManualRange, currentVideo, setStep } = useAppStore();
  const videoDuration = currentVideo?.duration ?? 480;

  return (
    <div>
      <StepIndicator current={1} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Selecionar Cortes</h2>

          {/* Mode toggle */}
          <div className="flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setCutMode('auto')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                cutMode === 'auto' ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              SmartCuts
            </button>
            <button
              onClick={() => setCutMode('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                cutMode === 'manual' ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Hand className="w-4 h-4" />
              Manual
            </button>
          </div>
        </div>

        {/* Duration selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground mr-2">Duração:</span>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 ${
                selectedDuration === d
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {d}s
            </button>
          ))}
        </div>

        {cutMode === 'auto' ? (
          <div className="space-y-3">
            {smartCuts.map((cut, i) => (
              <SmartCutCard key={cut.id} cut={cut} index={i} />
            ))}
          </div>
        ) : (
          /* Manual mode */
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm text-muted-foreground">
                {Math.floor(manualRange[0] / 60)}:{(manualRange[0] % 60).toString().padStart(2, '0')}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {Math.floor(manualRange[1] / 60)}:{(manualRange[1] % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Timeline bar */}
            <div className="relative h-12 bg-muted rounded-xl overflow-hidden mb-4">
              <div
                className="absolute top-0 bottom-0 gradient-primary opacity-30 rounded-xl"
                style={{
                  left: `${(manualRange[0] / videoDuration) * 100}%`,
                  width: `${((manualRange[1] - manualRange[0]) / videoDuration) * 100}%`,
                }}
              />
              {/* Waveform simulation */}
              <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-2">
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-muted-foreground/30 rounded-full"
                    style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Início</label>
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  value={manualRange[0]}
                  onChange={(e) => setManualRange([Number(e.target.value), manualRange[1]])}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fim</label>
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  value={manualRange[1]}
                  onChange={(e) => setManualRange([manualRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Duração selecionada: <span className="text-foreground font-semibold">{manualRange[1] - manualRange[0]}s</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setStep('idle')}
            className="px-6 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-colors active:scale-[0.97]"
          >
            Voltar
          </button>
          <button
            onClick={() => setStep('editing')}
            className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Próximo: Editar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
