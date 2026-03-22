/**
 * FFmpeg command generator for local processing.
 * Generates ready-to-use commands the user can run on their machine.
 */

export interface ExportConfig {
  videoUrl: string;
  startTime: number;
  endTime: number;
  format: '9:16' | '1:1' | '16:9';
  quality: '720p' | '1080p';
  captionStyle: string;
  captionText?: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getResolution(format: string, quality: string): { w: number; h: number } {
  const is1080 = quality === '1080p';
  switch (format) {
    case '9:16': return { w: is1080 ? 1080 : 720, h: is1080 ? 1920 : 1280 };
    case '1:1': return { w: is1080 ? 1080 : 720, h: is1080 ? 1080 : 720 };
    case '16:9': return { w: is1080 ? 1920 : 1280, h: is1080 ? 1080 : 720 };
    default: return { w: 1080, h: 1920 };
  }
}

function getCaptionFilter(style: string, fontSize: number = 24): string {
  const styles: Record<string, string> = {
    tiktok: `FontName=Arial Black,FontSize=${fontSize},PrimaryColour=&H0000FFFF,OutlineColour=&H00000000,Outline=3,Bold=1,Alignment=2,MarginV=80`,
    minimal: `FontName=Arial,FontSize=${fontSize},PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,Outline=1,Alignment=2,MarginV=60`,
    neon: `FontName=Arial Black,FontSize=${fontSize},PrimaryColour=&H006E00FF,OutlineColour=&H00000000,Outline=3,Bold=1,Alignment=2,MarginV=80`,
    custom: `FontName=Arial,FontSize=${fontSize},PrimaryColour=&H00FF8633,OutlineColour=&H00000000,Outline=2,Alignment=2,MarginV=70`,
  };
  return styles[style] || styles.minimal;
}

/**
 * Generate a complete shell script for downloading + processing a video.
 */
export function generateShellScript(config: ExportConfig): string {
  const { w, h } = getResolution(config.format, config.quality);
  const duration = config.endTime - config.startTime;
  const captionFilter = getCaptionFilter(config.captionStyle);

  return `#!/bin/bash
# ============================================
# ReelCutter Pro - Script de Processamento
# ============================================
# Requisitos: yt-dlp, ffmpeg
# Instalar: 
#   brew install yt-dlp ffmpeg  (macOS)
#   sudo apt install yt-dlp ffmpeg  (Linux)
#   winget install yt-dlp ffmpeg  (Windows)
# ============================================

set -e

VIDEO_URL="${config.videoUrl}"
OUTPUT="reel_$(date +%Y%m%d_%H%M%S).mp4"

echo "📥 Baixando vídeo..."
yt-dlp -f "bestvideo[height<=${h}]+bestaudio/best[height<=${h}]" \\
  --merge-output-format mp4 \\
  -o "input_video.mp4" \\
  "$VIDEO_URL"

echo "✂️ Cortando de ${formatTime(config.startTime)} até ${formatTime(config.endTime)} (${duration}s)..."
ffmpeg -y \\
  -ss ${formatTime(config.startTime)} \\
  -t ${duration} \\
  -i "input_video.mp4" \\
  -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black" \\
  -c:v libx264 -preset fast -crf 23 \\
  -c:a aac -b:a 128k \\
  -movflags +faststart \\
  "$OUTPUT"

echo "🧹 Limpando arquivo temporário..."
rm -f "input_video.mp4"

echo ""
echo "✅ Reel gerado com sucesso!"
echo "📁 Arquivo: $OUTPUT"
echo "📐 Formato: ${config.format} (${w}x${h})"
echo "🎬 Duração: ${duration}s"
`;
}

/**
 * Generate just the FFmpeg command for users who already have the video.
 */
export function generateFFmpegCommand(config: ExportConfig): string {
  const { w, h } = getResolution(config.format, config.quality);
  const duration = config.endTime - config.startTime;

  return `ffmpeg -ss ${formatTime(config.startTime)} -t ${duration} -i "input.mp4" \\
  -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black" \\
  -c:v libx264 -preset fast -crf 23 \\
  -c:a aac -b:a 128k \\
  -movflags +faststart \\
  "reel_output.mp4"`;
}

/**
 * Generate a JSON config file with all processing parameters.
 */
export function generateConfigJSON(config: ExportConfig): string {
  const { w, h } = getResolution(config.format, config.quality);
  return JSON.stringify({
    source: config.videoUrl,
    cut: {
      start: config.startTime,
      end: config.endTime,
      startFormatted: formatTime(config.startTime),
      endFormatted: formatTime(config.endTime),
      duration: config.endTime - config.startTime,
    },
    output: {
      format: config.format,
      resolution: `${w}x${h}`,
      quality: config.quality,
      codec: 'h264',
      audioCodec: 'aac',
      audioBitrate: '128k',
    },
    captions: {
      style: config.captionStyle,
      text: config.captionText || '',
    },
    generatedAt: new Date().toISOString(),
    generatedBy: 'ReelCutter Pro',
  }, null, 2);
}

/**
 * Download a text file in the browser.
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
