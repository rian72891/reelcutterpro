import { supabase } from '@/integrations/supabase/client';

const FUNCTION_NAME = 'wayinvideo';

export interface WayinClip {
  idx: number;
  title: string;
  description: string;
  hashtags: string[];
  begin_ms: string;
  end_ms: string;
  transcript?: string;
  download_url?: string;
}

export interface WayinTaskResponse {
  data: {
    project_id?: string;
    id?: string;
    status: 'CREATED' | 'QUEUED' | 'ONGOING' | 'SUCCEEDED' | 'FAILED';
    name?: string;
    clips?: WayinClip[];
  };
}

/** Submit AI Clipping task */
export async function submitClipTask(videoUrl: string, options?: {
  clipCount?: number;
  targetDuration?: number;
  language?: string;
}): Promise<WayinTaskResponse> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: 'POST',
    body: {
      video_url: videoUrl,
      clip_count: options?.clipCount ?? 5,
      target_duration: options?.targetDuration ?? 30,
      language: options?.language ?? 'pt',
    },
    headers: { 'x-action': 'clip' },
  });
  // supabase.functions.invoke doesn't support query params, so use fetch directly
  if (error) throw new Error(error.message || 'Erro ao submeter tarefa de clipping');
  return data;
}

/** Poll clipping results */
export async function getClipResults(projectId: string): Promise<WayinTaskResponse> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: 'POST',
    body: { _action: 'get-clip-results', id: projectId },
  });
  if (error) throw new Error(error.message || 'Erro ao buscar resultados');
  return data;
}

/** Submit export task */
export async function submitExportTask(options: {
  projectId: string;
  clipIndices: number[];
  resolution?: string;
  enableCaption?: boolean;
  captionStyle?: string;
  aspectRatio?: string;
}): Promise<WayinTaskResponse> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: 'POST',
    body: {
      _action: 'export',
      project_id: options.projectId,
      clip_indices: options.clipIndices,
      resolution: options.resolution ?? 'FHD_1080P',
      enable_caption: options.enableCaption ?? true,
      caption_style: options.captionStyle ?? 'style_1',
      aspect_ratio: options.aspectRatio ?? 'PORTRAIT_9_16',
    },
  });
  if (error) throw new Error(error.message || 'Erro ao submeter exportação');
  return data;
}

/** Poll export results */
export async function getExportResults(taskId: string): Promise<WayinTaskResponse> {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    method: 'POST',
    body: { _action: 'get-export-results', id: taskId },
  });
  if (error) throw new Error(error.message || 'Erro ao buscar exportação');
  return data;
}

/**
 * Helper: Invoke the edge function with query params via raw fetch.
 * supabase.functions.invoke doesn't support query params natively.
 */
async function invokeWithParams(action: string, method: 'GET' | 'POST', params?: Record<string, string>, body?: unknown) {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const baseUrl = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;
  const queryString = new URLSearchParams({ action, ...params }).toString();
  const url = `${baseUrl}?${queryString}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${anonKey}`,
    'apikey': anonKey,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/** Submit AI Clip task via raw fetch */
export async function apiSubmitClip(videoUrl: string, options?: {
  clipCount?: number;
  targetDuration?: number;
  language?: string;
}): Promise<WayinTaskResponse> {
  return invokeWithParams('clip', 'POST', undefined, {
    video_url: videoUrl,
    clip_count: options?.clipCount ?? 5,
    target_duration: options?.targetDuration ?? 30,
    language: options?.language ?? 'pt',
  });
}

/** Poll clip results */
export async function apiGetClipResults(id: string): Promise<WayinTaskResponse> {
  return invokeWithParams('clip-results', 'GET', { id });
}

/** Submit export */
export async function apiSubmitExport(options: {
  projectId: string;
  clipIndices: number[];
  resolution?: string;
  enableCaption?: boolean;
  captionStyle?: string;
  aspectRatio?: string;
}): Promise<WayinTaskResponse> {
  return invokeWithParams('export', 'POST', undefined, {
    project_id: options.projectId,
    clip_indices: options.clipIndices,
    resolution: options.resolution ?? 'FHD_1080P',
    enable_caption: options.enableCaption ?? true,
    caption_style: options.captionStyle ?? 'style_1',
    aspect_ratio: options.aspectRatio ?? 'PORTRAIT_9_16',
  });
}

/** Poll export results */
export async function apiGetExportResults(id: string): Promise<WayinTaskResponse> {
  return invokeWithParams('export-results', 'GET', { id });
}

/**
 * Poll a task until it reaches a terminal status.
 * Returns the final response.
 */
export async function pollUntilDone(
  pollFn: () => Promise<WayinTaskResponse>,
  onProgress?: (status: string, clips?: WayinClip[]) => void,
  intervalMs = 5000,
  maxAttempts = 60,
): Promise<WayinTaskResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollFn();
    const status = result?.data?.status;

    if (status === 'SUCCEEDED') {
      onProgress?.('SUCCEEDED', result.data.clips);
      return result;
    }

    if (status === 'FAILED') {
      throw new Error('Processamento falhou no servidor. Tente novamente.');
    }

    onProgress?.(status || 'ONGOING', result.data?.clips);
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error('Timeout: processamento demorou demais. Tente novamente.');
}

/** Map aspect ratio format to WayinVideo format */
export function mapAspectRatio(format: string): string {
  switch (format) {
    case '9:16': return 'PORTRAIT_9_16';
    case '1:1': return 'SQUARE_1_1';
    case '16:9': return 'LANDSCAPE_16_9';
    default: return 'PORTRAIT_9_16';
  }
}

/** Map quality to WayinVideo resolution */
export function mapResolution(quality: string): string {
  switch (quality) {
    case '720p': return 'HD_720P';
    case '1080p': return 'FHD_1080P';
    case '4k': return 'UHD_4K';
    default: return 'FHD_1080P';
  }
}

/** Map caption style to WayinVideo style */
export function mapCaptionStyle(style: string): string {
  switch (style) {
    case 'tiktok': return 'style_1';
    case 'minimal': return 'style_2';
    case 'neon': return 'style_3';
    case 'custom': return 'style_4';
    default: return 'style_1';
  }
}
