
export interface VintageStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  thumbnail: string;
}

export interface GenerationState {
  status: 'idle' | 'checking-key' | 'generating' | 'completed' | 'error';
  message: string;
  progress: number;
  resultUrl?: string;
  error?: string;
}

export type AspectRatio = '16:9' | '9:16';
