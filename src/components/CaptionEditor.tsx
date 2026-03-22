import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { StepIndicator } from './StepIndicator';
import { useState } from 'react';
import { Download, Loader2, Check, ArrowLeft, Type, Palette, Maximize } from 'lucide-react';

const captionStyles = [
  { id: 'tiktok', name: 'TikTok', color: '#FFFF00', bg: 'transparent', preview: 'text-yellow-400 font-black' },
  { id: 'minimal', name: 'Minimal', color: '#FFFFFF', bg: 'transparent', preview: 'text-foreground font-medium' },
  { id: 'neon', name: 'Neon', color: '#FF006E', bg: 'transparent', preview: 'text-primary font-bold' },
  { id: 'custom', name: 'Custom', color: '#3A86FF', bg: 'transparent', preview: 'text-accent font-semibold' },
];

const formats = ['9:16', '1:1', '16:9'];
const qualities = ['720p', '1080p'];

export function CaptionEditor() {
  const { captionStyle, setCaptionStyle, selectedFormat, setSelectedFormat, selectedQuality, setSelectedQuality, setStep } = useAppStore();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2500));
    setExporting(false);
    setExported(true);
  };

  return (
    <div>
      <StepIndicator current={2} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Edição & Exportação</h2>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Preview (60%) */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-4">
              <div
                className={`bg-muted rounded-xl flex items-center justify-center relative overflow-hidden mx-auto ${
                  selectedFormat === '9:16' ? 'aspect-[9/16] max-w-[280px]' :
                  selectedFormat === '1:1' ? 'aspect-square max-w-[400px]' :
                  'aspect-video w-full'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                {/* Simulated caption */}
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <p className={`text-lg leading-tight ${captionStyles.find(s => s.id === captionStyle)?.preview}`}
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    Esse é o momento mais importante do vídeo
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">Preview</span>
              </div>
            </div>
          </div>

          {/* Editor panel (40%) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Caption styles */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Estilo de Legenda
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {captionStyles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCaptionStyle(s.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                      captionStyle === s.id
                        ? 'border-2 border-primary bg-primary/10'
                        : 'bg-muted hover:bg-muted/80 border-2 border-transparent'
                    }`}
                  >
                    <span className={s.preview}>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Maximize className="w-4 h-4 text-accent" />
                Formato
              </h3>
              <div className="flex gap-2">
                {formats.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormat(f)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                      selectedFormat === f ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-secondary" />
                Qualidade
              </h3>
              <div className="flex gap-2">
                {qualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuality(q)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                      selectedQuality === q ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={exporting || exported}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] ${
                exported
                  ? 'bg-success/20 text-success'
                  : 'gradient-primary text-primary-foreground hover:opacity-90'
              } ${exporting ? 'animate-pulse-glow' : ''}`}
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando Reel...
                </>
              ) : exported ? (
                <>
                  <Check className="w-4 h-4" />
                  Reel Pronto!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar Reel
                </>
              )}
            </button>

            {exported && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
              >
                <Download className="w-4 h-4" />
                Baixar
              </motion.button>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => { setStep('selecting'); setExported(false); }}
            className="px-6 py-2.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-medium text-sm flex items-center gap-2 transition-colors active:scale-[0.97]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
