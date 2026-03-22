import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { StepIndicator } from './StepIndicator';
import { useState } from 'react';
import {
  Download, Loader2, Check, ArrowLeft, Type, Palette, Maximize,
  Terminal, FileJson, Copy, CheckCheck, AlertTriangle, FileText,
} from 'lucide-react';
import { generateShellScript, generateFFmpegCommand, generateConfigJSON, downloadTextFile, type ExportConfig } from '@/lib/ffmpegCommands';

const captionStyles = [
  { id: 'tiktok', name: 'TikTok', color: '#FFFF00', bg: 'transparent', preview: 'text-yellow-400 font-black' },
  { id: 'minimal', name: 'Minimal', color: '#FFFFFF', bg: 'transparent', preview: 'text-foreground font-medium' },
  { id: 'neon', name: 'Neon', color: '#FF006E', bg: 'transparent', preview: 'text-primary font-bold' },
  { id: 'custom', name: 'Custom', color: '#3A86FF', bg: 'transparent', preview: 'text-accent font-semibold' },
];

const formats = ['9:16', '1:1', '16:9'] as const;
const qualities = ['720p', '1080p'] as const;

type ExportMode = 'script' | 'command' | 'config';

export function CaptionEditor() {
  const {
    captionStyle, setCaptionStyle,
    selectedFormat, setSelectedFormat,
    selectedQuality, setSelectedQuality,
    setStep, currentVideo, smartCuts, manualRange, cutMode,
  } = useAppStore();

  const [exportMode, setExportMode] = useState<ExportMode | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const getExportConfig = (): ExportConfig => {
    let startTime = 0;
    let endTime = 30;

    if (cutMode === 'manual') {
      startTime = manualRange[0];
      endTime = manualRange[1];
    } else {
      const selected = smartCuts.find((c) => c.selected);
      if (selected) {
        startTime = selected.startTime;
        endTime = selected.endTime;
      }
    }

    return {
      videoUrl: currentVideo?.url || '',
      startTime,
      endTime,
      format: selectedFormat as ExportConfig['format'],
      quality: selectedQuality as ExportConfig['quality'],
      captionStyle,
    };
  };

  const handleDownloadScript = () => {
    const config = getExportConfig();
    const script = generateShellScript(config);
    downloadTextFile(script, 'reelcutter_process.sh', 'application/x-sh');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleDownloadConfig = () => {
    const config = getExportConfig();
    const json = generateConfigJSON(config);
    downloadTextFile(json, 'reelcutter_config.json', 'application/json');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopyCommand = async () => {
    const config = getExportConfig();
    const cmd = generateFFmpegCommand(config);
    await navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCut = smartCuts.find((c) => c.selected);
  const cutStart = cutMode === 'manual' ? manualRange[0] : (selectedCut?.startTime ?? 0);
  const cutEnd = cutMode === 'manual' ? manualRange[1] : (selectedCut?.endTime ?? 30);
  const cutDuration = cutEnd - cutStart;

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
              {/* Video embed or thumbnail */}
              <div
                className={`bg-muted rounded-xl flex items-center justify-center relative overflow-hidden mx-auto ${
                  selectedFormat === '9:16' ? 'aspect-[9/16] max-w-[280px]' :
                  selectedFormat === '1:1' ? 'aspect-square max-w-[400px]' :
                  'aspect-video w-full'
                }`}
              >
                {currentVideo?.thumbnail ? (
                  <img
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                )}
                {/* Caption overlay */}
                <div className="absolute bottom-8 left-0 right-0 text-center px-4 z-10">
                  <p
                    className={`text-lg leading-tight ${captionStyles.find(s => s.id === captionStyle)?.preview}`}
                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {selectedCut?.transcript?.slice(0, 60) || 'Esse é o momento mais importante do vídeo'}
                  </p>
                </div>
                {/* Info badge */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-lg z-10">
                  {cutDuration}s • {selectedFormat}
                </div>
                {!currentVideo?.thumbnail && (
                  <span className="text-muted-foreground text-sm z-10">Preview</span>
                )}
              </div>

              {/* Video info */}
              {currentVideo && (
                <div className="mt-4 px-1">
                  <h3 className="text-sm font-semibold truncate">{currentVideo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{currentVideo.author} • {currentVideo.platform}</p>
                </div>
              )}
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

            {/* Export options */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Download className="w-4 h-4 text-success" />
                Exportar
              </h3>

              <div className="space-y-2">
                {/* Download Script */}
                <button
                  onClick={handleDownloadScript}
                  className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  <Terminal className="w-4 h-4" />
                  Baixar Script Completo (.sh)
                </button>

                {/* Copy FFmpeg command */}
                <button
                  onClick={handleCopyCommand}
                  className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-success" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Comando FFmpeg
                    </>
                  )}
                </button>

                {/* Download config JSON */}
                <button
                  onClick={handleDownloadConfig}
                  className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors active:scale-[0.97]"
                >
                  <FileJson className="w-4 h-4" />
                  Baixar Config (.json)
                </button>
              </div>

              {downloaded && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs text-success">Arquivo baixado!</span>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-warning" />
                Como usar
              </h3>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Instale <code className="font-mono text-foreground/80 bg-muted px-1 rounded">yt-dlp</code> e <code className="font-mono text-foreground/80 bg-muted px-1 rounded">ffmpeg</code></li>
                <li>Baixe o script ou copie o comando</li>
                <li>Execute no terminal: <code className="font-mono text-foreground/80 bg-muted px-1 rounded">bash reelcutter_process.sh</code></li>
                <li>O reel será gerado na pasta atual</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => setStep('selecting')}
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
