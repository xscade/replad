export interface ComparisonState {
  original: string | null;
  generated: string | null;
}

export interface GenerationConfig {
  prompt: string;
  imageData: string; // Base64
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
