import { useState, useCallback, useRef } from 'react';
import { useAppStore, SmartCut } from '@/store/useAppStore';
import {
  apiSubmitClip,
  apiGetClipResults,
  apiSubmitExport,
  apiGetExportResults,
  pollUntilDone,
  mapAspectRatio,
  mapResolution,
  mapCaptionStyle,
  WayinClip,
} from '@/lib/wayinApi';
import { fetchVideoMetadata } from '@/lib/videoApi';
import { toast } from 'sonner';

export function useVideoProcessing() {
  const {
    setStep, setIsProcessing, setProgress,
    setCurrentVideo, addRecentVideo, setSmartCuts,
    videoUrl, selectedDuration, selectedFormat,
    selectedQuality, captionStyle, smartCuts, cutMode, manualRange,
  } = useAppStore();

  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const projectIdRef = useRef<string | null>(null);

  /** Convert WayinVideo clips to our SmartCut format */
  const wayinClipsToSmartCuts = useCallback((clips: WayinClip[]): SmartCut[] => {
    return clips.map((clip, i) => ({
      id: `wayin-${clip.idx}`,
      startTime: Math.round(parseInt(clip.begin_ms) / 1000),
      endTime: Math.round(parseInt(clip.end_ms) / 1000),
      score: Math.max(10, 95 - i * 12),
      transcript: clip.description || clip.title || '',
      thumbnail: '',
      selected: i === 0,
      wayinIdx: clip.idx,
      title: clip.title,
      hashtags: clip.hashtags,
    }));
  }, []);

  /** Step 1: Analyze video — fetch metadata + submit AI clipping */
  const analyzeVideo = useCallback(async (url: string) => {
    setIsProcessing(true);
    setStep('analyzing');
    setProgress(5);
    setProcessingStatus('Buscando metadados do vídeo...');

    try {
      // Fetch metadata via free APIs
      setProgress(10);
      const metadata = await fetchVideoMetadata(url);
      setProgress(20);

      const video = {
        id: Date.now().toString(),
        url,
        title: metadata.title,
        author: metadata.author,
        duration: metadata.duration || 480,
        platform: metadata.platform,
        thumbnail: metadata.thumbnail,
        processedAt: new Date().toISOString(),
      };
      setCurrentVideo(video);
      addRecentVideo(video);

      // Submit AI clipping to WayinVideo
      setProcessingStatus('Enviando para análise IA...');
      setProgress(30);

      const submitResult = await apiSubmitClip(url, {
        clipCount: 5,
        targetDuration: selectedDuration,
        language: 'pt',
      });

      const projectId = submitResult?.data?.project_id || submitResult?.data?.id;
      if (!projectId) throw new Error('Não foi possível criar a tarefa de clipping');
      projectIdRef.current = projectId;

      // Poll for results
      setProcessingStatus('Analisando vídeo com IA... isso pode levar 1-3 minutos');
      setProgress(40);

      const finalResult = await pollUntilDone(
        () => apiGetClipResults(projectId),
        (status, clips) => {
          if (status === 'ONGOING' && clips && clips.length > 0) {
            setProcessingStatus(`Analisando... ${clips.length} cortes encontrados até agora`);
            setProgress(40 + Math.min(clips.length * 8, 40));
          } else if (status === 'QUEUED') {
            setProcessingStatus('Na fila de processamento...');
          }
        },
        5000,
        60,
      );

      // Convert clips
      const clips = finalResult.data?.clips || [];
      if (clips.length === 0) {
        throw new Error('Nenhum corte encontrado. Tente com outro vídeo.');
      }

      const smartCutsList = wayinClipsToSmartCuts(clips);
      setSmartCuts(smartCutsList);
      setProgress(100);
      setProcessingStatus('Análise completa!');

      toast.success(`${clips.length} cortes encontrados!`);

      await new Promise((r) => setTimeout(r, 500));
      setStep('selecting');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Analyze error:', err);
      setProcessingStatus('');

      // Fallback to simulated cuts
      if (msg.includes('WAYINVIDEO_API_KEY') || msg.includes('500') || msg.includes('fetch')) {
        toast.error('API indisponível. Usando cortes simulados.');
        fallbackToSimulatedCuts(url);
      } else {
        toast.error(msg);
        setStep('idle');
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [selectedDuration, setStep, setIsProcessing, setProgress, setCurrentVideo, addRecentVideo, setSmartCuts, wayinClipsToSmartCuts]);

  /** Fallback: generate simulated cuts if API fails */
  const fallbackToSimulatedCuts = useCallback((url: string) => {
    const dur = 480;
    const segments = Math.min(4, Math.max(2, Math.floor(dur / 60)));
    const cuts: SmartCut[] = [];
    for (let i = 0; i < segments; i++) {
      const start = Math.floor((dur / segments) * i) + Math.floor(Math.random() * 15);
      const duration = 25 + Math.floor(Math.random() * 10);
      const end = Math.min(start + duration, dur);
      cuts.push({
        id: (i + 1).toString(),
        startTime: start,
        endTime: end,
        score: Math.floor(95 - i * 12 - Math.random() * 8),
        transcript: [
          'Esse é o momento mais importante do vídeo, onde o ponto principal é apresentado.',
          'Uma revelação surpreendente que gera muito engajamento.',
          'Dica prática que o público pode aplicar imediatamente.',
          'Momento que pode viralizar nas redes sociais.',
        ][i] || 'Trecho relevante do vídeo.',
        thumbnail: '',
        selected: i === 0,
      });
    }
    setSmartCuts(cuts);
    setStep('selecting');
  }, [setSmartCuts, setStep]);

  /** Step 3: Export clips via WayinVideo */
  const exportClips = useCallback(async () => {
    if (!projectIdRef.current) {
      toast.error('Nenhum projeto para exportar. Analise um vídeo primeiro.');
      return;
    }

    setIsExporting(true);
    setProcessingStatus('Iniciando exportação...');

    try {
      // Determine which clips to export
      const selectedIndices = cutMode === 'auto'
        ? smartCuts.filter(c => c.selected).map(c => (c as any).wayinIdx ?? parseInt(c.id) - 1)
        : [0];

      const exportResult = await apiSubmitExport({
        projectId: projectIdRef.current,
        clipIndices: selectedIndices,
        resolution: mapResolution(selectedQuality),
        enableCaption: true,
        captionStyle: mapCaptionStyle(captionStyle),
        aspectRatio: mapAspectRatio(selectedFormat),
      });

      const taskId = exportResult?.data?.project_id || exportResult?.data?.id;
      if (!taskId) throw new Error('Falha ao iniciar exportação');

      setProcessingStatus('Renderizando vídeo... isso pode levar 1-5 minutos');

      const finalExport = await pollUntilDone(
        () => apiGetExportResults(taskId),
        (status) => {
          if (status === 'ONGOING') setProcessingStatus('Renderizando vídeo...');
          if (status === 'QUEUED') setProcessingStatus('Na fila de renderização...');
        },
        5000,
        120,
      );

      const clips = finalExport.data?.clips || [];
      const firstWithUrl = clips.find(c => c.download_url);

      if (firstWithUrl?.download_url) {
        setExportDownloadUrl(firstWithUrl.download_url);
        toast.success('Reel pronto! Clique em Baixar.');
      } else {
        throw new Error('Exportação concluída mas sem URL de download');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro na exportação';
      toast.error(msg);
    } finally {
      setIsExporting(false);
      setProcessingStatus('');
    }
  }, [smartCuts, cutMode, selectedFormat, selectedQuality, captionStyle]);

  /** Download the exported clip */
  const downloadExportedClip = useCallback(() => {
    if (!exportDownloadUrl) return;
    const a = document.createElement('a');
    a.href = exportDownloadUrl;
    a.download = 'reel.mp4';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [exportDownloadUrl]);

  return {
    analyzeVideo,
    exportClips,
    downloadExportedClip,
    processingStatus,
    exportDownloadUrl,
    isExporting,
  };
}
